import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongoose'
import { Profile } from '@/src/models'
import { z } from 'zod'

const SkillSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Skill name is required'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  category: z.string().optional(),
  verified: z.boolean().optional(),
  endorsements: z.number().optional(),
  yearsOfExperience: z.number().optional()
})

const SkillsUpdateSchema = z.object({
  skills: z.array(SkillSchema)
})

// GET - Fetch user skills
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/profile/skills - Fetching user skills')
    
    const authCheck = await requireAuth(request)
    if (authCheck.error) return authCheck.response

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: authCheck.auth.userId })
      .select('skills')
      .lean()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      skills: (profile as any)?.skills || [] 
    })

  } catch (error) {
    console.error('❌ Error fetching skills:', error)
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    )
  }
}

// PUT - Update all skills
export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 PUT /api/profile/skills - Updating all skills')
    
    const authCheck = await requireAuth(request)
    if (authCheck.error) return authCheck.response

    const body = await request.json()
    const validatedData = SkillsUpdateSchema.parse(body)

    await connectToDatabase()

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: authCheck.auth.userId },
      { 
        $set: {
          skills: validatedData.skills,
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
      skills: updatedProfile.skills,
      message: 'Skills updated successfully' 
    })

  } catch (error) {
    console.error('❌ Error updating skills:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update skills' },
      { status: 500 }
    )
  }
}

// POST - Add a new skill
export async function POST(request: NextRequest) {
  try {
    console.log('➕ POST /api/profile/skills - Adding new skill')
    
    const authCheck = await requireAuth(request)
    if (authCheck.error) return authCheck.response

    const body = await request.json()
    const validatedSkill = SkillSchema.parse(body)

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: authCheck.auth.userId })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if skill already exists
    const existingSkill = profile.skills.find((skill: any) => skill.name.toLowerCase() === validatedSkill.name.toLowerCase())
    if (existingSkill) {
      return NextResponse.json({ error: 'Skill already exists' }, { status: 400 })
    }

    // Add new skill
    profile.skills.push(validatedSkill)
    await profile.save()

    return NextResponse.json({ 
      success: true, 
      skill: validatedSkill,
      message: 'Skill added successfully' 
    })

  } catch (error) {
    console.error('❌ Error adding skill:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to add skill' },
      { status: 500 }
    )
  }
}
