import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, hasRole } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import Institute, { IInstitute } from '@/src/models/Institute'
import { ApiResponse } from '@/lib/types/api.types'
import { z } from 'zod'

// Award validation schema
const awardSchema = z.object({
  title: z.string().min(1, 'Award title is required').max(200, 'Title must be less than 200 characters'),
  category: z.enum([
    'academic_excellence', 
    'research_innovation', 
    'teaching_excellence', 
    'student_achievement', 
    'community_service', 
    'industry_partnership', 
    'sustainability', 
    'technology_innovation',
    'sports_achievement',
    'cultural_excellence',
    'leadership',
    'other'
  ]),
  issuer: z.string().min(1, 'Award issuer is required').max(200, 'Issuer must be less than 200 characters'),
  year: z.number().int().min(1900).max(new Date().getFullYear()),
  month: z.number().int().min(1).max(12).optional(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  certificateImage: z.string().url().optional(),
  verificationUrl: z.string().url().optional(),
  isFeatured: z.boolean().default(false),
  level: z.enum(['international', 'national', 'state', 'regional', 'institutional']).optional(),
  recipients: z.array(z.string()).optional(), // Names of recipients
  criteria: z.string().max(500, 'Criteria must be less than 500 characters').optional(),
  impact: z.string().max(500, 'Impact description must be less than 500 characters').optional(),
  mediaLinks: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
})

const updateAwardSchema = awardSchema.partial()

// GET /api/institutes/[instituteId]/awards - Get all awards for specific institute
export async function GET(req: NextRequest, { params }: { params: Promise<{ instituteId: string }> }) {
  try {
    const auth = await getAuthenticatedUser(req)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, user } = auth
    const { instituteId } = await params

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute ID is required' }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const year = searchParams.get('year')
    const featured = searchParams.get('featured')

    await connectToDatabase()

    // Find the institute by ID
    const instituteRaw = await Institute.findById(instituteId).lean().exec()
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

    let awards = (institute.awards || []) as any[]

    // Apply filters
    if (category) {
      awards = awards.filter((award: any) => award.category === category)
    }
    if (year) {
      awards = awards.filter((award: any) => award.year === parseInt(year))
    }
    if (featured === 'true') {
      awards = awards.filter((award: any) => award.isFeatured)
    }

    // Sort by featured first, then by year (newest first), then by creation date
    awards.sort((a: any, b: any) => {
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
      if (a.year !== b.year) return b.year - a.year
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    })

    const response: ApiResponse<any> = {
      success: true,
      data: awards,
      message: 'Awards retrieved successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching awards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch awards' },
      { status: 500 }
    )
  }
}

// POST /api/institutes/[instituteId]/awards - Create a new award
export async function POST(req: NextRequest, { params }: { params: Promise<{ instituteId: string }> }) {
  try {
    const auth = await getAuthenticatedUser(req)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, user } = auth
    const { instituteId } = await params

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute ID is required' }, { status: 400 })
    }

    const body = await req.json()
    
    // Validate the request body
    const validationResult = awardSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid award data', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Find the institute by ID
    const instituteRaw = await Institute.findById(instituteId).lean().exec()
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

    // Create award object
    const award = {
      id: Date.now().toString(),
      ...validationResult.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Update institute with new award
    const updatedInstitute = await Institute.findByIdAndUpdate(
      instituteId,
      { 
        $push: { awards: award },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    )

    const response: ApiResponse<any> = {
      success: true,
      data: award,
      message: 'Award created successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating award:', error)
    return NextResponse.json(
      { error: 'Failed to create award' },
      { status: 500 }
    )
  }
}

// PATCH /api/institutes/[instituteId]/awards - Update an award
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ instituteId: string }> }) {
  try {
    const auth = await getAuthenticatedUser(req)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, user } = auth
    const { instituteId } = await params

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute ID is required' }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const awardId = searchParams.get('id')

    if (!awardId) {
      return NextResponse.json({ error: 'Award ID is required' }, { status: 400 })
    }

    const body = await req.json()
    
    // Validate the request body
    const validationResult = updateAwardSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid award data', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Verify institute exists and user has access
    const instituteRaw = await Institute.findById(instituteId).lean().exec()
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

    // Build update object
    const updateFields: any = {}
    const validatedData = validationResult.data as any
    Object.keys(validatedData).forEach(key => {
      if (validatedData[key] !== undefined) {
        updateFields[`awards.$.${key}`] = validatedData[key]
      }
    })
    updateFields['awards.$.updatedAt'] = new Date().toISOString()
    updateFields.updatedAt = new Date()

    // Find and update the award
    const updatedInstitute = await Institute.findOneAndUpdate(
      { 
        _id: instituteId,
        'awards.id': awardId
      },
      { $set: updateFields },
      { new: true }
    )

    if (!updatedInstitute) {
      return NextResponse.json({ error: 'Institute or award not found' }, { status: 404 })
    }

    const updatedAward = updatedInstitute.awards.find((a: any) => a.id === awardId)

    const response: ApiResponse<any> = {
      success: true,
      data: updatedAward,
      message: 'Award updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating award:', error)
    return NextResponse.json(
      { error: 'Failed to update award' },
      { status: 500 }
    )
  }
}

// DELETE /api/institutes/[instituteId]/awards - Delete an award
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ instituteId: string }> }) {
  try {
    const auth = await getAuthenticatedUser(req)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, user } = auth
    const { instituteId } = await params

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute ID is required' }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const awardId = searchParams.get('id')

    if (!awardId) {
      return NextResponse.json({ error: 'Award ID is required' }, { status: 400 })
    }

    await connectToDatabase()

    // Verify institute exists and user has access
    const instituteRaw = await Institute.findById(instituteId).lean().exec()
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

    // Find and update the institute
    const updatedInstitute = await Institute.findByIdAndUpdate(
      instituteId,
      { 
        $pull: { awards: { id: awardId } },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    )

    if (!updatedInstitute) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
    }

    const response: ApiResponse<any> = {
      success: true,
      data: { awardId },
      message: 'Award deleted successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting award:', error)
    return NextResponse.json(
      { error: 'Failed to delete award' },
      { status: 500 }
    )
  }
}
