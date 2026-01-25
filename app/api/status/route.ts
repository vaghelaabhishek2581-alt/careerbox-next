import { NextResponse } from 'next/server'
import engine, { initSearchEngine } from '@/lib/search/engine'

export async function GET () {
  await initSearchEngine()

  return NextResponse.json(engine.stats)
}
