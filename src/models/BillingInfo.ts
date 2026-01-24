import mongoose, { Schema, Document } from 'mongoose'

export interface IBillingInfo extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  instituteId?: mongoose.Types.ObjectId
  organizationName: string
  gstin?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  email?: string
  lastUpdated: Date
  createdAt: Date
  updatedAt: Date
}

const BillingInfoSchema = new Schema<IBillingInfo>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    instituteId: {
      type: Schema.Types.ObjectId,
      ref: 'AdminInstitute'
    },
    organizationName: {
      type: String,
      required: true,
      trim: true
    },
    gstin: {
      type: String,
      trim: true
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true
    },
    addressLine2: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    postalCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'India'
    },
    email: {
      type: String,
      trim: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

BillingInfoSchema.index({ userId: 1 })
BillingInfoSchema.index({ instituteId: 1 })
BillingInfoSchema.index({ gstin: 1 })

BillingInfoSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

export default mongoose.models.BillingInfo ||
  mongoose.model<IBillingInfo>('BillingInfo', BillingInfoSchema)
