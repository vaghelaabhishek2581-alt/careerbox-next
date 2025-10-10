import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, hasRole } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Lead } from '@/lib/types/lead.types'
import { ApiResponse } from '@/lib/types/api.types'

// PATCH /api/leads/[leadId]/status - Update lead status (admin only)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ leadId: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser(req)
    if (!authResult || !hasRole(authResult.user, 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, user } = authResult
    const { leadId } = await context.params
    const { status, notes } = await req.json()
    await connectToDatabase()
    
    // TODO: This needs to be refactored to use Mongoose models
    return NextResponse.json({ 
      error: 'This endpoint is currently under maintenance. Please use the new lead management system.' 
    }, { status: 503 })
  } catch (error) {
    console.error('Error updating lead status:', error)
    return NextResponse.json(
      { error: 'Failed to update lead status' },
      { status: 500 }
    )
  }
}
