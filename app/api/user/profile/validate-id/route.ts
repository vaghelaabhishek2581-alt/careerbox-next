import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/db/mongodb'

const validateSchema = z.object({
  publicId: z
    .string()
    .min(3, 'Public ID must be at least 3 characters')
    .max(30, 'Public ID must be less than 30 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Only letters, numbers, underscore and hyphen allowed'
    )
})

/**
 * @swagger
 * /api/user/profile/validate-id:
 *   post:
 *     summary: Validate public profile ID
 *     description: Check if a public profile ID is available
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
 *               publicId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Validation result
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
export async function POST (request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = authResult

    const data = await request.json()
    const { publicId } = validateSchema.parse(data)

    const { db } = await connectToDatabase()

    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    // Check if publicId exists for any other user
    const existingUser = await db.collection('users').findOne({
      _id: { $ne: new ObjectId(userId) },
      'personalDetails.publicProfileId': publicId
    })

    return NextResponse.json({
      available: !existingUser,
      suggestions: existingUser ? generateSuggestions(publicId) : []
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error validating public ID:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateSuggestions (baseId: string): string[] {
  const suggestions: string[] = []
  for (let i = 1; i <= 5; i++) {
    suggestions.push(`${baseId}${i}`)
  }
  return suggestions
}
