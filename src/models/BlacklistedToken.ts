import mongoose, { Document, Schema } from 'mongoose'

export interface IBlacklistedToken extends Document {
  tokenId: string
  token?: string
  userId: string
  reason: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

const BlacklistedTokenSchema = new Schema<IBlacklistedToken>({
  tokenId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  token: {
    type: String,
    sparse: true // Allow multiple null values
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  reason: {
    type: String,
    required: true,
    enum: ['logout', 'security', 'expired', 'admin_revoked']
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // TTL index
  }
}, {
  timestamps: true
})

// Compound index for efficient queries
BlacklistedTokenSchema.index({ tokenId: 1, expiresAt: 1 })
BlacklistedTokenSchema.index({ userId: 1, expiresAt: 1 })

export { IBlacklistedToken }
export default mongoose.models.BlacklistedToken || mongoose.model<IBlacklistedToken>('BlacklistedToken', BlacklistedTokenSchema)
