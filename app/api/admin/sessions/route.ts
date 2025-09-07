import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getActiveSessions } from '@/lib/socket/socket-server'

export async function GET () {
  try {
    const session = await getServerSession()

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const activeSessions = getActiveSessions()
    return NextResponse.json({ sessions: activeSessions })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
