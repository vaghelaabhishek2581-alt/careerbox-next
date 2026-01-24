import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectToDatabase } from '@/lib/db/mongoose'
import AdminInstitute from '@/src/models/AdminInstitute'

// GET /api/admin/institutes/[slug]
export async function GET (
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params
  try {
    await connectToDatabase()
    const doc = await AdminInstitute.findOne({ slug: slug.toLowerCase() })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(doc)
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/institutes/[slug]
export async function PATCH (
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params
  try {
    await connectToDatabase()
    const body = await req.json()
    if (body.slug) body.slug = String(body.slug).trim().toLowerCase()

    // Normalize course ids for legacy and programmes to avoid invalid ObjectId errors
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
        // Handle both old 'course' and new 'courses' structure
        if (Array.isArray(p?.course)) {
          p.course = p.course.map((c: any) => {
            const explicitId = c?._id || c?.id
            const _id = normalizeId(explicitId)
            const { id, ...rest } = c || {}
            return { _id, ...rest }
          })
        }
        if (Array.isArray(p?.courses)) {
          p.courses = p.courses.map((c: any) => {
            const explicitId = c?._id || c?.id
            const _id = normalizeId(explicitId)
            const { id, ...rest } = c || {}
            return { _id, ...rest }
          })
        }
        return p
      })
    }

    const updated = await AdminInstitute.findOneAndUpdate(
      { slug: slug.toLowerCase() },
      { $set: body },
      { new: true }
    )
    if (!updated)
      return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(updated)
  } catch (err: any) {
    if (err?.code === 11000) {
      return NextResponse.json(
        { error: 'Duplicate key', details: err.keyValue },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: err.message || 'Failed to update' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/institutes/[slug]
export async function DELETE (
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params
  try {
    await connectToDatabase()
    const res = await AdminInstitute.findOneAndDelete({
      slug: slug.toLowerCase()
    })
    if (!res) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to delete' },
      { status: 500 }
    )
  }
}
