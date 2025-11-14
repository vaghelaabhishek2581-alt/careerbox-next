import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongoose'
import StudentLead from '@/src/models/StudentLead'
import AdminInstitute from '@/src/models/AdminInstitute'

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const authResult = await getAuthenticatedUser(request)
    
    if (!authResult?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build filter query
    const filter: any = {
      $or: [
        { userId: authResult.userId },
        { email: authResult.user?.email }
      ]
    }
    
    if (status && status !== 'all') {
      filter.status = status
    }
    
    if (search) {
      filter.$and = [
        filter.$or ? { $or: filter.$or } : {},
        {
          $or: [
            { courseName: { $regex: search, $options: 'i' } },
            { instituteSlug: { $regex: search, $options: 'i' } },
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { status: { $regex: search, $options: 'i' } }
          ]
        }
      ]
    }

    // Build sort query
    const sortQuery: any = {}
    sortQuery[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Get total count for pagination
    const totalCount = await StudentLead.countDocuments(filter)
    
    // Fetch applications with pagination
    const applications = await StudentLead.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean()

    // Enrich applications with institute names
    const enrichedApplications = await Promise.all(
      applications.map(async (app) => {
        let instituteName = app.instituteSlug || 'Institute'
        
        // Try to get the actual institute name
        if (app.instituteId) {
          try {
            const institute = await AdminInstitute.findById(app.instituteId).select('name')
            if (institute) {
              instituteName = institute.name
            }
          } catch (err) {
            console.error('Error fetching institute name:', err)
          }
        }

        return {
          ...app,
          instituteName,
          // Format the response to match the frontend interface
          _id: app._id.toString(),
          createdAt: app.createdAt.toISOString(),
        }
      })
    )

    return NextResponse.json({
      success: true,
      applications: enrichedApplications,
      total: totalCount,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalCount / limit)
    })

  } catch (error) {
    console.error('Error fetching applied courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applied courses' },
      { status: 500 }
    )
  }
}
