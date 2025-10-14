import { NextResponse } from 'next/server'
import { createStudentLead } from '@/lib/actions/student-leads'

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
