import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/src/config/auth.config'
import prisma from '@/lib/db'

export async function POST (request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!['avatar', 'cover'].includes(type)) {
      return NextResponse.json({ error: 'Invalid image type' }, { status: 400 })
    }

    // TODO: Implement actual file upload to cloud storage (e.g., S3, Cloudinary)
    // For now, we'll simulate a successful upload
    const imageUrl = `https://placeholder.co/600x${
      type === 'avatar' ? '600' : '200'
    }`

    // Update the user's profile with the new image URL
    const updateData =
      type === 'avatar' ? { avatarUrl: imageUrl } : { coverImageUrl: imageUrl }

    const updatedProfile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: updateData
    })

    return NextResponse.json({
      type,
      url: imageUrl
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
