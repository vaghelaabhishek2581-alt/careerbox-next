import { z } from 'zod'

export const WorkExperienceSchema = z.object({
  id: z.string().optional(),
  companyName: z.string().min(1, 'Company name is required'),
  jobDesignation: z.string().min(1, 'Job designation is required'),
  employmentType: z.enum([
    'FULL_TIME',
    'PART_TIME',
    'CONTRACT',
    'INTERNSHIP',
    'FREELANCE'
  ]),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrentJob: z.boolean(),
  skills: z.array(z.string()),
  description: z.string().optional()
})

export const EducationSchema = z.object({
  id: z.string().optional(),
  degreeName: z.string().min(1, 'Degree name is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  instituteName: z.string().min(1, 'Institute name is required'),
  examBoard: z.string().optional(),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  passingYear: z.string(),
  isCurrentlyStudying: z.boolean(),
  grade: z.string().optional()
})

export const LanguageProficiencySchema = z.object({
  name: z.string().min(1, 'Language name is required'),
  level: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED', 'FLUENT', 'NATIVE'])
})

export const PersonalDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  professionalHeadline: z.string().optional(),
  publicProfileId: z
    .string()
    .min(3, 'Public ID must be at least 3 characters')
    .max(30, 'Public ID must be less than 30 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Only letters, numbers, underscore and hyphen allowed'
    )
})

export const UserProfileSchema = z.object({
  id: z.string(),
  personalDetails: PersonalDetailsSchema,
  workExperiences: z.array(WorkExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(z.string()),
  languages: z.array(LanguageProficiencySchema),
  coverImage: z.string().optional(),
  profileImage: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
  socialLinks: z
    .object({
      linkedin: z.string().url().optional(),
      github: z.string().url().optional(),
      twitter: z.string().url().optional(),
      portfolio: z.string().url().optional()
    })
    .optional()
})

export type WorkExperience = z.infer<typeof WorkExperienceSchema>
export type Education = z.infer<typeof EducationSchema>
export type LanguageProficiency = z.infer<typeof LanguageProficiencySchema>
export type PersonalDetails = z.infer<typeof PersonalDetailsSchema>
export type UserProfile = z.infer<typeof UserProfileSchema>
