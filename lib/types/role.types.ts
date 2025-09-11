export type UserRole = 'user' | 'business' | 'institute' | 'admin'

export interface RolePermissions {
  canCreateJobs: boolean
  canCreateCourses: boolean
  canCreateExams: boolean
  canViewAnalytics: boolean
  canManageUsers: boolean
  canManageLeads: boolean
  canManageSubscriptions: boolean
  canAccessAdminPanel: boolean
  canModerateContent: boolean
  canViewAllData: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  user: {
    canCreateJobs: false,
    canCreateCourses: false,
    canCreateExams: false,
    canViewAnalytics: false,
    canManageUsers: false,
    canManageLeads: false,
    canManageSubscriptions: false,
    canAccessAdminPanel: false,
    canModerateContent: false,
    canViewAllData: false,
  },
  business: {
    canCreateJobs: true,
    canCreateCourses: false,
    canCreateExams: true,
    canViewAnalytics: true,
    canManageUsers: false,
    canManageLeads: false,
    canManageSubscriptions: true,
    canAccessAdminPanel: false,
    canModerateContent: false,
    canViewAllData: false,
  },
  institute: {
    canCreateJobs: false,
    canCreateCourses: true,
    canCreateExams: true,
    canViewAnalytics: true,
    canManageUsers: false,
    canManageLeads: false,
    canManageSubscriptions: true,
    canAccessAdminPanel: false,
    canModerateContent: false,
    canViewAllData: false,
  },
  admin: {
    canCreateJobs: true,
    canCreateCourses: true,
    canCreateExams: true,
    canViewAnalytics: true,
    canManageUsers: true,
    canManageLeads: true,
    canManageSubscriptions: true,
    canAccessAdminPanel: true,
    canModerateContent: true,
    canViewAllData: true,
  },
}

export interface RoleRequirement {
  role: UserRole
  requiresSubscription: boolean
  subscriptionPlans?: string[]
}

export const ROLE_REQUIREMENTS: Record<UserRole, RoleRequirement> = {
  user: {
    role: 'user',
    requiresSubscription: false,
  },
  business: {
    role: 'business',
    requiresSubscription: true,
    subscriptionPlans: ['business_basic', 'business_pro'],
  },
  institute: {
    role: 'institute',
    requiresSubscription: true,
    subscriptionPlans: ['institute_basic', 'institute_pro'],
  },
  admin: {
    role: 'admin',
    requiresSubscription: false,
  },
}
