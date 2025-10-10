import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/unified-auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User } from '@/src/models';

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    
    if (!authResult) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { userId } = authResult;
    
    const { activeRole } = await request.json();
    
    if (!activeRole) {
      return NextResponse.json(
        { success: false, message: 'Active role is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Get user to verify they have this role
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.roles || !user.roles.includes(activeRole)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role selection' },
        { status: 400 }
      );
    }

    // Update user's active role
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        activeRole,
        needsRoleSelection: false,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'Failed to update role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Active role updated successfully',
      activeRole
    });

  } catch (error) {
    console.error('Role selection error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}