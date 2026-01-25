import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import mongoose from 'mongoose'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import RegistrationIntent from '@/src/models/RegistrationIntent'
import User from '@/src/models/User'
import Subscription from '@/src/models/Subscription'
import NotificationService from '@/lib/services/notificationService'
import AdminInstitute from '@/src/models/AdminInstitute'
import Business from '@/src/models/Business'

// Validation schema
const reviewSchema = z.object({
  action: z.enum(['approve', 'reject', 'require_payment', 'pending']),
  adminNotes: z.string().optional(),
  subscriptionPlan: z.enum(['free', 'basic', 'premium', 'enterprise']).optional(),
  durationMonths: z.number().min(1).max(60).optional()
})

async function generateUniqueInstituteId (baseName: string): Promise<string> {
  const cleanBase = baseName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)

  let id = cleanBase
  let counter = 0

  while (true) {
    const checkId = counter === 0 ? id : `${id}-${counter}`
    const exists = await AdminInstitute.findOne({ id: checkId }).select('_id')
    if (!exists) return checkId
    counter++
  }
}

export async function POST (
  request: NextRequest,
  { params }: { params: Promise<{ intentId: string }> }
) {
  try {
    // Authentication check with admin role requirement
    console.log('[Review] Authenticating admin user')
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      console.log('[Review] Authentication failed - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult
    console.log(
      `[Review] Admin authenticated: ${user.email}, roles: ${JSON.stringify(
        user.roles
      )}`
    )
    if (!user?.roles?.includes('admin')) {
      console.log('[Review] Admin role required - Access denied')
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    console.log('[Review] Parsing and validating request body')
    const body = await request.json()

    // Handle mapping rules:
    // 1. 'paid' maps to 'premium'
    // 2. 'require_payment' action implies 'premium' plan if not specified (or if 'paid' was passed)
    console.log(
      `[Review] Original body: action=${body.action}, subscriptionPlan=${body.subscriptionPlan}`
    )
    if (body.subscriptionPlan === 'paid') {
      body.subscriptionPlan = 'premium'
      console.log('[Review] Mapping paid -> premium')
    }

    if (
      body.action === 'require_payment' &&
      (!body.subscriptionPlan || body.subscriptionPlan === 'paid')
    ) {
      body.subscriptionPlan = body.subscriptionPlan || 'premium'
      console.log('[Review] Setting premium plan for require_payment action')
    }

    if (body.action === 'approve' && !body.subscriptionPlan) {
      body.subscriptionPlan = 'free'
      console.log(
        '[Review] Setting free plan for approve action with no plan specified'
      )
    }

    const validatedData = reviewSchema.parse(body)
    const { action, adminNotes, subscriptionPlan, durationMonths } = validatedData
    console.log(
      `[Review] Validated data: action=${action}, subscriptionPlan=${subscriptionPlan}`
    )

    await connectToDatabase()

    // Await params before using
    const { intentId } = await params
    console.log(
      `[Review] Starting review process for intent ID: ${intentId}, action: ${action}`
    )

    // Find the registration intent
    const intent = await RegistrationIntent.findById(intentId)
    if (!intent) {
      return NextResponse.json(
        { error: 'Registration intent not found' },
        { status: 404 }
      )
    }

    // Removed check for pending status to allow updates at any time

    // Prepare update data
    const updateData: any = {
      status:
        action === 'require_payment'
          ? 'payment_required'
          : action === 'approve'
          ? 'approved'
          : action === 'pending'
          ? 'pending'
          : 'rejected',
      reviewedBy: new mongoose.Types.ObjectId(authResult.userId), // Convert to ObjectId
      reviewedAt: new Date(),
      updatedAt: new Date()
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes
    }

    if (subscriptionPlan) {
      updateData.subscriptionPlan = subscriptionPlan
    }

    // Update the registration intent
    const updatedIntent = await RegistrationIntent.findByIdAndUpdate(
      intentId,
      { $set: updateData },
      { new: true }
    )
    console.log(
      `[Review] Registration intent ${intentId} updated with status: ${updateData.status}`
    )

    // If approved and subscription plan provided, create subscription and link organization
    if (action === 'approve' && subscriptionPlan) {
      // Find the user
      const intentUser = await User.findById(intent.userId)
      if (!intentUser) {
        return NextResponse.json(
          { error: 'User not found for this registration intent' },
          { status: 404 }
        )
      }

      let organizationId: mongoose.Types.ObjectId | null = null

      // Handle Institute Linking/Creation
      if (intent.type === 'institute') {
        let adminInstitute

        // Check if intent links to existing AdminInstitute
        if (intent.instituteId) {
          adminInstitute = await AdminInstitute.findById(intent.instituteId)
        }

        if (adminInstitute) {
          // Update existing institute: Add user to userIds if not present
          console.log(
            `[Review] Found existing institute: ${adminInstitute._id}, adding user ${intent.userId} to userIds`
          )

          // Use findByIdAndUpdate to avoid validation issues with existing documents
          await AdminInstitute.findByIdAndUpdate(
            adminInstitute._id,
            {
              $addToSet: {
                userIds: new mongoose.Types.ObjectId(intent.userId)
              },
              $set: { status: 'active' }
            },
            { runValidators: false } // Skip validation for existing documents
          )

          console.log(`[Review] Updated institute with user ${intent.userId}`)
        } else {
          // Create new AdminInstitute
          console.log(
            `[Review] Creating new AdminInstitute for: ${intent.organizationName}`
          )
          const uniqueId = await generateUniqueInstituteId(
            intent.organizationName
          )
          adminInstitute = new AdminInstitute({
            id: uniqueId,
            slug: uniqueId,
            name: intent.organizationName,
            type: intent.instituteType || 'University',
            status: 'active',
            userIds: [new mongoose.Types.ObjectId(intent.userId)],
            contact: {
              email: intent.email,
              phone: [intent.contactPhone],
              website: intent.website
            },
            location: {
              address: intent.address,
              city: intent.city,
              state: intent.state,
              pincode: intent.zipCode,
              country: intent.country
            },
            overview: [
              {
                key: 'Description',
                value: intent.description || 'No description provided'
              }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
          })
          await adminInstitute.save()
          console.log(
            `[Review] Created new institute with ID: ${adminInstitute._id}`
          )
        }

        organizationId = adminInstitute._id
      } else if (intent.type === 'business') {
        // Handle Business Linking/Creation
        console.log(
          `[Review] Creating new Business for: ${intent.organizationName}`
        )
        const businessSlug = await generateUniqueInstituteId(
          intent.organizationName
        )
        const business = new Business({
          name: intent.organizationName,
          publicProfileId: businessSlug,
          email: intent.email,
          contactPerson: intent.contactName,
          phone: intent.contactPhone,
          address: {
            street: intent.address,
            city: intent.city,
            state: intent.state,
            country: intent.country,
            zipCode: intent.zipCode
          },
          status: 'active',
          userId: new mongoose.Types.ObjectId(intent.userId),
          registrationIntentId: intent._id
        })
        await business.save()
        organizationId = business._id
        console.log(`[Review] Created new business with ID: ${business._id}`)
      }

      if (!organizationId) {
        return NextResponse.json(
          { error: 'Failed to create organization' },
          { status: 500 }
        )
      }

      await Subscription.deleteMany({
        userId: new mongoose.Types.ObjectId(intent.userId),
        organizationId: organizationId
      })

      const startDate = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + (durationMonths || 12))

      const subscription = new Subscription({
        userId: new mongoose.Types.ObjectId(intent.userId),
        organizationId: organizationId,
        organizationType: intent.type,
        planName: `${subscriptionPlan.charAt(0).toUpperCase() + subscriptionPlan.slice(1)} Plan`,
        planType: subscriptionPlan,
        billingCycle: (durationMonths || 12) >= 12 ? 'yearly' : 'monthly',
        status: 'active',
        amount: 0,
        currency: 'INR',
        startDate,
        endDate,
        grantedBy: new mongoose.Types.ObjectId(authResult.userId),
        grantReason: `Approved registration with ${subscriptionPlan} plan`,
        createdAt: new Date()
      })
      await subscription.save()

      // Update user: add role, ownedOrganizations, and subscription status
      const roleToAdd = intent.type === 'institute' ? 'institute' : 'business'
      console.log(
        `[Review] Updating user ${intent.userId} with role: ${roleToAdd}, organizationId: ${organizationId}`
      )

      const userUpdateResult = await User.findByIdAndUpdate(
        new mongoose.Types.ObjectId(intent.userId),
        {
          $set: {
            subscriptionActive: true,
            activeRole: roleToAdd,
            role: roleToAdd,
            isOrganizationOwner: true,
            updatedAt: new Date()
          },
          $addToSet: {
            roles: roleToAdd,
            ownedOrganizations: organizationId
          }
        },
        { new: true }
      )

      if (!userUpdateResult) {
        console.error(
          `[Review] Failed to update user - User not found for userId: ${intent.userId}`
        )
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        )
      }

      console.log(`[Review] User updated successfully:`, {
        userId: userUpdateResult._id.toString(),
        roles: userUpdateResult.roles,
        activeRole: userUpdateResult.activeRole,
        ownedOrganizations: userUpdateResult.ownedOrganizations?.map(
          (id: any) => id.toString()
        ),
        isOrganizationOwner: userUpdateResult.isOrganizationOwner,
        subscriptionActive: userUpdateResult.subscriptionActive
      })

      // Mark registration intent as completed with organizationId
      await RegistrationIntent.findByIdAndUpdate(intentId, {
        $set: {
          status: 'completed',
          subscriptionPlan: subscriptionPlan,
          organizationId: organizationId,
          updatedAt: new Date()
        }
      })
      console.log(`[Review] Registration intent marked as completed`)

      updateData.status = 'completed'
    } else if (action === 'reject' || action === 'pending') {
      // If status is changed back to reject or pending, deactivate the institute/business
      console.log(`[Review] Processing ${action} action for intent ${intentId}`)
      if (intent.organizationId) {
        if (intent.type === 'institute') {
          await AdminInstitute.findByIdAndUpdate(intent.organizationId, {
            status: action === 'pending' ? 'under_review' : 'inactive'
          })
          console.log(
            `[Review] Institute ${intent.organizationId} status updated to ${
              action === 'pending' ? 'under_review' : 'inactive'
            }`
          )
        } else if (intent.type === 'business') {
          await Business.findByIdAndUpdate(intent.organizationId, {
            status: action === 'pending' ? 'pending' : 'inactive'
          })
          console.log(
            `[Review] Business ${intent.organizationId} status updated`
          )
        }
      }
      await Subscription.deleteMany({
        userId: new mongoose.Types.ObjectId(intent.userId),
        organizationId: intent.organizationId
      })
    }

    // Send notifications based on action
    console.log(`[Review] Preparing notifications for action: ${action}`)
    try {
      let notificationData: any = {
        userId: intent.userId,
        priority: 'high',
        sendEmail: true,
        sendSocket: true,
        data: {
          registrationIntentId: intentId,
          metadata: {
            organizationName: intent.organizationName,
            type: intent.type,
            adminNotes: adminNotes
          }
        }
      }

      switch (action) {
        case 'approve':
          console.log(
            `[Review] Sending approval notification for ${intent.organizationName}`
          )
          notificationData = {
            ...notificationData,
            type: 'registration_approved',
            title: 'Registration Approved! 🎉',
            message: `Congratulations! Your ${intent.type} registration for "${intent.organizationName}" has been approved. You can now access your dashboard.`,
            emailTemplate: 'registration_approved',
            data: {
              ...notificationData.data,
              actionUrl:
                intent.type === 'institute' ? '/institute' : '/business',
              subscriptionPlan: subscriptionPlan || 'free',
              shouldRefetchSession: true
            }
          }
          break

        case 'reject':
          console.log(
            `[Review] Sending rejection notification for ${intent.organizationName}`
          )
          notificationData = {
            ...notificationData,
            type: 'registration_rejected',
            title: 'Registration Update Required',
            message: `Your ${intent.type} registration for "${intent.organizationName}" requires some updates. Please review the admin notes and resubmit.`,
            emailTemplate: 'registration_rejected',
            data: {
              ...notificationData.data,
              actionUrl:
                intent.type === 'institute'
                  ? '/register/institute'
                  : '/register/business'
            }
          }
          break

        case 'require_payment':
          console.log(
            `[Review] Sending payment required notification for ${intent.organizationName}`
          )
          notificationData = {
            ...notificationData,
            type: 'payment_required',
            title: 'Payment Required for Registration',
            message: `Your ${intent.type} registration for "${intent.organizationName}" has been approved pending payment. Please complete your payment to activate your account.`,
            emailTemplate: 'payment_required',
            data: {
              ...notificationData.data,
              actionUrl: `/user/payment/${intentId}`,
              subscriptionPlan: subscriptionPlan || 'basic'
            }
          }
          break
      }

      // Add email variables
      notificationData.emailVariables = {
        contactName: intent.contactName,
        organizationName: intent.organizationName,
        type: intent.type,
        email: intent.email,
        adminNotes: adminNotes,
        subscriptionGranted: action === 'approve' && subscriptionPlan,
        planType: subscriptionPlan
      }

      await NotificationService.createNotification(notificationData)
      console.log(
        `Notification sent for registration review: ${intent._id} - ${action}`
      )
    } catch (notificationError) {
      console.error(
        'Failed to send notification for registration review:',
        notificationError
      )
      // Don't fail the review if notification fails
    }

    // Transform for response
    const responseIntent = {
      id: updatedIntent._id.toString(),
      userId: updatedIntent.userId.toString(),
      type: updatedIntent.type,
      status: updateData.status,
      organizationName: updatedIntent.organizationName,
      email: updatedIntent.email,
      contactName: updatedIntent.contactName,
      contactPhone: updatedIntent.contactPhone,
      address: updatedIntent.address,
      city: updatedIntent.city,
      state: updatedIntent.state,
      country: updatedIntent.country,
      zipCode: updatedIntent.zipCode,
      description: updatedIntent.description,
      website: updatedIntent.website,
      establishmentYear: updatedIntent.establishmentYear,
      adminNotes: updatedIntent.adminNotes,
      reviewedBy: updatedIntent.reviewedBy,
      reviewedAt: updatedIntent.reviewedAt,
      createdAt: updatedIntent.createdAt,
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      message: `Registration intent ${action}d successfully`,
      data: {
        ...responseIntent,
        shouldRefetchSession: true
      }
    })
  } catch (error) {
    console.error('Error reviewing registration intent:', error)

    if (error instanceof z.ZodError) {
      console.log('Validation error:', error.errors)
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    // Provide more specific error message
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    console.log('Review API error message:', errorMessage)

    return NextResponse.json(
      {
        error: 'Failed to review registration intent',
        message: errorMessage,
        details:
          error instanceof Error ? error.stack : 'No stack trace available'
      },
      { status: 500 }
    )
  }
}
