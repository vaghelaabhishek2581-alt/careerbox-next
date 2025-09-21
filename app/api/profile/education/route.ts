import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongoose'
import { Profile } from '@/src/models'
import { z } from 'zod'

const EducationSchema = z.object({
  id: z.string(),
  degree: z.string().min(1, 'Degree is required'),
  institution: z.string().min(1, 'Institution name is required'),
  fieldOfStudy: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean(),
  location: z.string().optional(),
  grade: z.string().optional(),
  description: z.string().optional(),
  institutionLogo: z.string().optional(),
  institutionWebsite: z.string().optional(),
  accreditation: z.string().optional(),
  honors: z.array(z.string()).optional()
})

const EducationUpdateSchema = z.object({
  education: z.array(EducationSchema)
})

const BatchEducationSchema = z.object({
  educations: z.array(EducationSchema.omit({ id: true }))
})

// GET - Fetch user education
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/profile/education - Fetching user education')
    
    const authCheck = await requireAuth(request)
    if (authCheck.error) return authCheck.response

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: authCheck.auth.userId })
      .select('education')
      .lean()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      education: (profile as any)?.education || [] 
    })

  } catch (error) {
    console.error('❌ Error fetching education:', error)
    return NextResponse.json(
      { error: 'Failed to fetch education' },
      { status: 500 }
    )
  }
}

// PUT - Update all education
export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 PUT /api/profile/education - Updating all education')
    
    const authCheck = await requireAuth(request)
    if (authCheck.error) return authCheck.response

    const body = await request.json()
    const validatedData = EducationUpdateSchema.parse(body)

    await connectToDatabase()

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: authCheck.auth.userId },
      { 
        $set: {
          education: validatedData.education,
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
      education: updatedProfile.education,
      message: 'Education updated successfully' 
    })

  } catch (error) {
    console.error('❌ Error updating education:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update education' },
      { status: 500 }
    )
  }
}

// POST - Add new education
export async function POST(request: NextRequest) {
  try {
    console.log('➕ POST /api/profile/education - Adding new education')
    
    const authCheck = await requireAuth(request)
    if (authCheck.error) return authCheck.response

    const body = await request.json()
    const validatedEducation = EducationSchema.parse(body)

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: authCheck.auth.userId })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Add new education
    profile.education.push(validatedEducation)
    await profile.save()

    return NextResponse.json({ 
      success: true, 
      education: validatedEducation,
      message: 'Education added successfully' 
    })

  } catch (error) {
    console.error('❌ Error adding education:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to add education' },
      { status: 500 }
    )
  }
}
