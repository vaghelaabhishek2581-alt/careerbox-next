// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import clientPromise from '../../db'
import { ObjectId } from 'mongodb'
import {
  UserProfileUpdateSchema,
  toPublicUser,
  type UserDocument
} from '@/lib/types/user'
import { authenticateRequest } from '@/lib/auth'

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieves the complete user profile. Supports both NextAuth sessions and JWT tokens.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
export async function GET (request: NextRequest) {
  try {
    console.log('=== Profile API GET Debug ===')

    // Log request headers for debugging
    console.log('Request headers:', {
      cookie: request.headers.get('cookie')?.substring(0, 100) + '...',
      authorization: request.headers.get('authorization'),
      'user-agent': request.headers.get('user-agent')
    })

    // Authenticate request (works for both web sessions and JWT tokens)
    const authUser = await authenticateRequest(request)
    console.log('Auth result:', authUser)

    if (!authUser) {
      console.log('❌ Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ User authenticated:', {
      id: authUser.id,
      email: authUser.email
    })

    const client = await clientPromise
    const db = client.db()
    console.log('✅ Database connected')

    // Add more debugging for the database query
    console.log('Searching for user with ID:', authUser.id)
    console.log('ID type:', typeof authUser.id)
    console.log('Is valid ObjectId?', ObjectId.isValid(authUser.id))

    // Try to find user with different approaches
    let user: UserDocument | null = null

    // Method 1: Try with ObjectId conversion
    if (ObjectId.isValid(authUser.id)) {
      user = (await db.collection('users').findOne(
        { _id: new ObjectId(authUser.id) },
        {
          projection: {
            password: 0 // Exclude sensitive fields
          }
        }
      )) as UserDocument | null
      console.log('Method 1 (ObjectId) result:', user ? 'Found' : 'Not found')
    }

    // Method 2: Try with string ID if ObjectId method failed
    if (!user) {
      user = (await db.collection('users').findOne(
        { _id: authUser.id as any },
        {
          projection: {
            password: 0
          }
        }
      )) as UserDocument | null
      console.log('Method 2 (String ID) result:', user ? 'Found' : 'Not found')
    }

    // Method 3: Try finding by email as fallback
    if (!user && authUser.email) {
      user = (await db.collection('users').findOne(
        { email: authUser.email },
        {
          projection: {
            password: 0
          }
        }
      )) as UserDocument | null
      console.log('Method 3 (Email) result:', user ? 'Found' : 'Not found')
    }

    // Method 4: Debug - let's see what users exist
    if (!user) {
      const userCount = await db.collection('users').countDocuments()
      const sampleUsers = await db
        .collection('users')
        .find(
          {},
          {
            projection: { _id: 1, email: 1, name: 1 },
            limit: 3
          }
        )
        .toArray()

      console.log('Total users in DB:', userCount)
      console.log(
        'Sample users:',
        sampleUsers.map(u => ({
          id: u._id,
          email: u.email,
          name: u.name,
          idType: typeof u._id
        }))
      )
    }

    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json(
        {
          error: 'User not found',
          debug: {
            searchedId: authUser.id,
            idType: typeof authUser.id,
            isValidObjectId: ObjectId.isValid(authUser.id)
          }
        },
        { status: 404 }
      )
    }

    console.log('✅ User found:', {
      id: user._id,
      email: user.email,
      name: user.name
    })

    // Convert to public user format
    const profile = toPublicUser(user)
    console.log('✅ Profile converted successfully')

    return NextResponse.json(profile)
  } catch (error) {
    console.error('❌ Error fetching profile:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        debug:
          process.env.NODE_ENV === 'development'
            ? (error as Error).message
            : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * @swagger
 * /api/user/profile:
 *   patch:
 *     summary: Update user profile
 *     description: Updates specific fields of the user profile. Supports both NextAuth sessions and JWT tokens.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               location:
 *                 type: string
 *               company:
 *                 type: string
 *               website:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               languages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     level:
 *                       type: string
 *                       enum: [BASIC, INTERMEDIATE, ADVANCED, FLUENT, NATIVE]
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *               socialLinks:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *               personalDetails:
 *                 type: object
 *               workExperiences:
 *                 type: array
 *               education:
 *                 type: array
 *               profileImage:
 *                 type: string
 *               coverImage:
 *                 type: string
 *               userType:
 *                 type: string
 *                 enum: [student, professional]
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *               activeRole:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
export async function PATCH (request: NextRequest) {
  try {
    console.log('=== Profile API PATCH Debug ===')

    // Authenticate request (works for both web sessions and JWT tokens)
    const authUser = await authenticateRequest(request)
    console.log('Auth result:', authUser)

    if (!authUser) {
      console.log('❌ Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    console.log('Update data received:', Object.keys(data))

    // Validate the incoming data
    let validatedData
    try {
      validatedData = UserProfileUpdateSchema.parse(data)
      console.log('✅ Data validation passed')
    } catch (validationError) {
      console.log('❌ Data validation failed:', validationError)
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

    // Prepare update data - only include fields that are provided
    const updateData: any = {
      updatedAt: new Date()
    }

    // Add only defined fields to updateData
    Object.keys(validatedData).forEach(key => {
      const value = validatedData[key as keyof typeof validatedData]
      if (value !== undefined) {
        updateData[key] = value
      }
    })

    console.log('Update fields:', Object.keys(updateData))

    // Try both ID formats for the update as well
    let result
    if (ObjectId.isValid(authUser.id)) {
      result = await db
        .collection('users')
        .updateOne({ _id: new ObjectId(authUser.id) }, { $set: updateData })
    } else {
      result = await db
        .collection('users')
        .updateOne({ _id: authUser.id as any }, { $set: updateData })
    }

    if (!result.matchedCount) {
      console.log('❌ No user matched for update')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('✅ User updated successfully')

    // Get updated user data
    let updatedUser: UserDocument | null = null

    if (ObjectId.isValid(authUser.id)) {
      updatedUser = (await db
        .collection('users')
        .findOne(
          { _id: new ObjectId(authUser.id) },
          { projection: { password: 0 } }
        )) as UserDocument | null
    } else {
      updatedUser = (await db
        .collection('users')
        .findOne(
          { _id: authUser.id as any },
          { projection: { password: 0 } }
        )) as UserDocument | null
    }

    if (!updatedUser) {
      console.log('❌ Could not fetch updated user')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Convert to public user format
    const profile = toPublicUser(updatedUser)
    console.log('✅ Updated profile converted successfully')

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: profile
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('❌ Error updating profile:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        debug:
          process.env.NODE_ENV === 'development'
            ? (error as Error).message
            : undefined
      },
      { status: 500 }
    )
  }
}
