import { NextResponse } from 'next/server'
import { createStudentLead, getAllStudentLeads, getStudentLeads, updateLeadStatus } from '@/lib/actions/student-leads'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const result = await createStudentLead({
      userId: body.userId,
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      city: body.city,
      courseId: body.courseId,
      courseName: body.courseName,
      instituteId: body.instituteId,
      instituteSlug: body.instituteSlug,
      publicProfileId: body.publicProfileId,
      isAdminInstitute: Boolean(body.isAdminInstitute),
      message: body.message,
      source: body.source,
      utm: body.utm,
    })

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error || 'Failed to create lead' }, { status: 400 })
    }

    return NextResponse.json({ ok: true, id: result.id }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    
    const params = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      search: searchParams.get('search') || '',
      status: searchParams.get('status') || '',
      sortBy: (searchParams.get('sortBy') as 'createdAt' | 'fullName' | 'email' | 'status') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    }
    
    const result = await getStudentLeads(params)
    
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error || 'Failed to fetch leads' }, { status: 400 })
    }
    
    return NextResponse.json({ 
      ok: true, 
      leads: result.leads,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage
    }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { leadId, status } = body
    
    if (!leadId || !status) {
      return NextResponse.json({ ok: false, error: 'leadId and status are required' }, { status: 400 })
    }
    
    const result = await updateLeadStatus(leadId, status)
    
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error || 'Failed to update lead status' }, { status: 400 })
    }
    
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}
