import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Institute as InstituteModel } from '@/src/models'
import { Institute, CreateInstituteRequest } from '@/lib/types/institute.types'
import { ApiResponse, PaginatedResponse } from '@/lib/types/api.types'

// GET /api/institutes - Fetch institutes
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    await connectToDatabase()

    // Build query
    const query: any = { status: 'active' }
    if (status) query.status = status

    // Calculate pagination
    const skip = (page - 1) * limit
    const total = await InstituteModel.countDocuments(query)
    const institutes = await InstituteModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const response: PaginatedResponse<Institute> = {
      data: institutes,
      total,
      page,
      limit,
      hasMore: skip + institutes.length < total
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching institutes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch institutes' },
      { status: 500 }
    )
  }
}

// POST /api/institutes - Create a new institute
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const instituteData: CreateInstituteRequest = await req.json()
    await connectToDatabase()

    // Check if user already has an institute
    const existingInstitute = await InstituteModel.findOne({ userId: session.user.id })
    if (existingInstitute) {
      return NextResponse.json({ error: 'User already has an institute profile' }, { status: 400 })
    }

    // Create institute
    const institute = new InstituteModel({
      userId: session.user.id,
      instituteName: instituteData.instituteName,
      type: instituteData.type,
      accreditation: instituteData.accreditation,
      website: instituteData.website,
      description: instituteData.description,
      logo: instituteData.logo,
      address: instituteData.address,
      contactInfo: instituteData.contactInfo,
      socialMedia: instituteData.socialMedia,
      establishedYear: instituteData.establishedYear,
      studentCount: instituteData.studentCount,
      facultyCount: instituteData.facultyCount,
      isVerified: false,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const savedInstitute = await institute.save()

    const response: ApiResponse<Institute> = {
      success: true,
      data: savedInstitute.toObject(),
      message: 'Institute profile created successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating institute:', error)
    return NextResponse.json(
      { error: 'Failed to create institute' },
      { status: 500 }
    )
  }
}
