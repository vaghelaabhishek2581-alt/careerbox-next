import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import clientPromise from '../../../db'

/**
 * @swagger
 * /api/companies/search:
 *   get:
 *     summary: Search companies
 *     description: Search companies by name with autocomplete
 *     tags:
 *       - Companies
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: List of companies
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
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query) {
      return NextResponse.json({ companies: [] })
    }

    const client = await clientPromise
    const db = client.db()

    const companies = await db
      .collection('companies')
      .find({
        name: {
          $regex: query,
          $options: 'i'
        }
      })
      .project({
        _id: 1,
        name: 1,
        logo: 1,
        location: 1
      })
      .limit(limit)
      .toArray()

    return NextResponse.json({ companies })
  } catch (error) {
    console.error('Error searching companies:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
