import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { activeRole } = await request.json();

    if (!activeRole) {
      return NextResponse.json(
        { success: false, message: 'Active role is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Get user to verify they have this role
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(session.user.id) 
    });

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
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          activeRole,
          needsRoleSelection: false,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
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