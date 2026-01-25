import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectToDatabase } from '@/lib/db/mongoose'
import AdminInstitute from '@/src/models/AdminInstitute'

// GET /api/admin/institutes - list with pagination and search
export async function GET (req: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)
    const q = (searchParams.get('q') || '').trim()

    const filter: any = {}
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { slug: { $regex: q, $options: 'i' } },
        { 'location.city': { $regex: q, $options: 'i' } },
        { 'location.state': { $regex: q, $options: 'i' } }
      ]
    }

    const [items, total] = await Promise.all([
      AdminInstitute.find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      AdminInstitute.countDocuments(filter)
    ])

    return NextResponse.json({ items, total, page, limit })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to list institutes' },
      { status: 500 }
    )
  }
}

// POST /api/admin/institutes - create single admin institute
export async function POST (req: NextRequest) {
  try {
    await connectToDatabase()
    const body = await req.json()

    if (!body?.name || !body?.slug) {
      return NextResponse.json(
        { error: 'name and slug are required' },
        { status: 400 }
      )
    }

    // enforce slug normalization similar to schema
    body.slug = String(body.slug).trim().toLowerCase()

    // Normalize course ids for legacy and programmes
    const normalizeId = (val: any) =>
      val && mongoose.isValidObjectId(val)
        ? new mongoose.Types.ObjectId(String(val))
        : new mongoose.Types.ObjectId()
    if (Array.isArray(body?.courses)) {
      body.courses = body.courses.map((c: any) => {
        const explicitId = c?._id || c?.id
        const _id = normalizeId(explicitId)
        const { id, ...rest } = c || {}
        return { _id, ...rest }
      })
    }
    if (Array.isArray(body?.programmes)) {
      body.programmes = body.programmes.map((p: any) => {
        // Normalize programme _id
        const pId = p?._id || p?.id
        const programmeId = normalizeId(pId)

        // Handle both old 'course' and new 'courses' structure
        let normalizedCourses = p?.course || p?.courses || []
        if (Array.isArray(normalizedCourses)) {
          normalizedCourses = normalizedCourses.map((c: any) => {
            const explicitId = c?._id || c?.id
            const _id = normalizeId(explicitId)
            const { id, ...rest } = c || {}
            return { _id, ...rest }
          })
        }

        const { id, _id: oldId, course, courses, ...restP } = p || {}
        return { _id: programmeId, ...restP, course: normalizedCourses }
      })
    }

    const created = await AdminInstitute.create(body)

    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    if (err?.code === 11000) {
      return NextResponse.json(
        { error: 'Duplicate key', details: err.keyValue },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: err.message || 'Failed to create institute' },
      { status: 500 }
    )
  }
}
