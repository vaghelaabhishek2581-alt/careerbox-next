import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, hasRole } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongoose'
import Institute, { IInstitute } from '@/src/models/Institute'
import { z } from 'zod'

// Validation schemas
const rankingSchema = z.object({
  title: z.string().min(1, 'Ranking title is required').max(200),
  organization: z.string().min(1, 'Organization is required').max(200),
  category: z.enum(['national', 'state', 'international', 'university', 'program-specific']),
  rank: z.number().min(1),
  totalParticipants: z.number().min(1).optional(),
  year: z.number().min(2000).max(new Date().getFullYear() + 1),
  description: z.string().min(1, 'Description is required').max(1000),
  certificateUrl: z.string().url().optional(),
  verificationUrl: z.string().url().optional(),
  status: z.enum(['verified', 'pending', 'unverified']).default('pending')
})

const achievementSchema = z.object({
  title: z.string().min(1, 'Achievement title is required').max(200),
  type: z.enum(['accreditation', 'certification', 'award', 'recognition', 'milestone']),
  organization: z.string().min(1, 'Organization is required').max(200),
  description: z.string().min(1, 'Description is required').max(1000),
  dateAwarded: z.string().datetime(),
  validUntil: z.string().datetime().optional(),
  certificateUrl: z.string().url().optional(),
  status: z.enum(['active', 'expired', 'pending']).default('active')
})

// GET - Fetch rankings and achievements for specific institute
export async function GET(request: NextRequest, context: { params: Promise<{ instituteId: string }> }) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, user } = authResult
    const { instituteId } = await context.params

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute ID is required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'rankings' or 'achievements'

    await connectToDatabase()

    // Find institute by ID
    const instituteRaw = await Institute.findById(instituteId).lean()
    if (!instituteRaw) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
    }

    const institute = instituteRaw as unknown as IInstitute

    // Authorization: Only admin or institute owner can access
    const isAdmin = hasRole(user, 'admin')
    const isOwner = institute.userId.toString() === userId

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Access denied. Only admins and institute owners can access this resource.' }, { status: 403 })
    }

    const instituteDataRaw = await Institute.findById(institute._id)
      .select('rankings achievements')
      .lean()

    // Type assertion to resolve Mongoose lean() typing issues
    const instituteData = instituteDataRaw as unknown as IInstitute

    if (type === 'rankings') {
      return NextResponse.json({
        success: true,
        rankings: instituteData?.rankings || []
      })
    } else if (type === 'achievements') {
      return NextResponse.json({
        success: true,
        achievements: instituteData?.achievements || []
      })
    } else {
      return NextResponse.json({
        success: true,
        rankings: instituteData?.rankings || [],
        achievements: instituteData?.achievements || []
      })
    }

  } catch (error) {
    console.error('Error fetching rankings/achievements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}

// POST - Create a new ranking or achievement
export async function POST(request: NextRequest, context: { params: Promise<{ instituteId: string }> }) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, user } = authResult
    const { instituteId } = await context.params

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { type, ...data } = body

    if (!type || !['ranking', 'achievement'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "ranking" or "achievement"' },
        { status: 400 }
      )
    }

    // Validate input based on type
    let validatedData
    if (type === 'ranking') {
      validatedData = rankingSchema.parse(data)
    } else {
      validatedData = achievementSchema.parse(data)
    }

    await connectToDatabase()

    // Find institute by ID
    const instituteRaw = await Institute.findById(instituteId).lean()
    if (!instituteRaw) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
    }

    const institute = instituteRaw as unknown as IInstitute

    // Authorization: Only admin or institute owner can modify
    const isAdmin = hasRole(user, 'admin')
    const isOwner = institute.userId.toString() === userId

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Access denied. Only admins and institute owners can modify this resource.' }, { status: 403 })
    }

    // Add new ranking or achievement to institute
    const newItem = {
      ...validatedData,
      id: new Date().getTime().toString(), // Simple ID generation
      createdAt: new Date()
    }

    let updateField
    let successMessage
    if (type === 'ranking') {
      updateField = { $push: { rankings: newItem } }
      successMessage = 'Ranking added successfully'
    } else {
      updateField = { $push: { achievements: newItem } }
      successMessage = 'Achievement added successfully'
    }

    await Institute.findByIdAndUpdate(instituteId, updateField)

    return NextResponse.json({
      success: true,
      message: successMessage,
      [type]: newItem
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating ranking/achievement:', error)
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    )
  }
}
