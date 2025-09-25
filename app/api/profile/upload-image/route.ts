import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongoose'
import { Profile } from '@/src/models'
import { z } from 'zod'
import { generateS3Key, generatePresignedUrl, validateImageFile } from '@/lib/s3'

// Schema for image upload validation
const ImageUploadSchema = z.object({
    type: z.enum(['profile', 'cover']),
    imageUrl: z.string().url('Invalid image URL')
})

// ============================================================================
// POST - Upload profile or cover image
// ============================================================================

export async function POST(request: NextRequest) {
    try {
        console.log('📸 POST /api/profile/upload-image - Uploading image to S3')

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

            if (!file) {
                return NextResponse.json({ error: 'No file provided' }, { status: 400 })
            }

            if (!type || !['profile', 'cover'].includes(type)) {
                return NextResponse.json({ error: 'Invalid type. Must be "profile" or "cover"' }, { status: 400 })
            }

            // Validate file using your existing S3 validation
            const validation = validateImageFile(file)
            if (!validation.isValid) {
                return NextResponse.json({ error: validation.error }, { status: 400 })
            }

            console.log('📁 File validated:', {
                name: file.name,
                type: file.type,
                size: file.size,
                uploadType: type
            })

            // Generate S3 key and presigned URL
            console.log('🔑 Generating S3 key for user:', auth.userId, 'type:', type)
            const s3Key = generateS3Key(auth.userId, type as 'profile' | 'cover')
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

            await connectToDatabase()

            // Update the profile with the new S3 image URL
            const updateField = type === 'profile' ? 'profileImage' : 'coverImage'
            const updatedProfile = await Profile.findOneAndUpdate(
                { userId: auth.userId },
                {
                    [updateField]: fileUrl,
                    updatedAt: new Date()
                },
                { new: true, runValidators: true }
            ).populate('userId', 'email emailVerified')

            if (!updatedProfile) {
                console.log('❌ Profile not found for user:', auth.userId)
                return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
            }

            console.log('✅ Profile updated with S3 image URL:', type, 'for user:', auth.userId)

            return NextResponse.json({
                success: true,
                message: `${type === 'profile' ? 'Profile' : 'Cover'} image uploaded successfully`,
                imageUrl: fileUrl,
                s3Key,
                type: type,
                updatedAt: updatedProfile?.updatedAt
            })

        } else {
            // Handle JSON request with image URL (for direct URL updates)
            const body = await request.json()
            console.log('📝 Request body:', body)

            // Validate the request body
            const validatedData = ImageUploadSchema.parse(body)
            console.log('✅ Validated data:', validatedData)

            await connectToDatabase()

            // Update the profile with the new image URL
            const updateField = validatedData.type === 'profile' ? 'profileImage' : 'coverImage'
            const updatedProfile = await Profile.findOneAndUpdate(
                { userId: auth.userId },
                {
                    [updateField]: validatedData.imageUrl,
                    updatedAt: new Date()
                },
                { new: true, runValidators: true }
            ).populate('userId', 'email emailVerified')

            if (!updatedProfile) {
                console.log('❌ Profile not found for user:', auth.userId)
                return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
            }

            console.log('✅ Image URL updated successfully:', validatedData.type, 'for user:', auth.userId)

            return NextResponse.json({
                success: true,
                message: `${validatedData.type === 'profile' ? 'Profile' : 'Cover'} image updated successfully`,
                imageUrl: validatedData.imageUrl,
                profile: updatedProfile
            })
        }

    } catch (error) {
        console.error('❌ Error uploading image:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
        )
    }
}

// ============================================================================
// DELETE - Remove profile or cover image
// ============================================================================

export async function DELETE(request: NextRequest) {
    try {
        console.log('🗑️ DELETE /api/profile/upload-image - Removing image')

        const auth = await getAuthenticatedUser(request)
        if (!auth?.userId) {
            console.log('❌ No authentication found')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type')

        if (!type || !['profile', 'cover'].includes(type)) {
            return NextResponse.json({ error: 'Invalid type. Must be "profile" or "cover"' }, { status: 400 })
        }

        await connectToDatabase()

        // Remove the image from the profile
        const updateField = type === 'profile' ? 'profileImage' : 'coverImage'
        const updatedProfile = await Profile.findOneAndUpdate(
            { userId: auth.userId },
            {
                [updateField]: null,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).populate('userId', 'email emailVerified')

        if (!updatedProfile) {
            console.log('❌ Profile not found for user:', auth.userId)
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        console.log('✅ Image removed successfully:', type, 'for user:', auth.userId)

        return NextResponse.json({
            success: true,
            message: `${type === 'profile' ? 'Profile' : 'Cover'} image removed successfully`,
            profile: updatedProfile
        })

    } catch (error) {
        console.error('❌ Error removing image:', error)
        return NextResponse.json(
            { error: 'Failed to remove image' },
            { status: 500 }
        )
    }
}
