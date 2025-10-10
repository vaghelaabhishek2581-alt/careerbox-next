import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProfileView from '@/components/profile/ProfileView'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Profile, Institute, Business } from '@/src/models'

interface ProfilePageProps {
  params: Promise<{
    profileId: string
  }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { profileId } = await params
  
  try {
    await connectToDatabase()
    
    // Try to find user profile
    let profile: any = await Profile.findOne({
      'personalDetails.publicProfileId': profileId,
      status: 'active'
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

    const name = profile?.name || profile?.companyName || profile?.instituteName || 'Unknown'
    const description = profile?.bio || profile?.description || `View ${name}'s profile on CareerBox`

    return {
      title: `${name} | CareerBox`,
      description,
      openGraph: {
        title: `${name} | CareerBox`,
        description,
        images: profile?.profileImage || profile?.logo ? [profile.profileImage || profile.logo] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${name} | CareerBox`,
        description,
        images: profile?.profileImage || profile?.logo ? [profile.profileImage || profile.logo] : undefined,
      }
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileView profileId={profileId} />
        </Suspense>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="h-64 bg-muted animate-pulse rounded-lg" />
      
      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-48 bg-muted animate-pulse rounded-lg" />
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-muted animate-pulse rounded-lg" />
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    </div>
  )
}
