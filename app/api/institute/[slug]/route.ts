import { NextRequest, NextResponse } from 'next/server'
export async function GET (
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  console.log(`\n[API] GET /api/institute/${slug}`)
  return NextResponse.json(
    { error: 'Institute detail is not implemented', slug },
    { status: 501 }
  )
}
