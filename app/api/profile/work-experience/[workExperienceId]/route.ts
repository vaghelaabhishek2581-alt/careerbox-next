import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongoose'
import { Profile } from '@/src/models'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/unified-auth'
import { IWorkExperience } from '@/lib/types/profile.unified'

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

// PUT - Update a specific work experience entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ workExperienceId: string }> }
) {
  try {
    const { workExperienceId } = await params
    console.log('🔄 PUT /api/profile/work-experience/[workExperienceId] - Updating work experience:', workExperienceId)

    const authCheck = await requireAuth(request)
    if (authCheck.error) return authCheck.response

    const body = await request.json()
    console.log('📥 Received work experience data:', JSON.stringify(body, null, 2))
    const validatedData = WorkExperienceSchema.parse(body)
    console.log('✅ Validated work experience data:', JSON.stringify(validatedData, null, 2))

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: authCheck.auth.userId })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Find and update the work experience entry
    const workExperienceIndex = profile.workExperiences.findIndex((work: IWorkExperience) => work.id === workExperienceId)
    if (workExperienceIndex === -1) {
      return NextResponse.json({ error: 'Work experience entry not found' }, { status: 404 })
    }

    // Update the work experience entry
    profile.workExperiences[workExperienceIndex] = validatedData

    await profile.save()

    return NextResponse.json({
      success: true,
      workExperience: profile.workExperiences[workExperienceIndex],
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

// DELETE - Remove a specific work experience entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workExperienceId: string }> }
) {
  try {
    const { workExperienceId } = await params
    console.log('🗑️ DELETE /api/profile/work-experience/[workExperienceId] - Deleting work experience:', workExperienceId)

    const authCheck = await requireAuth(request)
    if (authCheck.error) return authCheck.response

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: authCheck.auth.userId })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Remove the work experience entry
    const initialLength = profile.workExperiences.length
    profile.workExperiences = profile.workExperiences.filter((work: IWorkExperience) => work.id !== workExperienceId)

    if (profile.workExperiences.length === initialLength) {
      return NextResponse.json({ error: 'Work experience entry not found' }, { status: 404 })
    }

    await profile.save()

    return NextResponse.json({
      success: true,
      message: 'Work experience deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error deleting work experience:', error)
    return NextResponse.json(
      { error: 'Failed to delete work experience' },
      { status: 500 }
    )
  }
}
