import mongoose, { Document, Schema } from 'mongoose'

export interface IContactMessage extends Document {
  name: string
  email: string
  mobile: string
  message: string
  type: 'general' | 'business' | 'institute' | 'support'
  status: 'new' | 'read' | 'replied' | 'archived'
  adminNotes?: string
  repliedAt?: Date
  repliedBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    mobile: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['general', 'business', 'institute', 'support'],
      default: 'general'
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'archived'],
      default: 'new'
    },
    adminNotes: {
      type: String,
      trim: true
    },
    repliedAt: {
      type: Date
    },
    repliedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

// Indexes for efficient querying
ContactMessageSchema.index({ status: 1, createdAt: -1 })
ContactMessageSchema.index({ email: 1 })
ContactMessageSchema.index({ type: 1 })

export default mongoose.models.ContactMessage ||
  mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema)
