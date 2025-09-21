import mongoose, { Schema, Document } from 'mongoose'

// Activity Schema
const ActivitySchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  type: { 
    type: String, 
    enum: [
      'login',
      'logout',
      'profile_update',
      'role_change',
      'content_view',
      'content_create',
      'content_update',
      'content_delete',
      'settings_change',
      'onboarding_complete'
    ],
    required: true
  },
  description: { 
    type: String, 
    required: true,
    maxlength: 500
  },
  metadata: { 
    type: Schema.Types.Mixed,
    default: {}
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  ip: { type: String },
  userAgent: { type: String },
  read: { type: Boolean, default: false },
  notified: { type: Boolean, default: false }
}, {
  timestamps: false, // We're using custom timestamp field
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for public ID
ActivitySchema.virtual('id').get(function() {
  return this._id.toHexString()
})

// Indexes
ActivitySchema.index({ userId: 1 })
ActivitySchema.index({ type: 1 })
ActivitySchema.index({ timestamp: -1 })
ActivitySchema.index({ userId: 1, timestamp: -1 })
ActivitySchema.index({ read: 1 })
ActivitySchema.index({ notified: 1 })

// Interface for Activity document
export interface IActivity extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  type: 'login' | 'logout' | 'profile_update' | 'role_change' | 'content_view' | 'content_create' | 'content_update' | 'content_delete' | 'settings_change' | 'onboarding_complete'
  description: string
  metadata?: Record<string, any>
  timestamp: Date
  ip?: string
  userAgent?: string
  read: boolean
  notified: boolean
}

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema)
