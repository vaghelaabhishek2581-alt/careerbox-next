import { NextRequest, NextResponse } from 'next/server'
import { OnboardingRole } from '@/lib/utils/user-creation'
import { ObjectId } from 'mongodb'
import { User, Profile } from '@/src/models'
import { connectToDatabase } from '@/lib/db/mongoose'

/**
 * POST /api/auth/onboarding/complete
 * Completes onboarding for an existing user, updating their profile and onboarding status.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, role, userType, bio, skills, interests, company, location } = await request.json()

    // Log request for debugging
    console.log('Onboarding completion request:', { userId, role, userType, bio, skills, interests, company, location })

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'UserId is required' },
        { status: 400 }
      )
    }
    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Role is required' },
        { status: 400 }
      )
    }

    // Complete onboarding and update user profile
    const result = await completeUserOnboardingWithProfile(userId, {
      role,
      userType,
      bio,
      skills,
      interests,
      company,
      location
    })

    if (!result.success) {
      console.error('Onboarding completion failed:', result.error)
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      )
    }

    console.log('Onboarding completed successfully for user:', userId)
    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: result.user,
      redirectTo: '/dashboard/user' // Add explicit redirect
    })
  } catch (error) {
    console.error('Onboarding completion error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Updates the user document with onboarding completion and profile enrichment.
 * Uses the User model for update, as in user-creation.ts.
 */
async function completeUserOnboardingWithProfile(
  userId: string,
  data: {
    role: OnboardingRole
    userType?: string
    bio?: string
    skills?: string[]
    interests?: string[]
    company?: string
    location?: string
  }
): Promise<{
  success: boolean
  user?: any
  error?: string
}> {
  try {
    await connectToDatabase()
    
    // Find user by ObjectId or string id
    const user = ObjectId.isValid(userId)
      ? await User.findById(new ObjectId(userId))
      : await User.findById(userId as any)

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    // Find or create profile
    let profile = await Profile.findOne({ userId: user._id })
    
    if (!profile) {
      return {
        success: false,
        error: 'Profile not found. Please complete profile setup first.'
      }
    }

    // Get user's name from profile or use email as fallback
    const userName = profile.personalDetails?.firstName 
      ? `${profile.personalDetails.firstName} ${profile.personalDetails.lastName || ''}`.trim()
      : user.email?.split('@')[0] || 'User'

    // Prepare profile updates
    const profileUpdates: any = {
      'personalDetails.professionalHeadline': getRoleHeadline(data.role),
      'personalDetails.aboutMe': data.bio || getDefaultBio(userName, data.role)
    }

    if (data.skills && data.skills.length > 0) {
      profileUpdates.skills = data.skills.map(skill => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: skill,
        level: 'BEGINNER',
        category: 'General'
      }))
    }

    if (data.interests && data.interests.length > 0) {
      profileUpdates['personalDetails.interests'] = data.interests
    }

    if (data.company) {
      profileUpdates.workExperiences = [{
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        company: data.company,
        location: data.location || '',
        positions: [{
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title: getDefaultPosition(data.role),
          startDate: new Date(),
          endDate: null,
          isCurrent: true,
          employmentType: 'FULL_TIME',
          locationType: 'ONSITE',
          description: `Working as ${getDefaultPosition(data.role)} at ${data.company}`
        }]
      }]
    }

    // Update profile
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: user._id },
      { $set: profileUpdates },
      { new: true }
    )

    if (!updatedProfile) {
      return {
        success: false,
        error: 'Failed to update profile'
      }
    }

    // Map onboarding role to account role taxonomy for gating
    const roleMap: Record<string, string> = {
      student: 'user',
      professional: 'user',
      institute_admin: 'institute',
      business_owner: 'business'
    }
    const accountRole = roleMap[data.role] || 'user'

    // Update user
    const updateResult = await User.updateOne(
      { _id: user._id },
      {
        $set: {
          needsOnboarding: false,
          needsRoleSelection: false,
          activeRole: accountRole,
          role: accountRole,
          updatedAt: new Date()
        },
        $addToSet: {
          roles: accountRole
        }
      }
    )

    if (updateResult.matchedCount === 0) {
      return {
        success: false,
        error: 'User not found for update'
      }
    }

    // Return updated user (excluding password)
    const updatedUser = await User.findById(user._id, { projection: { password: 0 } })
    return {
      success: true,
      user: updatedUser
    }
  } catch (error) {
    console.error('Error completing onboarding with profile:', error)
    return {
      success: false,
      error: 'Failed to complete onboarding'
    }
  }
}

function getRoleHeadline(role: OnboardingRole): string {
  switch (role) {
    case 'student':
      return 'Student'
    case 'professional':
      return 'Professional'
    case 'institute_admin':
      return 'Institute Administrator'
    case 'business_owner':
      return 'Business Owner'
    default:
      return 'User'
  }
}

function getDefaultBio(name: string, role: OnboardingRole): string {
  const firstName = (name || '').split(' ')[0] || 'User'
  switch (role) {
    case 'student':
      return `Hi! I'm ${firstName}, a student passionate about learning and growing in my field. I'm excited to connect with opportunities and build my career.`
    case 'professional':
      return `Hello! I'm ${firstName}, a dedicated professional with experience in my field. I'm always looking for new challenges and opportunities to grow.`
    case 'institute_admin':
      return `Welcome! I'm ${firstName}, an institute administrator committed to providing quality education and supporting student success.`
    case 'business_owner':
      return `Hi there! I'm ${firstName}, a business owner focused on growth and innovation. I'm interested in connecting with talented individuals and opportunities.`
    default:
      return `Welcome to my profile! I'm ${firstName} and I'm excited to be part of the CareerBox community.`
  }
}

function getDefaultPosition(role: OnboardingRole): string {
  switch (role) {
    case 'student':
      return 'Student'
    case 'professional':
      return 'Professional'
    case 'institute_admin':
      return 'Administrator'
    case 'business_owner':
      return 'Owner'
    default:
      return 'Member'
  }
}
