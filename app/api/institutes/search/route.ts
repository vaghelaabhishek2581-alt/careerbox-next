import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Institute as InstituteModel } from '@/src/models'
import { Institute, InstituteSearchFilters } from '@/lib/types/institute.types'
import { PaginatedResponse } from '@/lib/types/api.types'

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
    const session = await getServerSession(authOptions)
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

    await connectToDatabase()

    const filter: any = {
      instituteName: {
        $regex: query,
        $options: 'i'
      }
    }

    if (state) {
      filter['address.state'] = state
    }

    const institutes = await InstituteModel
      .find(filter)
      .select('_id instituteName type address.state address.city')
      .limit(limit)
      .lean()

    return NextResponse.json({ institutes })
  } catch (error) {
    console.error('Error searching institutes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/institutes/search - Advanced search with filters and pagination
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query, filters, page = 1, limit = 10 } = await req.json()

    await connectToDatabase()

    // Build search query
    const searchQuery: any = { status: 'active' }

    if (query) {
      searchQuery.$or = [
        { instituteName: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { type: { $regex: query, $options: 'i' } }
      ]
    }

    // Apply filters
    if (filters) {
      if (filters.type) searchQuery.type = filters.type
      if (filters.state) searchQuery['address.state'] = filters.state
      if (filters.city) searchQuery['address.city'] = filters.city
      if (filters.isVerified !== undefined) searchQuery.isVerified = filters.isVerified
      if (filters.establishedYear) {
        if (filters.establishedYear.min) searchQuery.establishedYear = { $gte: filters.establishedYear.min }
        if (filters.establishedYear.max) {
          searchQuery.establishedYear = { 
            ...searchQuery.establishedYear, 
            $lte: filters.establishedYear.max 
          }
        }
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit
    const total = await InstituteModel.countDocuments(searchQuery)
    const institutes = await InstituteModel
      .find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const response: PaginatedResponse<Institute> = {
      data: institutes,
      total,
      page,
      limit,
      hasMore: skip + institutes.length < total
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error searching institutes:', error)
    return NextResponse.json(
      { error: 'Failed to search institutes' },
      { status: 500 }
    )
  }
}
