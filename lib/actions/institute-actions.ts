"use server"

import { connectToDatabase } from '@/lib/db/mongoose'
import AdminInstitute from '@/src/models/AdminInstitute'
import Institute from '@/src/models/Institute'
import type { IAdminInstitute } from '@/src/models/AdminInstitute'
import type { IInstitute } from '@/src/models/Institute'

export type CombinedInstitute = {
  admin?: any
  account?: any
}

// Fetch combined institute data by slug without auth
export async function getInstituteBySlug(slug: string): Promise<CombinedInstitute | null> {
  if (!slug) return null
  await connectToDatabase()

  const admin = await AdminInstitute.findOne({ slug: slug.toLowerCase().trim() }).lean<IAdminInstitute | null>()

  // Secondary: Institute account record. Best effort match.
  let account = null as any
  if (admin?.slug) {
    account = await Institute.findOne({ publicProfileId: admin.slug }).lean<IInstitute | null>()
  }
  if (!account && admin?.name) {
    account = await Institute.findOne({ name: admin.name }).lean<IInstitute | null>()
  }
  if (!account) {
    // If admin not found, attempt directly via slug against publicProfileId
    account = await Institute.findOne({ publicProfileId: slug.toLowerCase().trim() }).lean<IInstitute | null>()
  }

  if (!admin && !account) return null
  return { admin, account }
}

// Suggest institutes by name without auth
export async function suggestInstitutesByName(q: string, limit = 10): Promise<Array<{ type: 'admin'|'account'; name: string; slug?: string; publicProfileId?: string; city?: string; state?: string }>> {
  const query = (q || '').trim()
  if (!query) return []
  await connectToDatabase()

  const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')

  const adminMatches = await AdminInstitute.find(
    { name: regex },
    { name: 1, slug: 1, 'location.city': 1, 'location.state': 1 }
  ).limit(limit).lean<Array<Pick<IAdminInstitute, 'name' | 'slug'> & { location?: { city?: string; state?: string } }>>()

  const accountMatches = await Institute.find(
    { name: regex },
    { name: 1, publicProfileId: 1, 'address.city': 1, 'address.state': 1 }
  ).limit(limit).lean<Array<Pick<IInstitute, 'name' | 'publicProfileId'> & { address?: { city?: string; state?: string } }>>()

  const suggestions: Array<{ type: 'admin'|'account'; name: string; slug?: string; publicProfileId?: string; city?: string; state?: string }> = []

  for (const a of adminMatches) {
    suggestions.push({ type: 'admin', name: a.name, slug: a.slug, city: a.location?.city, state: a.location?.state })
  }
  for (const i of accountMatches) {
    suggestions.push({ type: 'account', name: i.name, publicProfileId: i.publicProfileId, city: i.address?.city, state: i.address?.state })
  }

  // De-duplicate by name+slug/id and cap to limit
  const seen = new Set<string>()
  const unique: typeof suggestions = []
  for (const s of suggestions) {
    const key = `${s.type}:${s.slug || s.publicProfileId || s.name}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(s)
    if (unique.length >= limit) break
  }
  return unique
}

