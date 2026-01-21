import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'

// GET - Fetch a single counselling request
export async function GET (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult
    if (!user?.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const { db } = await connectToDatabase()

    const counsellingRequest = await db
      .collection('counselling_requests')
      .findOne({
        _id: new ObjectId(id)
      })

    if (!counsellingRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: counsellingRequest._id.toString(),
        name: counsellingRequest.name,
        email: counsellingRequest.email,
        phone: counsellingRequest.phone,
        state: counsellingRequest.state,
        city: counsellingRequest.city,
        courseLevel: counsellingRequest.courseLevel,
        courseInterest: counsellingRequest.courseInterest,
        status: counsellingRequest.status,
        submittedAt: counsellingRequest.submittedAt,
        source: counsellingRequest.source,
        adminNotes: counsellingRequest.adminNotes,
        counselorAssigned: counsellingRequest.counselorAssigned,
        contactedAt: counsellingRequest.contactedAt,
        completedAt: counsellingRequest.completedAt
      }
    })
  } catch (error) {
    console.error('Error fetching counselling request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update a counselling request (status, admin notes, counselor)
export async function PATCH (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult
    if (!user?.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const { db } = await connectToDatabase()

    const allowedUpdates = ['status', 'adminNotes', 'counselorAssigned']
    const updates: any = { updatedAt: new Date() }

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updates[key] = body[key]
      }
    }

    // If status is being set to 'contacted', add timestamp
    if (updates.status === 'contacted') {
      updates.contactedAt = new Date()
    }

    // If status is being set to 'completed', add timestamp
    if (updates.status === 'completed') {
      updates.completedAt = new Date()
    }

    const result = await db
      .collection('counselling_requests')
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updates },
        { returnDocument: 'after' }
      )

    if (!result) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result._id.toString(),
        name: result.name,
        email: result.email,
        phone: result.phone,
        state: result.state,
        city: result.city,
        courseLevel: result.courseLevel,
        courseInterest: result.courseInterest,
        status: result.status,
        submittedAt: result.submittedAt,
        source: result.source,
        adminNotes: result.adminNotes,
        counselorAssigned: result.counselorAssigned,
        contactedAt: result.contactedAt,
        completedAt: result.completedAt
      },
      message: 'Request updated successfully'
    })
  } catch (error) {
    console.error('Error updating counselling request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a single counselling request
export async function DELETE (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult
    if (!user?.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const { db } = await connectToDatabase()

    const result = await db.collection('counselling_requests').deleteOne({
      _id: new ObjectId(id)
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Request deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting counselling request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
