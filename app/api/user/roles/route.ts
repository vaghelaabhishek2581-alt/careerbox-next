import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/unified-auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User } from '@/src/models';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    
    if (!authResult) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { userId } = authResult;

    await connectToDatabase();
    
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      roles: user.roles || [],
      activeRole: user.activeRole || null,
      needsRoleSelection: user.needsRoleSelection || false
    });

  } catch (error) {
    console.error('Get roles error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}