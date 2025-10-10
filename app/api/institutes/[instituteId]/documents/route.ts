import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, hasRole } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import Institute, { IInstitute } from '@/src/models/Institute'
import { ApiResponse } from '@/lib/types/api.types'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { z } from 'zod'

// Document validation schema
const documentSchema = z.object({
  type: z.enum(['pan_card', 'gst_certificate', 'cin_certificate', 'trade_license', 'msme_certificate', 'other']),
  name: z.string().min(1, 'Document name is required'),
  description: z.string().optional(),
})

// GET /api/institutes/[instituteId]/documents - Get all documents for specific institute
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
      data: institute.documents || [],
      message: 'Documents retrieved successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

// POST /api/institutes/[instituteId]/documents - Upload a new document
export async function POST(req: NextRequest, context: { params: Promise<{ instituteId: string }> }) {
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

    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate document data
    const validationResult = documentSchema.safeParse({ type, name, description })
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid document data', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    // Validate file type and size
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, JPEG, PNG files are allowed' },
        { status: 400 }
      )
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Find the institute by ID
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

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'institutes', instituteId, 'documents')
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${type}_${timestamp}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = new Uint8Array(bytes)
    await writeFile(filePath, buffer)

    // Create document object
    const document = {
      id: timestamp.toString(),
      type: validationResult.data.type,
      name: validationResult.data.name,
      description: validationResult.data.description,
      fileName,
      url: `/uploads/institutes/${instituteId}/documents/${fileName}`,
      uploadedAt: new Date().toISOString(),
      status: 'pending' as const,
      fileSize: file.size,
      mimeType: file.type
    }

    // Update institute with new document
    const updatedInstitute = await Institute.findByIdAndUpdate(
      instituteId,
      { 
        $push: { documents: document },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    )

    const response: ApiResponse<any> = {
      success: true,
      data: document,
      message: 'Document uploaded successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}

// DELETE /api/institutes/[instituteId]/documents - Delete a document
export async function DELETE(req: NextRequest, context: { params: Promise<{ instituteId: string }> }) {
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

    const { searchParams } = new URL(req.url)
    const documentId = searchParams.get('id')

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
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
        $pull: { documents: { id: documentId } },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    )

    if (!updatedInstitute) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 404 })
    }

    const response: ApiResponse<any> = {
      success: true,
      data: { documentId },
      message: 'Document deleted successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
