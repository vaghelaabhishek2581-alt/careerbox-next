
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/unified-auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import AdminInstitute, { IAdminInstitute } from '@/src/models/AdminInstitute';
import Subscription from '@/src/models/Subscription';
import { ApiResponse } from '@/lib/types/api.types';


// GET /api/institutes/user - Fetch all institutes belonging to the current user
export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const authResult = await getAuthenticatedUser(req);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = authResult;

    await connectToDatabase();

    // Find all institutes where the userId matches
    const institutesRaw = await AdminInstitute
      .find({ userIds: userId })
      .select('-__v')
      .lean()
      .exec();

    const institutes = institutesRaw as unknown as IAdminInstitute[];

    // Fetch subscriptions for all institutes
    const instituteIds = institutes.map(inst => (inst as any)._id);
    const subscriptions = await Subscription
      .find({ organizationId: { $in: instituteIds }, organizationType: 'institute' })
      .lean()
      .exec();

    // Create a map of subscriptions by organizationId
    const subscriptionMap = new Map();
    subscriptions.forEach(sub => {
      subscriptionMap.set(sub.organizationId.toString(), sub);
    });

    const transformedInstitutes = institutes.map(institute => {
      const instituteId = (institute as any)._id.toString();
      const subscription = subscriptionMap.get(instituteId);
      
      return {
        ...institute,
        _id: instituteId,
        userIds: institute.userIds.map(id => id.toString()),
        city: institute.location?.city,
        state: institute.location?.state,
        // Add explicit verification status based on active status
        isVerified: institute.status === 'active' || institute.status === 'Active',
        // Add subscription data
        subscription: subscription ? {
          _id: subscription._id.toString(),
          status: subscription.status,
          isActive: subscription.isActive,
          planType: subscription.planType,
          planName: subscription.planName,
          features: subscription.features,
          endDate: subscription.endDate,
          grantReason: subscription.grantReason,
        } : null,
        subscriptionId: subscription?._id.toString() || null,
      };
    });

    const response: ApiResponse<any[]> = {
      success: true,
      data: transformedInstitutes,
      message: `Found ${transformedInstitutes.length} institute(s) for user`
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user institutes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user institutes',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/institutes/user - Select an institute as the active one
export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = authResult;
    const { instituteId } = await req.json();

    if (!instituteId) {
      return NextResponse.json(
        { error: 'Institute ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const instituteRaw = await AdminInstitute.findOne({
      _id: instituteId,
      userIds: userId
    }).lean().exec();

    if (!instituteRaw) {
      return NextResponse.json(
        { error: 'Institute not found or does not belong to user' },
        { status: 404 }
      );
    }

    const institute = instituteRaw as unknown as IAdminInstitute;

    // Fetch subscription for this institute
    const subscription = await Subscription
      .findOne({ organizationId: instituteId, organizationType: 'institute' })
      .lean()
      .exec();

    const response: ApiResponse<any> = {
      success: true,
      data: {
        ...institute,
        _id: (institute as any)._id.toString(),
        userIds: institute.userIds.map(id => id.toString()),
        city: institute.location?.city,
        state: institute.location?.state,
        subscription: subscription ? {
          _id: subscription._id.toString(),
          status: subscription.status,
          isActive: subscription.isActive,
          planType: subscription.planType,
          planName: subscription.planName,
          features: subscription.features,
          endDate: subscription.endDate,
          grantReason: subscription.grantReason,
        } : null,
        subscriptionId: subscription?._id.toString() || null,
      },
      message: 'Institute selected successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error selecting institute:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to select institute',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}