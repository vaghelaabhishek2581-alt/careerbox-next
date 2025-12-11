// lib/types/user.ts
import { z } from 'zod'

// Base enums and types
export type UserRole = 'user' | 'business' | 'organization' | 'admin'
export type UserType = 'student' | 'professional'

// Language level enums - keeping both for compatibility
export type LanguageLevel =
  | 'BASIC'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'FLUENT'
  | 'NATIVE'
export type LanguageLevelDisplay =
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced'
  | 'Native'

// Employment types
export const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FREELANCE', label: 'Freelance' }
] as const

export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' }
] as const

// Personal Details Schema
export const PersonalDetailsSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name too long'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long'),
  dateOfBirth: z.string().optional(),
  gender: z
    .enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'])
    .default('PREFER_NOT_TO_SAY'),
  publicProfileId: z.string().optional(),
  phone: z.string().optional()
})

// Work Experience Schema
export const WorkExperienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Position is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
  location: z.string().optional(),
  employmentType: z
    .enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'])
    .optional()
})

// Education Schema
export const EducationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
  grade: z.string().optional()
})

// Language Proficiency Schema
export const LanguageProficiencySchema = z.object({
  name: z.string().min(1, 'Language name is required'),
  level: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED', 'FLUENT', 'NATIVE'])
})

// Social Links Schema
export const SocialLinksSchema = z
  .object({
    linkedin: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    facebook: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
    portfolio: z.string().url().optional().or(z.literal(''))
  })
  .optional()

// Main User Profile Schema
export const UserProfileSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long')
    .optional(),
  email: z.string().email().optional(),
  bio: z.string().max(500, 'Bio is too long').optional().or(z.literal('')),
  location: z
    .string()
    .max(100, 'Location is too long')
    .optional()
    .or(z.literal('')),
  company: z
    .string()
    .max(100, 'Company name is too long')
    .optional()
    .or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  skills: z
    .array(z.string().min(1).max(50))
    .max(50, 'Maximum 50 skills allowed')
    .optional()
    .default([]),
  languages: z
    .array(LanguageProficiencySchema)
    .max(10, 'Maximum 10 languages allowed')
    .optional()
    .default([]),
  interests: z
    .array(z.string().min(1).max(50))
    .max(20, 'Maximum 20 interests allowed')
    .optional()
    .default([]),
  socialLinks: SocialLinksSchema,
  userType: z.enum(['student', 'professional']).optional(),
  roles: z.array(z.string()).optional().default([]),
  activeRole: z.string().optional(),

  // Extended profile data
  personalDetails: PersonalDetailsSchema.optional(),
  workExperiences: z.array(WorkExperienceSchema).optional().default([]),
  education: z.array(EducationSchema).optional().default([]),

  // Images
  profileImage: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  avatar: z.string().url().optional(), // For backward compatibility

  // System fields
  needsOnboarding: z.boolean().optional().default(false),
  needsRoleSelection: z.boolean().optional().default(false),
  provider: z.string().optional().default('credentials'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
})

// Update schema for PATCH operations
export const UserProfileUpdateSchema = UserProfileSchema.partial()

// Onboarding Schema
export const OnboardingSchema = z.object({
  roles: z.array(z.string()).min(1, 'At least one role is required'),
  activeRole: z.string().min(1, 'Active role is required'),
  userType: z.enum(['student', 'professional']).optional(),
  bio: z.string().max(500, 'Bio is too long').optional(),
  skills: z.array(z.string()).max(50, 'Maximum 50 skills allowed').optional(),
  interests: z
    .array(z.string())
    .max(20, 'Maximum 20 interests allowed')
    .optional(),
  company: z.string().max(100, 'Company name is too long').optional(),
  location: z.string().max(100, 'Location is too long').optional()
})

// Type exports
export type WorkExperience = z.infer<typeof WorkExperienceSchema>
export type Education = z.infer<typeof EducationSchema>
export type LanguageProficiency = z.infer<typeof LanguageProficiencySchema>
export type PersonalDetails = z.infer<typeof PersonalDetailsSchema>
export type UserProfile = z.infer<typeof UserProfileSchema>
export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>
export type OnboardingData = z.infer<typeof OnboardingSchema>

// Database document interface
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
  languages?: LanguageProficiency[]
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

// Public user interface (for API responses)
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
  skills: string[]
  languages: LanguageProficiency[]
  interests: string[]
  socialLinks: Record<string, string>

  // Extended profile fields
  personalDetails?: PersonalDetails
  workExperiences?: WorkExperience[]
  education?: Education[]

  // Images
  profileImage?: string
  coverImage?: string

  // System fields
  organizationId?: string
  permissions: string[]
  needsOnboarding: boolean
  needsRoleSelection: boolean
  provider: string

  // Timestamps
  createdAt?: Date
  updatedAt?: Date
}

// Utility function to convert database document to public user
export function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: user._id?.toString?.() ?? user._id,
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

// Available user roles
export const USER_ROLES = [
  'student',
  'professional',
  'freelancer',
  'entrepreneur',
  'business_owner',
  'recruiter',
  'mentor',
  'investor',
  'job_seeker'
] as const

export const USER_TYPES = ['student', 'professional'] as const

// Common skills by category
export const SKILL_CATEGORIES = {
  Programming: [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'C++',
    'C#',
    'PHP',
    'Ruby',
    'Go',
    'Rust',
    'React',
    'Angular',
    'Vue.js',
    'Node.js',
    'Express.js',
    'Next.js',
    'Laravel',
    'Django',
    'Spring Boot'
  ],
  Design: [
    'UI/UX Design',
    'Graphic Design',
    'Web Design',
    'Mobile Design',
    'Product Design',
    'Figma',
    'Adobe Creative Suite',
    'Sketch',
    'InVision',
    'Canva',
    'Photoshop',
    'Illustrator'
  ],
  Marketing: [
    'Digital Marketing',
    'SEO',
    'SEM',
    'Content Marketing',
    'Social Media Marketing',
    'Email Marketing',
    'Influencer Marketing',
    'Brand Management',
    'Market Research'
  ],
  Business: [
    'Project Management',
    'Business Analysis',
    'Strategy Planning',
    'Leadership',
    'Team Management',
    'Sales',
    'Finance',
    'Operations',
    'Product Management',
    'Business Development'
  ],
  'Data & Analytics': [
    'Data Analysis',
    'Machine Learning',
    'Artificial Intelligence',
    'Data Science',
    'Big Data',
    'SQL',
    'NoSQL',
    'Excel',
    'Tableau',
    'Power BI',
    'Google Analytics',
    'Statistical Analysis'
  ],
  'Cloud & DevOps': [
    'AWS',
    'Azure',
    'Google Cloud',
    'Docker',
    'Kubernetes',
    'CI/CD',
    'DevOps',
    'Infrastructure',
    'Monitoring',
    'Security'
  ]
} as const

// Common degree types
export const DEGREE_TYPES = [
  'High School Diploma',
  'Associate Degree',
  "Bachelor's Degree",
  "Master's Degree",
  'MBA',
  'PhD',
  'Certificate',
  'Diploma',
  'Professional Certification'
] as const

// Activity types
export type ActivityType =
  | 'login'
  | 'logout'
  | 'profile_update'
  | 'role_change'
  | 'content_view'
  | 'content_create'
  | 'content_update'
  | 'content_delete'
  | 'settings_change'
  | 'onboarding_complete'

export interface UserActivity {
  _id?: string
  userId: string
  type: ActivityType
  description: string
  metadata?: Record<string, any>
  timestamp: Date
  ip?: string
  userAgent?: string
  read?: boolean
  notified?: boolean
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  inApp: boolean
  types: {
    [key in ActivityType]?: {
      email: boolean
      push: boolean
      inApp: boolean
    }
  }
}

// NextAuth type extensions
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      roles: string[]
      activeRole: string | null
      userType?: UserType
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
    userType?: UserType
    needsOnboarding?: boolean
    needsRoleSelection?: boolean
    provider?: string
    ownedOrganizations?: string[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    roles?: string[]
    activeRole?: string | null
    userType?: UserType
    needsOnboarding?: boolean
    needsRoleSelection?: boolean
    provider?: string
    ownedOrganizations?: string[]
  }
}
