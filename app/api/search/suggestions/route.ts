import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongoose'
import AdminInstitute from '@/src/models/AdminInstitute'
import Institute from '@/src/models/Institute'

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    await connectToDatabase()

    const q = query.trim()
    const rx = new RegExp(escapeRegex(q), 'i')

    // AdminInstitute name suggestions
    const adminInstPromise = AdminInstitute.find(
      { name: rx },
      { slug: 1, name: 1 }
    )
      .limit(8)
      .lean()

    // AdminInstitute course suggestions via aggregation
    const adminCoursePromise = AdminInstitute.aggregate([
      { $unwind: '$courses' },
      { $match: { $or: [ { 'courses.name': rx }, { 'courses.seoUrl': rx } ] } },
      { $project: { _id: 0, instituteSlug: '$slug', instituteName: '$name', courseName: '$courses.name', courseSlug: '$courses.seoUrl' } },
      { $limit: 8 },
    ])

    // Account Institute suggestions
    const accountInstPromise = Institute.find(
      { name: rx },
      { publicProfileId: 1, name: 1 }
    )
      .limit(8)
      .lean()

    const [adminInst, adminCourses, accountInst] = await Promise.all([
      adminInstPromise,
      adminCoursePromise,
      accountInstPromise,
    ])

    const suggestions = [
      // Admin institutes
      ...adminInst.map((i: any) => ({
        type: 'institute' as const,
        source: 'admin' as const,
        label: i.name,
        slug: i.slug,
      })),
      // Account institutes
      ...accountInst.map((i: any) => ({
        type: 'institute' as const,
        source: 'account' as const,
        label: i.name,
        slug: i.publicProfileId,
      })),
      // Courses from admin
      ...adminCourses.map((c: any) => ({
        type: 'course' as const,
        source: 'admin' as const,
        label: `${c.courseName} — ${c.instituteName}`,
        courseName: c.courseName,
        courseSlug: c.courseSlug,
        instituteSlug: c.instituteSlug,
        instituteName: c.instituteName,
      })),
    ]

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    )
  }
}