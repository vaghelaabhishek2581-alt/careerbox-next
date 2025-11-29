// lib/types/user.ts
export type UserRole = 'user' | 'business' | 'organization' | 'admin'
export type UserType = 'student' | 'professional' | undefined

export interface UserDocument {
  _id: any
  name: string
  email: string
  password?: string | null
  role: UserRole
  roles?: string[]
  activeRole?: string | null
  userType?: UserType
  organizationId?: any
  avatar?: string | null
  bio?: string
  location?: string
  company?: string
  website?: string
  skills?: string[]
  languages?: Array<{
    name: string
    level: string
  }>
  interests?: string[]
  socialLinks?: Record<string, string>
  permissions?: string[]
  needsOnboarding?: boolean
  needsRoleSelection?: boolean
  provider?: string
  profileImage?: string
  coverImage?: string
  createdAt?: Date
  updatedAt?: Date
  onboardingCompletedAt?: Date
}

export interface PublicUser {
  id: string
  name: string
  email: string
  role: UserRole
  roles: string[]
  activeRole: string | null
  userType?: UserType
  avatar?: string | null
  bio?: string
  location?: string
  company?: string
  website?: string
  skills?: string[]
  languages?: Array<{
    name: string
    level: string
  }>
  interests?: string[]
  socialLinks?: Record<string, string>
  organizationId?: string
  permissions: string[]
  needsOnboarding: boolean
  needsRoleSelection: boolean
  provider?: string
  profileImage?: string
  coverImage?: string
}

export function toPublicUser (user: UserDocument): PublicUser {
  return {
    id: user._id?.toString?.() ?? user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    roles: user.roles || [user.role],
    activeRole: user.activeRole || user.role || null,
    userType: user.userType,
    avatar: user.avatar,
    bio: user.bio,
    location: user.location,
    company: user.company,
    website: user.website,
    skills: user.skills || [],
    languages: user.languages || [],
    interests: user.interests || [],
    socialLinks: user.socialLinks || {},
    organizationId: user.organizationId?.toString?.(),
    permissions: user.permissions || [],
    needsOnboarding: user.needsOnboarding ?? false,
    needsRoleSelection: user.needsRoleSelection ?? false,
    provider: user.provider || 'credentials',
    profileImage: user.profileImage,
    coverImage: user.coverImage
  }
}

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      roles: string[]
      activeRole: string | null
      needsOnboarding: boolean
      needsRoleSelection: boolean
      provider: string
      ownedOrganizations?: string[]
    }
  }

  interface User {
    id: string
    email: string
    name: string
    roles?: string[]
    activeRole?: string | null
    needsOnboarding?: boolean
    needsRoleSelection?: boolean
    ownedOrganizations?: string[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    roles?: string[]
    activeRole?: string | null
    needsOnboarding?: boolean
    needsRoleSelection?: boolean
    provider?: string
    ownedOrganizations?: string[]
  }
}
