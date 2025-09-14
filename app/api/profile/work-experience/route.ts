import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/db/mongoose'
import { Profile } from '@/src/models'
import { z } from 'zod'

const WorkPositionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Position title is required'),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean(),
  description: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']),
  skills: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  salary: z.object({
    amount: z.number().optional(),
    currency: z.string().optional(),
    isPublic: z.boolean()
  }).optional()
})

const WorkExperienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().optional(),
  positions: z.array(WorkPositionSchema).min(1),
  companyLogo: z.string().optional(),
  companyWebsite: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional()
})

const WorkExperienceUpdateSchema = z.object({
  workExperiences: z.array(WorkExperienceSchema)
})

// GET - Fetch user work experience
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/profile/work-experience - Fetching user work experience')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: session.user.id })
      .select('workExperiences')
      .lean()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      workExperiences: profile.workExperiences || [] 
    })

  } catch (error) {
    console.error('❌ Error fetching work experience:', error)
    return NextResponse.json(
      { error: 'Failed to fetch work experience' },
      { status: 500 }
    )
  }
}

// PUT - Update all work experience
export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 PUT /api/profile/work-experience - Updating all work experience')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = WorkExperienceUpdateSchema.parse(body)

    await connectToDatabase()

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: session.user.id },
      { 
        $set: {
          workExperiences: validatedData.workExperiences,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    )

    if (!updatedProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      workExperiences: updatedProfile.workExperiences,
      message: 'Work experience updated successfully' 
    })

  } catch (error) {
    console.error('❌ Error updating work experience:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update work experience' },
      { status: 500 }
    )
  }
}

// POST - Add new work experience
export async function POST(request: NextRequest) {
  try {
    console.log('➕ POST /api/profile/work-experience - Adding new work experience')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedWorkExperience = WorkExperienceSchema.parse(body)

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: session.user.id })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Add new work experience
    profile.workExperiences.push(validatedWorkExperience)
    await profile.save()

    return NextResponse.json({ 
      success: true, 
      workExperience: validatedWorkExperience,
      message: 'Work experience added successfully' 
    })

  } catch (error) {
    console.error('❌ Error adding work experience:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to add work experience' },
      { status: 500 }
    )
  }
}
