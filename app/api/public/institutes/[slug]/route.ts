import { NextResponse } from 'next/server'
import { getInstituteBySlug } from '@/lib/actions/institute-actions'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: rawSlug } = await params
  const slug = (rawSlug || '').trim()
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
  }

  try {
    const data = await getInstituteBySlug(slug)
    if (!data) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

