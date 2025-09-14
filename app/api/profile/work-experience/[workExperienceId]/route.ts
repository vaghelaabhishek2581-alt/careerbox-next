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
  company: z.string().min(1, 'Company name is required'),
  location: z.string().optional(),
  positions: z.array(WorkPositionSchema).min(1),
  companyLogo: z.string().optional(),
  companyWebsite: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional()
})

// PUT - Update a specific work experience entry
export async function PUT(
  request: NextRequest,
  { params }: { params: { workExperienceId: string } }
) {
  try {
    console.log('🔄 PUT /api/profile/work-experience/[workExperienceId] - Updating work experience:', params.workExperienceId)
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = WorkExperienceSchema.parse(body)

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: session.user.id })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Find and update the work experience entry
    const workExperienceIndex = profile.workExperiences.findIndex(work => work.id === params.workExperienceId)
    if (workExperienceIndex === -1) {
      return NextResponse.json({ error: 'Work experience entry not found' }, { status: 404 })
    }

    // Update the work experience entry
    profile.workExperiences[workExperienceIndex] = {
      ...profile.workExperiences[workExperienceIndex],
      ...validatedData
    }

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
  { params }: { params: { workExperienceId: string } }
) {
  try {
    console.log('🗑️ DELETE /api/profile/work-experience/[workExperienceId] - Deleting work experience:', params.workExperienceId)
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: session.user.id })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Remove the work experience entry
    const initialLength = profile.workExperiences.length
    profile.workExperiences = profile.workExperiences.filter(work => work.id !== params.workExperienceId)
    
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
