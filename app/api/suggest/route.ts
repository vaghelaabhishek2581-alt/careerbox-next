import { NextRequest, NextResponse } from 'next/server'
import engine, { initSearchEngine } from '@/lib/search/engine'
import { searchCities } from '@/lib/utils/indian-locations'

export async function GET (request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const q = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '8', 10)

  console.log(`\n[API] GET /api/suggest?q=${q}`)
  if (!q) {
    return NextResponse.json({ error: 'q required' }, { status: 400 })
  }

  await initSearchEngine()

  const [suggestions, locations] = await Promise.all([
    engine.suggest(q, limit),
    searchCities(q)
  ])

  return NextResponse.json({
    ...suggestions,
    locations: (locations || []).slice(0, 6)
  })
}
