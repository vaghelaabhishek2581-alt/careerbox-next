// import { NextRequest, NextResponse } from 'next/server';
// import { getAuthenticatedUser } from '@/lib/auth/unified-auth';
// import { connectToDatabase } from '@/lib/db/mongodb';
// import Institute from '@/src/models/Institute';
// import { ApiResponse } from '@/lib/types/api.types';

// // Type for lean institute document
// type LeanInstitute = {
//   _id: any;
//   userId: any;
//   registrationIntentId?: any;
//   subscriptionId?: any;
//   name: string;
//   email: string;
//   contactPerson: string;
//   phone: string;
//   address: {
//     street?: string;
//     city: string;
//     state: string;
//     country: string;
//     zipCode?: string;
//   };
//   website?: string;
//   establishmentYear?: number;
//   description?: string;
//   logo?: string;
//   coverImage?: string;
//   accreditation: string[];
//   socialMedia: {
//     linkedin?: string;
//     twitter?: string;
//     facebook?: string;
//     instagram?: string;
//   };
//   studentCount: number;
//   facultyCount: number;
//   courseCount: number;
//   isVerified: boolean;
//   status: 'active' | 'inactive' | 'suspended';
//   createdAt: Date;
//   updatedAt: Date;
// };

// // GET /api/institutes/user - Fetch all institutes belonging to the current user
// export async function GET(req: NextRequest) {
//   try {
//     // Get authenticated user
//     const authResult = await getAuthenticatedUser(req);
//     if (!authResult) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { userId } = authResult;

//     await connectToDatabase();

//     // Find all institutes where the userId matches
//     // Note: A user can have multiple institutes if they have multiple businesses
//     // but typically only one institute for institute role
//     const institutesRaw = await Institute
//       .find({ userId: userId })
//       .select('-__v')
//       .lean()
//       .exec();

//     // Type assertion for lean documents
//     const institutes = institutesRaw as unknown as LeanInstitute[];

//     // Transform the data to include shortcut fields
//     const transformedInstitutes = institutes.map(institute => ({
//       ...institute,
//       _id: institute._id.toString(),
//       userId: institute.userId.toString(),
//       registrationIntentId: institute.registrationIntentId?.toString(),
//       subscriptionId: institute.subscriptionId?.toString(),
//       city: institute.address?.city,
//       state: institute.address?.state,
//     }));

//     const response: ApiResponse<any[]> = {
//       success: true,
//       data: transformedInstitutes,
//       message: `Found ${transformedInstitutes.length} institute(s) for user`
//     };

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error('Error fetching user institutes:', error);
//     return NextResponse.json(
//       { 
//         success: false,
//         error: 'Failed to fetch user institutes',
//         message: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     );
//   }
// }

// // POST /api/institutes/user - Select an institute as the active one
// export async function POST(req: NextRequest) {
//   try {
//     const authResult = await getAuthenticatedUser(req);
//     if (!authResult) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { userId } = authResult;
//     const { instituteId } = await req.json();

//     if (!instituteId) {
//       return NextResponse.json(
//         { error: 'Institute ID is required' },
//         { status: 400 }
//       );
//     }

//     await connectToDatabase();

//     // Verify the institute belongs to the user
//     const instituteRaw = await Institute.findOne({ 
//       _id: instituteId, 
//       userId: userId 
//     }).lean().exec();

//     if (!instituteRaw) {
//       return NextResponse.json(
//         { error: 'Institute not found or does not belong to user' },
//         { status: 404 }
//       );
//     }

//     // Type assertion for lean document
//     const institute = instituteRaw as unknown as LeanInstitute;

//     // Here you could store the selected institute in session or user preferences
//     // For now, we'll just return the selected institute
//     const response: ApiResponse<any> = {
//       success: true,
//       data: {
//         ...institute,
//         _id: institute._id.toString(),
//         userId: institute.userId.toString(),
//         registrationIntentId: institute.registrationIntentId?.toString(),
//         subscriptionId: institute.subscriptionId?.toString(),
//         city: institute.address?.city,
//         state: institute.address?.state,
//       },
//       message: 'Institute selected successfully'
//     };

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error('Error selecting institute:', error);
//     return NextResponse.json(
//       { 
//         success: false,
//         error: 'Failed to select institute',
//         message: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/unified-auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import AdminInstitute, { IAdminInstitute } from '@/src/models/AdminInstitute';
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

    const transformedInstitutes = institutes.map(institute => ({
      ...institute,
      _id: (institute as any)._id.toString(),
      userIds: institute.userIds.map(id => id.toString()),
      city: institute.location?.city,
      state: institute.location?.state,
    }));

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

    const response: ApiResponse<any> = {
      success: true,
      data: {
        ...institute,
        _id: (institute as any)._id.toString(),
        userIds: institute.userIds.map(id => id.toString()),
        city: institute.location?.city,
        state: institute.location?.state,
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