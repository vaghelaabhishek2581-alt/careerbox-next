import { NextRequest, NextResponse } from 'next/server'
import engine, { initSearchEngine } from '@/lib/search/engine'

export async function GET (request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const city = searchParams.get('city') || undefined
  const state = searchParams.get('state') || undefined
  const type = searchParams.get('type') || undefined
  const level = searchParams.get('level') || undefined
  const programme = searchParams.get('programme') || undefined
  const exam = searchParams.get('exam') || undefined
  const course = searchParams.get('course') || undefined
  const accreditation = searchParams.get('accreditation') || undefined
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const sortByParam = searchParams.get('sortBy')
  const sortBy =
    sortByParam === 'courses' ||
    sortByParam === 'established' ||
    sortByParam === 'name'
      ? sortByParam
      : 'name'
  const sortOrderParam = searchParams.get('sortOrder')
  const sortOrder =
    sortOrderParam === 'asc' || sortOrderParam === 'desc'
      ? sortOrderParam
      : 'asc'

  console.log('\n[API] GET /api/explore', Object.fromEntries(searchParams))
  await initSearchEngine()

  const results = engine.explore({
    city,
    state,
    type,
    level,
    programme,
    exam,
    course,
    accreditation,
    page,
    limit,
    sortBy,
    sortOrder
  })

  return NextResponse.json(results)
}
