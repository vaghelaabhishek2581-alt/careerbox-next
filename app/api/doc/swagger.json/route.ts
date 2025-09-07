export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { specs } from '@/lib/swagger'

export async function GET () {
  return NextResponse.json(specs)
}
