import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongoose'
import { Profile } from '@/src/models'
import { z } from 'zod'

const SkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  category: z.string().optional(),
  verified: z.boolean().optional(),
  endorsements: z.number().optional(),
  yearsOfExperience: z.number().optional()
})

// PUT - Update a specific skill
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ skillId: string }> }
) {
  try {
    const { skillId } = await params
    console.log('🔄 PUT /api/profile/skills/[skillId] - Updating skill:', skillId)

    const authCheck = await requireAuth(request)
    if (authCheck.error) return authCheck.response

    const body = await request.json()
    const validatedData = SkillSchema.parse(body)

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: authCheck.auth.userId })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Find and update the skill
    const skillIndex = profile.skills.findIndex((skill: any) => skill.id === skillId)
    if (skillIndex === -1) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    // Check if skill name already exists (excluding current skill)
    const existingSkill = profile.skills.find(
      (skill: any, index: number) =>
        index !== skillIndex &&
        skill.name.toLowerCase() === validatedData.name.toLowerCase()
    )
    if (existingSkill) {
      return NextResponse.json({ error: 'Skill name already exists' }, { status: 400 })
    }

    // Update the skill while preserving the id
    profile.skills[skillIndex] = {
      ...profile.skills[skillIndex],
      ...validatedData,
      id: profile.skills[skillIndex].id // Explicitly preserve the id
    }

    await profile.save()

    return NextResponse.json({
      success: true,
      skill: profile.skills[skillIndex],
      message: 'Skill updated successfully'
    })

  } catch (error) {
    console.error('❌ Error updating skill:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update skill' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a specific skill
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ skillId: string }> }
) {
  try {
    const { skillId } = await params
    console.log('🗑️ DELETE /api/profile/skills/[skillId] - Deleting skill:', skillId)

    const authCheck = await requireAuth(request)
    if (authCheck.error) return authCheck.response

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: authCheck.auth.userId })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Remove the skill
    const initialLength = profile.skills.length
    profile.skills = profile.skills.filter((skill: any) => skill.id !== skillId)

    if (profile.skills.length === initialLength) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    await profile.save()

    return NextResponse.json({
      success: true,
      message: 'Skill deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error deleting skill:', error)
    return NextResponse.json(
      { error: 'Failed to delete skill' },
      { status: 500 }
    )
  }
}