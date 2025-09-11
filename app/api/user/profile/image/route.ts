// app/api/user/profile/image/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generatePresignedUrl, generateS3Key } from '@/lib/s3'
import { authenticateRequest } from '@/lib/auth'
import clientPromise from '../../../db'
import { ObjectId } from 'mongodb'
import { DatabaseUser } from '../route'

const imageRequestSchema = z.object({
  type: z.enum(['profile', 'cover']),
  contentType: z
    .string()
    .refine(
      type => ['image/jpeg', 'image/png', 'image/webp'].includes(type),
      'Only JPEG, PNG and WebP images are allowed'
    )
})

export async function POST(request: NextRequest) {
  try {
    console.log('=== Image Upload API Debug ===')
    
    // Check for required environment variables
    const requiredEnvVars = [
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY', 
      'AWS_S3_PROFILE_BUCKET',
      'AWS_REGION'
    ]
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
    
    if (missingEnvVars.length > 0) {
      console.log('❌ Missing environment variables:', missingEnvVars)
      return NextResponse.json(
        { error: 'Server configuration error', details: `Missing: ${missingEnvVars.join(', ')}` },
        { status: 500 }
      )
    }

    const authUser = await authenticateRequest(request)
    if (!authUser) {
      console.log('❌ Authentication failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ User authenticated:', { id: authUser.id, email: authUser.email })

    const data = await request.json()
    console.log('Upload request data:', data)
    
    const { type, contentType } = imageRequestSchema.parse(data)
    console.log('✅ Data validation passed:', { type, contentType })

    // Generate S3 key and presigned URL
    const key = generateS3Key(authUser.id, type)
    console.log('Generated S3 key:', key)

    const { uploadUrl, fileUrl } = await generatePresignedUrl(key, contentType)

    console.log('✅ Presigned upload URL generated successfully', uploadUrl)
    console.log('✅ Presigned file URL generated successfully', fileUrl)

    // Update user profile with new image URL in database
    const client = await clientPromise
    const db = client.db()
    
    // Determine the correct field name for the database update
    const updateField = type === 'profile' ? 'profileImage' : 'coverImage'
    
    // Find and update user in a single operation
    let updateResult
    
    try {
      // Try with ObjectId first if the ID is valid
      if (ObjectId.isValid(authUser.id)) {
        console.log('Attempting update with ObjectId:', authUser.id)
        updateResult = await db.collection('users').findOneAndUpdate(
          { _id: new ObjectId(authUser.id) },
          { 
            $set: { 
              [updateField]: fileUrl,
              updatedAt: new Date()
            } 
          },
          { 
            returnDocument: 'after',
            projection: { password: 0 }
          }
        )
      } else {
        // Try with string ID
        console.log('Attempting update with string ID:', authUser.id)
        updateResult = await db.collection('users').findOneAndUpdate(
          { _id: authUser.id as any },
          { 
            $set: { 
              [updateField]: fileUrl,
              updatedAt: new Date()
            } 
          },
          { 
            returnDocument: 'after',
            projection: { password: 0 }
          }
        )
      }
      
      // If still no result, try finding by email as fallback
      if (!updateResult?.value && authUser.email) {
        console.log('Attempting update with email:', authUser.email)
        updateResult = await db.collection('users').findOneAndUpdate(
          { email: authUser.email },
          { 
            $set: { 
              [updateField]: fileUrl,
              updatedAt: new Date()
            } 
          },
          { 
            returnDocument: 'after',
            projection: { password: 0 }
          }
        )
      }
      
    } catch (dbError) {
      console.error('❌ Database update error:', dbError)
      return NextResponse.json(
        { error: 'Database update failed', details: (dbError as Error).message },
        { status: 500 }
      )
    }

    if (!updateResult?.value) {
      console.log('❌ User not found for update. Auth ID:', authUser.id, 'Email:', authUser.email)
      
      // Let's try to find the user to debug
      let debugUser = null
      try {
        if (ObjectId.isValid(authUser.id)) {
          debugUser = await db.collection('users').findOne({ _id: new ObjectId(authUser.id) })
        } else {
          debugUser = await db.collection('users').findOne({ _id: authUser.id as any })
        }
        if (!debugUser && authUser.email) {
          debugUser = await db.collection('users').findOne({ email: authUser.email })
        }
        console.log('Debug - User exists:', !!debugUser, debugUser ? { _id: debugUser._id, email: debugUser.email } : 'Not found')
      } catch (debugError) {
        console.log('Debug query failed:', debugError)
      }
      
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updatedUser = updateResult.value as DatabaseUser
    console.log('✅ Database updated successfully. Updated field:', updateField, 'New URL:', fileUrl)
    console.log('✅ User found and updated:', { 
      id: updatedUser._id, 
      email: updatedUser.email,
      [updateField]: updatedUser[updateField as keyof DatabaseUser]
    })

    return NextResponse.json({ 
      uploadUrl, 
      fileUrl,
      key,
      message: 'Upload URL generated and profile updated successfully',
      updatedField: updateField,
      userId: updatedUser._id
    })
  } catch (error) {
    console.error('❌ Error handling image upload:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}

// Health check endpoint for image upload service
export async function GET(request: NextRequest) {
  try {
    const requiredEnvVars = [
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'AWS_S3_PROFILE_BUCKET', 
      'AWS_REGION'
    ]
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
    
    return NextResponse.json({
      status: 'ok',
      service: 'image-upload',
      configured: missingEnvVars.length === 0,
      missingEnvVars: missingEnvVars.length > 0 ? missingEnvVars : undefined,
      bucket: process.env.AWS_S3_PROFILE_BUCKET,
      region: process.env.AWS_REGION
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        error: (error as Error).message
      },
      { status: 500 }
    )
  }
}