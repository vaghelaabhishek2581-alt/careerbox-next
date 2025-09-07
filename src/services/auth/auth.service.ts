import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { authConfig } from '@/src/config/auth.config'
import { getUserByEmail, createUser, connectToDatabase } from '@/lib/db'
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError
} from '@/src/utils/types/errors'
import { LoginInput, RegisterInput } from '@/src/utils/validators/auth.schema'
import { toPublicUser } from '@/src/models/user.model'

export class AuthService {
  static async login (input: LoginInput) {
    const { email, password, userType, provider } = input

    const user = await getUserByEmail(email)
    if (!user) {
      throw new UnauthorizedError('Invalid credentials')
    }

    if ((provider ?? 'credentials') === 'credentials') {
      if (!password)
        throw new BadRequestError('Email and password are required')
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) throw new UnauthorizedError('Invalid credentials')
    }

    if (
      user.role === 'user' &&
      userType &&
      ['student', 'professional'].includes(userType)
    ) {
      const { db } = await connectToDatabase()
      await db
        .collection('users')
        .updateOne(
          { _id: user._id },
          { $set: { userType, lastLogin: new Date() } }
        )
      ;(user as any).userType = userType
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        userType: (user as any).userType,
        organizationId: (user as any).organizationId
      },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn }
    )

    const redirectUrls = {
      admin: '/dashboard/admin',
      organization: '/dashboard/organization',
      business: '/dashboard/business',
      user: '/dashboard/user'
    } as const

    const redirectUrl = (redirectUrls as any)[user.role] || '/dashboard/user'

    const { db } = await connectToDatabase()
    await db
      .collection('users')
      .updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } })

    return {
      user: toPublicUser(user as any),
      token,
      redirectUrl
    }
  }

  static async register (input: RegisterInput) {
    const {
      name,
      email,
      password,
      role,
      userType,
      organizationCode,
      provider = 'credentials',
      image
    } = input

    const validRoles = ['user', 'business', 'organization', 'admin'] as const
    if (!validRoles.includes(role as any)) {
      throw new BadRequestError('Invalid role specified')
    }

    let finalUserType = userType
    if (role === 'user') {
      if (!userType) {
        if (provider === 'google') finalUserType = 'student'
        else
          throw new BadRequestError(
            'User type (student/professional) is required for normal users'
          )
      } else if (!['student', 'professional'].includes(userType)) {
        throw new BadRequestError(
          'Invalid user type. Must be student or professional'
        )
      }
    }

    let organizationId: any = null
    if (role === 'organization') {
      if (!organizationCode)
        throw new BadRequestError(
          'Organization code is required for organization users'
        )
      const { db } = await connectToDatabase()
      const organization = await db
        .collection('organizations')
        .findOne({ code: organizationCode })
      if (!organization) throw new BadRequestError('Invalid organization code')
      organizationId = organization._id
    }

    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      throw new ConflictError('User already exists with this email')
    }

    let hashedPassword: string | null = null
    if (provider === 'credentials' && password) {
      hashedPassword = await bcrypt.hash(password, 12)
    }

    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      provider,
      role,
      userType: role === 'user' ? finalUserType : null,
      organizationId,
      status: role === 'admin' ? 'pending' : 'active',
      permissions: getDefaultPermissions(role),
      profile: {
        avatar: image || null,
        bio: '',
        skills: [],
        interests: []
      },
      settings: {
        notifications: { email: true, push: true, marketing: false },
        privacy: { profileVisible: true, showEmail: false }
      },
      needsOnboarding:
        provider === 'google' || (role === 'user' && !finalUserType),
      needsRoleSelection: false,
      roles: [role],
      activeRole: role,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await createUser(userData as any)

    if ((userData as any).status === 'pending') {
      return { requiresApproval: true }
    }

    const token = jwt.sign(
      {
        userId: result.insertedId,
        email,
        role,
        userType: finalUserType,
        organizationId,
        provider
      },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn }
    )

    const redirectUrls = {
      admin: '/dashboard/admin',
      organization: '/dashboard/organization',
      business: '/dashboard/business',
      user: '/dashboard/user'
    } as const

    const redirectUrl = (redirectUrls as any)[role] || '/dashboard/user'

    const userResponse = {
      id: result.insertedId.toString(),
      name,
      email,
      role,
      userType: finalUserType,
      organizationId,
      permissions: (userData as any).permissions,
      provider,
      needsOnboarding: (userData as any).needsOnboarding,
      needsRoleSelection: (userData as any).needsRoleSelection,
      roles: (userData as any).roles,
      activeRole: (userData as any).activeRole
    }

    return {
      user: userResponse,
      token,
      redirectUrl
    }
  }
}

function getDefaultPermissions (role: string): string[] {
  const permissions = {
    user: ['profile:read', 'profile:update', 'courses:access'],
    business: [
      'dashboard:business',
      'employees:manage',
      'analytics:view',
      'billing:manage'
    ],
    organization: [
      'dashboard:organization',
      'members:manage',
      'courses:manage',
      'reports:view'
    ],
    admin: ['*']
  } as const
  return (permissions as any)[role] || []
}
