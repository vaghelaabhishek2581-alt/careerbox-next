import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { userId, roles } = await request.json();

    if (!userId || !roles || !Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User ID and roles are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Determine if user needs role selection modal
    const needsRoleSelection = roles.length > 1;
    const activeRole = roles.length === 1 ? roles[0] : null;
    
    // Update user with selected roles
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          roles,
          activeRole,
          needsRoleSelection,
          needsOnboarding: false,
          onboardingCompletedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      needsRoleSelection,
      activeRole
    });

  } catch (error) {
    console.error('Onboarding completion error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}