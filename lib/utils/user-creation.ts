import bcrypt from 'bcryptjs'
import { createEmailVerification, sendVerificationEmail } from '@/lib/email/verification'
import { User, Profile, Business, Institute } from '@/src/models'
import { connectToDatabase } from '@/lib/db/mongoose'

// Unified user creation types
export type OnboardingRole = 'student' | 'professional' | 'institute_admin' | 'business_owner'
export type UserProvider = 'credentials' | 'google' | 'github'

export interface CreateUserData {
  name: string
  email: string
  password?: string
  provider: UserProvider
  image?: string
  role?: OnboardingRole
}

export interface UserProfile {
  personalDetails: {
    firstName: string
    lastName: string
    publicProfileId: string
    professionalHeadline?: string
    aboutMe?: string
    phone?: string
    avatar?: string
  }
  workExperience: any[]
  education: any[]
  skills: any[]
  languages: any[]
  interests: string[]
  socialLinks: any[]
  achievements: any[]
  certifications: any[]
  projects: any[]
  goals: any[]
  preferences: {
    notifications: {
      email: boolean
      push: boolean
      marketing: boolean
    }
    privacy: {
      profileVisible: boolean
      showEmail: boolean
      showPhone: boolean
    }
  }
}

/**
 * Generate a unique public profile ID from user's name
 */
export function generatePublicProfileId(name: string, email: string): string {
  // Extract first and last name
  const nameParts = name.trim().toLowerCase().split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts[nameParts.length - 1] || ''
  
  // Create base profile ID
  let baseId = ''
  if (firstName && lastName) {
    baseId = `${firstName}_${lastName}`
  } else if (firstName) {
    baseId = firstName
  } else {
    // Fallback to email prefix
    baseId = email.split('@')[0].toLowerCase()
  }
  
  // Clean the base ID (remove special characters, keep only alphanumeric and underscore)
  baseId = baseId.replace(/[^a-z0-9_]/g, '')
  
  // Ensure minimum length
  if (baseId.length < 3) {
    baseId = baseId + '_user'
  }
  
  // Ensure maximum length
  if (baseId.length > 25) {
    baseId = baseId.substring(0, 25)
  }
  
  return baseId
}

/**
 * Generate unique profile ID by checking database
 */
export async function generateUniqueProfileId(name: string, email: string): Promise<string> {
  // Ensure database connection
  await connectToDatabase()
  
  let baseId = generatePublicProfileId(name, email)
  let finalId = baseId
  let counter = 1
  
  // Check if profile ID exists in profiles, businesses, or institutes
  while (true) {
    const existingProfile = await Profile.findOne({
      'personalDetails.publicProfileId': finalId
    })
    
    const existingBusiness = await Business.findOne({
      'publicProfileId': finalId
    })
    
    const existingInstitute = await Institute.findOne({
      'publicProfileId': finalId
    })
    
    if (!existingProfile && !existingBusiness && !existingInstitute) {
      break
    }
    
    finalId = `${baseId}${counter}`
    counter++
    
    // Prevent infinite loop
    if (counter > 1000) {
      finalId = `${baseId}_${Date.now()}`
      break
    }
  }
  
  return finalId
}

/**
 * Parse full name into first and last name
 */
export function parseFullName(fullName: string): { firstName: string; lastName: string } {
  const nameParts = fullName.trim().split(' ')
  
  if (nameParts.length === 1) {
    return {
      firstName: nameParts[0],
      lastName: ''
    }
  }
  
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ')
  
  return { firstName, lastName }
}

/**
 * Create a complete user with auto-hydrated profile
 */
export async function createUserWithProfile(userData: CreateUserData): Promise<{
  success: boolean
  user?: any
  error?: string
}> {
  try {
    // Ensure database connection
    await connectToDatabase()
    console.log('🔌 Database connection established for user creation')
    
    // Check if user already exists
    const existingUser = await User.findOne({
      email: userData.email.toLowerCase()
    })
    
    if (existingUser) {
      return {
        success: false,
        error: 'User already exists with this email'
      }
    }
    // Parse name
    const { firstName, lastName } = parseFullName(userData.name)
    
    // Generate unique profile ID
    const publicProfileId = await generateUniqueProfileId(userData.name, userData.email)
    
    // Create user first
    const newUserData = {
      email: userData.email.toLowerCase().trim(),
      role: 'user', // Default role, will be updated during onboarding
      roles: userData.role ? [userData.role] : [], // Initialize roles array
      activeRole: userData.role || null,
      provider: userData.provider,
      needsOnboarding: true,
      needsRoleSelection: !userData.role,
      emailVerified: userData.provider === 'google', // Google users are pre-verified
      preferences: {
        notifications: {
          email: true,
          push: true,
          marketing: false
        },
        privacy: {
          profileVisible: true,
          showEmail: false,
          showPhone: false
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
    console.log('newUserData', newUserData)
    
    // Add password for credentials users
    if (userData.provider === 'credentials' && userData.password) {
      (newUserData as any).password = await bcrypt.hash(userData.password, 12)
    }
    
    // Create user
    console.log('🔧 Creating User with data:', JSON.stringify(newUserData, null, 2))
    const user = new User(newUserData)
    console.log('🔧 User instance created, attempting to save...')
    const savedUser = await user.save()
    console.log('✅ User saved successfully:', savedUser._id)
    
    // Create profile for the user
    const profileData = {
      userId: savedUser._id,
      personalDetails: {
        firstName,
        lastName,
        publicProfileId,
        professionalHeadline: userData.role === 'professional' ? 'Professional' : 
                             userData.role === 'student' ? 'Student' :
                             userData.role === 'institute_admin' ? 'Institute Administrator' :
                             userData.role === 'business_owner' ? 'Business Owner' : 'User',
        aboutMe: `Welcome to my profile! I'm ${firstName} and I'm excited to be part of the CareerBox community.`,
      },
      workExperiences: [],
      education: [],
      skills: [],
      languages: [],
      socialLinks: {},
      profileImage: userData.image || undefined,
      isPublic: true,
      isComplete: false,
      completionPercentage: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const profile = new Profile(profileData)
    const savedProfile = await profile.save()
    
    // Update user with profile reference
    savedUser.profileId = savedProfile._id
    await savedUser.save()
    
    // Return user without password
    const { password, ...userWithoutPassword } = savedUser.toObject()
    
    return {
      success: true,
      user: userWithoutPassword
    }
  } catch (error) {
    console.error('Error creating user with profile:', error)
    return {
      success: false,
      error: 'Failed to create user account'
    }
  }
}

/**
 * Update user profile with role selection
 */
export async function updateUserRole(userId: string, role: OnboardingRole): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Ensure database connection
    await connectToDatabase()
    
    const updateData: any = {
      activeRole: role,
      needsRoleSelection: false,
      updatedAt: new Date()
    }
    
    // Update profile headline based on role
    const headlineMap = {
      student: 'Student',
      professional: 'Professional',
      institute_admin: 'Institute Administrator',
      business_owner: 'Business Owner'
    }
    
    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...updateData,
          'profile.personalDetails.professionalHeadline': headlineMap[role]
        }
      }
    )
    
    return { success: true }
  } catch (error) {
    console.error('Error updating user role:', error)
    return {
      success: false,
      error: 'Failed to update user role'
    }
  }
}

/**
 * Complete user onboarding
 */
export async function completeUserOnboarding(userId: string, role: OnboardingRole): Promise<{
  success: boolean
  error?: string
}> {
  try {
   
    
    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          needsOnboarding: false,
          needsRoleSelection: false,
          activeRole: role,
          roles: [role], // Ensure roles array is set
          updatedAt: new Date()
        }
      }
    )
    
    return { success: true }
  } catch (error) {
    console.error('Error completing onboarding:', error)
    return {
      success: false,
      error: 'Failed to complete onboarding'
    }
  }
}

/**
 * Send email verification
 */
export async function sendEmailVerification(email: string, name: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Create verification token
    const tokenResult = await createEmailVerification(email)
    
    if (!tokenResult.success || !tokenResult.token) {
      return {
        success: false,
        error: tokenResult.error || 'Failed to create verification token'
      }
    }
    
    // Send verification email
    const emailResult = await sendVerificationEmail(email, name, tokenResult.token)
    
    if (!emailResult.success) {
      return {
        success: false,
        error: emailResult.error || 'Failed to send verification email'
      }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error sending email verification:', error)
    return {
      success: false,
      error: 'Failed to send verification email'
    }
  }
}
