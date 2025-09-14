import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
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

// PUT - Update a specific education entry
export async function PUT(
  request: NextRequest,
  { params }: { params: { educationId: string } }
) {
  try {
    console.log('🔄 PUT /api/profile/education/[educationId] - Updating education:', params.educationId)
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = EducationSchema.parse(body)

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: session.user.id })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Find and update the education entry
    const educationIndex = profile.education.findIndex(edu => edu.id === params.educationId)
    if (educationIndex === -1) {
      return NextResponse.json({ error: 'Education entry not found' }, { status: 404 })
    }

    // Update the education entry
    profile.education[educationIndex] = {
      ...profile.education[educationIndex],
      ...validatedData
    }

    await profile.save()

    return NextResponse.json({ 
      success: true, 
      education: profile.education[educationIndex],
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

// DELETE - Remove a specific education entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { educationId: string } }
) {
  try {
    console.log('🗑️ DELETE /api/profile/education/[educationId] - Deleting education:', params.educationId)
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: session.user.id })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Remove the education entry
    const initialLength = profile.education.length
    profile.education = profile.education.filter(edu => edu.id !== params.educationId)
    
    if (profile.education.length === initialLength) {
      return NextResponse.json({ error: 'Education entry not found' }, { status: 404 })
    }

    await profile.save()

    return NextResponse.json({ 
      success: true, 
      message: 'Education deleted successfully' 
    })

  } catch (error) {
    console.error('❌ Error deleting education:', error)
    return NextResponse.json(
      { error: 'Failed to delete education' },
      { status: 500 }
    )
  }
}
