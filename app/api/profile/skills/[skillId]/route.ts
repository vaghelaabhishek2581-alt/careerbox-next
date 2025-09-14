import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
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
  { params }: { params: { skillId: string } }
) {
  try {
    console.log('🔄 PUT /api/profile/skills/[skillId] - Updating skill:', params.skillId)
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = SkillSchema.parse(body)

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: session.user.id })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Find and update the skill
    const skillIndex = profile.skills.findIndex(skill => skill.id === params.skillId)
    if (skillIndex === -1) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    // Check if skill name already exists (excluding current skill)
    const existingSkill = profile.skills.find(
      (skill, index) => 
        index !== skillIndex && 
        skill.name.toLowerCase() === validatedData.name.toLowerCase()
    )
    if (existingSkill) {
      return NextResponse.json({ error: 'Skill name already exists' }, { status: 400 })
    }

    // Update the skill
    profile.skills[skillIndex] = {
      ...profile.skills[skillIndex],
      ...validatedData
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
  { params }: { params: { skillId: string } }
) {
  try {
    console.log('🗑️ DELETE /api/profile/skills/[skillId] - Deleting skill:', params.skillId)
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: session.user.id })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Remove the skill
    const initialLength = profile.skills.length
    profile.skills = profile.skills.filter(skill => skill.id !== params.skillId)
    
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
