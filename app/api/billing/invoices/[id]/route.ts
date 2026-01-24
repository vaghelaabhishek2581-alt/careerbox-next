import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongoose'
import Invoice from '@/src/models/Invoice'
import User from '@/src/models/User'
import AdminInstitute from '@/src/models/AdminInstitute'
import { Types } from 'mongoose'
import { SELLER_DETAILS } from '@/lib/billing/invoice'

async function resolveInstituteId (userId: string) {
  const user = await User.findById(userId)
    .select('ownedOrganizations')
    .lean<{ ownedOrganizations?: Types.ObjectId[] } | null>()
  const owned = (user?.ownedOrganizations || []) as Types.ObjectId[]
  if (owned.length > 0) {
    return owned[0]
  }
  const institute = await AdminInstitute.findOne({
    userIds: { $in: [new Types.ObjectId(userId)] }
  })
    .select('_id')
    .lean<{ _id: Types.ObjectId } | null>()
  return institute?._id || null
}

export async function GET (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedUser(req)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { id } = await params
    const invoiceFilter = Types.ObjectId.isValid(id)
      ? { $or: [{ invoiceId: id }, { _id: id }] }
      : { invoiceId: id }
    const invoice = await Invoice.findOne(invoiceFilter)
      .lean<{
        _id?: Types.ObjectId
        invoiceId?: string
        orderId?: string
        transactionId?: string
        subscriptionId?: Types.ObjectId
        instituteId?: Types.ObjectId
        planSnapshot?: any
        billingSnapshot?: any
        lineItems?: any[]
        subtotal?: number
        taxBreakup?: any
        totalAmount?: number
        currency?: string
        paymentMethod?: 'UPI' | 'Card'
        upiHandle?: string
        cardBrand?: string
        cardLast4?: string
        paymentStatus?: 'pending' | 'paid' | 'failed'
        invoiceDate?: Date
        dueDate?: Date
        pdfUrl?: string
      } | null>()
      .exec()

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (!auth.user?.roles?.includes('institute')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const instituteId = await resolveInstituteId(auth.userId)
    if (
      !instituteId ||
      invoice.instituteId?.toString() !== instituteId.toString()
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: invoice._id?.toString(),
        invoiceId: invoice.invoiceId,
        orderId: invoice.orderId,
        transactionId: invoice.transactionId,
        subscriptionId: invoice.subscriptionId?.toString(),
        instituteId: invoice.instituteId?.toString(),
        planSnapshot: invoice.planSnapshot,
        billingSnapshot: invoice.billingSnapshot,
        lineItems: invoice.lineItems,
        subtotal: invoice.subtotal,
        taxBreakup: invoice.taxBreakup,
        totalAmount: invoice.totalAmount,
        currency: invoice.currency,
        paymentMethod: invoice.paymentMethod,
        upiHandle: invoice.upiHandle,
        cardBrand: invoice.cardBrand,
        cardLast4: invoice.cardLast4,
        paymentStatus: invoice.paymentStatus,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        pdfUrl: invoice.pdfUrl,
        seller: SELLER_DETAILS
      }
    })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}
