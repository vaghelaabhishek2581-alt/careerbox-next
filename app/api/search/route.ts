import { NextRequest, NextResponse } from 'next/server'
import engine, { initSearchEngine } from '@/lib/search/engine'

export async function GET (request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const q = searchParams.get('q') || undefined
  const typeParam = searchParams.get('type') || undefined
  const type =
    typeParam === 'institute' ||
    typeParam === 'programme' ||
    typeParam === 'course'
      ? typeParam
      : undefined
  const city = searchParams.get('city') || undefined
  const state = searchParams.get('state') || undefined
  const level = searchParams.get('level') || undefined
  const programme = searchParams.get('programme') || undefined
  const exam = searchParams.get('exam') || undefined
  const course = searchParams.get('course') || undefined
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)

  console.log('\n[API] GET /api/search', Object.fromEntries(searchParams))
  await initSearchEngine()

  const results = engine.search({
    q,
    type,
    city,
    state,
    level,
    programme,
    exam,
    course,
    page,
    limit
  })

  return NextResponse.json(results)
}
