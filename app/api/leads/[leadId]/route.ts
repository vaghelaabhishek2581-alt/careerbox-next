import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Lead } from '@/lib/types/lead.types'
import { ApiResponse } from '@/lib/types/api.types'

// GET /api/leads/[leadId] - Fetch lead by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { leadId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leadId } = params
    const db = await connectDB()
    const leadsCollection = db.collection('leads')

    const lead = await leadsCollection.findOne({ id: leadId })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Check if user can access this lead
    if (session.user.role !== 'admin' && lead.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const response: ApiResponse<Lead> = {
      success: true,
      data: lead
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching lead:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    )
  }
}

// PUT /api/leads/[leadId] - Update lead
export async function PUT(
  req: NextRequest,
  { params }: { params: { leadId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leadId } = params
    const updateData = await req.json()
    const db = await connectDB()
    const leadsCollection = db.collection('leads')

    const lead = await leadsCollection.findOne({ id: leadId })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Check if user can update this lead
    if (session.user.role !== 'admin' && lead.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updatedLead = {
      ...lead,
      ...updateData,
      updatedAt: new Date()
    }

    await leadsCollection.updateOne(
      { id: leadId },
      { $set: updatedLead }
    )

    const response: ApiResponse<Lead> = {
      success: true,
      data: updatedLead
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    )
  }
}
