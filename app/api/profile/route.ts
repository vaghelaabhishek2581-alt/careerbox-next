import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/db/mongoose'
import { Profile, User } from '@/src/models'
import { z } from 'zod'

// ============================================================================
// SCHEMAS
// ============================================================================

const PersonalDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  middleName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  professionalHeadline: z.string().max(200).optional(),
  publicProfileId: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  aboutMe: z.string().max(2000).optional(),
  phone: z.string().optional(),
  interests: z.array(z.string()).optional(),
  professionalBadges: z.array(z.string()).optional(),
  nationality: z.string().optional()
})

const SkillSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Skill name is required'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  category: z.string().optional(),
  verified: z.boolean().optional(),
  endorsements: z.number().optional(),
  yearsOfExperience: z.number().optional()
})

const LanguageSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Language name is required'),
  level: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED', 'FLUENT', 'NATIVE']),
  certifications: z.array(z.string()).optional()
})

const WorkPositionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Position title is required'),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean(),
  description: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']),
  skills: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  salary: z.object({
    amount: z.number().optional(),
    currency: z.string().optional(),
    isPublic: z.boolean()
  }).optional()
})

const WorkExperienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().optional(),
  positions: z.array(WorkPositionSchema).min(1),
  companyLogo: z.string().optional(),
  companyWebsite: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional()
})

const EducationSchema = z.object({
  id: z.string(),
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

const SocialLinksSchema = z.object({
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  github: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  youtube: z.string().optional(),
  portfolio: z.string().optional(),
  website: z.string().optional()
})

const ProfileUpdateSchema = z.object({
  personalDetails: PersonalDetailsSchema.optional(),
  workExperiences: z.array(WorkExperienceSchema).optional(),
  education: z.array(EducationSchema).optional(),
  skills: z.array(SkillSchema).optional(),
  languages: z.array(LanguageSchema).optional(),
  socialLinks: SocialLinksSchema.optional(),
  profileImage: z.string().optional(),
  coverImage: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  isPublic: z.boolean().optional()
})

// ============================================================================
// GET - Fetch user profile
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/profile - Fetching user profile')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('❌ No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    console.log('✅ Connected to database')

    const profile = await Profile.findOne({ userId: session.user.id })
      .populate('userId', 'email emailVerified')
      .lean()

    if (!profile) {
      console.log('❌ Profile not found for user:', session.user.id)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    console.log('✅ Profile found:', profile.personalDetails?.firstName, profile.personalDetails?.lastName)
    return NextResponse.json({ success: true, profile })

  } catch (error) {
    console.error('❌ Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create new profile
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    console.log('🆕 POST /api/profile - Creating new profile')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('❌ No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📝 Request body:', body)

    // Validate the request body
    const validatedData = ProfileUpdateSchema.parse(body)
    console.log('✅ Validated data:', validatedData)

    await connectToDatabase()
    console.log('✅ Connected to database')

    // Check if profile already exists
    const existingProfile = await Profile.findOne({ userId: session.user.id })
    if (existingProfile) {
      console.log('❌ Profile already exists for user:', session.user.id)
      return NextResponse.json({ error: 'Profile already exists' }, { status: 400 })
    }

    // Check if publicProfileId is unique
    if (validatedData.personalDetails?.publicProfileId) {
      const existingPublicId = await Profile.findOne({ 
        'personalDetails.publicProfileId': validatedData.personalDetails.publicProfileId 
      })
      if (existingPublicId) {
        console.log('❌ Public profile ID already exists:', validatedData.personalDetails.publicProfileId)
        return NextResponse.json({ 
          error: 'Public profile ID already exists',
          message: 'This profile ID is already taken'
        }, { status: 400 })
      }
    }

    // Create new profile
    const profileData = {
      userId: session.user.id,
      personalDetails: validatedData.personalDetails || {
        firstName: '',
        lastName: '',
        publicProfileId: `user-${session.user.id}`
      },
      workExperiences: validatedData.workExperiences || [],
      education: validatedData.education || [],
      skills: validatedData.skills || [],
      languages: validatedData.languages || [],
      socialLinks: validatedData.socialLinks || {},
      profileImage: validatedData.profileImage,
      coverImage: validatedData.coverImage,
      location: validatedData.location,
      bio: validatedData.bio,
      isPublic: validatedData.isPublic ?? true
    }

    const profile = new Profile(profileData)
    const savedProfile = await profile.save()
    console.log('✅ Profile created successfully:', savedProfile._id)

    return NextResponse.json({ 
      success: true, 
      profile: savedProfile,
      message: 'Profile created successfully' 
    })

  } catch (error) {
    console.error('❌ Error creating profile:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update entire profile
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 PUT /api/profile - Updating entire profile')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('❌ No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📝 Request body:', body)

    // Validate the request body
    const validatedData = ProfileUpdateSchema.parse(body)
    console.log('✅ Validated data:', validatedData)

    await connectToDatabase()
    console.log('✅ Connected to database')

    // Check if profile exists
    const existingProfile = await Profile.findOne({ userId: session.user.id })
    if (!existingProfile) {
      console.log('❌ Profile not found for user:', session.user.id)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if publicProfileId is unique (if being updated)
    if (validatedData.personalDetails?.publicProfileId && 
        validatedData.personalDetails.publicProfileId !== existingProfile.personalDetails.publicProfileId) {
      const existingPublicId = await Profile.findOne({ 
        'personalDetails.publicProfileId': validatedData.personalDetails.publicProfileId 
      })
      if (existingPublicId) {
        console.log('❌ Public profile ID already exists:', validatedData.personalDetails.publicProfileId)
        return NextResponse.json({ 
          error: 'Public profile ID already exists',
          message: 'This profile ID is already taken'
        }, { status: 400 })
      }
    }

    // Update profile
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: session.user.id },
      { 
        ...validatedData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )

    console.log('✅ Profile updated successfully:', updatedProfile._id)

    return NextResponse.json({ 
      success: true, 
      profile: updatedProfile,
      message: 'Profile updated successfully' 
    })

  } catch (error) {
    console.error('❌ Error updating profile:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
