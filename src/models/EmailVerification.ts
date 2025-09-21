import mongoose, { Document, Schema } from 'mongoose'

export interface IEmailVerification extends Document {
  token: string
  email: string
  expiresAt: Date
  verified: boolean
  verifiedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const EmailVerificationSchema = new Schema<IEmailVerification>({
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
    index: { expireAfterSeconds: 0 } // TTL index
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  }
}, {
  timestamps: true
})

// Compound index for efficient queries
EmailVerificationSchema.index({ email: 1, verified: 1 })
EmailVerificationSchema.index({ token: 1, verified: 1, expiresAt: 1 })

export default mongoose.models.EmailVerification || mongoose.model<IEmailVerification>('EmailVerification', EmailVerificationSchema)
