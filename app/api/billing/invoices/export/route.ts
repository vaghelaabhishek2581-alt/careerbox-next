import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase as connectMongoose } from '@/lib/db/mongoose'
import Subscription from '@/src/models/Subscription'

function toCSV (rows: Array<Record<string, any>>): string {
  const headers = [
    'InvoiceID',
    'OrderID',
    'Amount',
    'Currency',
    'Status',
    'PaymentDate',
    'Plan',
    'Interval'
  ]
  const escape = (v: any) => {
    const s = v == null ? '' : String(v)
    return `"${s.replace(/"/g, '""')}"`
  }
  const lines = [headers.join(',')]
  for (const r of rows) {
    lines.push(
      [
        escape(r.id),
        escape(r.orderId),
        escape(r.amount),
        escape(r.currency),
        escape(r.status),
        escape(new Date(r.paymentDate).toISOString()),
        escape(r.planName),
        escape(r.interval)
      ].join(',')
    )
  }
  return lines.join('\r\n')
}

export async function GET (req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectMongoose()
    const subs = await Subscription.find({ userId: auth.userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec()

    const rows = subs.map((s: any) => ({
      id: String(s._id),
      orderId: String(s._id),
      amount: s.amount,
      currency: s.currency || 'INR',
      status: s.status === 'active' ? 'paid' : s.status,
      paymentDate: s.lastPaymentDate || s.startDate,
      planName: s.planName || 'Subscription',
      interval: s.billingCycle || 'yearly'
    }))

    const csv = toCSV(rows)
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="billing_invoices.csv"`
      }
    })
  } catch (error) {
    console.error('Export invoices error:', error)
    return NextResponse.json(
      { error: 'Failed to export invoices' },
      { status: 500 }
    )
  }
}
