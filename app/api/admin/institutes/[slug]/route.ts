import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongoose'
import AdminInstitute from '@/src/models/AdminInstitute'

// GET /api/admin/institutes/[slug]
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase()
    const slug = params.slug.toLowerCase()
    const doc = await AdminInstitute.findOne({ slug })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(doc)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch' }, { status: 500 })
  }
}

// PATCH /api/admin/institutes/[slug]
export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase()
    const slug = params.slug.toLowerCase()
    const body = await req.json()
    if (body.slug) body.slug = String(body.slug).trim().toLowerCase()

    const updated = await AdminInstitute.findOneAndUpdate({ slug }, { $set: body }, { new: true })
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (err: any) {
    if (err?.code === 11000) {
      return NextResponse.json({ error: 'Duplicate key', details: err.keyValue }, { status: 409 })
    }
    return NextResponse.json({ error: err.message || 'Failed to update' }, { status: 500 })
  }
}

// DELETE /api/admin/institutes/[slug]
export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase()
    const slug = params.slug.toLowerCase()
    const res = await AdminInstitute.findOneAndDelete({ slug })
    if (!res) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete' }, { status: 500 })
  }
}
