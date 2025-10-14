import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongoose'
import AdminInstitute from '@/src/models/AdminInstitute'

// GET /api/admin/institutes - list with pagination and search
export async function GET(req: NextRequest) {
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
        { 'location.state': { $regex: q, $options: 'i' } },
      ]
    }

    const [items, total] = await Promise.all([
      AdminInstitute.find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      AdminInstitute.countDocuments(filter),
    ])

    return NextResponse.json({ items, total, page, limit })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to list institutes' }, { status: 500 })
  }
}

// POST /api/admin/institutes - create single admin institute
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()
    const body = await req.json()

    if (!body?.name || !body?.slug) {
      return NextResponse.json({ error: 'name and slug are required' }, { status: 400 })
    }

    // enforce slug normalization similar to schema
    body.slug = String(body.slug).trim().toLowerCase()

    const created = await AdminInstitute.create(body)
    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    if (err?.code === 11000) {
      return NextResponse.json({ error: 'Duplicate key', details: err.keyValue }, { status: 409 })
    }
    return NextResponse.json({ error: err.message || 'Failed to create institute' }, { status: 500 })
  }
}
