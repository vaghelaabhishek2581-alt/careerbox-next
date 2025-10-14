import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectToDatabase } from '@/lib/db/mongoose'
import AdminInstitute from '@/src/models/AdminInstitute'

// POST /api/admin/institutes/bulk - bulk create/update via JSON array
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()
    const payload = await req.json()

    if (!payload || !Array.isArray(payload)) {
      return NextResponse.json({ error: 'Expected an array of institutes' }, { status: 400 })
    }

    // Helper: ensure each course subdocument has a Mongo ObjectId (both legacy courses[] and new programmes[].course[])
    const ensureCourseIds = (doc: any) => {
      const normalizeId = (val: any) => {
        try {
          if (val && mongoose.isValidObjectId(val)) {
            return new mongoose.Types.ObjectId(String(val))
          }
        } catch {}
        return new mongoose.Types.ObjectId()
      }
      // legacy top-level courses
      if (Array.isArray(doc?.courses)) {
        doc.courses = doc.courses.map((c: any) => {
          const explicitId = c?._id || c?.id // accept either _id or id
          const _id = normalizeId(explicitId)
          const { id, ...rest } = c || {};
          return { _id, ...rest };
        })
      }

      // new structure: programmes[].course[] and programmes[].courses[]
      if (Array.isArray(doc?.programmes)) {
        doc.programmes = doc.programmes.map((p: any) => {
          // Handle 'courses' (plural) and convert to 'course' (singular) for schema compatibility
          if (Array.isArray(p?.courses)) {
            p.course = p.courses.map((c: any) => {
              const explicitId = c?._id || c?.id // accept either _id or id
              const _id = normalizeId(explicitId)
              const { id, ...rest } = c || {};
              return { _id, ...rest };
            })
            delete p.courses // remove the plural version
          }
          // Handle 'course' (singular) structure
          else if (Array.isArray(p?.course)) {
            p.course = p.course.map((c: any) => {
              const explicitId = c?._id || c?.id // accept either _id or id
              const _id = normalizeId(explicitId)
              const { id, ...rest } = c || {};
              return { _id, ...rest };
            })
          }
          return p
        })
      }
      return doc
    }

    // Upsert by slug when provided; else by id; else insert
    const ops = payload.map((doc: any) => {
      const normalized: any = ensureCourseIds({ ...doc })
      if (normalized.slug) normalized.slug = String(normalized.slug).trim().toLowerCase()
      const key: any = normalized.slug ? { slug: normalized.slug } : (normalized.id ? { id: normalized.id } : null)
      if (key) {
        return {
          updateOne: {
            filter: key,
            update: { $set: normalized },
            upsert: true,
          },
        }
      }
      return { insertOne: { document: normalized } }
    })

    const result = await AdminInstitute.bulkWrite(ops, { ordered: false })

    return NextResponse.json({ result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Bulk upload failed' }, { status: 500 })
  }
}
