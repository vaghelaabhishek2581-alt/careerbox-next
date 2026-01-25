import mongoose, { Schema, Document } from 'mongoose'

export interface IInvoice extends Document {
  _id: mongoose.Types.ObjectId
  invoiceId: string
  orderId?: string
  transactionId?: string
  userId: mongoose.Types.ObjectId
  instituteId?: mongoose.Types.ObjectId
  subscriptionId?: mongoose.Types.ObjectId
  planSnapshot: {
    name: string
    price: number
    duration: string
  }
  billingSnapshot: {
    organizationName: string
    gstin?: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    postalCode: string
    country: string
    email?: string
  }
  lineItems: Array<{
    description: string
    qty: number
    unitPrice: number
    sac?: string
  }>
  subtotal: number
  taxBreakup: {
    cgst: number
    sgst: number
    igst: number
  }
  totalAmount: number
  currency: string
  paymentMethod?: 'UPI' | 'Card'
  upiHandle?: string
  cardBrand?: string
  cardLast4?: string
  paymentStatus: 'pending' | 'paid' | 'failed'
  invoiceDate: Date
  dueDate?: Date
  pdfUrl?: string
  createdAt: Date
  updatedAt: Date
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceId: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, index: true },
    transactionId: { type: String, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    instituteId: { type: Schema.Types.ObjectId, ref: 'AdminInstitute' },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    planSnapshot: {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      duration: { type: String, required: true }
    },
    billingSnapshot: {
      organizationName: { type: String, required: true },
      gstin: { type: String },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      email: { type: String }
    },
    lineItems: [
      {
        description: { type: String, required: true },
        qty: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        sac: { type: String }
      }
    ],
    subtotal: { type: Number, required: true },
    taxBreakup: {
      cgst: { type: Number, required: true },
      sgst: { type: Number, required: true },
      igst: { type: Number, required: true }
    },
    totalAmount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'INR' },
    paymentMethod: { type: String, enum: ['UPI', 'Card'] },
    upiHandle: { type: String },
    cardBrand: { type: String },
    cardLast4: { type: String },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    invoiceDate: { type: Date, required: true },
    dueDate: { type: Date },
    pdfUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

InvoiceSchema.index({ userId: 1 })
InvoiceSchema.index({ instituteId: 1 })
InvoiceSchema.index({ subscriptionId: 1 })
InvoiceSchema.index({ paymentStatus: 1 })
InvoiceSchema.index({ invoiceDate: -1 })

InvoiceSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

export default mongoose.models.Invoice ||
  mongoose.model<IInvoice>('Invoice', InvoiceSchema)
