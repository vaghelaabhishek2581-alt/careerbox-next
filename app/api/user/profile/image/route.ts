import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { z } from 'zod'
import { generatePresignedUrl, generateS3Key } from '@/lib/s3'
import clientPromise from '../../../db'
import { ObjectId } from 'mongodb'

const imageRequestSchema = z.object({
  type: z.enum(['profile', 'cover']),
  contentType: z
    .string()
    .refine(
      type => ['image/jpeg', 'image/png', 'image/webp'].includes(type),
      'Only JPEG, PNG and WebP images are allowed'
    )
})

/**
 * @swagger
 * /api/user/profile/image:
 *   post:
 *     summary: Get presigned URL for image upload
 *     description: Generates a presigned URL for uploading profile or cover image to S3
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [profile, cover]
 *               contentType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Presigned URL generated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
export async function POST (request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { type, contentType } = imageRequestSchema.parse(data)

    const key = generateS3Key(session.user.id, type)
    const { uploadUrl, fileUrl } = await generatePresignedUrl(key, contentType)

    // Update user profile with new image URL
    const client = await clientPromise
    const db = client.db()

    await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          [`${type}Image`]: fileUrl,
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({ uploadUrl, fileUrl })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error handling image upload:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
