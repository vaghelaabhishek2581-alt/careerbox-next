"use server"

import { connectToDatabase } from '@/lib/db/mongoose'
import StudentLead, { IStudentLead } from '@/src/models/StudentLead'
import { Types } from 'mongoose'

export type CreateStudentLeadInput = {
  // Authenticated user id if available
  userId?: string

  // Applicant details (required when userId not provided)
  fullName?: string
  email?: string
  phone?: string
  city?: string

  // Context
  courseId?: string
  courseName?: string
  instituteId?: string
  instituteSlug?: string
  publicProfileId?: string
  isAdminInstitute: boolean

  // Optional extras
  message?: string
  source?: string
  utm?: { source?: string; medium?: string; campaign?: string }
}

export type CreateStudentLeadResult = {
  ok: boolean
  id?: string
  error?: string
}

// Creates a Student lead from the course Apply flow
export async function createStudentLead(input: CreateStudentLeadInput): Promise<CreateStudentLeadResult> {
  try {
    await connectToDatabase()

    // Basic validation
    const isAuthed = Boolean(input.userId)
    if (!isAuthed) {
      if (!input.fullName || !input.email) {
        return { ok: false, error: 'fullName and email are required for guest lead' }
      }
    }

    if (!input.instituteSlug && !input.publicProfileId && !input.instituteId) {
      return { ok: false, error: 'Provide instituteSlug or publicProfileId or instituteId' }
    }

    // Build document
    const doc: Partial<IStudentLead> = {
      userId: input.userId ? new Types.ObjectId(input.userId) : undefined,
      fullName: input.fullName || '',
      email: (input.email || '').toLowerCase().trim(),
      phone: input.phone,
      city: input.city,
      courseId: input.courseId,
      courseName: input.courseName,
      instituteId: input.instituteId,
      instituteSlug: input.instituteSlug?.toLowerCase().trim(),
      publicProfileId: input.publicProfileId?.toLowerCase().trim(),
      isAdminInstitute: Boolean(input.isAdminInstitute),
      message: input.message,
      source: input.source || 'institute_detail_page',
      utm: input.utm,
      status: 'new',
    }

    // Persist
    const created = await StudentLead.create(doc)
    return { ok: true, id: created._id.toString() }
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to create lead' }
  }
}
