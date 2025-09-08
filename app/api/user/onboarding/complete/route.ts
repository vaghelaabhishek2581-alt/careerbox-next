// app/api/onboarding/complete/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { authenticateRequest } from '@/lib/auth'
import clientPromise from '../../../db'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import {
  OnboardingSchema,
  toPublicUser,
  type UserDocument
} from '@/lib/types/user'

/**
 * @swagger
 * /api/onboarding/complete:
 *   post:
 *     summary: Complete user onboarding
 *     description: Updates user profile with selected roles and marks onboarding as complete
 *     tags:
 *       - Onboarding
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roles
 *               - activeRole
 *             properties:
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Selected user roles
 *                 minItems: 1
 *               activeRole:
 *                 type: string
 *                 description: Primary active role
 *                 minLength: 1
 *               userType:
 *                 type: string
 *                 enum: [student, professional]
 *                 description: User type classification
 *               bio:
 *                 type: string
 *                 description: User bio
 *                 maxLength: 500
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: User skills
 *                 maxItems: 50
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: User interests
 *                 maxItems: 20
 *               company:
 *                 type: string
 *                 description: Company name
 *                 maxLength: 100
 *               location:
 *                 type: string
 *                 description: User location
 *                 maxLength: 100
 *     responses:
 *       200:
 *         description: Onboarding completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *                     activeRole:
 *                       type: string
 *                     userType:
 *                       type: string
 *                     needsOnboarding:
 *                       type: boolean
 *                     needsRoleSelection:
 *                       type: boolean
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export async function POST (request: NextRequest) {
  try {
    // Authenticate request (works for both web sessions and JWT tokens)
    const authUser = await authenticateRequest(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Validate the incoming data using the OnboardingSchema
    let validatedData
    try {
      validatedData = OnboardingSchema.parse(data)
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid input', details: validationError.errors },
          { status: 400 }
        )
      }
      throw validationError
    }

    const client = await clientPromise
    const db = client.db()

    // Prepare update data
    const updateData = {
      ...validatedData,
      needsOnboarding: false,
      needsRoleSelection: validatedData.roles.length > 1, // True if multiple roles selected
      onboardingCompletedAt: new Date(),
      updatedAt: new Date()
    }

    // Update user with onboarding data
    const result = await db
      .collection('users')
      .updateOne({ _id: new ObjectId(authUser.id) }, { $set: updateData })

    if (!result.matchedCount) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get updated user data
    const updatedUser = (await db
      .collection('users')
      .findOne(
        { _id: new ObjectId(authUser.id) },
        { projection: { password: 0 } }
      )) as UserDocument | null

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found after update' },
        { status: 404 }
      )
    }

    // Convert to public user format
    const publicUser = toPublicUser(updatedUser)

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: {
        id: publicUser.id,
        email: publicUser.email,
        name: publicUser.name,
        roles: publicUser.roles,
        activeRole: publicUser.activeRole,
        userType: publicUser.userType,
        needsOnboarding: publicUser.needsOnboarding,
        needsRoleSelection: publicUser.needsRoleSelection,
        provider: publicUser.provider
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Onboarding completion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
