import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import clientPromise from '../../../db'

/**
 * @swagger
 * /api/institutes/search:
 *   get:
 *     summary: Search educational institutes
 *     description: Search institutes by name with autocomplete
 *     tags:
 *       - Institutes
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: List of institutes
 *       401:
 *         description: Unauthorized
 */
export async function GET (request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const state = searchParams.get('state')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query) {
      return NextResponse.json({ institutes: [] })
    }

    const client = await clientPromise
    const db = client.db()

    const filter: any = {
      name: {
        $regex: query,
        $options: 'i'
      }
    }

    if (state) {
      filter.state = state
    }

    const institutes = await db
      .collection('institutes')
      .find(filter)
      .project({
        _id: 1,
        name: 1,
        type: 1,
        state: 1,
        city: 1,
        examBoards: 1
      })
      .limit(limit)
      .toArray()

    return NextResponse.json({ institutes })
  } catch (error) {
    console.error('Error searching institutes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
