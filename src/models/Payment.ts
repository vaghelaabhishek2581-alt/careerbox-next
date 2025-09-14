import mongoose, { Schema, Document } from 'mongoose'

// Payment Schema
const PaymentSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  orderId: { 
    type: String, 
    required: true 
  },
  paymentId: { 
    type: String 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    required: true,
    default: 'INR'
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  method: { 
    type: String, 
    enum: ['razorpay', 'payu', 'stripe', 'paypal'],
    required: true
  },
  gatewayResponse: { 
    type: Schema.Types.Mixed 
  },
  subscriptionId: { 
    type: String 
  },
  plan: { 
    type: String 
  },
  interval: { 
    type: String,
    enum: ['monthly', 'yearly']
  },
  description: { 
    type: String 
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  paidAt: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for public ID
PaymentSchema.virtual('id').get(function() {
  return this._id.toHexString()
})

// Indexes
PaymentSchema.index({ userId: 1 })
PaymentSchema.index({ orderId: 1 })
PaymentSchema.index({ paymentId: 1 })
PaymentSchema.index({ status: 1 })
PaymentSchema.index({ createdAt: -1 })

// Pre-save middleware
PaymentSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Interface for Payment document
export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  orderId: string
  paymentId?: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  method: 'razorpay' | 'payu' | 'stripe' | 'paypal'
  gatewayResponse?: any
  subscriptionId?: string
  plan?: string
  interval?: 'monthly' | 'yearly'
  description?: string
  createdAt: Date
  updatedAt: Date
  paidAt?: Date
}

export { IPayment }
export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema)
