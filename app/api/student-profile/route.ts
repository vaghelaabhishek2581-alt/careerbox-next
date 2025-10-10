import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongoose'
import { Profile, User } from '@/src/models'
import { parseFullName } from '@/lib/utils/user-creation'

interface StudentProfileData {
  name: string
  email: string
  phone: string
  city: string
  eligibilityExams: Array<{ exam: string; score: string }>
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request)
    
    if (!authResult) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId, user } = authResult

    const profileData: StudentProfileData = await request.json()
    
    // Debug: Log the received data
    console.log('Received profile data:', JSON.stringify(profileData, null, 2))

    // Validate required fields
    if (!profileData.name || !profileData.email || !profileData.phone || !profileData.city) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }
    
    // Debug: Log eligibility exams specifically
    console.log('Eligibility exams received:', profileData.eligibilityExams)

    // Connect to database
    await connectToDatabase()
    
    // Parse the full name into first and last name
    const { firstName, lastName } = parseFullName(profileData.name)
    
    // Find or create the user's profile
    let profile = await Profile.findOne({ userId: userId })
    
    if (!profile) {
      // Create new profile if it doesn't exist
      profile = new Profile({
        userId: userId,
        personalDetails: {
          firstName,
          lastName,
          publicProfileId: `student_${Date.now()}`, // Temporary, should be generated properly
          phone: profileData.phone,
          city: profileData.city,
          eligibilityExams: profileData.eligibilityExams || [],
          professionalHeadline: 'Student'
        },
        workExperiences: [],
        education: [],
        skills: [],
        languages: [],
        socialLinks: {},
        isPublic: true,
        isComplete: false,
        completionPercentage: 25, // Basic info completed
        createdAt: new Date(),
        updatedAt: new Date()
      })
    } else {
      // Update existing profile using $set to ensure nested updates work properly
      profile = await Profile.findOneAndUpdate(
        { userId: userId },
        {
          $set: {
            'personalDetails.firstName': firstName,
            'personalDetails.lastName': lastName,
            'personalDetails.phone': profileData.phone,
            'personalDetails.city': profileData.city,
            'personalDetails.eligibilityExams': profileData.eligibilityExams || [],
            updatedAt: new Date()
          }
        },
        { new: true }
      )
    }
    
    // For new profiles, save them
    if (!profile._id || profile.isNew) {
      await profile.save()
    }
    
    // Debug: Verify what was saved
    const savedProfile = await Profile.findOne({ userId: userId })
    console.log('Profile personalDetails after save:', JSON.stringify(savedProfile?.personalDetails, null, 2))
    
    // Also update the User model if needed
    await User.findByIdAndUpdate(userId, {
      updatedAt: new Date()
    })
    
    console.log('Student profile saved successfully for user:', userId)

    return NextResponse.json({
      success: true,
      message: 'Student profile saved successfully',
      data: {
        userId: userId,
        profileComplete: true
      }
    })

  } catch (error) {
    console.error('Error saving student profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request)
    
    if (!authResult) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId, user } = authResult

    // Connect to database and fetch profile
    await connectToDatabase()
    
    const profile = await Profile.findOne({ userId: userId })
    
    if (!profile) {
      return NextResponse.json({
        success: true,
        data: {
          name: user?.name || '',
          email: user?.email || '',
          phone: '',
          city: '',
          eligibilityExams: [],
          profileComplete: false
        }
      })
    }

    // Construct full name from profile
    const fullName = `${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`.trim()

    return NextResponse.json({
      success: true,
      data: {
        name: fullName || user?.name || '',
        email: user?.email || '',
        phone: profile.personalDetails.phone || '',
        city: profile.personalDetails.city || '',
        eligibilityExams: profile.personalDetails.eligibilityExams || [],
        profileComplete: !!(fullName && profile.personalDetails.phone)
      }
    })

  } catch (error) {
    console.error('Error fetching student profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
