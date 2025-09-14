// Re-export Profile types from the Redux slice for backward compatibility
export type {
  IProfile,
  IPersonalDetails,
  IWorkExperience,
  IWorkPosition,
  IEducation,
  ISkill,
  ILanguage,
  ISocialLinks
} from '@/lib/redux/slices/profileSlice'

// Legacy type aliases for backward compatibility
export type PersonalDetails = import('@/lib/redux/slices/profileSlice').IPersonalDetails
export type WorkExperience = import('@/lib/redux/slices/profileSlice').IWorkExperience
export type Education = import('@/lib/redux/slices/profileSlice').IEducation
export type Skill = import('@/lib/redux/slices/profileSlice').ISkill
export type Language = import('@/lib/redux/slices/profileSlice').ILanguage
export type SocialLinks = import('@/lib/redux/slices/profileSlice').ISocialLinks
export type Profile = import('@/lib/redux/slices/profileSlice').IProfile
