// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import clientPromise from '../../db'
import { ObjectId } from 'mongodb'
import { UserProfileUpdateSchema } from '@/lib/types/profile.unified'
import { authenticateRequest } from '@/lib/auth'

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *         userType:
 *           type: string
 *         profileImage:
 *           type: string
 *           nullable: true
 *         coverImage:
 *           type: string
 *           nullable: true
 *         location:
 *           type: string
 *         website:
 *           type: string
 *         bio:
 *           type: string
 *         verified:
 *           type: boolean
 *         emailVerified:
 *           type: boolean
 *         followers:
 *           type: integer
 *         following:
 *           type: integer
 *         personalDetails:
 *           type: object
 *           properties:
 *             firstName: { type: string }
 *             lastName: { type: string }
 *             middleName: { type: string }
 *             dateOfBirth: { type: string }
 *             gender: { type: string }
 *             professionalHeadline: { type: string }
 *             publicProfileId: { type: string }
 *             aboutMe: { type: string }
 *             phone: { type: string }
 *             interests: { type: array, items: { type: string } }
 *             professionalBadges: { type: array, items: { type: string } }
 *         skills:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id: { type: string }
 *               name: { type: string }
 *               level: { type: string }
 *         languages:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id: { type: string }
 *               name: { type: string }
 *               level: { type: string }
 *         workExperiences:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id: { type: string }
 *               company: { type: string }
 *               location: { type: string }
 *               positions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     title: { type: string }
 *                     startDate: { type: string }
 *                     endDate: { type: string }
 *                     isCurrent: { type: boolean }
 *                     description: { type: string }
 *                     employmentType: { type: string }
 *                     skills: { type: array, items: { type: string } }
 *         education:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id: { type: string }
 *               degree: { type: string }
 *               institution: { type: string }
 *               fieldOfStudy: { type: string }
 *               startDate: { type: string }
 *               endDate: { type: string }
 *               isCurrent: { type: boolean }
 *               location: { type: string }
 *               grade: { type: string }
 *               description: { type: string }
 *         contacts:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id: { type: string }
 *               email: { type: string }
 *               isPrimary: { type: boolean }
 *               isVerified: { type: boolean }
 *         socialLinks:
 *           type: object
 *           additionalProperties: true
 *         stats:
 *           type: object
 *           properties:
 *             completedCourses: { type: integer }
 *             skillsAssessed: { type: integer }
 *             careerGoals: { type: integer }
 *             networkSize: { type: integer }
 *         progress:
 *           type: object
 *           properties:
 *             overall: { type: integer }
 *             skills: { type: integer }
 *             goals: { type: integer }
 *         roles:
 *           type: array
 *           items: { type: string }
 *         activeRole:
 *           type: string
 *         permissions:
 *           type: array
 *           items: { type: string }
 *         needsOnboarding:
 *           type: boolean
 *         needsRoleSelection:
 *           type: boolean
 *         provider:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UserProfileUpdate:
 *       type: object
 *       description: Fields for updating the user profile (partial)
 *       additionalProperties: true
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         details:
 *           type: array
 *           items: { type: object }
 *         debug:
 *           type: string
 */

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags:
 *       - User
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: The user's profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   patch:
 *     summary: Update the authenticated user's profile
 *     tags:
 *       - User
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfileUpdate'
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export interface DatabaseUser {
  _id: any
  name: string
  email: string
  role?: string
  userType?: string
  profileImage?: string
  coverImage?: string
  location?: string
  website?: string
  bio?: string
  verified?: boolean
  emailVerified?: boolean
  followers?: number
  following?: number
  personalDetails?: any
  skills?: any[]
  languages?: any[]
  workExperiences?: any[]
  education?: any[]
  contacts?: any[]
  socialLinks?: any
  stats?: any
  progress?: any
  roles?: string[]
  activeRole?: string
  permissions?: string[]
  needsOnboarding?: boolean
  needsRoleSelection?: boolean
  provider?: string
  createdAt?: Date
  updatedAt?: Date
}

function convertToUserProfile(user: DatabaseUser) {
  return {
    id: user._id?.toString() || user._id,
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'user',
    userType: user.userType || 'professional',
    profileImage: user.profileImage,
    coverImage: user.coverImage,
    location: user.location || '',
    website: user.website || '',
    bio: user.bio || '',
    verified: user.verified || false,
    emailVerified: user.emailVerified || false,
    followers: user.followers || 0,
    following: user.following || 0,
    personalDetails: {
      firstName: user.personalDetails?.firstName || '',
      lastName: user.personalDetails?.lastName || '',
      middleName: user.personalDetails?.middleName || '',
      dateOfBirth: user.personalDetails?.dateOfBirth || '',
      gender: user.personalDetails?.gender || 'PREFER_NOT_TO_SAY',
      professionalHeadline: user.personalDetails?.professionalHeadline || '',
      publicProfileId: user.personalDetails?.publicProfileId || '',
      aboutMe: user.personalDetails?.aboutMe || '',
      phone: user.personalDetails?.phone || '',
      interests: user.personalDetails?.interests || [],
      professionalBadges: user.personalDetails?.professionalBadges || []
    },
    skills: (user.skills || []).map((skill: any, index: number) => ({
      id: skill.id || `skill_${index}`,
      name: skill.name || skill,
      level: skill.level || 'INTERMEDIATE'
    })),
    languages: (user.languages || []).map((lang: any, index: number) => ({
      id: lang.id || `lang_${index}`,
      name: lang.name || lang,
      level: lang.level || 'INTERMEDIATE'
    })),
    workExperiences: (user.workExperiences || []).map((work: any, index: number) => ({
      id: work.id || `work_${index}`,
      company: work.company || '',
      location: work.location || '',
      positions: (work.positions || []).map((pos: any, posIndex: number) => ({
        id: pos.id || `pos_${index}_${posIndex}`,
        title: pos.title || '',
        startDate: pos.startDate || '',
        endDate: pos.endDate || '',
        isCurrent: pos.isCurrent || false,
        description: pos.description || '',
        employmentType: pos.employmentType || 'FULL_TIME',
        skills: pos.skills || []
      }))
    })),
    education: (user.education || []).map((edu: any, index: number) => ({
      id: edu.id || `edu_${index}`,
      degree: edu.degree || '',
      institution: edu.institution || '',
      fieldOfStudy: edu.fieldOfStudy || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      isCurrent: edu.isCurrent || false,
      location: edu.location || '',
      grade: edu.grade || '',
      description: edu.description || ''
    })),
    contacts: (user.contacts || []).map((contact: any, index: number) => ({
      id: contact.id || `contact_${index}`,
      email: contact.email || '',
      isPrimary: contact.isPrimary || false,
      isVerified: contact.isVerified || false
    })),
    socialLinks: user.socialLinks || {},
    stats: {
      completedCourses: user.stats?.completedCourses || 0,
      skillsAssessed: user.stats?.skillsAssessed || 0,
      careerGoals: user.stats?.careerGoals || 0,
      networkSize: user.stats?.networkSize || 0
    },
    progress: {
      overall: user.progress?.overall || 0,
      skills: user.progress?.skills || 0,
      goals: user.progress?.goals || 0
    },
    roles: user.roles || [user.role || 'user'],
    activeRole: user.activeRole || user.role || 'user',
    permissions: user.permissions || [],
    needsOnboarding: user.needsOnboarding || false,
    needsRoleSelection: user.needsRoleSelection || false,
    provider: user.provider || 'credentials',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('=== Profile API GET Debug ===')

    const authUser = await authenticateRequest(request)
    console.log('Auth result:', authUser)

    if (!authUser) {
      console.log('❌ Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()
    
    let user: DatabaseUser | null = null

    // Try different methods to find the user
    if (ObjectId.isValid(authUser.id)) {
      user = await db.collection('users').findOne(
        { _id: new ObjectId(authUser.id) },
        { projection: { password: 0 } }
      ) as DatabaseUser | null
    }

    if (!user) {
      user = await db.collection('users').findOne(
        { _id: authUser.id as any },
        { projection: { password: 0 } }
      ) as DatabaseUser | null
    }

    if (!user && authUser.email) {
      user = await db.collection('users').findOne(
        { email: authUser.email },
        { projection: { password: 0 } }
      ) as DatabaseUser | null
    }

    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const profile = convertToUserProfile(user)
    console.log('✅ Profile converted successfully')

    return NextResponse.json(profile)
  } catch (error) {
    console.error('❌ Error fetching profile:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        debug: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('=== Profile API PATCH Debug ===')

    const authUser = await authenticateRequest(request)
    if (!authUser) {
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

    // Prepare update data
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

    // Update user
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get updated user
    let updatedUser: DatabaseUser | null = null
    if (ObjectId.isValid(authUser.id)) {
      updatedUser = await db
        .collection('users')
        .findOne(
          { _id: new ObjectId(authUser.id) },
          { projection: { password: 0 } }
        ) as DatabaseUser | null
    } else {
      updatedUser = await db
        .collection('users')
        .findOne(
          { _id: authUser.id as any },
          { projection: { password: 0 } }
        ) as DatabaseUser | null
    }

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const profile = convertToUserProfile(updatedUser)
    
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
        debug: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}