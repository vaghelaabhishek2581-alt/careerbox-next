export type UserRole = 'user' | 'business' | 'organization' | 'admin'
export type UserType = 'student' | 'professional' | undefined

import { PersonalDetails, WorkExperience, Education, Skill, Language } from '@/lib/types/profile.unified'

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
  skills?: Skill[]
  languages?: Language[]
  interests?: string[]
  socialLinks?: Record<string, string>
  permissions?: string[]
  needsOnboarding?: boolean
  needsRoleSelection?: boolean
  provider?: string
  profileImage?: string
  coverImage?: string

  // Extended profile data
  personalDetails?: PersonalDetails
  workExperiences?: WorkExperience[]
  education?: Education[]

  // Timestamps
  createdAt?: Date
  updatedAt?: Date
  onboardingCompletedAt?: Date
}

export function toPublicUser (user: UserDocument): Omit<UserDocument, 'password'> {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    roles: user.roles || [user.role],
    activeRole: user.activeRole || user.role || null,
    userType: user.userType,
    avatar: user.avatar,
    bio: user.bio || '',
    location: user.location || '',
    company: user.company || '',
    website: user.website || '',
    skills: user.skills || [],
    languages: user.languages || [],
    interests: user.interests || [],
    socialLinks: user.socialLinks || {},
    personalDetails: user.personalDetails,
    workExperiences: user.workExperiences || [],
    education: user.education || [],
    profileImage: user.profileImage,
    coverImage: user.coverImage,
    organizationId: user.organizationId?.toString?.(),
    permissions: user.permissions || [],
    needsOnboarding: user.needsOnboarding ?? false,
    needsRoleSelection: user.needsRoleSelection ?? false,
    provider: user.provider || 'credentials',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }
}
