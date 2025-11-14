import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connectToDatabase } from '@/lib/db/mongoose'
import Profile from '@/src/models/Profile'
import { Institute, Business } from '@/src/models'
import Header from '@/components/header'
import PublicProfileClient from './PublicProfileClient.tsx'

interface ProfilePageProps {
  params: Promise<{
    profileId: string
  }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { profileId } = await params

  try {
    await connectToDatabase()

    // Try to find user profile by publicProfileId
    let profile: any = await Profile.findOne({
      'personalDetails.publicProfileId': profileId,
      isPublic: true // Only show public profiles (isPublic is at root level)
    }).lean().exec()

    if (!profile) {
      // Try business profile
      profile = await Business.findOne({
        publicProfileId: profileId,
        status: 'active'
      }).lean().exec()
    }

    if (!profile) {
      // Try institute profile
      profile = await Institute.findOne({
        publicProfileId: profileId,
        status: 'active'
      }).lean().exec()
    }

    if (!profile) {
      return {
        title: 'Profile Not Found | CareerBox',
        description: 'The requested profile could not be found.'
      }
    }

    // Extract name based on profile type
    const name = profile?.personalDetails?.firstName && profile?.personalDetails?.lastName
      ? `${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`
      : profile?.companyName || profile?.instituteName || 'Unknown'

    const bio = profile?.personalDetails?.bio || profile?.bio || profile?.description || `View ${name}'s profile on CareerBox`
    const profession = profile?.personalDetails?.profession || profile?.personalDetails?.professionalHeadline || ''

    return {
      title: `${name} (@${profileId}) | CareerBox`,
      description: bio.length > 160 ? `${bio.substring(0, 157)}...` : bio,
      keywords: [
        name,
        profileId,
        'CareerBox',
        'professional profile',
        profession,
        'career',
        'portfolio'
      ].filter(Boolean).join(', '),
      authors: [{ name }],
      openGraph: {
        title: `${name} (@${profileId})`,
        description: `${profession ? profession + ' - ' : ''}${bio}`,
        type: 'profile',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile/${profileId}`,
        images: profile?.profileImage || profile?.logo ? [
          {
            url: profile.profileImage || profile.logo,
            width: 400,
            height: 400,
            alt: `${name}'s profile picture`,
          }
        ] : [
          {
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/og-default.png`,
            width: 1200,
            height: 630,
            alt: 'CareerBox Profile',
          }
        ],
        siteName: 'CareerBox',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${name} (@${profileId})`,
        description: `${profession ? profession + ' - ' : ''}${bio}`,
        images: profile?.profileImage || profile?.logo ? [profile.profileImage || profile.logo] : [],
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile/${profileId}`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Profile | CareerBox',
      description: 'View profile on CareerBox'
    }
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { profileId } = await params

  try {
    await connectToDatabase()

    console.log('🔍 Searching for profile with publicProfileId:', profileId)

    // First, let's try to find any profile with this publicProfileId (for debugging)
    const anyProfile = await Profile.findOne({
      'personalDetails.publicProfileId': profileId
    }).lean().exec()

    console.log('🔍 Found any profile:', !!anyProfile)
    if (anyProfile) {
      console.log('🔍 Profile isPublic status:', (anyProfile as any).isPublic)
    }

    // Find user profile by publicProfileId
    const profile: any = await Profile.findOne({
      'personalDetails.publicProfileId': profileId,
      isPublic: true // Only show public profiles (isPublic is at root level)
    }).lean().exec()

    console.log('🔍 Found public profile:', !!profile)

    if (!profile) {
      console.log('❌ No public profile found for:', profileId)
      notFound()
    }

    // Convert MongoDB document to plain object for client component
    const profileData = {
      ...profile,
      _id: profile._id.toString(),
      userId: profile.userId?.toString(),
      createdAt: profile.createdAt?.toISOString(),
      updatedAt: profile.updatedAt?.toISOString(),
    }

    return (
      <div className="bg-gray-50">
        <Header />
        <div className="min-h-screen mt-28">
          <PublicProfileClient profile={profileData} />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading profile:', error)
    notFound()
  }
}
