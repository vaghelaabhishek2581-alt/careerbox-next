import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, hasRole } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongoose'
import Facility from '@/src/models/Facility'
import Institute, { IInstitute } from '@/src/models/Institute'
import { z } from 'zod'

// Validation schema for facility creation/update
const facilitySchema = z.object({
  name: z.string().min(1, 'Facility name is required').max(200),
  type: z.enum([
    'library', 'laboratory', 'classroom', 'auditorium', 'sports-complex',
    'cafeteria', 'hostel', 'medical-center', 'computer-center', 'workshop',
    'seminar-hall', 'conference-room', 'parking', 'playground', 'gymnasium',
    'swimming-pool', 'research-center', 'innovation-lab', 'incubation-center',
    'placement-cell', 'counseling-center', 'bank', 'atm', 'transport',
    'security', 'maintenance', 'other'
  ]),
  category: z.enum(['academic', 'recreational', 'residential', 'support', 'administrative']),
  description: z.string().max(1000).optional(),
  location: z.object({
    building: z.string().optional(),
    floor: z.string().optional(),
    roomNumber: z.string().optional(),
    area: z.string().optional(),
    coordinates: z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional()
    }).optional()
  }).optional(),
  capacity: z.number().min(1).optional(),
  area: z.number().min(1).optional(),
  areaUnit: z.enum(['sqft', 'sqm']).default('sqft'),
  equipment: z.array(z.object({
    name: z.string().min(1, 'Equipment name is required'),
    quantity: z.number().min(1),
    condition: z.enum(['excellent', 'good', 'fair', 'poor', 'out-of-order']).default('good'),
    lastMaintenance: z.string().datetime().optional(),
    nextMaintenance: z.string().datetime().optional()
  })).default([]),
  features: z.array(z.string()).default([]),
  operatingHours: z.object({
    monday: z.object({ open: z.string().optional(), close: z.string().optional(), closed: z.boolean().default(false) }).optional(),
    tuesday: z.object({ open: z.string().optional(), close: z.string().optional(), closed: z.boolean().default(false) }).optional(),
    wednesday: z.object({ open: z.string().optional(), close: z.string().optional(), closed: z.boolean().default(false) }).optional(),
    thursday: z.object({ open: z.string().optional(), close: z.string().optional(), closed: z.boolean().default(false) }).optional(),
    friday: z.object({ open: z.string().optional(), close: z.string().optional(), closed: z.boolean().default(false) }).optional(),
    saturday: z.object({ open: z.string().optional(), close: z.string().optional(), closed: z.boolean().default(false) }).optional(),
    sunday: z.object({ open: z.string().optional(), close: z.string().optional(), closed: z.boolean().default(true) }).optional()
  }).optional(),
  isAccessible: z.boolean().default(true),
  requiresBooking: z.boolean().default(false),
  bookingContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional()
  }).optional(),
  inchargeStaff: z.array(z.object({
    name: z.string().min(1, 'Staff name is required'),
    designation: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional()
  })).default([])
})

// GET - Fetch facilities for specific institute
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

    // Fetch facilities for this institute
    const facilities = await Facility.find({ instituteId: institute._id })
      .sort({ name: 1 })
      .lean()

    return NextResponse.json({ 
      success: true, 
      facilities: facilities.map((facility: any) => ({
        ...facility,
        _id: facility._id.toString(),
        instituteId: facility.instituteId.toString()
      }))
    })

  } catch (error) {
    console.error('Error fetching facilities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch facilities' },
      { status: 500 }
    )
  }
}

// POST - Create a new facility
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

    // Check if user has institute role
    if (!user?.roles?.includes('institute')) {
      return NextResponse.json({ error: 'Institute role required' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = facilitySchema.parse(body)

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

    // Create new facility
    const newFacility = new Facility({
      ...validatedData,
      instituteId: institute._id,
      images: [],
      lastMaintenance: null,
      nextMaintenance: null,
      maintenanceNotes: '',
      utilizationRate: 0,
      monthlyUsage: 0,
      status: 'active',
      isPublic: true,
      rating: 0,
      reviewCount: 0
    })

    await newFacility.save()

    return NextResponse.json({
      success: true,
      message: 'Facility created successfully',
      facility: {
        ...newFacility.toObject(),
        _id: newFacility._id.toString(),
        instituteId: newFacility.instituteId.toString()
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating facility:', error)
    return NextResponse.json(
      { error: 'Failed to create facility' },
      { status: 500 }
    )
  }
}
