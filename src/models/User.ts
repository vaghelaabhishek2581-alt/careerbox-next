import mongoose, { Schema, Document } from 'mongoose'

// ============================================================================
// INTERFACE
// ============================================================================

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  password?: string
  role: 'user' | 'business' | 'institute' | 'admin'
  activeRole?: 'user' | 'business' | 'institute' | 'admin'
  roles: string[]
  emailVerified: boolean
  subscriptionActive?: boolean
  needsOnboarding: boolean
  needsRoleSelection: boolean
  profileId?: mongoose.Types.ObjectId // Reference to Profile model

  // Team Member Information
  isTeamMember?: boolean
  teamMemberOf?: {
    organizationId: mongoose.Types.ObjectId
    organizationType: 'business' | 'institute'
  }
  teamMemberRole?: string // Custom role in the organization
  teamMemberPermissions?: string[] // Array of permission strings

  // Organization Owner Information
  isOrganizationOwner?: boolean
  ownedOrganizations?: mongoose.Types.ObjectId[] // Mixed references to Business/Institute

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
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
  onboardingCompletedAt?: Date
}

// ============================================================================
// SCHEMA
// ============================================================================

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false // Optional for OAuth users
  },
  role: {
    type: String,
    enum: ['user', 'business', 'institute', 'admin'],
    default: 'user'
  },
  activeRole: {
    type: String,
    enum: ['user', 'business', 'institute', 'admin'],
    default: 'user'
  },
  roles: [{
    type: String,
    enum: ['user', 'business', 'institute', 'admin']
  }],
  emailVerified: {
    type: Boolean,
    default: false
  },
  subscriptionActive: {
    type: Boolean,
    default: false
  },
  needsOnboarding: {
    type: Boolean,
    default: true
  },
  needsRoleSelection: {
    type: Boolean,
    default: false
  },
  profileId: {
    type: Schema.Types.ObjectId,
    ref: 'Profile'
  },

  // Team Member Information
  isTeamMember: {
    type: Boolean,
    default: false
  },
  teamMemberOf: {
    organizationId: {
      type: Schema.Types.ObjectId,
      required: false
    },
    organizationType: {
      type: String,
      enum: ['business', 'institute'],
      required: false
    }
  },
  teamMemberRole: {
    type: String,
    trim: true
  },
  teamMemberPermissions: [{
    type: String,
    trim: true
  }],

  // Organization Owner Information
  isOrganizationOwner: {
    type: Boolean,
    default: false
  },
  ownedOrganizations: [{
    type: Schema.Types.ObjectId,
    // Note: This will reference either Business or Institute models
    // We'll handle the dynamic referencing in the application logic
  }],

  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    },
    privacy: {
      profileVisible: { type: Boolean, default: true },
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false }
    }
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  onboardingCompletedAt: {
    type: Date
  }
})

// ============================================================================
// INDEXES
// ============================================================================

// Email index is automatically created by unique: true
UserSchema.index({ role: 1 })
UserSchema.index({ activeRole: 1 })
UserSchema.index({ 'teamMemberOf.organizationId': 1 })
UserSchema.index({ 'teamMemberOf.organizationType': 1 })
UserSchema.index({ profileId: 1 })
UserSchema.index({ ownedOrganizations: 1 })

// ============================================================================
// VIRTUALS
// ============================================================================

UserSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

// ============================================================================
// METHODS
// ============================================================================

UserSchema.methods.hasRole = function (role: string): boolean {
  return this.roles.includes(role)
}

UserSchema.methods.hasAnyRole = function (roles: string[]): boolean {
  return roles.some(role => this.roles.includes(role))
}

UserSchema.methods.isAdmin = function (): boolean {
  return this.role === 'admin' || this.roles.includes('admin')
}

UserSchema.methods.isBusiness = function (): boolean {
  return this.role === 'business' || this.roles.includes('business')
}

UserSchema.methods.isInstitute = function (): boolean {
  return this.role === 'institute' || this.roles.includes('institute')
}

UserSchema.methods.hasPermission = function (permission: string): boolean {
  return this.teamMemberPermissions?.includes(permission) || false
}

UserSchema.methods.isOwnerOf = function (organizationId: string): boolean {
  return this.ownedOrganizations?.some((id: mongoose.Types.ObjectId) => id.toString() === organizationId) || false
}

UserSchema.methods.isTeamMemberOf = function (organizationId: string): boolean {
  return this.teamMemberOf?.organizationId?.toString() === organizationId
}

UserSchema.methods.getTeamMemberOrganizationType = function (): 'business' | 'institute' | null {
  return this.teamMemberOf?.organizationType || null
}

// Helper method to get user's owned businesses
UserSchema.methods.getOwnedBusinesses = async function () {
  if (!this.ownedOrganizations?.length) return []

  const Business = mongoose.model('Business')
  return await Business.find({
    _id: { $in: this.ownedOrganizations },
    userId: this._id
  })
}

// Helper method to get user's owned institutes (should be max 1)
UserSchema.methods.getOwnedInstitute = async function () {
  if (!this.ownedOrganizations?.length) return null

  const Institute = mongoose.model('Institute')
  return await Institute.findOne({
    _id: { $in: this.ownedOrganizations },
    userId: this._id
  })
}

// Helper method to get all owned organizations with their types
UserSchema.methods.getOwnedOrganizationsWithType = async function () {
  if (!this.ownedOrganizations?.length) return []

  const Business = mongoose.model('Business')
  const Institute = mongoose.model('Institute')

  const [businesses, institute] = await Promise.all([
    Business.find({
      _id: { $in: this.ownedOrganizations },
      userId: this._id
    }).lean(),
    Institute.findOne({
      _id: { $in: this.ownedOrganizations },
      userId: this._id
    }).lean()
  ])

  const organizations = [
    ...businesses.map(b => ({ ...b, organizationType: 'business' as const })),
    ...(institute ? [{ ...institute, organizationType: 'institute' as const }] : [])
  ]

  return organizations
}

// ============================================================================
// PRE-SAVE MIDDLEWARE
// ============================================================================

UserSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

// ============================================================================
// EXPORT
// ============================================================================

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)