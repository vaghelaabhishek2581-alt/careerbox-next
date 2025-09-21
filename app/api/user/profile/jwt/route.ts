import { NextRequest, NextResponse } from 'next/server'
import { withJWTAuth } from '@/lib/middleware/jwt-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import { createSuccessResponse, createErrorResponse, validateRequiredFields } from '@/lib/middleware/jwt-auth'

// Get user profile (JWT version)
async function getProfileHandler(request: NextRequest, user: any) {
  try {
    const { db } = await connectToDatabase()
    
    // Get user profile from database
    const userProfile = await db.collection('users').findOne(
      { _id: user._id },
      { projection: { password: 0 } }
    )
    
    if (!userProfile) {
      return createErrorResponse(
        'User profile not found',
        404,
        'PROFILE_NOT_FOUND'
      )
    }
    
    // Convert to frontend format
    const profile = {
      id: userProfile._id.toString(),
      name: userProfile.name,
      email: userProfile.email,
      role: userProfile.role,
      userType: userProfile.userType,
      profileImage: userProfile.avatar || userProfile.profileImage,
      coverImage: userProfile.coverImage,
      location: userProfile.location,
      website: userProfile.website,
      bio: userProfile.bio || userProfile.profile?.personalDetails?.aboutMe,
      verified: userProfile.verified || false,
      emailVerified: userProfile.emailVerified || false,
      followers: userProfile.followers || 0,
      following: userProfile.following || 0,
      personalDetails: userProfile.personalDetails || userProfile.profile?.personalDetails || {
        firstName: userProfile.name?.split(' ')[0] || '',
        lastName: userProfile.name?.split(' ').slice(1).join(' ') || '',
        middleName: '',
        dateOfBirth: '',
        gender: 'PREFER_NOT_TO_SAY',
        professionalHeadline: userProfile.activeRole === 'student' ? 'Student' :
                             userProfile.activeRole === 'professional' ? 'Professional' :
                             userProfile.activeRole === 'institute_admin' ? 'Institute Administrator' :
                             userProfile.activeRole === 'business_owner' ? 'Business Owner' : 'User',
        publicProfileId: userProfile.profile?.personalDetails?.publicProfileId || '',
        aboutMe: userProfile.profile?.personalDetails?.aboutMe || `Welcome to my profile! I'm ${userProfile.name} and I'm excited to be part of the CareerBox community.`,
        phone: '',
        interests: [],
        professionalBadges: []
      },
      skills: (userProfile.profile?.skills || userProfile.skills || []).map((skill: any, index: number) => ({
        id: skill.id || `skill_${index}`,
        name: skill.name || skill,
        level: skill.level || 'INTERMEDIATE'
      })),
      languages: (userProfile.profile?.languages || userProfile.languages || []).map((lang: any, index: number) => ({
        id: lang.id || `lang_${index}`,
        name: lang.name || lang,
        level: lang.level || 'INTERMEDIATE'
      })),
      workExperiences: (userProfile.profile?.workExperience || userProfile.workExperiences || []).map((work: any, index: number) => ({
        id: work.id || `work_${index}`,
        company: work.company || '',
        location: work.location || '',
        positions: (work.positions || []).map((pos: any, posIndex: number) => ({
          id: pos.id || `pos_${index}_${posIndex}`,
          title: pos.title || '',
          startDate: pos.startDate || '',
          endDate: pos.endDate || '',
          isCurrent: pos.isCurrent || false,
          description: pos.description || '',
          locationType: pos.locationType || 'ONSITE',
          employmentType: pos.employmentType || 'FULL_TIME',
          skills: pos.skills || []
        }))
      })),
      education: (userProfile.profile?.education || userProfile.education || []).map((edu: any, index: number) => ({
        id: edu.id || `edu_${index}`,
        degree: edu.degree || '',
        institution: edu.institution || '',
        fieldOfStudy: edu.fieldOfStudy || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        isCurrent: edu.isCurrent || false,
        location: edu.location || '',
        grade: edu.grade || '',
        description: edu.description || ''
      })),
      contacts: (userProfile.contacts || []).map((contact: any, index: number) => ({
        id: contact.id || `contact_${index}`,
        email: contact.email || '',
        isPrimary: contact.isPrimary || false,
        isVerified: contact.isVerified || false
      })),
      socialLinks: userProfile.profile?.socialLinks || userProfile.socialLinks || {},
      stats: {
        completedCourses: userProfile.stats?.completedCourses || 0,
        skillsAssessed: userProfile.stats?.skillsAssessed || 0,
        careerGoals: userProfile.stats?.careerGoals || 0,
        networkSize: userProfile.stats?.networkSize || 0
      },
      progress: {
        overall: userProfile.progress?.overall || 0,
        skills: userProfile.progress?.skills || 0,
        goals: userProfile.progress?.goals || 0
      },
      roles: userProfile.roles || [userProfile.role || 'user'],
      activeRole: userProfile.activeRole || userProfile.role || 'user',
      permissions: userProfile.permissions || [],
      needsOnboarding: userProfile.needsOnboarding || false,
      needsRoleSelection: userProfile.needsRoleSelection || false,
      provider: userProfile.provider || 'credentials',
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt
    }
    
    return createSuccessResponse(profile)
    
  } catch (error) {
    console.error('Get profile error:', error)
    return createErrorResponse(
      'Failed to fetch profile',
      500,
      'FETCH_PROFILE_FAILED'
    )
  }
}

// Update user profile (JWT version)
async function updateProfileHandler(request: NextRequest, user: any) {
  try {
    const body = await request.json()
    
    if (!body || Object.keys(body).length === 0) {
      return createErrorResponse(
        'No data provided for update',
        400,
        'NO_DATA_PROVIDED'
      )
    }
    
    const { db } = await connectToDatabase()
    
    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }
    
    // Handle different profile sections
    if (body.personalDetails) {
      updateData.personalDetails = body.personalDetails
    }
    
    if (body.skills) {
      updateData.skills = body.skills
    }
    
    if (body.languages) {
      updateData.languages = body.languages
    }
    
    if (body.workExperiences) {
      updateData.workExperiences = body.workExperiences
    }
    
    if (body.education) {
      updateData.education = body.education
    }
    
    if (body.socialLinks) {
      updateData.socialLinks = body.socialLinks
    }
    
    if (body.bio !== undefined) {
      updateData.bio = body.bio
    }
    
    if (body.location !== undefined) {
      updateData.location = body.location
    }
    
    if (body.website !== undefined) {
      updateData.website = body.website
    }
    
    // Update user profile
    const result = await db.collection('users').updateOne(
      { _id: user._id },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return createErrorResponse(
        'User not found',
        404,
        'USER_NOT_FOUND'
      )
    }
    
    return createSuccessResponse(null, 'Profile updated successfully')
    
  } catch (error) {
    console.error('Update profile error:', error)
    return createErrorResponse(
      'Failed to update profile',
      500,
      'UPDATE_PROFILE_FAILED'
    )
  }
}

export const GET = withJWTAuth(getProfileHandler)
export const PATCH = withJWTAuth(updateProfileHandler)
