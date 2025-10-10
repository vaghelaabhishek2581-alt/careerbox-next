import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, hasRole } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import Institute, { IInstitute } from '@/src/models/Institute'
import { ApiResponse } from '@/lib/types/api.types'
import { z } from 'zod'

// Registration details validation schema
const registrationDetailsSchema = z.object({
    panNumber: z.string().min(10, 'PAN number must be 10 characters').max(10),
    gstNumber: z.string().min(15, 'GST number must be 15 characters').max(15),
    cinNumber: z.string().optional(),
    tanNumber: z.string().optional(),
    tradeLicenseNumber: z.string().optional(),
    licenseExpiryDate: z.string().optional(),
    msmeRegistrationNumber: z.string().optional(),
    importExportCode: z.string().optional(),
})

// GET /api/institutes/[instituteId]/registration-details - Get registration details for specific institute
export async function GET(req: NextRequest, context: { params: Promise<{ instituteId: string }> }) {
    try {
        const auth = await getAuthenticatedUser(req)
        if (!auth?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { userId, user } = auth
        const { instituteId } = await context.params

        if (!instituteId) {
            return NextResponse.json({ error: 'Institute ID is required' }, { status: 400 })
        }

        await connectToDatabase()

        // Find the institute by ID
        const instituteRaw = await Institute.findById(instituteId).lean().exec()
        if (!instituteRaw) {
            return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
        }

        const institute = instituteRaw as unknown as IInstitute

        // Authorization: Only admin or institute owner can access
        const isAdmin = hasRole(user, 'admin')
        const isOwner = institute.userId.toString() === userId

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: 'Access denied. Only admins and institute owners can access this resource.' }, { status: 403 })
        }

        const response: ApiResponse<any> = {
            success: true,
            data: institute.registrationDetails || {},
            message: 'Registration details retrieved successfully'
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Error fetching registration details:', error)
        return NextResponse.json(
            { error: 'Failed to fetch registration details' },
            { status: 500 }
        )
    }
}

// PATCH /api/institutes/[instituteId]/registration-details - Update registration details
export async function PATCH(req: NextRequest, context: { params: Promise<{ instituteId: string }> }) {
    try {
        const auth = await getAuthenticatedUser(req)
        if (!auth?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { userId, user } = auth
        const { instituteId } = await context.params

        if (!instituteId) {
            return NextResponse.json({ error: 'Institute ID is required' }, { status: 400 })
        }

        const body = await req.json()

        // Validate the request body
        const validationResult = registrationDetailsSchema.safeParse(body)
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid registration details', details: validationResult.error.errors },
                { status: 400 }
            )
        }

        await connectToDatabase()

        // Verify institute exists and user has access
        const instituteRaw = await Institute.findById(instituteId).lean().exec()
        if (!instituteRaw) {
            return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
        }

        const institute = instituteRaw as unknown as IInstitute

        // Authorization: Only admin or institute owner can modify
        const isAdmin = hasRole(user, 'admin')
        const isOwner = institute.userId.toString() === userId

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: 'Access denied. Only admins and institute owners can modify this resource.' }, { status: 403 })
        }

        // Find and update the institute
        const updatedInstitute = await Institute.findByIdAndUpdate(
            instituteId,
            {
                $set: {
                    registrationDetails: validationResult.data,
                    updatedAt: new Date()
                }
            },
            { new: true }
        )

        if (!updatedInstitute) {
            return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
        }

        const response: ApiResponse<any> = {
            success: true,
            data: updatedInstitute.registrationDetails,
            message: 'Registration details updated successfully'
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Error updating registration details:', error)
        return NextResponse.json(
            { error: 'Failed to update registration details' },
            { status: 500 }
        )
    }
}
