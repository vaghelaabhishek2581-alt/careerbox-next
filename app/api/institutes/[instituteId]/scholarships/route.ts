import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, hasRole } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import Institute, { IInstitute } from '@/src/models/Institute'
import { ApiResponse } from '@/lib/types/api.types'
import { z } from 'zod'

// Scholarship validation schema
const scholarshipSchema = z.object({
  title: z.string().min(1, 'Scholarship title is required').max(200, 'Title must be less than 200 characters'),
  type: z.enum([
    'merit_based', 
    'need_based', 
    'sports_scholarship', 
    'cultural_scholarship', 
    'research_scholarship',
    'minority_scholarship',
    'government_scholarship',
    'corporate_scholarship',
    'international_scholarship',
    'other'
  ]),
  category: z.enum([
    'undergraduate',
    'postgraduate', 
    'doctoral',
    'diploma',
    'certificate',
    'all_levels'
  ]),
  amount: z.string().min(1, 'Scholarship amount is required').max(100, 'Amount must be less than 100 characters'),
  currency: z.string().default('INR'),
  numberOfAwards: z.string().min(1, 'Number of awards is required').max(50, 'Number of awards must be less than 50 characters'),
  year: z.number().int().min(2000).max(new Date().getFullYear() + 5),
  applicationDeadline: z.string().optional(),
  announcementDate: z.string().optional(),
  verificationUrl: z.string().url().optional(),
  applicationUrl: z.string().url().optional(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  eligibilityCriteria: z.string().min(1, 'Eligibility criteria is required').max(1000, 'Eligibility criteria must be less than 1000 characters'),
  selectionProcess: z.string().max(500, 'Selection process must be less than 500 characters').optional(),
  documentsRequired: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(), // Additional benefits beyond monetary
  renewalCriteria: z.string().max(500, 'Renewal criteria must be less than 500 characters').optional(),
  contactInfo: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    website: z.string().url().optional(),
    address: z.string().optional()
  }).optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
})

const updateScholarshipSchema = scholarshipSchema.partial()

// GET /api/institutes/[instituteId]/scholarships - Get all scholarships for specific institute
export async function GET(req: NextRequest, { params }: { params: { instituteId: string } }) {
  try {
    const auth = await getAuthenticatedUser(req)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, user } = auth
    const { instituteId } = params

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute ID is required' }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const year = searchParams.get('year')
    const featured = searchParams.get('featured')
    const active = searchParams.get('active')

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

    let scholarships = institute.scholarships || []

    // Apply filters
    if (type) {
      scholarships = scholarships.filter(scholarship => scholarship.type === type)
    }
    if (category) {
      scholarships = scholarships.filter(scholarship => scholarship.category === category)
    }
    if (year) {
      scholarships = scholarships.filter(scholarship => scholarship.year === parseInt(year))
    }
    if (featured === 'true') {
      scholarships = scholarships.filter(scholarship => scholarship.isFeatured)
    }
    if (active !== null && active !== undefined) {
      scholarships = scholarships.filter(scholarship => scholarship.isActive === (active === 'true'))
    }

    // Sort by featured first, then by year (newest first), then by creation date
    scholarships.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
      if (a.year !== b.year) return b.year - a.year
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    })

    const response: ApiResponse<any> = {
      success: true,
      data: scholarships,
      message: 'Scholarships retrieved successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching scholarships:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scholarships' },
      { status: 500 }
    )
  }
}

// POST /api/institutes/[instituteId]/scholarships - Create a new scholarship
export async function POST(req: NextRequest, { params }: { params: { instituteId: string } }) {
  try {
    const auth = await getAuthenticatedUser(req)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, user } = auth
    const { instituteId } = params

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute ID is required' }, { status: 400 })
    }

    const body = await req.json()
    
    // Validate the request body
    const validationResult = scholarshipSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid scholarship data', details: validationResult.error.errors },
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

    // Create scholarship object
    const scholarship = {
      id: Date.now().toString(),
      ...validationResult.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Update institute with new scholarship
    const updatedInstitute = await Institute.findByIdAndUpdate(
      instituteId,
      { 
        $push: { scholarships: scholarship },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    )

    const response: ApiResponse<any> = {
      success: true,
      data: scholarship,
      message: 'Scholarship created successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating scholarship:', error)
    return NextResponse.json(
      { error: 'Failed to create scholarship' },
      { status: 500 }
    )
  }
}

// PATCH /api/institutes/[instituteId]/scholarships - Update a scholarship
export async function PATCH(req: NextRequest, { params }: { params: { instituteId: string } }) {
  try {
    const auth = await getAuthenticatedUser(req)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, user } = auth
    const { instituteId } = params

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute ID is required' }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const scholarshipId = searchParams.get('id')

    if (!scholarshipId) {
      return NextResponse.json({ error: 'Scholarship ID is required' }, { status: 400 })
    }

    const body = await req.json()
    
    // Validate the request body
    const validationResult = updateScholarshipSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid scholarship data', details: validationResult.error.errors },
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

    // Build update object with proper typing
    const updateFields: any = {}
    const validatedData = validationResult.data as any
    Object.keys(validatedData).forEach(key => {
      if (validatedData[key] !== undefined) {
        updateFields[`scholarships.$.${key}`] = validatedData[key]
      }
    })
    updateFields['scholarships.$.updatedAt'] = new Date().toISOString()
    updateFields.updatedAt = new Date()

    // Find and update the scholarship
    const updatedInstitute = await Institute.findOneAndUpdate(
      { 
        _id: instituteId,
        'scholarships.id': scholarshipId
      },
      { $set: updateFields },
      { new: true }
    )

    if (!updatedInstitute) {
      return NextResponse.json({ error: 'Institute or scholarship not found' }, { status: 404 })
    }

    const updatedScholarship = updatedInstitute.scholarships.find((s: any) => s.id === scholarshipId)

    const response: ApiResponse<any> = {
      success: true,
      data: updatedScholarship,
      message: 'Scholarship updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating scholarship:', error)
    return NextResponse.json(
      { error: 'Failed to update scholarship' },
      { status: 500 }
    )
  }
}

// DELETE /api/institutes/[instituteId]/scholarships - Delete a scholarship
export async function DELETE(req: NextRequest, { params }: { params: { instituteId: string } }) {
  try {
    const auth = await getAuthenticatedUser(req)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, user } = auth
    const { instituteId } = params

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute ID is required' }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const scholarshipId = searchParams.get('id')

    if (!scholarshipId) {
      return NextResponse.json({ error: 'Scholarship ID is required' }, { status: 400 })
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
        $pull: { scholarships: { id: scholarshipId } },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    )

    if (!updatedInstitute) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
    }

    const response: ApiResponse<any> = {
      success: true,
      data: { scholarshipId },
      message: 'Scholarship deleted successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting scholarship:', error)
    return NextResponse.json(
      { error: 'Failed to delete scholarship' },
      { status: 500 }
    )
  }
}
