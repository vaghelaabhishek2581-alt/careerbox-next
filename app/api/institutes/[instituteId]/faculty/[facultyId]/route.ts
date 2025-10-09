import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/mongoose'
import Faculty from '@/src/models/Faculty'
import Institute from '@/src/models/Institute'
import { z } from 'zod'

// Validation schema for faculty update
const updateFacultySchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').max(50).optional(),
  personalInfo: z.object({
    firstName: z.string().min(1, 'First name is required').max(50).optional(),
    lastName: z.string().min(1, 'Last name is required').max(50).optional(),
    middleName: z.string().max(50).optional(),
    email: z.string().email('Valid email is required').optional(),
    phone: z.string().min(10, 'Valid phone number is required').optional(),
    alternatePhone: z.string().optional(),
    dateOfBirth: z.string().datetime().optional(),
    gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().min(1, 'City is required').optional(),
      state: z.string().min(1, 'State is required').optional(),
      country: z.string().min(1, 'Country is required').optional(),
      zipCode: z.string().optional()
    }).optional()
  }).optional(),
  department: z.string().min(1, 'Department is required').max(100).optional(),
  designation: z.string().min(1, 'Designation is required').max(100).optional(),
  employmentType: z.enum(['full-time', 'part-time', 'visiting', 'adjunct', 'emeritus']).optional(),
  joiningDate: z.string().datetime().optional(),
  qualifications: z.array(z.object({
    degree: z.string().min(1, 'Degree is required'),
    field: z.string().min(1, 'Field is required'),
    institution: z.string().min(1, 'Institution is required'),
    year: z.number().min(1950).max(new Date().getFullYear()),
    grade: z.string().optional()
  })).optional(),
  specialization: z.array(z.string().max(100)).optional(),
  researchInterests: z.array(z.string().max(100)).optional(),
  totalExperience: z.number().min(0).optional(),
  teachingExperience: z.number().min(0).optional(),
  industryExperience: z.number().min(0).optional(),
  subjectsTaught: z.array(z.string()).optional(),
  bio: z.string().max(1000).optional(),
  status: z.enum(['active', 'inactive', 'on-leave', 'retired']).optional()
})

// GET - Fetch specific faculty member
export async function GET(
  request: NextRequest,
  { params }: { params: { facultyId: string } }
) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = authResult
    const { facultyId } = params

    await connectToDatabase()

    // Find user's institute
    const institute = await Institute.findOne({ userId }).lean()
    if (!institute) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
    }

    // Fetch specific faculty member
    const faculty = await Faculty.findOne({ 
      _id: facultyId, 
      instituteId: institute._id 
    }).lean()

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty member not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      faculty: {
        ...faculty,
        _id: faculty._id.toString(),
        instituteId: faculty.instituteId.toString()
      }
    })

  } catch (error) {
    console.error('Error fetching faculty member:', error)
    return NextResponse.json(
      { error: 'Failed to fetch faculty member' },
      { status: 500 }
    )
  }
}

// PATCH - Update faculty member
export async function PATCH(
  request: NextRequest,
  { params }: { params: { facultyId: string } }
) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = authResult
    const { facultyId } = params
    const body = await request.json()

    // Validate input
    const validatedData = updateFacultySchema.parse(body)

    await connectToDatabase()

    // Find user's institute
    const institute = await Institute.findOne({ userId }).lean()
    if (!institute) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
    }

    // Check if faculty member exists and belongs to this institute
    const existingFaculty = await Faculty.findOne({ 
      _id: facultyId, 
      instituteId: institute._id 
    })
    if (!existingFaculty) {
      return NextResponse.json({ error: 'Faculty member not found' }, { status: 404 })
    }

    // Check for duplicate employee ID if updating
    if (validatedData.employeeId && validatedData.employeeId !== existingFaculty.employeeId) {
      const duplicateEmployeeId = await Faculty.findOne({ 
        instituteId: institute._id, 
        employeeId: validatedData.employeeId,
        _id: { $ne: facultyId }
      })
      if (duplicateEmployeeId) {
        return NextResponse.json(
          { error: 'Employee ID already exists' },
          { status: 400 }
        )
      }
    }

    // Check for duplicate email if updating
    if (validatedData.personalInfo?.email && 
        validatedData.personalInfo.email !== existingFaculty.personalInfo.email) {
      const duplicateEmail = await Faculty.findOne({ 
        instituteId: institute._id, 
        'personalInfo.email': validatedData.personalInfo.email,
        _id: { $ne: facultyId }
      })
      if (duplicateEmail) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    // Update faculty member
    const updatedFaculty = await Faculty.findByIdAndUpdate(
      facultyId,
      { 
        ...validatedData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Faculty member updated successfully',
      faculty: {
        ...updatedFaculty.toObject(),
        _id: updatedFaculty._id.toString(),
        instituteId: updatedFaculty.instituteId.toString()
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating faculty member:', error)
    return NextResponse.json(
      { error: 'Failed to update faculty member' },
      { status: 500 }
    )
  }
}

// DELETE - Remove faculty member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { facultyId: string } }
) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = authResult
    const { facultyId } = params

    await connectToDatabase()

    // Find user's institute
    const institute = await Institute.findOne({ userId }).lean()
    if (!institute) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
    }

    // Check if faculty member exists and belongs to this institute
    const faculty = await Faculty.findOne({ 
      _id: facultyId, 
      instituteId: institute._id 
    })
    if (!faculty) {
      return NextResponse.json({ error: 'Faculty member not found' }, { status: 404 })
    }

    // Delete faculty member
    await Faculty.findByIdAndDelete(facultyId)

    // Update institute faculty count
    await Institute.findByIdAndUpdate(
      institute._id,
      { $inc: { facultyCount: -1 } }
    )

    return NextResponse.json({
      success: true,
      message: 'Faculty member deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting faculty member:', error)
    return NextResponse.json(
      { error: 'Failed to delete faculty member' },
      { status: 500 }
    )
  }
}
