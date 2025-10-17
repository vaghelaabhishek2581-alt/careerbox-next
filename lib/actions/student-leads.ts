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

export type GetAllStudentLeadsResult = {
  ok: boolean
  leads?: IStudentLead[]
  totalCount?: number
  totalPages?: number
  currentPage?: number
  error?: string
}

export type GetStudentLeadsParams = {
  page?: number
  limit?: number
  search?: string
  status?: string
  sortBy?: 'createdAt' | 'fullName' | 'email' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export type UpdateLeadStatusResult = {
  ok: boolean
  error?: string
}

export type GetLeadStatsResult = {
  ok: boolean
  stats?: {
    total: number
    new: number
    contacted: number
    qualified: number
    enrolled: number
    rejected: number
  }
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

// Get all student leads for admin (legacy - no pagination)
export async function getAllStudentLeads(): Promise<GetAllStudentLeadsResult> {
  try {
    await connectToDatabase()
    
    const leads = await StudentLead.find({})
      .sort({ createdAt: -1 })
      .lean()
    
    return { ok: true, leads: leads as IStudentLead[] }
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to fetch leads' }
  }
}

// Get student leads with pagination and filtering
export async function getStudentLeads(params: GetStudentLeadsParams = {}): Promise<GetAllStudentLeadsResult> {
  try {
    await connectToDatabase()
    
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params

    // Build filter query
    const filter: any = {}
    
    if (status && status !== 'all') {
      filter.status = status
    }
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { courseName: { $regex: search, $options: 'i' } },
        { instituteSlug: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ]
    }

    // Build sort query
    const sortQuery: any = {}
    sortQuery[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Get total count for pagination
    const totalCount = await StudentLead.countDocuments(filter)
    const totalPages = Math.ceil(totalCount / limit)
    
    // Get paginated results
    const leads = await StudentLead.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean()
    
    return { 
      ok: true, 
      leads: leads as IStudentLead[],
      totalCount,
      totalPages,
      currentPage: page
    }
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to fetch leads' }
  }
}

// Update lead status
export async function updateLeadStatus(leadId: string, status: 'new' | 'contacted' | 'qualified' | 'enrolled' | 'rejected'): Promise<UpdateLeadStatusResult> {
  try {
    await connectToDatabase()
    
    const validStatuses = ['new', 'contacted', 'qualified', 'enrolled', 'rejected']
    if (!validStatuses.includes(status)) {
      return { ok: false, error: 'Invalid status' }
    }
    
    const updated = await StudentLead.findByIdAndUpdate(
      leadId,
      { status },
      { new: true }
    )
    
    if (!updated) {
      return { ok: false, error: 'Lead not found' }
    }
    
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to update lead status' }
  }
}

// Get lead statistics by status
export async function getLeadStats(): Promise<GetLeadStatsResult> {
  try {
    await connectToDatabase()
    
    const pipeline = [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]
    
    const results = await StudentLead.aggregate(pipeline)
    const totalCount = await StudentLead.countDocuments({})
    
    const stats = {
      total: totalCount,
      new: 0,
      contacted: 0,
      qualified: 0,
      enrolled: 0,
      rejected: 0
    }
    
    results.forEach((result: any) => {
      if (result._id && stats.hasOwnProperty(result._id)) {
        (stats as any)[result._id] = result.count
      }
    })
    
    return { ok: true, stats }
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to fetch lead statistics' }
  }
}
