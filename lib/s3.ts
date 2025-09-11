// lib/s3.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

// Use the profile bucket name for image uploads
const BUCKET_NAME = process.env.AWS_S3_PROFILE_BUCKET!

// Generate S3 key for file
export function generateS3Key(userId: string, type: 'profile' | 'cover'): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  return `users/${userId}/profile/${type}${randomString}`
}

// Generate presigned URL for upload
export async function generatePresignedUrl(key: string, contentType: string) {
  try {
    if (!BUCKET_NAME) {
      throw new Error('AWS_S3_PROFILE_BUCKET environment variable is not set')
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read', // Make the object publicly readable
      Metadata: {
        'uploaded-at': new Date().toISOString()
      }
    })

    // Generate presigned URL (expires in 1 hour)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    console.log('✅ Presigned upload URL generated successfully', uploadUrl)
    
    // Generate the file URL
    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    console.log('✅ Presigned file URL generated successfully', fileUrl)

    return {
      uploadUrl,
      fileUrl,
      key
    }
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    throw new Error('Failed to generate upload URL')
  }
}

// Validate image file
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 5MB'
    }
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only JPEG, PNG, and WebP images are allowed'
    }
  }

  return { isValid: true }
}

// Delete object from S3
export async function deleteS3Object(key: string): Promise<boolean> {
  try {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    })

    await s3Client.send(command)
    return true
  } catch (error) {
    console.error('Error deleting S3 object:', error)
    return false
  }
}