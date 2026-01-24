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

    // Build SEO from "About" section across profile types
    const isUser = !!profile?.personalDetails
    const isBusiness = !!profile?.companyName && !profile?.personalDetails
    const isInstitute = !!profile?.instituteName && !profile?.personalDetails

    const name = isUser
      ? (profile?.personalDetails?.firstName && profile?.personalDetails?.lastName
          ? `${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`
          : (profile?.personalDetails?.firstName || profile?.name || 'Unknown'))
      : (profile?.companyName || profile?.instituteName || profile?.name || 'Unknown')

    // About-derived description and headline
    const headline = isUser
      ? (profile?.personalDetails?.professionalHeadline || profile?.personalDetails?.profession || '')
      : isBusiness
      ? (profile?.industry ? `${profile.industry}` : '')
      : isInstitute
      ? (profile?.type ? `${profile.type}` : '')
      : ''

    const aboutDesc = isUser
      ? (profile?.personalDetails?.bio || profile?.bio || '')
      : isBusiness
      ? (profile?.description || '')
      : isInstitute
      ? (profile?.description || '')
      : ''

    const locationText = isUser
      ? (profile?.location || profile?.personalDetails?.location || '')
      : isBusiness
      ? (profile?.headquarters ? `${profile.headquarters.city}, ${profile.headquarters.country}` : '')
      : isInstitute
      ? (profile?.address ? `${profile.address.city}, ${profile.address.country}` : '')
      : ''

    const descriptionFull = [headline, aboutDesc, locationText].filter(Boolean).join(' · ')
    const description = descriptionFull
      ? (descriptionFull.length > 160 ? `${descriptionFull.substring(0, 157)}...` : descriptionFull)
      : `View ${name}'s profile on CareerBox`

    // Image selection: prefer cover, then avatar/logo
    const coverImage = profile?.coverImage
    const avatarOrLogo = profile?.profileImage || profile?.logo
    const ogImage = coverImage || avatarOrLogo

    const keywordsArr = [
      name,
      profileId,
      'CareerBox',
      'professional profile',
      headline,
      isBusiness ? profile?.industry : undefined,
      isInstitute ? profile?.type : undefined,
      locationText,
    ].filter(Boolean) as string[]

    return {
      title: `${name} (@${profileId}) | CareerBox`,
      description,
      keywords: keywordsArr.join(', '),
      authors: [{ name }],
      openGraph: {
        title: `${name} (@${profileId})`,
        description,
        type: isUser ? 'profile' : 'website',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile/${profileId}`,
        images: ogImage ? [
          {
            url: ogImage,
            width: coverImage ? 1200 : 400,
            height: coverImage ? 630 : 400,
            alt: `${name}'s ${coverImage ? 'cover' : 'profile'} image`,
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
        description,
        images: ogImage ? [ogImage] : [],
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
      <div className="w-full max-w-7xl mx-auto">
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
