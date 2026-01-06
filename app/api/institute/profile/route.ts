import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase as dbConnect } from '@/lib/db/mongodb';
import AdminInstitute from '@/src/models/AdminInstitute';
import User from '@/src/models/User';
import { getAuthenticatedUser } from '@/lib/auth/unified-auth';
import { Types } from 'mongoose';

export async function GET(req: NextRequest) {
  const session = await getAuthenticatedUser(req);

  if (!session || !session.user) {

    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id: userId, roles } = session.user;

  if (!roles?.includes('institute') && !roles?.includes('admin')) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  try {
    const user = await User.findById(userId);
    console.log('rfrew', user)
    if (!user || !user.ownedOrganizations || user.ownedOrganizations.length === 0) {
      return NextResponse.json({ message: 'No institute associated with this user' }, { status: 404 });
    }

    const instituteId = user.ownedOrganizations[0];
    const institute = await AdminInstitute.findById(instituteId);

    if (!institute) {
      return NextResponse.json({ message: 'Institute not found' }, { status: 404 });
    }

    return NextResponse.json(institute, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching institute profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}

interface ContactInfo {
  email?: string;
  phone?: string;
  tollFree?: string;
  fax?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  contactPersons?: Array<{
    name: string;
    designation: string;
    email?: string;
    phone?: string;
  }>;
}

interface LocationInfo {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  nearbyLandmarks?: string[];
}

interface AccreditationInfo {
  naac?: {
    grade?: string;
    category?: string;
    cgpa?: number;
    validUntil?: string;
    cycleNumber?: number;
  };
  nirf?: any;
  ugc?: {
    recognition?: string;
  };
  [key: string]: any;
}

interface UpdateInstituteProfileData {
  // Basic Information
  name?: string;
  shortName?: string;
  slug?: string;
  establishedYear?: number;
  type?: string;
  status?: string;
  logo?: string;
  coverImage?: string;
  website?: string;

  // Contact Information
  contact?: ContactInfo;

  // Location Information
  location?: LocationInfo;

  // Accreditation
  accreditation?: AccreditationInfo;

  // Overview
  overview?: Array<{ key: string; value: string }>;

  // Campus Details
  campusDetails?: {
    area?: string;
    builtUpArea?: string;
    campusType?: string;
    campusFacilities?: string[];
    hostels?: {
      available?: boolean;
      capacity?: number;
      description?: string;
    };
    library?: {
      available?: boolean;
      description?: string;
      digitalResources?: boolean;
    };
    sports?: {
      available?: boolean;
      facilities?: string[];
    };
  };

  // Admissions
  admissions?: {
    admissionProcess?: string;
    importantDates?: Array<{
      event: string;
      date: string;
    }>;
    eligibilityCriteria?: string;
    selectionProcess?: string;
    reservationPolicy?: Record<string, string>;
    documentsRequired?: string[];
  };

  // Placements
  placements?: {
    averagePackage?: number;
    highestPackage?: number;
    placementRate?: number;
    topRecruiters?: string[];
    placementStatistics?: Array<{
      year: number;
      averagePackage: number;
      highestPackage: number;
      placementRate: number;
    }>;
  };

  // Media Gallery
  mediaGallery?: {
    images?: string[];
    videos?: string[];
    virtualTour?: string;
  };

  // Additional Fields
  description?: string;
  awards?: string[];
  rankings?: any;
  researchAndInnovation?: any;
  alumniNetwork?: any;
  academics?: any;
  faculty_student_ratio?: any;
}

export async function PATCH(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getAuthenticatedUser(req);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id: userId, roles } = session.user;

    // Check user role
    if (!roles?.includes('institute') && !roles?.includes('admin')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    // Get user and their associated institute
    const user = await User.findById(userId);
    if (!user?.ownedOrganizations?.length) {
      return NextResponse.json({ message: 'No institute associated with this user' }, { status: 404 });
    }

    const instituteId = new Types.ObjectId(user.ownedOrganizations[0].toString());
    const updateData: UpdateInstituteProfileData = await req.json();

    // Basic validation
    if (!updateData || Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No data provided for update' }, { status: 400 });
    }

    // Additional validation can be added here based on requirements
    if (updateData.contact?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.contact.email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
    }

    // Prepare update object with all valid fields from the request
    const updates: Record<string, any> = {};

    // Helper function to safely add fields to updates
    const addToUpdates = (field: string, value: any) => {
      if (value !== undefined) {
        updates[field] = value;
      }
    };

    // Basic fields
    const {
      name, shortName, slug, establishedYear, type, status,
      logo, coverImage, website, description, awards,
      contact, location, accreditation, overview, campusDetails,
      academics, admissions, placements, mediaGallery, rankings,
      researchAndInnovation, alumniNetwork, faculty_student_ratio
    } = updateData;

    // Add direct fields
    addToUpdates('name', name);
    addToUpdates('shortName', shortName);
    addToUpdates('slug', slug);
    addToUpdates('establishedYear', establishedYear);
    addToUpdates('type', type);
    addToUpdates('status', status);
    addToUpdates('logo', logo);
    addToUpdates('coverImage', coverImage);
    addToUpdates('website', website);
    addToUpdates('description', description);

    // Add nested objects if they exist
    if (contact) addToUpdates('contact', contact);
    if (location) addToUpdates('location', location);
    if (accreditation) addToUpdates('accreditation', accreditation);
    if (overview) addToUpdates('overview', overview);
    if (campusDetails) addToUpdates('campusDetails', campusDetails);
    if (academics) addToUpdates('academics', academics);
    if (admissions) addToUpdates('admissions', admissions);
    if (placements) addToUpdates('placements', placements);
    if (mediaGallery) addToUpdates('mediaGallery', mediaGallery);
    if (awards) addToUpdates('awards', awards);
    if (rankings) addToUpdates('rankings', rankings);
    if (researchAndInnovation) addToUpdates('researchAndInnovation', researchAndInnovation);
    if (alumniNetwork) addToUpdates('alumniNetwork', alumniNetwork);
    if (faculty_student_ratio) addToUpdates('faculty_student_ratio', faculty_student_ratio);

    // Add updatedAt timestamp
    updates.updatedAt = new Date();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: 'No valid fields to update' }, { status: 400 });
    }

    // Update the institute profile
    let updatedInstitute;

    try {
      updatedInstitute = await AdminInstitute.findByIdAndUpdate(
        instituteId,
        { $set: updates },
        { new: true, runValidators: true }
      );
    } catch (error) {
      console.error('Database update error:', error);
      throw error; // This will be caught by the outer try-catch
    }

    if (!updatedInstitute) {
      return NextResponse.json({ message: 'Failed to update institute profile' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      data: updatedInstitute
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error updating institute profile:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if ('name' in error && error.name === 'ValidationError' && 'errors' in error) {
        const validationError = error as { errors: Record<string, { message: string }> };
        const errors = Object.values(validationError.errors).map(err => err.message);
        return NextResponse.json({
          message: 'Validation failed',
          errors
        }, { status: 400 });
      }

      return NextResponse.json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Internal Server Error',
      error: 'An unknown error occurred'
    }, { status: 500 });
  }
}
