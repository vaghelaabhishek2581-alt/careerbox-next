import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import RegistrationIntent from '@/src/models/RegistrationIntent'
import { connectToDatabase } from '@/lib/db/mongoose'

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase()

    // Authenticate user
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const { userId } = authResult

    // Fetch user's registration intents
    const intents = await RegistrationIntent.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50) // Limit to 50 recent intents to prevent OOM
      .lean()

    // Transform data for frontend with normalized status
    const transformedIntents = intents.map((intent: any) => {
      const originalStatus = intent.status || 'pending'
      const normalizedStatus = originalStatus === 'completed' ? 'approved' : originalStatus
      return {
      id: intent._id?.toString() || '',
      userId: intent.userId?.toString() || '',
      type: intent.type || '',
      status: normalizedStatus,

      // Basic Information
      organizationName: intent.organizationName || '',
      email: intent.email || '',
      contactName: intent.contactName || '',
      contactPhone: intent.contactPhone || '',

      // Institute specific fields
      instituteType: intent.instituteType || null,
      instituteCategory: intent.instituteCategory || null,
      establishmentYear: intent.establishmentYear || null,

      // Business specific fields
      businessCategory: intent.businessCategory || null,
      organizationSize: intent.organizationSize || null,

      // Address
      address: intent.address || '',
      city: intent.city || '',
      state: intent.state || '',
      country: intent.country || '',
      zipCode: intent.zipCode || null,

      // Additional Information
      description: intent.description || null,
      website: intent.website || null,

      // Admin Review
      adminNotes: intent.adminNotes || null,
      reviewedBy: intent.reviewedBy?.toString() || null,
      reviewedAt: intent.reviewedAt?.toISOString() || null,

      // Subscription Details
      subscriptionPlan: intent.subscriptionPlan || null,
      subscriptionAmount: intent.subscriptionAmount || null,
      subscriptionGrantedBy: intent.subscriptionGrantedBy?.toString() || null,
      subscriptionGrantedAt: intent.subscriptionGrantedAt?.toISOString() || null,

      // Payment Information
      paymentIntentId: intent.paymentIntentId || null,
      paymentStatus: intent.paymentStatus || null,
      paidAt: intent.paidAt?.toISOString() || null,

      // Metadata
      createdAt: intent.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: intent.updatedAt?.toISOString() || new Date().toISOString(),
    }})

    return NextResponse.json({
      success: true,
      data: transformedIntents
    })

  } catch (error) {
    console.error('Fetch registration intents error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
