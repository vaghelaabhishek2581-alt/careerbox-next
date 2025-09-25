import mongoose, { Schema, Document } from 'mongoose'

// ============================================================================
// INTERFACE
// ============================================================================

export interface ITeamMember extends Document {
  _id: mongoose.Types.ObjectId
  organizationId: mongoose.Types.ObjectId
  organizationType: 'institute' | 'business'
  userId: mongoose.Types.ObjectId
  invitedBy: mongoose.Types.ObjectId
  
  // Basic Information
  email: string
  firstName: string
  lastName: string
  role: string // Custom role name like "Course Manager", "HR Manager", etc.
  
  // Status
  status: 'pending' | 'active' | 'suspended' | 'removed'
  invitationToken?: string
  invitationExpiresAt?: Date
  joinedAt?: Date
  
  // Permissions
  permissions: {
    // Institute Permissions
    canManageStudents?: boolean
    canManageCourses?: boolean
    canManageFaculty?: boolean
    canViewAnalytics?: boolean
    canManageDocuments?: boolean
    canManageProfile?: boolean
    canManageTeam?: boolean
    canManageBilling?: boolean
    
    // Business Permissions
    canManageJobs?: boolean
    canManageApplications?: boolean
    canViewReports?: boolean
    canManageCompanyProfile?: boolean
    canManageTeamMembers?: boolean
    canManageSubscription?: boolean
    
    // Common Permissions
    canViewDashboard?: boolean
    canReceiveNotifications?: boolean
  }
  
  // Access Restrictions
  accessLevel: 'full' | 'limited' | 'read_only'
  allowedSections: string[] // Array of dashboard sections they can access
  
  // Metadata
  lastActiveAt?: Date
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// SCHEMA
// ============================================================================

const TeamMemberSchema = new Schema<ITeamMember>({
  organizationId: { 
    type: Schema.Types.ObjectId, 
    required: true,
    refPath: 'organizationType' // Dynamic reference based on organizationType
  },
  organizationType: { 
    type: String, 
    enum: ['institute', 'business'], 
    required: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  invitedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Basic Information
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true 
  },
  firstName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  lastName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  role: { 
    type: String, 
    required: true, 
    trim: true 
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'active', 'suspended', 'removed'],
    default: 'pending' 
  },
  invitationToken: { 
    type: String, 
    trim: true 
  },
  invitationExpiresAt: { 
    type: Date 
  },
  joinedAt: { 
    type: Date 
  },
  
  // Permissions
  permissions: {
    // Institute Permissions
    canManageStudents: { type: Boolean, default: false },
    canManageCourses: { type: Boolean, default: false },
    canManageFaculty: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: false },
    canManageDocuments: { type: Boolean, default: false },
    canManageProfile: { type: Boolean, default: false },
    canManageTeam: { type: Boolean, default: false },
    canManageBilling: { type: Boolean, default: false },
    
    // Business Permissions
    canManageJobs: { type: Boolean, default: false },
    canManageApplications: { type: Boolean, default: false },
    canViewReports: { type: Boolean, default: false },
    canManageCompanyProfile: { type: Boolean, default: false },
    canManageTeamMembers: { type: Boolean, default: false },
    canManageSubscription: { type: Boolean, default: false },
    
    // Common Permissions
    canViewDashboard: { type: Boolean, default: true },
    canReceiveNotifications: { type: Boolean, default: true }
  },
  
  // Access Restrictions
  accessLevel: { 
    type: String, 
    enum: ['full', 'limited', 'read_only'],
    default: 'limited' 
  },
  allowedSections: [{ 
    type: String, 
    trim: true 
  }],
  
  // Metadata
  lastActiveAt: { 
    type: Date 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
})

// ============================================================================
// INDEXES
// ============================================================================

TeamMemberSchema.index({ organizationId: 1 })
TeamMemberSchema.index({ userId: 1 })
TeamMemberSchema.index({ email: 1 })
TeamMemberSchema.index({ status: 1 })
TeamMemberSchema.index({ invitedBy: 1 })
TeamMemberSchema.index({ invitationToken: 1 })

// ============================================================================
// VIRTUALS
// ============================================================================

TeamMemberSchema.virtual('id').get(function() {
  return this._id.toHexString()
})

TeamMemberSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

// ============================================================================
// METHODS
// ============================================================================

TeamMemberSchema.methods.hasPermission = function(permission: string): boolean {
  return this.permissions[permission] === true
}

TeamMemberSchema.methods.canAccessSection = function(section: string): boolean {
  if (this.accessLevel === 'full') return true
  return this.allowedSections.includes(section)
}

TeamMemberSchema.methods.isActive = function(): boolean {
  return this.status === 'active'
}

TeamMemberSchema.methods.isPending = function(): boolean {
  return this.status === 'pending'
}

// ============================================================================
// PRE-SAVE MIDDLEWARE
// ============================================================================

TeamMemberSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// ============================================================================
// EXPORT
// ============================================================================

export default mongoose.models.TeamMember || mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema)
