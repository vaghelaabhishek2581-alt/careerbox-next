import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, hasRole } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongoose'
import Faculty from '@/src/models/Faculty'
import Institute, { IInstitute } from '@/src/models/Institute'
import { z } from 'zod'

// Validation schema for faculty creation/update
const facultySchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').max(50),
  personalInfo: z.object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    middleName: z.string().max(50).optional(),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    alternatePhone: z.string().optional(),
    dateOfBirth: z.string().datetime().optional(),
    gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      country: z.string().min(1, 'Country is required'),
      zipCode: z.string().optional()
    })
  }),
  department: z.string().min(1, 'Department is required').max(100),
  designation: z.string().min(1, 'Designation is required').max(100),
  employmentType: z.enum(['full-time', 'part-time', 'visiting', 'adjunct', 'emeritus']),
  joiningDate: z.string().datetime(),
  qualifications: z.array(z.object({
    degree: z.string().min(1, 'Degree is required'),
    field: z.string().min(1, 'Field is required'),
    institution: z.string().min(1, 'Institution is required'),
    year: z.number().min(1950).max(new Date().getFullYear()),
    grade: z.string().optional()
  })).min(1, 'At least one qualification is required'),
  specialization: z.array(z.string().max(100)).default([]),
  researchInterests: z.array(z.string().max(100)).default([]),
  totalExperience: z.number().min(0).default(0),
  teachingExperience: z.number().min(0).default(0),
  industryExperience: z.number().min(0).default(0),
  subjectsTaught: z.array(z.string()).default([]),
  bio: z.string().max(1000).optional()
})

// GET - Fetch faculty for specific institute
export async function GET(request: NextRequest, { params }: { params: Promise<{ instituteId: string }> }) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, user } = authResult
    const { instituteId } = await params

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

    // Fetch faculty for this institute
    const faculty = await Faculty.find({ instituteId: institute._id })
      .sort({ 'personalInfo.firstName': 1 })
      .lean()

    return NextResponse.json({ 
      success: true, 
      faculty: faculty.map((member: any) => ({
        ...member,
        _id: member._id.toString(),
        instituteId: member.instituteId.toString()
      }))
    })

  } catch (error) {
    console.error('Error fetching faculty:', error)
    return NextResponse.json(
      { error: 'Failed to fetch faculty' },
      { status: 500 }
    )
  }
}

// POST - Create a new faculty member
export async function POST(request: NextRequest, { params }: { params: Promise<{ instituteId: string }> }) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, user } = authResult
    const { instituteId } = await params

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute ID is required' }, { status: 400 })
    }

    const body = await request.json()

    // Validate input
    const validatedData = facultySchema.parse(body)

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

    // Check if employee ID already exists for this institute
    const existingFaculty = await Faculty.findOne({ 
      instituteId: institute._id, 
      employeeId: validatedData.employeeId 
    })
    if (existingFaculty) {
      return NextResponse.json(
        { error: 'Employee ID already exists' },
        { status: 400 }
      )
    }

    // Check if email already exists for this institute
    const existingEmail = await Faculty.findOne({ 
      instituteId: institute._id, 
      'personalInfo.email': validatedData.personalInfo.email 
    })
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Create new faculty member
    const newFaculty = new Faculty({
      ...validatedData,
      instituteId: institute._id,
      publications: [],
      researchProjects: [],
      coursesHandled: [],
      awards: [],
      administrativeRoles: [],
      socialMedia: {},
      status: 'active',
      isVerified: false
    })

    await newFaculty.save()

    // Update institute faculty count
    await Institute.findByIdAndUpdate(
      institute._id,
      { $inc: { facultyCount: 1 } }
    )

    return NextResponse.json({
      success: true,
      message: 'Faculty member added successfully',
      faculty: {
        ...newFaculty.toObject(),
        _id: newFaculty._id.toString(),
        instituteId: newFaculty.instituteId.toString()
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating faculty:', error)
    return NextResponse.json(
      { error: 'Failed to create faculty member' },
      { status: 500 }
    )
  }
}
