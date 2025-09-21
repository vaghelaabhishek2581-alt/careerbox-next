import mongoose, { Schema, Document } from 'mongoose'

export interface IPasswordReset extends Document {
  token: string
  email: string
  expiresAt: Date
  used: boolean
  usedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const PasswordResetSchema = new Schema<IPasswordReset>({
  token: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index
  },
  used: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date
  }
}, {
  timestamps: true
})

// Compound index for efficient queries
PasswordResetSchema.index({ token: 1, used: 1, expiresAt: 1 })

export default mongoose.models.PasswordReset || mongoose.model<IPasswordReset>('PasswordReset', PasswordResetSchema)
