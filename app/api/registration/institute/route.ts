import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import RegistrationIntent from '@/src/models/RegistrationIntent'
import User from '@/src/models/User'
import { connectToDatabase } from '@/lib/db/mongoose'
import { sendInstituteRegistrationConfirmation } from '@/lib/services/email-service'
import { z } from 'zod'

// Validation schema for institute registration
const instituteRegistrationSchema = z.object({
  // Basic Information
  email: z.string().email('Invalid email address').optional(),
  organizationName: z.string().min(1, 'Organization name is required'),
  instituteType: z.string().min(1, 'Institute type is required'),
  instituteCategory: z.string().min(1, 'Institute category is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  contactPhone: z.string().min(1, 'Contact phone is required'),
  establishmentYear: z.union([z.number(), z.string()]).transform(val => {
    if (typeof val === 'string') {
      if (val === '' || val.trim() === '') return undefined
      const num = parseInt(val, 10)
      return isNaN(num) ? undefined : num
    }
    return val
  }).optional(),

  // Address
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  zipCode: z.string().optional().or(z.literal('')).transform(val => val || undefined),

  // Additional Information
  description: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  website: z.string().url().optional().or(z.literal('')),

  // Agreements
  agreeTerms: z.union([z.boolean(), z.string()]).transform(val => val === true || val === 'true').refine(val => val === true, 'You must agree to terms and conditions'),
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

    // Parse and validate request body
    const body = await request.json()
    const validatedData = instituteRegistrationSchema.parse(body)

    // Check if user already has a pending or approved institute registration
    const existingIntent = await RegistrationIntent.findOne({
      userId,
      type: 'institute',
      status: { $in: ['pending', 'approved', 'completed'] }
    })

    if (existingIntent) {
      return NextResponse.json(
        {
          success: false,
          message: 'You already have an active institute registration application'
        },
        { status: 400 }
      )
    }

    // Create new registration intent
    const registrationIntent = new RegistrationIntent({
      userId,
      type: 'institute',
      status: 'pending',

      // Basic Information
      organizationName: validatedData.organizationName,
      email: validatedData.email || user?.email,
      contactName: validatedData.contactName,
      contactPhone: validatedData.contactPhone,

      // Institute specific fields
      instituteType: validatedData.instituteType,
      instituteCategory: validatedData.instituteCategory,
      establishmentYear: validatedData.establishmentYear,

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
        await sendInstituteRegistrationConfirmation(
          userEmail,
          validatedData.organizationName,
          validatedData.contactName,
          registrationIntent._id.toString()
        );
        console.log('Institute registration confirmation email sent to:', userEmail);
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the registration if email fails
    }

    // TODO: Send notification email to admin

    return NextResponse.json({
      success: true,
      message: 'Institute registration submitted successfully',
      data: {
        id: registrationIntent._id,
        status: registrationIntent.status,
        organizationName: registrationIntent.organizationName,
        type: registrationIntent.type,
        createdAt: registrationIntent.createdAt,
      }
    })

  } catch (error) {
    console.error('Institute registration error:', error)

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
