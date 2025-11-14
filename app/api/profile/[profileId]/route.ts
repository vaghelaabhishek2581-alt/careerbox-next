import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import Profile from '@/src/models/Profile'
import { Business, Institute } from '@/src/models'
import { UserProfile, BusinessProfile, InstituteProfile } from '@/lib/types/unified.types'

// GET /api/profile/[profileId] - Fetch public profile by publicProfileId
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId } = await params
    await connectToDatabase()

    // Try to find user profile first (only public profiles)
    let profile: any = await Profile.findOne({
      'personalDetails.publicProfileId': profileId,
      isPublic: true // isPublic is at root level, not in personalDetails
    }).lean().exec()

    if (profile) {
      // Increment profile view count
      await Profile.findByIdAndUpdate(
        profile._id,
        { $inc: { 'stats.profileViews': 1 } }
      )

      // Convert MongoDB document to plain object and sanitize for public access
      const userProfile: UserProfile = {
        id: profile._id.toString(),
        name: profile.personalDetails?.firstName && profile.personalDetails?.lastName 
          ? `${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`
          : profile.name || 'User',
        email: profile.personalDetails?.email || profile.email, // Only show if public
        role: profile.role,
        userType: profile.userType,
        profileImage: profile.profileImage,
        coverImage: profile.coverImage,
        bio: profile.personalDetails?.bio || profile.bio,
        location: profile.personalDetails?.city && profile.personalDetails?.state
          ? `${profile.personalDetails.city}, ${profile.personalDetails.state}`
          : profile.location,
        website: profile.personalDetails?.website || profile.website,
        verified: profile.verified || false,
        emailVerified: profile.emailVerified || false,
        status: profile.status || 'active',
        verificationStatus: profile.verificationStatus || 'unverified',
        personalDetails: profile.personalDetails,
        skills: profile.skills || [],
        languages: profile.languages || [],
        workExperiences: profile.workExperience || [],
        education: profile.education || [],
        certifications: profile.certifications || [],
        achievements: profile.achievements || [],
        contacts: profile.contacts || [],
        socialLinks: profile.socialLinks,
        address: profile.address,
        stats: profile.stats || { profileViews: 0, connections: 0 },
        progress: profile.progress,
        roles: profile.roles || [],
        activeRole: profile.activeRole,
        permissions: [], // Don't expose permissions for public profiles
        needsOnboarding: false, // Don't expose onboarding status
        needsRoleSelection: false, // Don't expose role selection status
        provider: profile.provider || 'credentials',
        privacySettings: undefined, // Don't expose privacy settings
        notificationPreferences: undefined, // Don't expose notification preferences
        followers: profile.followers || [],
        following: profile.following || [],
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
        lastActiveAt: profile.lastActiveAt,
        onboardingCompletedAt: profile.onboardingCompletedAt
      }

      return NextResponse.json({
        profile: userProfile,
        type: 'user'
      })
    }

    // Try to find business profile
    profile = await Business.findOne({
      publicProfileId: profileId,
      status: 'active'
    }).lean().exec()

    if (profile) {
      // Increment profile view count
      await Business.findByIdAndUpdate(
        profile._id,
        { $inc: { 'stats.profileViews': 1 } }
      )

      const businessProfile: BusinessProfile = {
        id: profile._id.toString(),
        userId: profile.userId,
        companyName: profile.companyName,
        industry: profile.industry,
        size: profile.size,
        description: profile.description,
        website: profile.website,
        logo: profile.logo,
        coverImage: profile.coverImage,
        foundedYear: profile.foundedYear,
        revenue: profile.revenue,
        employeeCount: profile.employeeCount,
        jobPostings: profile.jobPostings || 0,
        headquarters: profile.headquarters,
        contactInfo: profile.contactInfo,
        services: profile.services || [],
        awards: profile.awards || [],
        isVerified: profile.isVerified || false,
        verificationDocuments: profile.verificationDocuments || [],
        status: profile.status || 'active',
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      }

      return NextResponse.json({
        profile: businessProfile,
        type: 'business'
      })
    }

    // Try to find institute profile
    profile = await Institute.findOne({
      publicProfileId: profileId,
      status: 'active'
    }).lean().exec()

    if (profile) {
      // Increment profile view count
      await Institute.findByIdAndUpdate(
        profile._id,
        { $inc: { 'stats.profileViews': 1 } }
      )

      const instituteProfile: InstituteProfile = {
        id: profile._id.toString(),
        userId: profile.userId,
        instituteName: profile.instituteName,
        type: profile.type,
        description: profile.description,
        website: profile.website,
        logo: profile.logo,
        coverImage: profile.coverImage,
        establishedYear: profile.establishedYear,
        accreditation: profile.accreditation || [],
        ranking: profile.ranking,
        studentCount: profile.studentCount,
        facultyCount: profile.facultyCount,
        address: profile.address,
        campuses: profile.campuses || [],
        contactInfo: profile.contactInfo,
        programs: profile.programs || [],
        departments: profile.departments || [],
        facilities: profile.facilities || [],
        isVerified: profile.isVerified || false,
        verificationDocuments: profile.verificationDocuments || [],
        status: profile.status || 'active',
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      }

      return NextResponse.json({
        profile: instituteProfile,
        type: 'institute'
      })
    }

    // Profile not found
    return NextResponse.json(
      { error: 'Profile not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
