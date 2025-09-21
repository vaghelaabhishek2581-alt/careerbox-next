import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongoose'
import { Profile } from '@/src/models'
import { requireAuth } from '@/lib/auth/unified-auth'
import { z } from 'zod'

// Position schema for validation (if we add PUT/PATCH methods later)
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
    if (data.isCurrent) {
      return !data.endDate;
    }
    return !!data.endDate;
  },
  {
    message: "End date is required for non-current positions",
    path: ["endDate"],
  }
)

// DELETE - Remove a specific position from work experience
export async function DELETE(
  request: NextRequest,
  { params }: { params: { workExperienceId: string; positionId: string } }
) {
  try {
    console.log('🗑️ DELETE /api/profile/work-experience/[workExperienceId]/positions/[positionId] - Deleting position:', params.positionId)
    
    const authCheck = await requireAuth(request)
    if (authCheck.error) return authCheck.response
    
    await connectToDatabase()

    const profile = await Profile.findOne({ userId: authCheck.auth.userId })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Find the work experience entry
    const workExperienceIndex = profile.workExperiences.findIndex((work: { id: string }) => work.id === params.workExperienceId)
    if (workExperienceIndex === -1) {
      return NextResponse.json({ error: 'Work experience entry not found' }, { status: 404 })
    }

    const workExperience = profile.workExperiences[workExperienceIndex]
    
    // Check if there's only one position (can't delete the last position)
    if (workExperience.positions.length <= 1) {
      return NextResponse.json({ 
        error: 'Cannot delete the last position. Delete the entire work experience instead.' 
      }, { status: 400 })
    }

    // Remove the specific position
    const initialLength = workExperience.positions.length
    workExperience.positions = workExperience.positions.filter((pos: { id: string }) => pos.id !== params.positionId)
    
    if (workExperience.positions.length === initialLength) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }

    await profile.save()

    return NextResponse.json({ 
      success: true, 
      message: 'Position deleted successfully' 
    })

  } catch (error) {
    console.error('❌ Error deleting position:', error)
    return NextResponse.json(
      { error: 'Failed to delete position' },
      { status: 500 }
    )
  }
}

// PUT - Update a specific position within work experience
export async function PUT(
  request: NextRequest,
  { params }: { params: { workExperienceId: string; positionId: string } }
) {
  try {
    console.log('🔄 PUT /api/profile/work-experience/[workExperienceId]/positions/[positionId] - Updating position:', params.positionId)
    
    const authCheck = await requireAuth(request)
    if (authCheck.error) return authCheck.response
    
    const body = await request.json()
    console.log('📥 Received position data:', JSON.stringify(body, null, 2))
    const validatedData = WorkPositionSchema.parse(body)
    console.log('✅ Validated position data:', JSON.stringify(validatedData, null, 2))

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: authCheck.auth.userId })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Find the work experience entry
    const workExperienceIndex = profile.workExperiences.findIndex((work: { id: string }) => work.id === params.workExperienceId)
    if (workExperienceIndex === -1) {
      return NextResponse.json({ error: 'Work experience entry not found' }, { status: 404 })
    }

    const workExperience = profile.workExperiences[workExperienceIndex]
    
    // Find the specific position
    const positionIndex = workExperience.positions.findIndex((pos: { id: string }) => pos.id === params.positionId)
    if (positionIndex === -1) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }

    // Update the specific position
    workExperience.positions[positionIndex] = validatedData

    await profile.save()

    return NextResponse.json({ 
      success: true, 
      position: workExperience.positions[positionIndex],
      message: 'Position updated successfully' 
    })

  } catch (error) {
    console.error('❌ Error updating position:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update position' },
      { status: 500 }
    )
  }
}
