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
  organizationId?: mongoose.Types.ObjectId
  emailVerified: boolean
  needsOnboarding: boolean
  needsRoleSelection: boolean
  profileId?: mongoose.Types.ObjectId // Reference to Profile model
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
  organizationId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Organization' 
  },
  emailVerified: { 
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
UserSchema.index({ organizationId: 1 })
UserSchema.index({ profileId: 1 })

// ============================================================================
// VIRTUALS
// ============================================================================

UserSchema.virtual('id').get(function() {
  return this._id.toHexString()
})

// ============================================================================
// METHODS
// ============================================================================

UserSchema.methods.hasRole = function(role: string): boolean {
  return this.roles.includes(role)
}

UserSchema.methods.hasAnyRole = function(roles: string[]): boolean {
  return roles.some(role => this.roles.includes(role))
}

UserSchema.methods.isAdmin = function(): boolean {
  return this.role === 'admin' || this.roles.includes('admin')
}

UserSchema.methods.isBusiness = function(): boolean {
  return this.role === 'business' || this.roles.includes('business')
}

UserSchema.methods.isInstitute = function(): boolean {
  return this.role === 'institute' || this.roles.includes('institute')
}

// ============================================================================
// PRE-SAVE MIDDLEWARE
// ============================================================================

UserSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// ============================================================================
// EXPORT
// ============================================================================

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)