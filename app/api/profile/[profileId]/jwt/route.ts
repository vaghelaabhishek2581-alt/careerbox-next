import { NextRequest, NextResponse } from 'next/server'
import { withJWTAuthDynamic, createSuccessResponse, createErrorResponse } from '@/lib/middleware/jwt-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import { ObjectId } from 'mongodb'

// Get public profile by profileId (JWT version)
async function getPublicProfileHandler(
  request: NextRequest,
  user: any,
  { params }: { params: { profileId: string } }
) {
  try {
    const { profileId } = params
    
    if (!profileId) {
      return createErrorResponse(
        'Profile ID is required',
        400,
        'MISSING_PROFILE_ID'
      )
    }
    
    const { db } = await connectToDatabase()
    
    // Find user by public profile ID
    const userProfile = await db.collection('users').findOne(
      { 'profile.personalDetails.publicProfileId': profileId },
      { projection: { password: 0 } }
    )
    
    if (!userProfile) {
      return createErrorResponse(
        'Profile not found',
        404,
        'PROFILE_NOT_FOUND'
      )
    }
    
    // Check if profile is public
    const isPublic = userProfile.profile?.preferences?.privacy?.profileVisible !== false
    
    if (!isPublic) {
      return createErrorResponse(
        'Profile is private',
        403,
        'PROFILE_PRIVATE'
      )
    }
    
    // Return public profile data
    const publicProfile = {
      id: userProfile._id.toString(),
      name: userProfile.name,
      profileImage: userProfile.avatar || userProfile.profileImage,
      personalDetails: {
        firstName: userProfile.profile?.personalDetails?.firstName || userProfile.name?.split(' ')[0] || '',
        lastName: userProfile.profile?.personalDetails?.lastName || userProfile.name?.split(' ').slice(1).join(' ') || '',
        professionalHeadline: userProfile.profile?.personalDetails?.professionalHeadline || 'Professional',
        publicProfileId: userProfile.profile?.personalDetails?.publicProfileId || '',
        aboutMe: userProfile.profile?.personalDetails?.aboutMe || '',
        location: userProfile.location || ''
      },
      skills: (userProfile.profile?.skills || []).map((skill: any) => ({
        name: skill.name || skill,
        level: skill.level || 'INTERMEDIATE'
      })),
      workExperiences: (userProfile.profile?.workExperience || []).map((work: any) => ({
        company: work.company || '',
        positions: (work.positions || []).map((pos: any) => ({
          title: pos.title || '',
          startDate: pos.startDate || '',
          endDate: pos.endDate || '',
          isCurrent: pos.isCurrent || false,
          description: pos.description || ''
        }))
      })),
      education: (userProfile.profile?.education || []).map((edu: any) => ({
        degree: edu.degree || '',
        institution: edu.institution || '',
        fieldOfStudy: edu.fieldOfStudy || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        isCurrent: edu.isCurrent || false
      })),
      socialLinks: userProfile.profile?.socialLinks || {},
      stats: {
        completedCourses: userProfile.stats?.completedCourses || 0,
        skillsAssessed: userProfile.stats?.skillsAssessed || 0,
        careerGoals: userProfile.stats?.careerGoals || 0,
        networkSize: userProfile.stats?.networkSize || 0
      }
    }
    
    return createSuccessResponse(publicProfile)
    
  } catch (error) {
    console.error('Get public profile error:', error)
    return createErrorResponse(
      'Failed to fetch profile',
      500,
      'FETCH_PROFILE_FAILED'
    )
  }
}

// Update profile (JWT version) - only if it's the user's own profile
async function updateProfileHandler(
  request: NextRequest,
  user: any,
  { params }: { params: { profileId: string } }
) {
  try {
    const { profileId } = params
    
    if (!profileId) {
      return createErrorResponse(
        'Profile ID is required',
        400,
        'MISSING_PROFILE_ID'
      )
    }
    
    const { db } = await connectToDatabase()
    
    // Find the profile owner
    const profileOwner = await db.collection('users').findOne(
      { 'profile.personalDetails.publicProfileId': profileId }
    )
    
    if (!profileOwner) {
      return createErrorResponse(
        'Profile not found',
        404,
        'PROFILE_NOT_FOUND'
      )
    }
    
    // Check if user is updating their own profile
    if (profileOwner._id.toString() !== user._id.toString()) {
      return createErrorResponse(
        'You can only update your own profile',
        403,
        'NOT_PROFILE_OWNER'
      )
    }
    
    const body = await request.json()
    
    if (!body || Object.keys(body).length === 0) {
      return createErrorResponse(
        'No data provided for update',
        400,
        'NO_DATA_PROVIDED'
      )
    }
    
    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }
    
    // Handle different profile sections
    if (body.personalDetails) {
      updateData['profile.personalDetails'] = body.personalDetails
    }
    
    if (body.skills) {
      updateData['profile.skills'] = body.skills
    }
    
    if (body.workExperiences) {
      updateData['profile.workExperience'] = body.workExperiences
    }
    
    if (body.education) {
      updateData['profile.education'] = body.education
    }
    
    if (body.socialLinks) {
      updateData['profile.socialLinks'] = body.socialLinks
    }
    
    if (body.bio !== undefined) {
      updateData.bio = body.bio
    }
    
    if (body.location !== undefined) {
      updateData.location = body.location
    }
    
    // Update user profile
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(user._id) },
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

export const GET = withJWTAuthDynamic(getPublicProfileHandler)
export const PATCH = withJWTAuthDynamic(updateProfileHandler)
