import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

export async function generatePresignedUrl (key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_PROFILE_BUCKET!,
    Key: key,
    ContentType: contentType
  })

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    return {
      uploadUrl: signedUrl,
      fileUrl: `https://${process.env.AWS_S3_PROFILE_BUCKET}.s3.amazonaws.com/${key}`
    }
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    throw error
  }
}

export function generateS3Key (userId: string, type: 'profile' | 'cover') {
  const timestamp = Date.now()
  return `${type}/${userId}/${timestamp}.jpg`
}
