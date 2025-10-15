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

    // AdminInstitute course suggestions via aggregation (from root courses)
    const adminCoursePromise = AdminInstitute.aggregate([
      { $unwind: '$courses' },
      { $match: { $or: [{ 'courses.name': rx }, { 'courses.seoUrl': rx }] } },
      {
        $project: {
          _id: 0,
          instituteSlug: '$slug',
          instituteName: '$name',
          courseName: '$courses.name',
          courseSlug: '$courses.seoUrl',
        },
      },
      { $limit: 5 },
    ])

    // AdminInstitute programme suggestions via aggregation
    const adminProgrammePromise = AdminInstitute.aggregate([
      { $unwind: '$programmes' },
      { $match: { 'programmes.name': rx } },
      {
        $project: {
          _id: 0,
          instituteSlug: '$slug',
          instituteName: '$name',
          programmeName: '$programmes.name',
        },
      },
      { $limit: 5 },
    ])

    // AdminInstitute course suggestions from within programmes
    const adminProgrammeCoursePromise = AdminInstitute.aggregate([
      { $unwind: '$programmes' },
      { $unwind: '$programmes.course' },
      {
        $match: {
          $or: [
            { 'programmes.course.name': rx },
            { 'programmes.course.seoUrl': rx },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          instituteSlug: '$slug',
          instituteName: '$name',
          courseName: '$programmes.course.name',
          courseSlug: '$programmes.course.seoUrl',
          programmeName: '$programmes.name',
        },
      },
      { $limit: 5 },
    ])

    // Account Institute suggestions
    const accountInstPromise = Institute.find(
      { name: rx },
      { publicProfileId: 1, name: 1 }
    )
      .limit(8)
      .lean()

    const [
      adminInst,
      adminCourses,
      accountInst,
      adminProgrammes,
      adminProgrammeCourses,
    ] = await Promise.all([
      adminInstPromise,
      adminCoursePromise,
      accountInstPromise,
      adminProgrammePromise,
      adminProgrammeCoursePromise,
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
      // Programmes from admin
      ...adminProgrammes.map((p: any) => ({
        type: 'programme' as const,
        source: 'admin' as const,
        label: `${p.programmeName} in ${p.instituteName}`,
        programmeName: p.programmeName,
        instituteSlug: p.instituteSlug,
        instituteName: p.instituteName,
      })),
      // Courses from programmes from admin
      ...adminProgrammeCourses.map((c: any) => ({
        type: 'course' as const,
        source: 'admin' as const,
        label: `${c.courseName} (${c.programmeName}) — ${c.instituteName}`,
        courseName: c.courseName,
        courseSlug: c.courseSlug,
        instituteSlug: c.instituteSlug,
        instituteName: c.instituteName,
        programmeName: c.programmeName,
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