import { NextRequest, NextResponse } from 'next/server'
import { completeUserOnboarding, OnboardingRole } from '@/lib/utils/user-creation'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const { userId, role, userType, bio, skills, interests, company, location } = await request.json()

    console.log('Onboarding completion request:', { userId, role, userType, bio, skills, interests, company, location })

    // Validate input
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

    // Complete onboarding with profile creation
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
      user: result.user
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
 * Complete user onboarding with profile creation
 */
async function completeUserOnboardingWithProfile(userId: string, data: {
  role: OnboardingRole
  userType?: string
  bio?: string
  skills?: string[]
  interests?: string[]
  company?: string
  location?: string
}): Promise<{
  success: boolean
  user?: any
  error?: string
}> {
  try {
    const { db } = await connectToDatabase()
    
    const query = ObjectId.isValid(userId) 
      ? { _id: new ObjectId(userId) }
      : { _id: userId }

    // Get current user
    const user = ObjectId.isValid(userId) 
      ? await db.collection('users').findOne({ _id: new ObjectId(userId) })
      : await db.collection('users').findOne({ _id: userId as any })
    
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    // Prepare profile updates
    const profileUpdates: any = {
      'profile.personalDetails.professionalHeadline': getRoleHeadline(data.role),
      'profile.personalDetails.aboutMe': data.bio || getDefaultBio(user.name, data.role)
    }

    // Add skills if provided
    if (data.skills && data.skills.length > 0) {
      profileUpdates['profile.skills'] = data.skills.map(skill => ({
        name: skill,
        level: 'Beginner',
        category: 'General'
      }))
    }

    // Add interests if provided
    if (data.interests && data.interests.length > 0) {
      profileUpdates['profile.interests'] = data.interests
    }

    // Add work experience if company is provided
    if (data.company) {
      profileUpdates['profile.workExperience'] = [{
        company: data.company,
        position: getDefaultPosition(data.role),
        location: data.location || '',
        startDate: new Date(),
        endDate: null,
        current: true,
        description: `Working as ${getDefaultPosition(data.role)} at ${data.company}`
      }]
    }

    // Update user with onboarding completion and profile
    const updateResult = ObjectId.isValid(userId) 
      ? await db.collection('users').updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: {
              needsOnboarding: false,
              needsRoleSelection: false,
              activeRole: data.role,
              roles: [data.role],
              userType: data.userType || (data.role === 'student' ? 'student' : 'professional'),
              updatedAt: new Date(),
              ...profileUpdates
            }
          }
        )
      : await db.collection('users').updateOne(
          { _id: userId as any },
          {
            $set: {
              needsOnboarding: false,
              needsRoleSelection: false,
              activeRole: data.role,
              roles: [data.role],
              userType: data.userType || (data.role === 'student' ? 'student' : 'professional'),
              updatedAt: new Date(),
              ...profileUpdates
            }
          }
        )

    if (updateResult.matchedCount === 0) {
      return {
        success: false,
        error: 'User not found for update'
      }
    }

    // Get updated user
    const updatedUser = ObjectId.isValid(userId) 
      ? await db.collection('users').findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } })
      : await db.collection('users').findOne({ _id: userId as any }, { projection: { password: 0 } })
    
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
  const firstName = name.split(' ')[0] || 'User'
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
