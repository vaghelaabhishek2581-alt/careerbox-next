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
