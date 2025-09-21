import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongoose'
import { Profile } from '@/src/models'
import { z } from 'zod'

const WorkPositionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Position title is required'),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  isCurrent: z.boolean(),
  description: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']).default('FULL_TIME'),
  locationType: z.enum(['ONSITE', 'REMOTE', 'HYBRID']).default('ONSITE'),
  skills: z.array(z.string()).optional()
}).refine(
  (data) => {
    // If it's a current position, endDate should be null/undefined
    if (data.isCurrent) {
      return !data.endDate;
    }
    // If it's not current, endDate should be provided
    return !!data.endDate;
  },
  {
    message: "End date is required for non-current positions",
    path: ["endDate"],
  }
)

const WorkExperienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().optional(),
  positions: z.array(WorkPositionSchema).min(1)
})

const WorkExperienceUpdateSchema = z.object({
  workExperiences: z.array(WorkExperienceSchema)
})

// GET - Fetch user work experience
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/profile/work-experience - Fetching user work experience')
    
    const authCheck = await requireAuth(request)
    if (authCheck.error) return authCheck.response

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: authCheck.auth.userId })
      .select('workExperiences')
      .lean()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      workExperiences: (profile as any)?.workExperiences || [] 
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
    
    const authCheck = await requireAuth(request)
    if (authCheck.error) return authCheck.response

    const body = await request.json()
    const validatedData = WorkExperienceUpdateSchema.parse(body)

    await connectToDatabase()

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: authCheck.auth.userId },
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
    
    const authCheck = await requireAuth(request)
    if (authCheck.error) return authCheck.response

    const body = await request.json()
    const validatedWorkExperience = WorkExperienceSchema.parse(body)

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: authCheck.auth.userId })
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
