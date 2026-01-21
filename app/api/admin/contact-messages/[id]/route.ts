import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongoose'
import { ContactMessage } from '@/src/models'

// GET - Fetch a single contact message
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

    await connectToDatabase()

    const message = await ContactMessage.findById(id).lean()

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const m = message as any

    return NextResponse.json({
      success: true,
      data: {
        ...m,
        id: m._id?.toString(),
        _id: undefined
      }
    })
  } catch (error) {
    console.error('Error fetching contact message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update a contact message (status, admin notes)
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

    await connectToDatabase()

    const allowedUpdates = ['status', 'adminNotes']
    const updates: any = {}

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updates[key] = body[key]
      }
    }

    // If status is being set to 'replied', add timestamp
    if (updates.status === 'replied') {
      updates.repliedAt = new Date()
      updates.repliedBy = user.id
    }

    const message = await ContactMessage.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).lean()

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const m = message as any

    return NextResponse.json({
      success: true,
      data: {
        ...m,
        id: m._id?.toString(),
        _id: undefined
      },
      message: 'Message updated successfully'
    })
  } catch (error) {
    console.error('Error updating contact message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a single contact message
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

    await connectToDatabase()

    const message = await ContactMessage.findByIdAndDelete(id)

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting contact message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
