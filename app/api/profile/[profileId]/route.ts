import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db'
import { UserProfile, BusinessProfile, InstituteProfile } from '@/lib/types/unified.types'

// GET /api/profile/[profileId] - Fetch profile by public profile ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const authCheck = await requireAuth(req)
    if (authCheck.error) return authCheck.response

    const { profileId } = await params
    const { db } = await connectToDatabase()

    // Try to find user profile first
    let profile = await db.collection('users').findOne({
      'personalDetails.publicProfileId': profileId,
      status: 'active'
    })

    if (profile) {
      // Increment profile view count
      await db.collection('users').updateOne(
        { _id: profile._id },
        { $inc: { 'stats.profileViews': 1 } }
      )

      const userProfile: UserProfile = {
        id: profile._id.toString(),
        name: profile.name,
        email: profile.email,
        role: profile.role,
        userType: profile.userType,
        profileImage: profile.profileImage,
        coverImage: profile.coverImage,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        verified: profile.verified || false,
        emailVerified: profile.emailVerified || false,
        status: profile.status || 'active',
        verificationStatus: profile.verificationStatus || 'unverified',
        personalDetails: profile.personalDetails,
        skills: profile.skills || [],
        languages: profile.languages || [],
        workExperiences: profile.workExperiences || [],
        education: profile.education || [],
        certifications: profile.certifications || [],
        achievements: profile.achievements || [],
        contacts: profile.contacts || [],
        socialLinks: profile.socialLinks,
        address: profile.address,
        stats: profile.stats,
        progress: profile.progress,
        roles: profile.roles || [],
        activeRole: profile.activeRole,
        permissions: profile.permissions || [],
        needsOnboarding: profile.needsOnboarding || false,
        needsRoleSelection: profile.needsRoleSelection || false,
        provider: profile.provider || 'credentials',
        privacySettings: profile.privacySettings,
        notificationPreferences: profile.notificationPreferences,
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
    profile = await db.collection('businesses').findOne({
      publicProfileId: profileId,
      status: 'active'
    })

    if (profile) {
      // Increment profile view count
      await db.collection('businesses').updateOne(
        { _id: profile._id },
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
    profile = await db.collection('institutes').findOne({
      publicProfileId: profileId,
      status: 'active'
    })

    if (profile) {
      // Increment profile view count
      await db.collection('institutes').updateOne(
        { _id: profile._id },
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
