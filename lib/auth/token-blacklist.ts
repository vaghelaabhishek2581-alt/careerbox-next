import { connectToDatabase } from '@/lib/db/mongodb'

// Utility function to check if a token is blacklisted (use in middleware or auth checks)
export async function isTokenBlacklisted(tokenId: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()
    const blacklistedToken = await db.collection('blacklisted_tokens').findOne({
      tokenId,
      expiresAt: { $gt: new Date() } // Only check non-expired blacklisted tokens
    })

    return !!blacklistedToken
  } catch (error) {
    console.error('Error checking token blacklist:', error)
    return false
  }
}

// Utility function to blacklist a token
export async function blacklistToken(tokenData: {
  tokenId: string
  userId: string
  email?: string
  expiresAt: Date
}): Promise<void> {
  try {
    const { db } = await connectToDatabase()
    
    await db.collection('blacklisted_tokens').insertOne({
      ...tokenData,
      blacklistedAt: new Date()
    })
  } catch (error) {
    console.error('Error blacklisting token:', error)
    throw error
  }
}
