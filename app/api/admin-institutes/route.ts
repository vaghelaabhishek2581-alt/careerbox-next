import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import AdminInstitute from '@/src/models/AdminInstitute'

export async function GET() {
  try {
    await connectToDatabase()
    
    // Fetch only essential fields for the dropdown
    const institutes = await AdminInstitute.find(
      {},
      { 
        name: 1,
        slug: 1,
        type: 1,
        'location.city': 1,
        'location.state': 1,
        website: 1,
        contact: 1,
        establishedYear: 1
      }
    ).sort({ name: 1 }).lean()

    return NextResponse.json({ data: institutes })
  } catch (error) {
    console.error('Error fetching admin institutes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch institutes' },
      { status: 500 }
    )
  }
}
