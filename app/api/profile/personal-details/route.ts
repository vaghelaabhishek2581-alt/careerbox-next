import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongoose'
import { Profile } from '@/src/models'
import { z } from 'zod'

const PersonalDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  middleName: z.string().optional(),
  dateOfBirth: z.string().datetime().optional().or(z.date().optional()),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  professionalHeadline: z.string().max(200).optional(),
  publicProfileId: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  aboutMe: z.string().max(2000).optional(),
  phone: z.string().optional(),
  interests: z.array(z.string()).optional(),
  professionalBadges: z.array(z.string()).optional(),
  nationality: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/profile/personal-details - Fetching personal details')
    
    const authCheck = await requireAuth(request)
    if (authCheck.error) return authCheck.response

    await connectToDatabase()
    console.log('✅ Connected to database')

    const profile = await Profile.findOne({ userId: authCheck.auth.userId })
    if (!profile) {
      console.log('❌ Profile not found for user:', authCheck.auth.userId)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    console.log('✅ Personal details fetched successfully')
    console.log('📄 Current personal details:', profile.personalDetails)

    return NextResponse.json({ 
      success: true, 
      personalDetails: profile.personalDetails 
    })

  } catch (error) {
    console.error('❌ Error fetching personal details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch personal details' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('🔄 PATCH /api/profile/personal-details - Updating personal details')
    
    const authCheck = await requireAuth(request)
    if (authCheck.error) return authCheck.response

    const body = await request.json()
    console.log('📝 Request body:', body)

    const validatedData = PersonalDetailsSchema.parse(body)
    console.log('✅ Validated personal details:', validatedData)

    await connectToDatabase()
    console.log('✅ Connected to database')

    // Check if profile exists
    const existingProfile = await Profile.findOne({ userId: authCheck.auth.userId })
    if (!existingProfile) {
      console.log('❌ Profile not found for user:', authCheck.auth.userId)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if publicProfileId is unique (if being updated)
    if (validatedData.publicProfileId && 
        validatedData.publicProfileId !== existingProfile.personalDetails.publicProfileId) {
      const existingPublicId = await Profile.findOne({ 
        'personalDetails.publicProfileId': validatedData.publicProfileId 
      })
      if (existingPublicId) {
        console.log('❌ Public profile ID already exists:', validatedData.publicProfileId)
        return NextResponse.json({ error: 'Public profile ID already exists' }, { status: 400 })
      }
    }

    // Prepare update data with proper date conversion
    const updateData = { ...validatedData }
    if (updateData.dateOfBirth && typeof updateData.dateOfBirth === 'string') {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth)
    }

    // Build the $set object for specific field updates
    const setUpdate: any = { updatedAt: new Date() }
    
    // Update each field individually to avoid overwriting the entire personalDetails object
    Object.keys(updateData).forEach(key => {
      setUpdate[`personalDetails.${key}`] = updateData[key as keyof typeof updateData]
    })

    console.log('📝 Update data being applied:', setUpdate)

    // Update personal details
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: authCheck.auth.userId },
      { $set: setUpdate },
      { new: true, runValidators: true }
    )

    if (!updatedProfile) {
      console.log('❌ Failed to update profile - profile not found after update')
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    console.log('✅ Personal details updated successfully')
    console.log('📄 Updated profile personal details:', updatedProfile.personalDetails)

    return NextResponse.json({ 
      success: true, 
      profile: updatedProfile,
      message: 'Personal details updated successfully' 
    })

  } catch (error) {
    console.error('❌ Error updating personal details:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update personal details' },
      { status: 500 }
    )
  }
}
