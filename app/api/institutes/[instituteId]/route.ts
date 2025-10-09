import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/unified-auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { ApiResponse } from '@/lib/types/api.types';
import Institute, { IInstitute } from '@/src/models/Institute';


// GET /api/institutes/[instituteId] - Fetch a specific institute by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ instituteId: string }> }) {
  try {
    const authResult = await getAuthenticatedUser(req);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = authResult;
    const { instituteId } = await params;

    if (!instituteId) {
      return NextResponse.json(
        { error: 'Institute ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the institute and verify it belongs to the user
    const instituteRaw = await Institute
      .findOne({
        _id: instituteId,
        userId: userId  // Ensure user owns this institute
      })
      .select('-__v')
      .lean()
      .exec();

    if (!instituteRaw) {
      return NextResponse.json(
        { error: 'Institute not found or access denied' },
        { status: 404 }
      );
    }

    // Type assertion for lean document
    const institute = instituteRaw as unknown as IInstitute;

    // Transform the data
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
      data: transformedInstitute
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

// PATCH /api/institutes/[instituteId] - Update institute data
export async function PATCH(
  req: NextRequest,
  { params }: { params: { instituteId: string } }
) {
  try {
    const authResult = await getAuthenticatedUser(req);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = authResult;
    const { instituteId } = params;
    const updateData = await req.json();

    await connectToDatabase();

    // Verify ownership
    const institute = await Institute.findOne({
      _id: instituteId,
      userId: userId
    });

    if (!institute) {
      return NextResponse.json(
        { error: 'Institute not found or access denied' },
        { status: 404 }
      );
    }

    // Update the institute
    Object.assign(institute, updateData);
    await institute.save();

    const response: ApiResponse<any> = {
      success: true,
      data: {
        ...institute.toObject(),
        _id: institute._id.toString(),
        userId: institute.userId.toString(),
        registrationIntentId: institute.registrationIntentId?.toString(),
        subscriptionId: institute.subscriptionId?.toString(),
        city: institute.address?.city,
        state: institute.address?.state,
      },
      message: 'Institute updated successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating institute:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update institute',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
