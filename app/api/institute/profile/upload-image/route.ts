import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongoose'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import AdminInstitute from '@/src/models/AdminInstitute'
import User from '@/src/models/User'
import { Types } from 'mongoose'
import { generatePresignedUrl, validateImageFile } from '@/lib/s3'

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    const session = await getAuthenticatedUser(req)
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id: userId, roles } = session.user
    if (!roles?.includes('institute') && !roles?.includes('admin')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const user = await User.findById(userId)
    if (!user?.ownedOrganizations?.length) {
      return NextResponse.json(
        { success: false, message: 'No institute associated with this user' },
        { status: 404 }
      )
    }

    const instituteId = user.ownedOrganizations[0]?.toString()
    const contentType = req.headers.get('content-type') || ''

    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ success: false, message: 'Content-Type must be multipart/form-data' }, { status: 400 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const type = (formData.get('type') as string) || '' // 'logo' | 'cover'

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
    }
    if (!['logo', 'cover'].includes(type)) {
      return NextResponse.json({ success: false, message: 'Invalid type. Must be "logo" or "cover"' }, { status: 400 })
    }

    const validation = validateImageFile(file)
    if (!validation.isValid) {
      return NextResponse.json({ success: false, message: validation.error || 'Invalid image' }, { status: 400 })
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const s3Key = `institutes/${instituteId}/${type}/${Date.now()}-${safeName}`

    const { uploadUrl, fileUrl } = await generatePresignedUrl(s3Key, file.type)

    const uploadResp = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type }
    })

    if (!uploadResp.ok) {
      const errorText = await uploadResp.text()
      return NextResponse.json(
        { success: false, message: 'Failed to upload to S3', details: errorText },
        { status: 500 }
      )
    }

    const updateField = type === 'logo' ? 'logo' : 'coverImage'
    const updatedInstitute = await AdminInstitute.findByIdAndUpdate(
      new Types.ObjectId(instituteId),
      { $set: { [updateField]: fileUrl, updatedAt: new Date() } },
      { new: true, runValidators: true }
    )

    if (!updatedInstitute) {
      return NextResponse.json({ success: false, message: 'Institute not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, imageUrl: fileUrl, type, instituteId })
  } catch (error) {
    console.error('Error uploading institute image:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}