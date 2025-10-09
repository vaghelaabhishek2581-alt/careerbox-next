import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, hasRole } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import Institute, { IInstitute } from '@/src/models/Institute'
import { ApiResponse } from '@/lib/types/api.types'
import { z } from 'zod'

// Highlight validation schema
const highlightSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  value: z.string().min(1, 'Value is required').max(50, 'Value must be less than 50 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  example: z.string().max(200, 'Example must be less than 200 characters').optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().int().min(0).optional(),
})

const updateHighlightSchema = highlightSchema.partial()

// GET /api/institutes/[instituteId]/highlights - Get all highlights for specific institute
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

    const highlights = institute.highlights || []
    // Sort by order if available, otherwise by creation date
    highlights.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order
      }
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
    })

    const response: ApiResponse<any> = {
      success: true,
      data: highlights,
      message: 'Highlights retrieved successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching highlights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch highlights' },
      { status: 500 }
    )
  }
}

// POST /api/institutes/[instituteId]/highlights - Create a new highlight
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
    const validationResult = highlightSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid highlight data', details: validationResult.error.errors },
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

    // Create highlight object
    const highlight = {
      id: Date.now().toString(),
      ...validationResult.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Update institute with new highlight
    const updatedInstitute = await Institute.findByIdAndUpdate(
      instituteId,
      { 
        $push: { highlights: highlight },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    )

    const response: ApiResponse<any> = {
      success: true,
      data: highlight,
      message: 'Highlight created successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating highlight:', error)
    return NextResponse.json(
      { error: 'Failed to create highlight' },
      { status: 500 }
    )
  }
}

// PATCH /api/institutes/[instituteId]/highlights - Update a highlight
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
    const highlightId = searchParams.get('id')

    if (!highlightId) {
      return NextResponse.json({ error: 'Highlight ID is required' }, { status: 400 })
    }

    const body = await req.json()
    
    // Validate the request body
    const validationResult = updateHighlightSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid highlight data', details: validationResult.error.errors },
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

    // Find and update the highlight
    const updatedInstitute = await Institute.findOneAndUpdate(
      { 
        _id: instituteId,
        'highlights.id': highlightId
      },
      { 
        $set: { 
          'highlights.$.title': validationResult.data.title,
          'highlights.$.value': validationResult.data.value,
          'highlights.$.description': validationResult.data.description,
          'highlights.$.example': validationResult.data.example,
          'highlights.$.icon': validationResult.data.icon,
          'highlights.$.color': validationResult.data.color,
          'highlights.$.order': validationResult.data.order,
          'highlights.$.updatedAt': new Date().toISOString(),
          updatedAt: new Date()
        }
      },
      { new: true }
    )

    if (!updatedInstitute) {
      return NextResponse.json({ error: 'Institute or highlight not found' }, { status: 404 })
    }

    const updatedHighlight = updatedInstitute.highlights.find((h: any) => h.id === highlightId)

    const response: ApiResponse<any> = {
      success: true,
      data: updatedHighlight,
      message: 'Highlight updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating highlight:', error)
    return NextResponse.json(
      { error: 'Failed to update highlight' },
      { status: 500 }
    )
  }
}

// DELETE /api/institutes/[instituteId]/highlights - Delete a highlight
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
    const highlightId = searchParams.get('id')

    if (!highlightId) {
      return NextResponse.json({ error: 'Highlight ID is required' }, { status: 400 })
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
        $pull: { highlights: { id: highlightId } },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    )

    if (!updatedInstitute) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
    }

    const response: ApiResponse<any> = {
      success: true,
      data: { highlightId },
      message: 'Highlight deleted successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting highlight:', error)
    return NextResponse.json(
      { error: 'Failed to delete highlight' },
      { status: 500 }
    )
  }
}
