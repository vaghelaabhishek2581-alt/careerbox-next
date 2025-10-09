import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import mongoose from 'mongoose'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import RegistrationIntent from '@/src/models/RegistrationIntent'
import User from '@/src/models/User'
import Subscription from '@/src/models/Subscription'
import NotificationService from '@/lib/services/notificationService'

// Validation schema
const reviewSchema = z.object({
  action: z.enum(['approve', 'reject', 'require_payment']),
  adminNotes: z.string().optional(),
  subscriptionPlan: z.enum(['free', 'basic', 'premium', 'enterprise']).optional(),
})

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

    // If approved and subscription plan provided, create subscription
    if (action === 'approve' && subscriptionPlan) {
      try {
        // Find the user
        const intentUser = await User.findById(intent.userId)
        if (intentUser) {
          // Create subscription
          const subscription = new Subscription({
            userId: intent.userId,
            organizationId: intent._id, // Use registration intent ID as organization ID
            organizationType: intent.type,
            planName: `${subscriptionPlan.charAt(0).toUpperCase() + subscriptionPlan.slice(1)} Plan`,
            planType: subscriptionPlan,
            status: 'active',
            amount: 0, // Free subscription granted by admin
            currency: 'INR',
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            grantedBy: user.email,
            grantReason: `Approved registration with ${subscriptionPlan} plan`,
            createdAt: new Date(),
          })

          await subscription.save()

          // Update user subscription status and roles
          const roleToAdd = intent.type === 'institute' ? 'institute' : 'business'
          await User.findByIdAndUpdate(
            intent.userId,
            {
              $set: {
                subscriptionActive: true,
                activeRole: roleToAdd,
                updatedAt: new Date(),
              },
              $addToSet: {
                roles: roleToAdd,
              },
            }
          )

          // Mark registration intent as completed
          await RegistrationIntent.findByIdAndUpdate(
            intentId,
            { $set: { status: 'completed', updatedAt: new Date() } }
          )

          updateData.status = 'completed'
        }
      } catch (error) {
        console.error('Error creating subscription:', error)
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
              actionUrl: intent.type === 'institute' ? '/dashboard/institute' : '/dashboard/business',
              subscriptionPlan: subscriptionPlan || 'free'
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
              actionUrl: `/dashboard/user/payment/${intentId}`,
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
      data: responseIntent,
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
