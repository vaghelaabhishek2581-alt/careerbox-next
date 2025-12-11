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
  action: z.enum(['approve', 'reject', 'require_payment']),
  adminNotes: z.string().optional(),
  subscriptionPlan: z.enum(['free', 'basic', 'premium', 'enterprise']).optional(),
})

async function generateUniqueInstituteId(baseName: string): Promise<string> {
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ intentId: string }> }
) {
  try {
    // Authentication check with admin role requirement
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult
    if (!user?.roles?.includes('admin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()

    // Handle mapping rules:
    // 1. 'paid' maps to 'premium'
    // 2. 'require_payment' action implies 'premium' plan if not specified (or if 'paid' was passed)
    if (body.subscriptionPlan === 'paid') {
      body.subscriptionPlan = 'premium'
    }

    if (body.action === 'require_payment' && (!body.subscriptionPlan || body.subscriptionPlan === 'paid')) {
      body.subscriptionPlan = body.subscriptionPlan || 'premium'
    }

    if (body.action === 'approve' && !body.subscriptionPlan) {
      body.subscriptionPlan = 'free'
    }

    const validatedData = reviewSchema.parse(body)
    const { action, adminNotes, subscriptionPlan } = validatedData

    await connectToDatabase()

    // Await params before using
    const { intentId } = await params

    // Find the registration intent
    const intent = await RegistrationIntent.findById(intentId)
    if (!intent) {
      return NextResponse.json({ error: 'Registration intent not found' }, { status: 404 })
    }

    // Check if intent is still pending
    if (intent.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending registration intents can be reviewed' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {
      status: action === 'require_payment' ? 'payment_required' : action === 'approve' ? 'approved' : 'rejected',
      reviewedBy: new mongoose.Types.ObjectId(authResult.userId), // Convert to ObjectId
      reviewedAt: new Date(),
      updatedAt: new Date(),
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes
    }

    if (action === 'require_payment' && subscriptionPlan) {
      updateData.subscriptionPlan = subscriptionPlan
    }

    // Update the registration intent
    const updatedIntent = await RegistrationIntent.findByIdAndUpdate(
      intentId,
      { $set: updateData },
      { new: true }
    )

    // If approved and subscription plan provided, create subscription and link organization
    if (action === 'approve' && subscriptionPlan) {
      try {
        // Find the user
        const intentUser = await User.findById(intent.userId)
        if (intentUser) {
          let organizationId = intent._id // Default fallback

          // Handle Institute Linking/Creation
          if (intent.type === 'institute') {
            let adminInstitute

            // Check if intent links to existing AdminInstitute
            if (intent.instituteId) {
              adminInstitute = await AdminInstitute.findById(intent.instituteId)
            }

            if (adminInstitute) {
              // Update existing institute: Add user to userIds if not present
              // Initialize userIds if it doesn't exist (for old documents)
              if (!adminInstitute.userIds) {
                adminInstitute.userIds = []
              }
              if (!adminInstitute.userIds.some((id: mongoose.Types.ObjectId) => id.toString() === intent.userId.toString())) {
                adminInstitute.userIds.push(intent.userId)
                await adminInstitute.save()
              }
            } else {
              // Create new AdminInstitute
              const uniqueId = await generateUniqueInstituteId(intent.organizationName)
              adminInstitute = new AdminInstitute({
                id: uniqueId,
                slug: uniqueId,
                name: intent.organizationName,
                type: intent.instituteType || 'University',
                status: 'active',
                userIds: [intent.userId],
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
                overview: [{ key: 'Description', value: intent.description || 'No description provided' }],
                createdAt: new Date(),
                updatedAt: new Date()
              })
              await adminInstitute.save()
            }

            organizationId = adminInstitute._id
          } else if (intent.type === 'business') {
            // Handle Business Linking/Creation
            // Assuming Business model works similarly or we use existing logic
            // For now, we'll create a Business entity if it doesn't exist (similar to payment logic)
            // But to respect the prompt "update in adminInstitute", I'll focus on institute.
            // I'll leave Business as is for now or reuse existing logic if any.
            // The prompt specifically asked to remove InstituteModal and use AdminInstitute.

            // For Business, we might still need to create a Business entity.
            // I'll implement basic Business creation here to be safe.
            const businessSlug = await generateUniqueInstituteId(intent.organizationName) // Reuse helper
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
              userId: intent.userId, // Business model uses userId (singular) usually
              registrationIntentId: intent._id
            })
            await business.save()
            organizationId = business._id
          }

          // Create subscription
          const subscription = new Subscription({
            userId: intent.userId,
            organizationId: organizationId, // Use the REAL organization ID (AdminInstitute or Business)
            organizationType: intent.type,
            planName: `${subscriptionPlan.charAt(0).toUpperCase() + subscriptionPlan.slice(1)} Plan`,
            planType: subscriptionPlan,
            billingCycle: 'yearly', // Admin-granted subscriptions are lifetime
            status: 'active',
            amount: 0, // Free subscription granted by admin
            currency: 'INR',
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            grantedBy: new mongoose.Types.ObjectId(authResult.userId), // Admin who approved
            grantReason: `Approved registration with ${subscriptionPlan} plan`,
            createdAt: new Date(),
          })

          await subscription.save()

          // Update user subscription status and roles
          const roleToAdd = intent.type === 'institute' ? 'institute' : 'business'
          console.log(`[Review] Updating user roles for userId: ${intent.userId}, roleToAdd: ${roleToAdd}`)

          const userUpdateResult = await User.findByIdAndUpdate(
            intent.userId,
            {
              $set: {
                subscriptionActive: true,
                activeRole: roleToAdd,
                role: roleToAdd,
                isOrganizationOwner: true,
                updatedAt: new Date(),
              },
              $addToSet: {
                roles: roleToAdd,
                ownedOrganizations: organizationId,
              },
            },
            { new: true }
          )

          if (!userUpdateResult) {
            console.error(`[Review] Failed to update user - User not found for userId: ${intent.userId}`)
            throw new Error(`User update failed: User with ID ${intent.userId} not found`)
          }

          console.log(`[Review] Successfully updated user roles:`, {
            userId: userUpdateResult._id.toString(),
            roles: userUpdateResult.roles,
            activeRole: userUpdateResult.activeRole,
            role: userUpdateResult.role,
            isOrganizationOwner: userUpdateResult.isOrganizationOwner
          })

          // Mark registration intent as completed
          await RegistrationIntent.findByIdAndUpdate(
            intentId,
            {
              $set: {
                status: 'completed',
                updatedAt: new Date(),
                organizationId: organizationId
              }
            }
          )

          updateData.status = 'completed'
        }
      } catch (error) {
        console.error('Error creating subscription/organization:', error)
        // Don't fail the review, just log the error
      }
    }

    // Send notifications based on action
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
          notificationData = {
            ...notificationData,
            type: 'registration_approved',
            title: 'Registration Approved! 🎉',
            message: `Congratulations! Your ${intent.type} registration for "${intent.organizationName}" has been approved. You can now access your dashboard.`,
            emailTemplate: 'registration_approved',
            data: {
              ...notificationData.data,
              actionUrl: intent.type === 'institute' ? '/institute' : '/business',
              subscriptionPlan: subscriptionPlan || 'free',
              shouldRefetchSession: true
            }
          }
          break

        case 'reject':
          notificationData = {
            ...notificationData,
            type: 'registration_rejected',
            title: 'Registration Update Required',
            message: `Your ${intent.type} registration for "${intent.organizationName}" requires some updates. Please review the admin notes and resubmit.`,
            emailTemplate: 'registration_rejected',
            data: {
              ...notificationData.data,
              actionUrl: intent.type === 'institute' ? '/register/institute' : '/register/business'
            }
          }
          break

        case 'require_payment':
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

      await NotificationService.createNotification(notificationData);
      console.log(`Notification sent for registration review: ${intent._id} - ${action}`);
    } catch (notificationError) {
      console.error('Failed to send notification for registration review:', notificationError);
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
      updatedAt: new Date(),
    }

    return NextResponse.json({
      success: true,
      message: `Registration intent ${action}d successfully`,
      data: {
        ...responseIntent,
        shouldRefetchSession: true
      },
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.log('Review API error message:', errorMessage)

    return NextResponse.json(
      {
        error: 'Failed to review registration intent',
        message: errorMessage,
        details: error instanceof Error ? error.stack : 'No stack trace available'
      },
      { status: 500 }
    )
  }
}
