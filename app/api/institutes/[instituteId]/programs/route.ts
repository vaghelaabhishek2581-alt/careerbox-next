import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, hasRole } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import Program, { IProgram } from '@/src/models/Program'
import Institute, { IInstitute } from '@/src/models/Institute'
import { z } from 'zod'

// Validation schema for program creation/update
const programSchema = z.object({
    name: z.string().min(1, 'Program name is required').max(200),
    code: z.string().min(1, 'Program code is required').max(20),
    degree: z.enum(['Certificate', 'Diploma', 'Bachelor', 'Master', 'PhD', 'Post Graduate Diploma']),
    field: z.string().min(1, 'Field is required').max(100),
    specialization: z.string().max(100).optional(),
    description: z.string().min(1, 'Description is required').max(5000),
    duration: z.object({
        years: z.number().min(1).max(10),
        months: z.number().min(0).max(11).default(0)
    }),
    mode: z.enum(['full-time', 'part-time', 'online', 'hybrid']),
    eligibilityCriteria: z.object({
        minimumPercentage: z.number().min(0).max(100).optional(),
        requiredQualification: z.string().min(1, 'Required qualification is required'),
        ageLimit: z.object({
            min: z.number().min(16).optional(),
            max: z.number().max(100).optional()
        }).optional(),
        entranceExam: z.string().optional(),
        additionalRequirements: z.array(z.string()).default([])
    }),
    feeStructure: z.object({
        tuitionFee: z.number().min(0),
        admissionFee: z.number().min(0).default(0),
        developmentFee: z.number().min(0).default(0),
        examFee: z.number().min(0).default(0),
        libraryFee: z.number().min(0).default(0),
        labFee: z.number().min(0).default(0),
        hostelFee: z.number().min(0).default(0),
        otherFees: z.number().min(0).default(0),
        totalFee: z.number().min(0),
        currency: z.string().default('INR'),
        paymentStructure: z.enum(['yearly', 'semester', 'monthly']).default('yearly')
    }),
    totalSeats: z.number().min(1),
    admissionStartDate: z.string().datetime().optional(),
    admissionEndDate: z.string().datetime().optional(),
    accreditation: z.array(z.string()).default([]),
    affiliatedUniversity: z.string().optional(),
    approvedBy: z.array(z.string()).default([])
})

// GET - Fetch programs for specific institute
export async function GET(request: NextRequest, context: { params: Promise<{ instituteId: string }> }) {
    try {
        const authResult = await getAuthenticatedUser(request)
        if (!authResult) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { userId, user } = authResult
        const { instituteId } = await context.params

        if (!instituteId) {
            return NextResponse.json({ error: 'Institute ID is required' }, { status: 400 })
        }

        await connectToDatabase()

        // Find institute by ID
        const instituteRaw = await Institute.findById(instituteId).lean()
        if (!instituteRaw) {
            return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
        }

        // Type assertion to resolve Mongoose lean() typing issues
        const institute = instituteRaw as unknown as IInstitute

        // Authorization: Only admin or institute owner can access
        const isAdmin = hasRole(user, 'admin')
        const isOwner = institute.userId.toString() === userId

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: 'Access denied. Only admins and institute owners can access this resource.' }, { status: 403 })
        }

        // Fetch programs for this institute
        const programsRaw = await Program.find({ instituteId: institute._id })
            .sort({ createdAt: -1 })
            .lean()

        // Type assertion for programs array
        const programs = programsRaw as unknown as IProgram[]

        return NextResponse.json({
            success: true,
            programs: programs.map(program => ({
                ...program,
                _id: program._id.toString(),
                instituteId: program.instituteId.toString()
            }))
        })

    } catch (error) {
        console.error('Error fetching programs:', error)
        return NextResponse.json(
            { error: 'Failed to fetch programs' },
            { status: 500 }
        )
    }
}

// POST - Create a new program
export async function POST(request: NextRequest, context: { params: Promise<{ instituteId: string }> }) {
    try {
        const authResult = await getAuthenticatedUser(request)
        if (!authResult) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { userId, user } = authResult
        const { instituteId } = await context.params

        if (!instituteId) {
            return NextResponse.json({ error: 'Institute ID is required' }, { status: 400 })
        }

        const body = await request.json()

        // Validate input
        const validatedData = programSchema.parse(body)

        await connectToDatabase()

        // Find institute by ID
        const instituteRaw = await Institute.findById(instituteId).lean()
        if (!instituteRaw) {
            return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
        }

        // Type assertion to resolve Mongoose lean() typing issues
        const institute = instituteRaw as unknown as IInstitute

        // Authorization: Only admin or institute owner can modify
        const isAdmin = hasRole(user, 'admin')
        const isOwner = institute.userId.toString() === userId

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: 'Access denied. Only admins and institute owners can modify this resource.' }, { status: 403 })
        }

        // Check if program code already exists for this institute
        const existingProgram = await Program.findOne({
            instituteId: institute._id,
            code: validatedData.code
        })
        if (existingProgram) {
            return NextResponse.json(
                { error: 'Program code already exists' },
                { status: 400 }
            )
        }

        // Calculate total credits (can be enhanced later)
        const totalCredits = validatedData.duration.years * 120 // Rough estimate

        // Create new program
        const newProgram = new Program({
            ...validatedData,
            instituteId: institute._id,
            totalCredits,
            availableSeats: validatedData.totalSeats,
            curriculum: [], // Can be added later
            status: 'active'
        })

        await newProgram.save()

        return NextResponse.json({
            success: true,
            message: 'Program created successfully',
            program: {
                ...newProgram.toObject(),
                _id: newProgram._id.toString(),
                instituteId: newProgram.instituteId.toString()
            }
        }, { status: 201 })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            )
        }

        console.error('Error creating program:', error)
        return NextResponse.json(
            { error: 'Failed to create program' },
            { status: 500 }
        )
    }
}
