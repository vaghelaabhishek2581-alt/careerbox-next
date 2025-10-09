import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, hasRole } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongoose'
import Institute, { IInstitute } from '@/src/models/Institute'
import { z } from 'zod'
import { generatePresignedUrl, validateImageFile } from '@/lib/s3'

// Schema for image upload validation
const InstituteImageUploadSchema = z.object({
    type: z.enum(['logo', 'cover']),
    imageUrl: z.string().url('Invalid image URL')
})

// ============================================================================
// POST - Upload institute logo or cover image
// ============================================================================

export async function POST(request: NextRequest) {
    try {
        console.log('📸 POST /api/institutes/upload-image - Uploading institute image to S3')

        const auth = await getAuthenticatedUser(request)
        if (!auth?.userId) {
            console.log('❌ No authentication found')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('✅ Authentication found for user:', auth.userId, 'via', auth.authType)

        // Check if request is multipart/form-data (file upload)
        const contentType = request.headers.get('content-type')

        if (contentType?.includes('multipart/form-data')) {
            // Handle file upload with S3
            const formData = await request.formData()
            const file = formData.get('file') as File
            const type = formData.get('type') as string
            const instituteId = formData.get('instituteId') as string

            if (!file) {
                return NextResponse.json({ error: 'No file provided' }, { status: 400 })
            }

            if (!type || !['logo', 'cover'].includes(type)) {
                return NextResponse.json({ error: 'Invalid type. Must be "logo" or "cover"' }, { status: 400 })
            }

            if (!instituteId) {
                return NextResponse.json({ error: 'Institute ID is required' }, { status: 400 })
            }

            await connectToDatabase()

            // Verify the institute belongs to the user
            const instituteRaw = await Institute.findOne({
                _id: instituteId,
                userId: auth.userId
            }).lean().exec()

            if (!instituteRaw) {
                return NextResponse.json({
                    error: 'Institute not found or does not belong to user'
                }, { status: 404 })
            }

            // Type assertion to resolve Mongoose lean() typing issues
            const institute = instituteRaw as unknown as IInstitute

            // Validate file using your existing S3 validation
            const validation = validateImageFile(file)
            if (!validation.isValid) {
                return NextResponse.json({ error: validation.error }, { status: 400 })
            }

            console.log('📁 File validated:', {
                name: file.name,
                type: file.type,
                size: file.size,
                uploadType: type,
                instituteId: instituteId
            })

            // Generate S3 key for institute images
            console.log('🔑 Generating S3 key for institute:', instituteId, 'type:', type)
            const s3Key = `institutes/${instituteId}/${type}/${Date.now()}-${file.name}`
            console.log('🔑 Generated S3 key:', s3Key)

            console.log('🔗 Generating presigned URL for content type:', file.type)
            const { uploadUrl, fileUrl } = await generatePresignedUrl(s3Key, file.type)
            console.log('🔗 Generated URLs - Upload URL length:', uploadUrl.length, 'File URL:', fileUrl)

            // Upload file to S3 using presigned URL
            console.log('🔄 Attempting S3 upload with URL:', uploadUrl)

            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
            })

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text()
                console.error('❌ S3 upload failed:', {
                    status: uploadResponse.status,
                    statusText: uploadResponse.statusText,
                    errorBody: errorText,
                    uploadUrl: uploadUrl.substring(0, 100) + '...' // Log partial URL for debugging
                })
                return NextResponse.json({
                    error: 'Failed to upload to S3',
                    details: `S3 returned ${uploadResponse.status}: ${uploadResponse.statusText}`,
                    s3Error: errorText
                }, { status: 500 })
            }

            console.log('✅ File uploaded to S3 successfully:', fileUrl)

            // Update the institute with the new S3 image URL
            const updateField = type === 'logo' ? 'logo' : 'coverImage'
            const updatedInstituteRaw = await Institute.findOneAndUpdate(
                { _id: instituteId, userId: auth.userId },
                {
                    [updateField]: fileUrl,
                    updatedAt: new Date()
                },
                { new: true, runValidators: true }
            ).lean().exec()

            if (!updatedInstituteRaw) {
                console.log('❌ Institute not found for user:', auth.userId)
                return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
            }

            // Type assertion to resolve Mongoose lean() typing issues
            const updatedInstitute = updatedInstituteRaw as unknown as IInstitute

            console.log('✅ Institute updated with S3 image URL:', type, 'for institute:', instituteId)

            return NextResponse.json({
                success: true,
                message: `${type === 'logo' ? 'Logo' : 'Cover'} image uploaded successfully`,
                imageUrl: fileUrl,
                s3Key,
                type: type,
                instituteId: instituteId,
                updatedAt: updatedInstitute.updatedAt
            })

        } else {
            // Handle JSON request with image URL (for direct URL updates)
            const body = await request.json()
            console.log('📝 Request body:', body)

            // Validate the request body
            const validatedData = InstituteImageUploadSchema.parse(body)
            const { instituteId } = body

            if (!instituteId) {
                return NextResponse.json({ error: 'Institute ID is required' }, { status: 400 })
            }

            console.log('✅ Validated data:', validatedData)

            await connectToDatabase()

            // Verify the institute belongs to the user
            const instituteRaw = await Institute.findOne({
                _id: instituteId,
                userId: auth.userId
            }).lean().exec()

            if (!instituteRaw) {
                return NextResponse.json({
                    error: 'Institute not found or does not belong to user'
                }, { status: 404 })
            }

            // Type assertion to resolve Mongoose lean() typing issues
            const institute = instituteRaw as unknown as IInstitute

            // Update the institute with the new image URL
            const updateField = validatedData.type === 'logo' ? 'logo' : 'coverImage'
            const updatedInstituteRaw = await Institute.findOneAndUpdate(
                { _id: instituteId, userId: auth.userId },
                {
                    [updateField]: validatedData.imageUrl,
                    updatedAt: new Date()
                },
                { new: true, runValidators: true }
            ).lean().exec()

            if (!updatedInstituteRaw) {
                console.log('❌ Institute not found for user:', auth.userId)
                return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
            }

            // Type assertion to resolve Mongoose lean() typing issues
            const updatedInstitute = updatedInstituteRaw as unknown as IInstitute

            console.log('✅ Image URL updated successfully:', validatedData.type, 'for institute:', instituteId)

            return NextResponse.json({
                success: true,
                message: `${validatedData.type === 'logo' ? 'Logo' : 'Cover'} image updated successfully`,
                imageUrl: validatedData.imageUrl,
                type: validatedData.type,
                instituteId: instituteId,
                institute: updatedInstitute
            })
        }

    } catch (error) {
        console.error('❌ Error uploading institute image:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to upload institute image' },
            { status: 500 }
        )
    }
}

// ============================================================================
// DELETE - Remove institute logo or cover image
// ============================================================================

export async function DELETE(request: NextRequest) {
    try {
        console.log('🗑️ DELETE /api/institutes/upload-image - Removing institute image')

        const auth = await getAuthenticatedUser(request)
        if (!auth?.userId) {
            console.log('❌ No authentication found')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type')
        const instituteId = searchParams.get('instituteId')

        if (!type || !['logo', 'cover'].includes(type)) {
            return NextResponse.json({ error: 'Invalid type. Must be "logo" or "cover"' }, { status: 400 })
        }

        if (!instituteId) {
            return NextResponse.json({ error: 'Institute ID is required' }, { status: 400 })
        }

        await connectToDatabase()

        // Verify the institute belongs to the user
        const instituteRaw = await Institute.findOne({
            _id: instituteId,
            userId: auth.userId
        }).lean().exec()

        if (!instituteRaw) {
            return NextResponse.json({
                error: 'Institute not found or does not belong to user'
            }, { status: 404 })
        }

        // Type assertion to resolve Mongoose lean() typing issues
        const institute = instituteRaw as unknown as IInstitute

        // Remove the image from the institute
        const updateField = type === 'logo' ? 'logo' : 'coverImage'
        const updatedInstituteRaw = await Institute.findOneAndUpdate(
            { _id: instituteId, userId: auth.userId },
            {
                [updateField]: null,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).lean().exec()

        if (!updatedInstituteRaw) {
            console.log('❌ Institute not found for user:', auth.userId)
            return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
        }

        // Type assertion to resolve Mongoose lean() typing issues
        const updatedInstitute = updatedInstituteRaw as unknown as IInstitute

        console.log('✅ Image removed successfully:', type, 'for institute:', instituteId)

        return NextResponse.json({
            success: true,
            message: `${type === 'logo' ? 'Logo' : 'Cover'} image removed successfully`,
            type: type,
            instituteId: instituteId,
            institute: updatedInstitute
        })

    } catch (error) {
        console.error('❌ Error removing institute image:', error)
        return NextResponse.json(
            { error: 'Failed to remove institute image' },
            { status: 500 }
        )
    }
}
