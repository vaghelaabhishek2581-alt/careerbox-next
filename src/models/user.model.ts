export type UserRole = 'user' | 'business' | 'organization' | 'admin'
export type UserType = 'student' | 'professional' | undefined

export interface UserDocument {
  _id: any
  name: string
  email: string
  password?: string | null
  role: UserRole
  userType?: UserType
  organizationId?: any
  avatar?: string | null
  permissions?: string[]
  needsOnboarding?: boolean
  needsRoleSelection?: boolean
  roles?: string[]
  activeRole?: string | null
}

export function toPublicUser (user: UserDocument) {
  return {
    id: user._id?.toString?.() ?? user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    userType: user.userType,
    avatar: (user as any).avatar,
    organizationId: user.organizationId,
    permissions: user.permissions || [],
    roles: user.roles || [user.role],
    activeRole: user.activeRole || user.role,
    needsOnboarding: user.needsOnboarding ?? false,
    needsRoleSelection: user.needsRoleSelection ?? false
  }
}
