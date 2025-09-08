import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { generateOTP } from '@/lib/utils';
import { sendOTPEmail } from '@/lib/services/email-service';
import { getServerSession } from 'next-auth';

// POST /api/auth/verify-email
// Request body: { email: string }
// Sends OTP to the specified email
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    
    // Check if email is already verified
    const user = await db.collection('users').findOne({
      email,
      emailVerified: true
    });

    if (user) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await db.collection('verificationCodes').updateOne(
      { email },
      {
        $set: {
          code: otp,
          expiresAt,
          type: 'email_verification'
        }
      },
      { upsert: true }
    );

    // Send OTP email
    await sendOTPEmail(email, otp);

    return NextResponse.json(
      { message: 'Verification code sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to send verification code:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}

// PUT /api/auth/verify-email
// Request body: { email: string, code: string }
// Verifies the email using the provided OTP
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    // Find verification code
    const verificationCode = await db.collection('verificationCodes').findOne({
      email,
      code,
      type: 'email_verification',
      expiresAt: { $gt: new Date() }
    });

    if (!verificationCode) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Mark email as verified
    await db.collection('users').updateOne(
      { email },
      {
        $set: {
          emailVerified: true,
          verifiedAt: new Date()
        }
      }
    );

    // Delete verification code
    await db.collection('verificationCodes').deleteOne({
      email,
      code
    });

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to verify email:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}
