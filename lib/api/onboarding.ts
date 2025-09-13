import apiClient from './client'
import { ApiResponse } from './client'

export interface OnboardingData {
  userId: string
  role: 'student' | 'professional' | 'institute_admin' | 'business_owner'
  userType?: 'student' | 'professional'
  bio?: string
  skills?: string[]
  interests?: string[]
  company?: string
  location?: string
}

export interface OnboardingResponse {
  success: boolean
  user: {
    id: string
    email: string
    name: string
    roles: string[]
    activeRole: string
    needsOnboarding: boolean
    needsRoleSelection: boolean
    profile: {
      personalDetails: {
        firstName: string
        lastName: string
        publicProfileId: string
        professionalHeadline: string
        aboutMe: string
        avatar?: string
      }
      workExperience: any[]
      education: any[]
      skills: any[]
      languages: any[]
      interests: string[]
      socialLinks: any[]
      achievements: any[]
      certifications: any[]
      projects: any[]
      goals: any[]
      preferences: {
        notifications: {
          email: boolean
          push: boolean
          marketing: boolean
        }
        privacy: {
          profileVisible: boolean
          showEmail: boolean
          showPhone: boolean
        }
      }
    }
  }
  message?: string
}

export class OnboardingAPI {
  /**
   * Complete user onboarding with role selection and profile creation
   */
  static async completeOnboarding(data: OnboardingData): Promise<ApiResponse<OnboardingResponse>> {
    return apiClient.post<OnboardingResponse>('/api/auth/onboarding/complete', data)
  }

  /**
   * Update user role during onboarding
   */
  static async updateRole(userId: string, role: string): Promise<ApiResponse<any>> {
    return apiClient.post('/api/auth/onboarding/role', {
      userId,
      role
    })
  }

  /**
   * Get onboarding status for a user
   */
  static async getOnboardingStatus(userId: string): Promise<ApiResponse<{
    needsOnboarding: boolean
    needsRoleSelection: boolean
    activeRole?: string
    roles?: string[]
  }>> {
    return apiClient.get(`/api/auth/onboarding/status?userId=${userId}`)
  }

  /**
   * Skip onboarding (for testing purposes)
   */
  static async skipOnboarding(userId: string): Promise<ApiResponse<any>> {
    return apiClient.post('/api/auth/onboarding/skip', { userId })
  }
}

export default OnboardingAPI
