import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongoose'
import { Profile } from '@/src/models'
import Institute from '@/src/models/Institute'
import Business from '@/src/models/Business'

export async function GET(
  request: NextRequest,
  { params }: { params: { publicId: string } }
) {
  try {
    const { publicId } = params
    
    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Check if it's a user profile
    const userProfile = await Profile.findOne({
      'personalDetails.publicProfileId': publicId
    })
      .select('-sensitiveData -privateInfo') // Exclude sensitive fields
      .lean()

    if (userProfile) {
      return NextResponse.json({
        type: 'user',
        data: userProfile
      })
    }

    // Check if it's an institute
    const institute = await Institute.findOne({
      publicProfileId: publicId,
      status: 'active' // Only show active institutes
    })
      .select('-subscriptionId') // Don't expose subscription details
      .lean()

    if (institute) {
      return NextResponse.json({
        type: 'institute',
        data: institute
      })
    }

    // Check if it's a business
    const business = await Business.findOne({
      publicProfileId: publicId,
      status: 'active' // Only show active businesses
    })
      .select('-subscriptionId') // Don't expose subscription details
      .lean()

    if (business) {
      return NextResponse.json({
        type: 'business',
        data: business
      })
    }

    // Profile not found
    return NextResponse.json(
      { error: 'Profile not found', notFound: true },
      { status: 404 }
    )

  } catch (error) {
    console.error('Error fetching public profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
