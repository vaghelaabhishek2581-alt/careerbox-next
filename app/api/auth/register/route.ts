import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase, getUserByEmail, createUser } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: User registration
 *     description: Register new user with role-based access
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['name', 'email', 'password', 'role']
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               role:
 *                 type: string
 *                 enum: [user, business, organization, admin]
 *               userType:
 *                 type: string
 *                 enum: [student, professional]
 *               organizationCode:
 *                 type: string
 *                 description: Required for organization role
 */
export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, userType, organizationCode } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['user', 'business', 'organization', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // For normal users, require userType
    if (role === 'user' && (!userType || !['student', 'professional'].includes(userType))) {
      return NextResponse.json(
        { success: false, message: 'User type (student/professional) is required for normal users' },
        { status: 400 }
      );
    }

    // For organization users, validate organization code
    let organizationId = null;
    if (role === 'organization') {
      if (!organizationCode) {
        return NextResponse.json(
          { success: false, message: 'Organization code is required for organization users' },
          { status: 400 }
        );
      }

      const { db } = await connectToDatabase();
      const organization = await db.collection('organizations').findOne({ code: organizationCode });
      if (!organization) {
        return NextResponse.json(
          { success: false, message: 'Invalid organization code' },
          { status: 400 }
        );
      }
      organizationId = organization._id;
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user data
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      userType: role === 'user' ? userType : undefined,
      organizationId,
      status: role === 'admin' ? 'pending' : 'active', // Admin accounts require approval
      permissions: getDefaultPermissions(role),
      profile: {
        avatar: null,
        bio: '',
        skills: [],
        interests: []
      },
      settings: {
        notifications: {
          email: true,
          push: true,
          marketing: false
        },
        privacy: {
          profileVisible: true,
          showEmail: false
        }
      }
    };

    // Create user
    const result = await createUser(userData);

    // Generate JWT token (except for pending admin accounts)
    if (userData.status === 'pending') {
      return NextResponse.json({
        success: true,
        message: 'Admin account created successfully. Awaiting approval.',
        requiresApproval: true
      });
    }

    const token = jwt.sign(
      { 
        userId: result.insertedId,
        email,
        role,
        userType,
        organizationId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Determine redirect URL
    const redirectUrls = {
      admin: '/dashboard/admin',
      organization: '/dashboard/organization',
      business: '/dashboard/business',
      user: '/dashboard/user'
    };

    const redirectUrl = redirectUrls[role as keyof typeof redirectUrls] || '/dashboard/user';

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: result.insertedId,
        name,
        email,
        role,
        userType,
        organizationId,
        permissions: userData.permissions
      },
      token,
      redirectUrl
    });

  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getDefaultPermissions(role: string): string[] {
  const permissions = {
    user: ['profile:read', 'profile:update', 'courses:access'],
    business: ['dashboard:business', 'employees:manage', 'analytics:view', 'billing:manage'],
    organization: ['dashboard:organization', 'members:manage', 'courses:manage', 'reports:view'],
    admin: ['*'] // Full access
  };

  return permissions[role as keyof typeof permissions] || [];
}