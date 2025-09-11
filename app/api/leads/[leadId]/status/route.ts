import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Lead } from '@/lib/types/lead.types'
import { ApiResponse } from '@/lib/types/api.types'

// PATCH /api/leads/[leadId]/status - Update lead status (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { leadId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leadId } = params
    const { status, notes } = await req.json()
    const db = await connectDB()
    const leadsCollection = db.collection('leads')

    const lead = await leadsCollection.findOne({ id: leadId })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Add contact record if notes provided
    const contactRecord = {
      id: crypto.randomUUID(),
      type: 'note' as const,
      content: notes || `Status updated to ${status}`,
      timestamp: new Date(),
      adminId: session.user.id,
      adminName: session.user.name || 'Admin'
    }

    const updatedLead = {
      ...lead,
      status,
      contactHistory: [...lead.contactHistory, contactRecord],
      updatedAt: new Date()
    }

    await leadsCollection.updateOne(
      { id: leadId },
      { $set: updatedLead }
    )

    const response: ApiResponse<Lead> = {
      success: true,
      data: updatedLead,
      message: 'Lead status updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating lead status:', error)
    return NextResponse.json(
      { error: 'Failed to update lead status' },
      { status: 500 }
    )
  }
}
