// import { UserRole, UserType } from '@/src/models/user.model'

// export interface WorkPosition {
//   id: string
//   title: string
//   startDate: Date
//   endDate?: Date | null
//   isCurrent: boolean
//   description?: string
//   employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Freelance'
//   skills?: string[]
// }

// export interface WorkExperience {
//   id: string
//   company: string
//   location?: string
//   positions: WorkPosition[]
// }

// export interface Education {
//   id: string
//   degree: string
//   institution: string
//   startDate: Date
//   endDate?: Date | null
//   isCurrent: boolean
//   location?: string
//   grade?: string
//   description?: string
//   fieldOfStudy?: string
// }

// export interface Skill {
//   id: string
//   name: string
//   level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
// }

// export interface Language {
//   id: string
//   name: string
//   level: 'Basic' | 'Intermediate' | 'Advanced' | 'Fluent' | 'Native'
// }

// export interface PersonalDetails {
//   firstName: string
//   lastName: string
//   middleName?: string
//   dateOfBirth?: Date | null
//   gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say'
//   professionalHeadline: string
//   publicProfileId: string
//   aboutMe: string
//   interests?: string[]
//   professionalBadges?: string[]
//   emails?: {
//     email: string
//     isPrimary: boolean
//     isVerified: boolean
//   }[]
// }

// export interface UserProfile {
//   id?: string
//   name: string
//   email?: string
//   role?: UserRole
//   userType?: UserType
//   profileImage?: string
//   coverImage?: string
//   location?: string
//   website?: string
//   verified?: boolean
//   emailVerified?: boolean
//   followers?: number
//   following?: number
//   personalDetails: PersonalDetails
//   skills: Skill[]
//   languages: Language[]
//   workExperiences: WorkExperience[]
//   education: Education[]
//   stats: {
//     completedCourses: number
//     skillsAssessed: number
//     careerGoals: number
//     networkSize: number
//   }
//   progress: {
//     overall: number
//     skills: number
//     goals: number
//   }
// }

// export interface ProfileState {
//   profile: UserProfile | null
//   isLoading: boolean
//   error: string | null
//   isDirty: boolean
// }

// export interface WorkExperienceState {
//   workExperiences: WorkExperience[]
//   isLoading: boolean
//   error: string | null
// }

// export interface EducationState {
//   education: Education[]
//   isLoading: boolean
//   error: string | null
// }
// lib/types/profile.unified.ts
import { z } from 'zod'

// Base enums
export type UserRole = 'user' | 'business' | 'organization' | 'admin'
export type UserType = 'student' | 'professional'
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE'
export type LanguageLevel = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'FLUENT' | 'NATIVE'
export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'

// Personal Details Schema
export const PersonalDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  middleName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  professionalHeadline: z.string().max(200).optional(),
  publicProfileId: z.string().optional(),
  aboutMe: z.string().max(2000).optional(),
  phone: z.string().optional(),
  interests: z.array(z.string()).optional().default([]),
  professionalBadges: z.array(z.string()).optional().default([])
})

// Work Position Schema
export const WorkPositionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Position title is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']),
  skills: z.array(z.string()).optional().default([])
})

// Work Experience Schema
export const WorkExperienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().optional(),
  positions: z.array(WorkPositionSchema).min(1, 'At least one position is required')
})

// Education Schema
export const EducationSchema = z.object({
  id: z.string(),
  degree: z.string().min(1, 'Degree is required'),
  institution: z.string().min(1, 'Institution name is required'),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  location: z.string().optional(),
  grade: z.string().optional(),
  description: z.string().optional()
})

// Skill Schema
export const SkillSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Skill name is required'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])
})

// Language Schema
export const LanguageSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Language name is required'),
  level: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED', 'FLUENT', 'NATIVE'])
})

// Contact Schema
export const ContactSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  isPrimary: z.boolean().default(false),
  isVerified: z.boolean().default(false)
})

// Social Links Schema
export const SocialLinksSchema = z.object({
  linkedin: z.string().url().optional().or(z.literal('')),
  twitter: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  instagram: z.string().url().optional().or(z.literal('')),
  facebook: z.string().url().optional().or(z.literal('')),
  youtube: z.string().url().optional().or(z.literal('')),
  portfolio: z.string().url().optional().or(z.literal(''))
}).optional()

// Stats Schema
export const StatsSchema = z.object({
  completedCourses: z.number().default(0),
  skillsAssessed: z.number().default(0),
  careerGoals: z.number().default(0),
  networkSize: z.number().default(0)
}).optional()

// Progress Schema
export const ProgressSchema = z.object({
  overall: z.number().min(0).max(100).default(0),
  skills: z.number().min(0).max(100).default(0),
  goals: z.number().min(0).max(100).default(0)
}).optional()

// Main User Profile Schema
export const UserProfileSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email().optional(),
  role: z.enum(['user', 'business', 'organization', 'admin']).optional(),
  userType: z.enum(['student', 'professional']).optional(),
  profileImage: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  bio: z.string().max(500).optional(),
  verified: z.boolean().default(false),
  emailVerified: z.boolean().default(false),
  followers: z.number().default(0),
  following: z.number().default(0),
  
  // Extended profile data
  personalDetails: PersonalDetailsSchema.optional(),
  skills: z.array(SkillSchema).default([]),
  languages: z.array(LanguageSchema).default([]),
  workExperiences: z.array(WorkExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  contacts: z.array(ContactSchema).default([]),
  socialLinks: SocialLinksSchema,
  stats: StatsSchema,
  progress: ProgressSchema,
  
  // System fields
  roles: z.array(z.string()).default([]),
  activeRole: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  needsOnboarding: z.boolean().default(false),
  needsRoleSelection: z.boolean().default(false),
  provider: z.string().default('credentials'),
  
  // Timestamps
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
})

// Update Schema for PATCH operations
export const UserProfileUpdateSchema = UserProfileSchema.partial()

// Type exports
export type PersonalDetails = z.infer<typeof PersonalDetailsSchema>
export type WorkPosition = z.infer<typeof WorkPositionSchema>
export type WorkExperience = z.infer<typeof WorkExperienceSchema>
export type Education = z.infer<typeof EducationSchema>
export type Skill = z.infer<typeof SkillSchema>
export type Language = z.infer<typeof LanguageSchema>
export type Contact = z.infer<typeof ContactSchema>
export type UserProfile = z.infer<typeof UserProfileSchema>
export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>

// State interfaces
export interface ProfileState {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  isDirty: boolean
}

// Utility function to get display name
export function getDisplayName(profile: UserProfile | null): string {
  if (!profile) return 'Guest User'
  
  if (profile.personalDetails?.firstName && profile.personalDetails?.lastName) {
    return `${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`
  }
  
  return profile.name || 'Unnamed User'
}

// Utility function to get initials
export function getInitials(profile: UserProfile | null): string {
  if (!profile) return 'GU'
  
  if (profile.personalDetails?.firstName && profile.personalDetails?.lastName) {
    return `${profile.personalDetails.firstName.charAt(0)}${profile.personalDetails.lastName.charAt(0)}`.toUpperCase()
  }
  
  if (profile.name) {
    const nameParts = profile.name.split(' ')
    return nameParts.length > 1 
      ? `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
      : profile.name.charAt(0).toUpperCase()
  }
  
  return 'UN'
}

// Constants
export const EMPLOYMENT_TYPE_LABELS = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance'
} as const

export const SKILL_LEVEL_LABELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate', 
  ADVANCED: 'Advanced',
  EXPERT: 'Expert'
} as const

export const LANGUAGE_LEVEL_LABELS = {
  BASIC: 'Basic',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced', 
  FLUENT: 'Fluent',
  NATIVE: 'Native'
} as const