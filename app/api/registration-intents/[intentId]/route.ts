import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/unified-auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import RegistrationIntent, { IRegistrationIntent } from '@/src/models/RegistrationIntent';

// Type for lean document to fix Mongoose typing issues
type LeanRegistrationIntent = {
  _id: any;
  userId: any;
  type: string;
  status: string;
  organizationName: string;
  contactName: string;
  email: string;
  contactPhone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  description?: string;
  website?: string;
  establishmentYear?: number;
  adminNotes?: string;
  subscriptionPlan?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ intentId: string }> }
) {
  try {
    // Authentication check
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = authResult;
    await connectToDatabase();

    // Await params before using
    const { intentId } = await params;

    // Find the registration intent
    const registrationIntent = await RegistrationIntent.findOne({
      _id: intentId,
      userId: userId // Ensure user can only access their own registration intents
    }).lean().exec();

    if (!registrationIntent) {
      return NextResponse.json(
        { error: 'Registration intent not found or access denied' },
        { status: 404 }
      );
    }

    // Transform for response - Type assertion to ensure we have the correct type
    const intent = registrationIntent as unknown as LeanRegistrationIntent;
    const responseData = {
      id: intent._id.toString(),
      userId: intent.userId.toString(),
      type: intent.type,
      status: intent.status,
      organizationName: intent.organizationName,
      contactName: intent.contactName,
      email: intent.email,
      contactPhone: intent.contactPhone,
      address: intent.address,
      city: intent.city,
      state: intent.state,
      country: intent.country,
      zipCode: intent.zipCode,
      description: intent.description,
      website: intent.website,
      establishmentYear: intent.establishmentYear,
      adminNotes: intent.adminNotes,
      subscriptionPlan: intent.subscriptionPlan,
      reviewedAt: intent.reviewedAt,
      createdAt: intent.createdAt,
      updatedAt: intent.updatedAt
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching registration intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
