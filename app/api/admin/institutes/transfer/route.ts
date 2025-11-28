import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import mongoose from 'mongoose'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import User from '@/src/models/User'
import AdminInstitute from '@/src/models/AdminInstitute'

// Validation schema
const transferSchema = z.object({
    userId: z.string(),
    instituteId: z.string(), // AdminInstitute ID (ObjectId)
})

export async function POST(request: NextRequest) {
    try {
        // Authentication check with admin role requirement
        const authResult = await getAuthenticatedUser(request)
        if (!authResult) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { user } = authResult
        if (!user?.roles?.includes('admin')) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        // Parse and validate request body
        const body = await request.json()
        const validatedData = transferSchema.parse(body)
        const { userId, instituteId } = validatedData

        await connectToDatabase()

        // Verify User exists
        const targetUser = await User.findById(userId)
        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Verify Institute exists
        const institute = await AdminInstitute.findById(instituteId)
        if (!institute) {
            return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
        }

        // Update Institute: Add user to userIds if not present
        // Initialize userIds if it doesn't exist (for old documents)
        if (!institute.userIds) {
            institute.userIds = []
        }
        if (!institute.userIds.some((id: mongoose.Types.ObjectId) => id.toString() === userId)) {
            institute.userIds.push(new mongoose.Types.ObjectId(userId))
            await institute.save()
        }

        // Update User: Add institute to ownedOrganizations and ensure institute role
        await User.findByIdAndUpdate(userId, {
            $addToSet: {
                ownedOrganizations: new mongoose.Types.ObjectId(instituteId),
                roles: 'institute'
            },
            $set: {
                isOrganizationOwner: true,
                updatedAt: new Date()
            }
        })

        // Also set activeRole if user has no active role or wants to switch?
        // We won't force switch activeRole here, but ensure they have the role.

        return NextResponse.json({
            success: true,
            message: 'Institute transferred successfully',
            data: {
                userId,
                instituteId,
                instituteName: institute.name
            }
        })

    } catch (error) {
        console.error('Error transferring institute:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to transfer institute' },
            { status: 500 }
        )
    }
}
