import { NextResponse } from 'next/server'
import { getLeadStats } from '@/lib/actions/student-leads'

export async function GET() {
  try {
    const result = await getLeadStats()
    
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error || 'Failed to fetch lead statistics' }, { status: 400 })
    }
    
    return NextResponse.json({ ok: true, stats: result.stats }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}
