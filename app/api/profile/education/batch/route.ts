import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongoose'
import { Profile } from '@/src/models'
import { z } from 'zod'

const EducationSchema = z.object({
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

const BatchEducationSchema = z.object({
  educations: z.array(EducationSchema)
})

// POST - Add multiple education entries
export async function POST(request: NextRequest) {
  try {
    console.log('➕ POST /api/profile/education/batch - Adding multiple education entries')
    
    const authCheck = await requireAuth(request)
    if (authCheck.error) return authCheck.response

    const body = await request.json()
    const validatedData = BatchEducationSchema.parse(body)

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: authCheck.auth.userId })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Generate IDs for new education entries
    const newEducations = validatedData.educations.map(education => ({
      ...education,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }))

    // Add all new education entries
    profile.education.push(...newEducations)
    await profile.save()

    return NextResponse.json({ 
      success: true, 
      educations: newEducations,
      totalAdded: newEducations.length,
      message: `${newEducations.length} education ${newEducations.length === 1 ? 'entry' : 'entries'} added successfully` 
    })

  } catch (error) {
    console.error('❌ Error adding batch education:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to add education entries' },
      { status: 500 }
    )
  }
}
