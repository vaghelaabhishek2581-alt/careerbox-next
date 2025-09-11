import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Lead } from '@/lib/types/lead.types'
import { ApiResponse, PaginatedResponse } from '@/lib/types/api.types'

// GET /api/leads - Fetch leads (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const db = await connectDB()
    const leadsCollection = db.collection('leads')

    // Build query
    const query: any = {}
    if (type) query.type = type
    if (status) query.status = status

    // Calculate pagination
    const skip = (page - 1) * limit
    const total = await leadsCollection.countDocuments(query)
    const leads = await leadsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const response: PaginatedResponse<Lead> = {
      data: leads,
      total,
      page,
      limit,
      hasMore: skip + leads.length < total
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

// POST /api/leads - Create a new lead
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const leadData = await req.json()
    const db = await connectDB()
    const leadsCollection = db.collection('leads')

    // Create lead
    const lead: Lead = {
      id: crypto.randomUUID(),
      userId: session.user.id,
      type: leadData.type,
      status: 'pending',
      businessData: leadData.businessData,
      instituteData: leadData.instituteData,
      contactHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await leadsCollection.insertOne(lead)

    // Send notification to admin
    await notifyAdminOfNewLead(lead)

    const response: ApiResponse<Lead> = {
      success: true,
      data: lead,
      message: `${leadData.type === 'business' ? 'Business' : 'Institute'} profile submitted for review. Our team will contact you shortly.`
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}

async function notifyAdminOfNewLead(lead: Lead) {
  try {
    // Implementation for notifying admin
    // This could be email, push notification, or database notification
    console.log(`New lead created: ${lead.id} of type ${lead.type}`)
  } catch (error) {
    console.error('Error notifying admin:', error)
  }
}
