import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongoose'
import Invoice from '@/src/models/Invoice'
import User from '@/src/models/User'
import AdminInstitute from '@/src/models/AdminInstitute'
import { Types } from 'mongoose'

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  status: z.enum(['paid', 'pending', 'failed']).optional(),
  instituteId: z.string().optional(),
  dateStart: z.string().optional(),
  dateEnd: z.string().optional()
})

async function resolveInstituteId (userId: string) {
  const user: any = await User.findById(userId)
    .select('ownedOrganizations')
    .lean()
  const owned = (user?.ownedOrganizations || []) as Types.ObjectId[]
  if (owned.length > 0) {
    return owned[0]
  }
  const institute: any = await AdminInstitute.findOne({
    userIds: { $in: [new Types.ObjectId(userId)] }
  })
    .select('_id')
    .lean()
  return institute?._id || null
}

export async function GET (req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const parsed = querySchema.parse(Object.fromEntries(searchParams.entries()))
    const page = parseInt(parsed.page, 10)
    const limit = parseInt(parsed.limit, 10)

    await connectToDatabase()

    const filter: any = {}

    if (parsed.status) {
      filter.paymentStatus = parsed.status
    }

    if (parsed.dateStart || parsed.dateEnd) {
      filter.invoiceDate = {}
      if (parsed.dateStart) filter.invoiceDate.$gte = new Date(parsed.dateStart)
      if (parsed.dateEnd) filter.invoiceDate.$lte = new Date(parsed.dateEnd)
    }

    const isAdmin = auth.user?.roles?.includes('admin')
    if (isAdmin) {
      if (parsed.instituteId) {
        filter.instituteId = new Types.ObjectId(parsed.instituteId)
      }
    } else {
      if (!auth.user?.roles?.includes('institute')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const instituteId = await resolveInstituteId(auth.userId)
      if (!instituteId) {
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { currentPage: page, totalPages: 0, totalItems: 0 }
        })
      }
      filter.instituteId = instituteId
    }

    const totalItems = await Invoice.countDocuments(filter)
    const totalPages = Math.ceil(totalItems / limit)
    const invoices = await Invoice.find(filter)
      .sort({ invoiceDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec()

    const data = invoices.map((inv: any) => ({
      id: inv._id?.toString(),
      invoiceId: inv.invoiceId,
      orderId: inv.orderId,
      transactionId: inv.transactionId,
      instituteId: inv.instituteId?.toString(),
      subscriptionId: inv.subscriptionId?.toString(),
      planName: inv.planSnapshot?.name,
      interval: inv.planSnapshot?.duration,
      amount: inv.totalAmount,
      subtotal: inv.subtotal,
      currency: inv.currency,
      status: inv.paymentStatus,
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate,
      paymentMethod: inv.paymentMethod,
      upiHandle: inv.upiHandle,
      cardBrand: inv.cardBrand,
      cardLast4: inv.cardLast4,
      billingSnapshot: inv.billingSnapshot,
      taxBreakup: inv.taxBreakup
    }))

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}
