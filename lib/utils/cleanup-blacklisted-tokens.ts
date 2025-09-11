import { connectToDatabase } from '@/lib/db/mongodb'

/**
 * Clean up expired blacklisted tokens
 */
export async function cleanupBlacklistedTokens(): Promise<{
  success: boolean
  deletedCount?: number
  error?: string
}> {
  try {
    const { db } = await connectToDatabase()
    
    // Delete expired blacklisted tokens
    const result = await db.collection('blacklisted_tokens').deleteMany({
      expiresAt: { $lt: new Date() }
    })
    
    console.log(`Cleaned up ${result.deletedCount} expired blacklisted tokens`)
    
    return {
      success: true,
      deletedCount: result.deletedCount
    }
  } catch (error) {
    console.error('Error cleaning up blacklisted tokens:', error)
    return {
      success: false,
      error: 'Failed to clean up blacklisted tokens'
    }
  }
}

/**
 * Remove specific blacklisted token
 */
export async function removeBlacklistedToken(tokenId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { db } = await connectToDatabase()
    
    await db.collection('blacklisted_tokens').deleteOne({
      tokenId
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error removing blacklisted token:', error)
    return {
      success: false,
      error: 'Failed to remove blacklisted token'
    }
  }
}
