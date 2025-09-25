import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/unified-auth';
import User from '@/src/models/User';
import { connectToDatabase } from '@/lib/db/mongodb';
import { z } from 'zod';

// Validation schema
const switchRoleSchema = z.object({
  activeRole: z.string().min(1, 'Active role is required')
});

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Authenticate user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = authResult;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = switchRoleSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { activeRole } = validationResult.data;

    // Find user and check if they have the requested role
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has permission for this role
    if (!user.roles || !user.roles.includes(activeRole)) {
      return NextResponse.json(
        { error: `User does not have access to role: ${activeRole}` },
        { status: 403 }
      );
    }

    // Update user's active role in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        activeRole: activeRole,
        updatedAt: new Date()
      },
      { new: true, select: 'activeRole roles email' }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
    }

    console.log(`User ${userId} switched role to: ${activeRole}`);

    return NextResponse.json({
      success: true,
      message: 'Role switched successfully',
      data: {
        activeRole: updatedUser.activeRole,
        roles: updatedUser.roles
      }
    });

  } catch (error) {
    console.error('Error switching user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
