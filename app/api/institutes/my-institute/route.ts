import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Institute } from '@/lib/types/institute.types'
import { ApiResponse } from '@/lib/types/api.types'

// GET /api/institutes/my-institute - Fetch current user's institute
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await connectDB()
    const institutesCollection = db.collection('institutes')

    const institute = await institutesCollection.findOne({ userId: session.user.id })

    if (!institute) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
    }

    const response: ApiResponse<Institute> = {
      success: true,
      data: institute
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching my institute:', error)
    return NextResponse.json(
      { error: 'Failed to fetch institute' },
      { status: 500 }
    )
  }
}
