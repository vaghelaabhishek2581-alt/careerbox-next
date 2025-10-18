import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import RegistrationIntent from '@/src/models/RegistrationIntent'
import { connectToDatabase } from '@/lib/db/mongoose'
import { sendBusinessRegistrationConfirmation } from '@/lib/services/email-service'
import NotificationService from '@/lib/services/notificationService'
import { z } from 'zod'

// Validation schema for business registration
const businessRegistrationSchema = z.object({
  // Basic Information
  organizationName: z.string().min(1, 'Business name is required'),
  email: z.string().email('Invalid email address').optional(),
  businessCategory: z.string().min(1, 'Business category is required'),
  organizationSize: z.string().min(1, 'Organization size is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  contactPhone: z.string().min(1, 'Contact phone is required'),
  website: z.string().url().optional().or(z.literal('')),
  
  // Address
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  zipCode: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  
  // Additional Information
  description: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  
  // Agreements
  agreeTerms: z.union([z.boolean(), z.string()]).transform(val => val === true || val === 'true'),
  subscribeNewsletter: z.union([z.boolean(), z.string()]).transform(val => val === true || val === 'true').optional(),
  contactViaEmail: z.union([z.boolean(), z.string()]).transform(val => val === true || val === 'true').optional(),
  contactViaPhone: z.union([z.boolean(), z.string()]).transform(val => val === true || val === 'true').optional(),
})

export async function POST(request: NextRequest) {
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

    const { userId, user } = authResult

    // Parse FormData for file uploads
    const formData = await request.formData()
    const data: any = {}
    
    // Extract form fields
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        // Handle file uploads (logo, cover image)
        // TODO: Implement file upload to cloud storage
        data[key] = value.name // Store filename for now
      } else {
        data[key] = value
      }
    }

    // Validate data
    const validatedData = businessRegistrationSchema.parse(data)

    // Check if user already has a pending or approved business registration
    const existingIntent = await RegistrationIntent.findOne({
      userId,
      type: 'business',
      status: { $in: ['pending', 'approved', 'completed'] }
    })

    if (existingIntent) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'You already have an active business registration application' 
        },
        { status: 400 }
      )
    }

    // Create new registration intent
    const registrationIntent = new RegistrationIntent({
      userId,
      type: 'business',
      status: 'pending',
      
      // Basic Information
      organizationName: validatedData.organizationName,
      email: validatedData.email || user?.email,
      contactName: validatedData.contactName,
      contactPhone: validatedData.contactPhone,
      
      // Business specific fields
      businessCategory: validatedData.businessCategory,
      organizationSize: validatedData.organizationSize,
      
      // Address
      address: validatedData.address,
      city: validatedData.city,
      state: validatedData.state,
      country: validatedData.country,
      zipCode: validatedData.zipCode,
      
      // Additional Information
      description: validatedData.description,
      website: validatedData.website || undefined,
    })

    await registrationIntent.save()

    // Send confirmation email to user
    try {
      const userEmail = validatedData.email || user?.email;
      if (userEmail) {
        await sendBusinessRegistrationConfirmation(
          userEmail,
          validatedData.organizationName,
          validatedData.contactName,
          registrationIntent._id.toString()
        );
        console.log('Business registration confirmation email sent to:', validatedData.email || user?.email);
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the registration if email fails
    }

    // Send notifications
    try {
      // Send notification to user
      await NotificationService.createNotification({
        userId: userId,
        type: 'registration_submitted',
        title: 'Registration Request Submitted',
        message: `Your business registration request for "${validatedData.organizationName}" has been submitted and is under review.`,
        data: {
          registrationIntentId: registrationIntent._id.toString(),
          actionUrl: '/notifications',
          metadata: {
            organizationName: validatedData.organizationName,
            type: 'business'
          }
        },
        priority: 'medium',
        sendEmail: true,
        sendSocket: true,
        emailTemplate: 'registration_submitted',
        emailVariables: {
          contactName: validatedData.contactName,
          organizationName: validatedData.organizationName,
          type: 'business',
          email: validatedData.email || user?.email,
          contactPhone: validatedData.contactPhone,
          city: validatedData.city,
          state: validatedData.state,
          country: validatedData.country,
          description: validatedData.description
        }
      });

      // Send notification to admins
      await NotificationService.sendAdminNotification({
        type: 'registration_submitted',
        title: 'New Business Registration Request',
        message: `New business registration request from ${validatedData.contactName} for "${validatedData.organizationName}" requires review.`,
        data: {
          registrationIntentId: registrationIntent._id.toString(),
          actionUrl: '/admin/registrations',
          metadata: {
            organizationName: validatedData.organizationName,
            contactName: validatedData.contactName,
            type: 'business'
          }
        },
        priority: 'high',
        sendEmail: true,
        sendSocket: true,
        emailTemplate: 'admin_notification',
        emailVariables: {
          organizationName: validatedData.organizationName,
          type: 'business',
          contactName: validatedData.contactName,
          email: validatedData.email || user?.email,
          contactPhone: validatedData.contactPhone,
          city: validatedData.city,
          state: validatedData.state,
          country: validatedData.country,
          description: validatedData.description
        }
      });

      console.log('Notifications sent for business registration:', registrationIntent._id);
    } catch (notificationError) {
      console.error('Failed to send notifications:', notificationError);
      // Don't fail the registration if notifications fail
    }

    return NextResponse.json({
      success: true,
      message: 'Business registration submitted successfully',
      data: {
        id: registrationIntent._id,
        status: registrationIntent.status,
        organizationName: registrationIntent.organizationName,
        type: registrationIntent.type,
        createdAt: registrationIntent.createdAt,
      }
    })

  } catch (error) {
    console.error('Business registration error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation error',
          errors: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
