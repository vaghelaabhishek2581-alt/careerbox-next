"use server"

import { connectToDatabase } from '@/lib/db/mongoose'
import StudentLead, { IStudentLead } from '@/src/models/StudentLead'
import Profile from '@/src/models/Profile'
import User from '@/src/models/User'
import { Types } from 'mongoose'

export type CreateStudentLeadInput = {
  // Authenticated user id if available
  userId?: string

  // Applicant details (required when userId not provided)
  fullName?: string
  email?: string
  phone?: string
  city?: string
  eligibilityExams?: Array<{ exam: string; score: string }>

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
    
    let fullName = input.fullName
    let email = input.email
    let phone = input.phone
    let city = input.city
    let eligibilityExams = input.eligibilityExams

    // If user is authenticated, fetch their details from Profile
    if (isAuthed && input.userId) {
      try {
        const profile = await Profile.findOne({ userId: new Types.ObjectId(input.userId) })
        const user = await User.findById(new Types.ObjectId(input.userId))

        if (profile && user) {
          // Use profile data
          fullName = `${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`
          email = user.email
          phone = profile.personalDetails.phone || phone
          city = profile.personalDetails.city || city
          eligibilityExams = profile.personalDetails.eligibilityExams || eligibilityExams
        } else {
          // Profile not found, require manual data
          if (!input.fullName || !input.email) {
            return { ok: false, error: 'User profile not found. Please provide fullName and email.' }
          }
        }
      } catch (profileErr) {
        console.error('Error fetching user profile:', profileErr)
        // Fall back to provided data
        if (!input.fullName || !input.email) {
          return { ok: false, error: 'Failed to fetch user profile. Please provide fullName and email.' }
        }
      }
    } else {
      // Guest user - validate required fields
      if (!fullName || !email) {
        return { ok: false, error: 'fullName and email are required for guest lead' }
      }
    }

    if (!input.instituteSlug && !input.publicProfileId && !input.instituteId) {
      return { ok: false, error: 'Provide instituteSlug or publicProfileId or instituteId' }
    }

    // Build document
    const doc: Partial<IStudentLead> = {
      userId: input.userId ? new Types.ObjectId(input.userId) : undefined,
      fullName: fullName || '',
      email: (email || '').toLowerCase().trim(),
      phone: phone,
      city: city,
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
      eligibilityExams: eligibilityExams,
    }

    // Persist
    const created = await StudentLead.create(doc)
    return { ok: true, id: created._id.toString() }
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to create lead' }
  }
}
