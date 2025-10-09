import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, hasRole } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import Institute, { IInstitute } from '@/src/models/Institute'
import { ApiResponse } from '@/lib/types/api.types'
import { z } from 'zod'

// Location validation schema
const locationSchema = z.object({
  type: z.enum(['main_campus', 'branch_campus', 'hostel', 'library', 'sports_complex', 'research_center', 'other']),
  name: z.string().min(1, 'Location name is required').max(200, 'Name must be less than 200 characters'),
  address: z.string().min(1, 'Address is required').max(500, 'Address must be less than 500 characters'),
  city: z.string().min(1, 'City is required').max(100, 'City must be less than 100 characters'),
  state: z.string().min(1, 'State is required').max(100, 'State must be less than 100 characters'),
  country: z.string().min(1, 'Country is required').max(100, 'Country must be less than 100 characters'),
  zipCode: z.string().min(1, 'Zip code is required').max(20, 'Zip code must be less than 20 characters'),
  isPrimary: z.boolean().default(false),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }).optional(),
  contactInfo: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional()
  }).optional(),
  facilities: z.array(z.string()).optional(),
  capacity: z.number().int().min(0).optional(),
  establishedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
})

const updateLocationSchema = locationSchema.partial()

// GET /api/institutes/[instituteId]/locations - Get all locations for specific institute
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

    const locations = institute.locations || []
    // Sort by primary first, then by creation date
    locations.sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1
      if (!a.isPrimary && b.isPrimary) return 1
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
    })

    const response: ApiResponse<any> = {
      success: true,
      data: locations,
      message: 'Locations retrieved successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}

// POST /api/institutes/[instituteId]/locations - Create a new location
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
    const validationResult = locationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid location data', details: validationResult.error.errors },
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

    // If this is set as primary, unset other primary locations
    if (validationResult.data.isPrimary) {
      await Institute.findByIdAndUpdate(
        instituteId,
        { $set: { 'locations.$[].isPrimary': false } }
      )
    }

    // Create location object
    const location = {
      id: Date.now().toString(),
      ...validationResult.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Update institute with new location
    const updatedInstitute = await Institute.findByIdAndUpdate(
      instituteId,
      { 
        $push: { locations: location },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    )

    const response: ApiResponse<any> = {
      success: true,
      data: location,
      message: 'Location created successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating location:', error)
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    )
  }
}

// PATCH /api/institutes/[instituteId]/locations - Update a location
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
    const locationId = searchParams.get('id')

    if (!locationId) {
      return NextResponse.json({ error: 'Location ID is required' }, { status: 400 })
    }

    const body = await req.json()
    
    // Validate the request body
    const validationResult = updateLocationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid location data', details: validationResult.error.errors },
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

    // If this is set as primary, unset other primary locations
    if (validationResult.data.isPrimary) {
      await Institute.findByIdAndUpdate(
        instituteId,
        { $set: { 'locations.$[].isPrimary': false } }
      )
    }

    // Build update object
    const updateFields: any = {}
    const validatedData = validationResult.data as any
    Object.keys(validatedData).forEach(key => {
      if (validatedData[key] !== undefined) {
        updateFields[`locations.$.${key}`] = validatedData[key]
      }
    })
    updateFields['locations.$.updatedAt'] = new Date().toISOString()
    updateFields.updatedAt = new Date()

    // Find and update the location
    const updatedInstitute = await Institute.findOneAndUpdate(
      { 
        _id: instituteId,
        'locations.id': locationId
      },
      { $set: updateFields },
      { new: true }
    )

    if (!updatedInstitute) {
      return NextResponse.json({ error: 'Institute or location not found' }, { status: 404 })
    }

    const updatedLocation = updatedInstitute.locations.find((l: any) => l.id === locationId)

    const response: ApiResponse<any> = {
      success: true,
      data: updatedLocation,
      message: 'Location updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating location:', error)
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    )
  }
}

// DELETE /api/institutes/[instituteId]/locations - Delete a location
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
    const locationId = searchParams.get('id')

    if (!locationId) {
      return NextResponse.json({ error: 'Location ID is required' }, { status: 400 })
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
        $pull: { locations: { id: locationId } },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    )

    if (!updatedInstitute) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
    }

    const response: ApiResponse<any> = {
      success: true,
      data: { locationId },
      message: 'Location deleted successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting location:', error)
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    )
  }
}
