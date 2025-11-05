import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectToDatabase } from '@/lib/db/mongoose'
import AdminInstitute from '@/src/models/AdminInstitute'
import { populateSuggestionsFromInstitute, upsertSuggestions } from '@/lib/utils/populate-suggestions'

// POST /api/admin/institutes/bulk - bulk create/update via JSON array
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()
    const payload = await req.json()

    if (!payload || !Array.isArray(payload)) {
      return NextResponse.json({ error: 'Expected an array of institutes' }, { status: 400 })
    }

    // Helper: recursively replace "N/A" with null
    const replaceNAWithNull = (obj: any): any => {
      if (obj === null || obj === undefined) return obj
      if (obj === "N/A" || obj === "n/a") return null
      if (Array.isArray(obj)) return obj.map(replaceNAWithNull)
      if (typeof obj === 'object') {
        const result: any = {}
        for (const key in obj) {
          result[key] = replaceNAWithNull(obj[key])
        }
        return result
      }
      return obj
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
      // First replace N/A with null, then ensure course IDs
      const cleanedDoc = replaceNAWithNull(doc)
      const normalized: any = ensureCourseIds({ ...cleanedDoc })
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

    // Populate search suggestions for all institutes
    try {
      const institutes = await AdminInstitute.find({}).select('publicId name slug logo location programmes courses')
      const allSuggestions = []
      
      for (const institute of institutes) {
        const suggestions = await populateSuggestionsFromInstitute(institute.toObject())
        allSuggestions.push(...suggestions)
      }
      
      await upsertSuggestions(allSuggestions)
    } catch (suggestionError: any) {
      console.error('Failed to populate suggestions:', suggestionError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ result, suggestionsPopulated: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Bulk upload failed' }, { status: 500 })
  }
}
