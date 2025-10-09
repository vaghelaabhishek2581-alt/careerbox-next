import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, hasRole } from '@/lib/auth/unified-auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import Institute, { IInstitute } from '@/src/models/Institute';
import { ApiResponse } from '@/lib/types/api.types';

// GET /api/institutes/[instituteId]/active - Get specific institute by ID with authorization
export async function GET(req: NextRequest, { params }: { params: { instituteId: string } }) {
  try {
    // Get authenticated user
    const authResult = await getAuthenticatedUser(req);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, user } = authResult;
    const { instituteId } = params;

    if (!instituteId) {
      return NextResponse.json({ error: 'Institute ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Find the institute by ID
    const instituteRaw = await Institute
      .findById(instituteId)
      .select('-__v')
      .lean()
      .exec();

    if (!instituteRaw) {
      return NextResponse.json(
        {
          success: false,
          error: 'Institute not found'
        },
        { status: 404 }
      );
    }

    // Type assertion for lean document
    const institute = instituteRaw as unknown as IInstitute;

    // Authorization: Only admin or institute owner can access
    const isAdmin = hasRole(user, 'admin');
    const isOwner = institute.userId.toString() === userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied. Only admins and institute owners can access this resource.'
        },
        { status: 403 }
      );
    }

    // Transform the data to include shortcut fields
    const transformedInstitute = {
      ...institute,
      _id: institute._id.toString(),
      userId: institute.userId.toString(),
      registrationIntentId: institute.registrationIntentId?.toString(),
      subscriptionId: institute.subscriptionId?.toString(),
      city: institute.address?.city,
      state: institute.address?.state,
    };

    const response: ApiResponse<any> = {
      success: true,
      data: transformedInstitute,
      message: 'Institute retrieved successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching institute:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch institute',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
