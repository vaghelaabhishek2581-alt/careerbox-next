import { connectToDatabase } from '@/lib/db/mongodb'
import { UserStatus, UserActivity } from './types'

export class UserManager {
  private db: any

  constructor() {
    this.db = null
  }

  private async getDatabase() {
    if (!this.db) {
      const { db } = await connectToDatabase()
      this.db = db
    }
    return this.db
  }

  /**
   * Update user status in database
   */
  public async updateUserStatus(userId: string, status: UserStatus): Promise<void> {
    try {
      if (!userId || !status) {
        throw new Error('Invalid userId or status')
      }

      const db = await this.getDatabase()
      
      await db.collection('users').updateOne(
        { _id: userId },
        { 
          $set: { 
            status,
            lastActiveAt: new Date(),
            updatedAt: new Date()
          }
        }
      )

      console.log(`Updated user ${userId} status to ${status}`)
    } catch (error) {
      console.error('Error updating user status:', error)
      throw error
    }
  }

  /**
   * Log user activity
   */
  public async logUserActivity(userId: string, activity: UserActivity): Promise<void> {
    try {
      if (!userId || !activity) {
        throw new Error('Invalid userId or activity')
      }

      const db = await this.getDatabase()
      
      await db.collection('user_activities').insertOne({
        userId,
        action: activity.action,
        target: activity.target,
        metadata: activity.metadata || {},
        ip: activity.ip,
        userAgent: activity.userAgent,
        timestamp: new Date()
      })

      console.log(`Logged activity for user ${userId}: ${activity.action}`)
    } catch (error) {
      console.error('Error logging user activity:', error)
      throw error
    }
  }

  /**
   * Get user online status
   */
  public async getUserStatus(userId: string): Promise<UserStatus | null> {
    try {
      const db = await this.getDatabase()
      
      const user = await db.collection('users').findOne(
        { _id: userId },
        { projection: { status: 1, lastActiveAt: 1 } }
      )

      if (!user) {
        return null
      }

      // Check if user is actually online based on last activity
      const lastActive = user.lastActiveAt
      const now = new Date()
      const timeDiff = now.getTime() - lastActive.getTime()
      const fiveMinutes = 5 * 60 * 1000

      // If last activity was more than 5 minutes ago, consider offline
      if (timeDiff > fiveMinutes && user.status === 'online') {
        await this.updateUserStatus(userId, 'offline')
        return 'offline'
      }

      return user.status
    } catch (error) {
      console.error('Error getting user status:', error)
      return null
    }
  }

  /**
   * Get all online users
   */
  public async getOnlineUsers(): Promise<string[]> {
    try {
      const db = await this.getDatabase()
      
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      
      const onlineUsers = await db.collection('users').find({
        status: 'online',
        lastActiveAt: { $gte: fiveMinutesAgo }
      }).toArray()

      return onlineUsers.map((user: any) => user._id.toString())
    } catch (error) {
      console.error('Error getting online users:', error)
      return []
    }
  }

  /**
   * Get user activity history
   */
  public async getUserActivityHistory(
    userId: string, 
    limit: number = 50
  ): Promise<UserActivity[]> {
    try {
      const db = await this.getDatabase()
      
      const activities = await db.collection('user_activities')
        .find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray()

      return activities.map((activity: any) => ({
        action: activity.action,
        target: activity.target,
        metadata: activity.metadata,
        ip: activity.ip,
        userAgent: activity.userAgent
      }))
    } catch (error) {
      console.error('Error getting user activity history:', error)
      return []
    }
  }

  /**
   * Get user statistics
   */
  public async getUserStats(userId: string): Promise<{
    totalActivities: number
    lastActive: Date | null
    status: UserStatus | null
    joinDate: Date | null
  }> {
    try {
      const db = await this.getDatabase()
      
      const [user, activityCount] = await Promise.all([
        db.collection('users').findOne(
          { _id: userId },
          { projection: { status: 1, lastActiveAt: 1, createdAt: 1 } }
        ),
        db.collection('user_activities').countDocuments({ userId })
      ])

      return {
        totalActivities: activityCount,
        lastActive: user?.lastActiveAt || null,
        status: user?.status || null,
        joinDate: user?.createdAt || null
      }
    } catch (error) {
      console.error('Error getting user stats:', error)
      return {
        totalActivities: 0,
        lastActive: null,
        status: null,
        joinDate: null
      }
    }
  }

  /**
   * Clean up old user activities
   */
  public async cleanupOldActivities(daysToKeep: number = 30): Promise<void> {
    try {
      const db = await this.getDatabase()
      
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)
      
      const result = await db.collection('user_activities').deleteMany({
        timestamp: { $lt: cutoffDate }
      })

      console.log(`Cleaned up ${result.deletedCount} old user activities`)
    } catch (error) {
      console.error('Error cleaning up old activities:', error)
      throw error
    }
  }

  /**
   * Update user last activity timestamp
   */
  public async updateLastActivity(userId: string): Promise<void> {
    try {
      const db = await this.getDatabase()
      
      await db.collection('users').updateOne(
        { _id: userId },
        { 
          $set: { 
            lastActiveAt: new Date()
          }
        }
      )
    } catch (error) {
      console.error('Error updating last activity:', error)
      throw error
    }
  }

  /**
   * Get users by status
   */
  public async getUsersByStatus(status: UserStatus): Promise<any[]> {
    try {
      const db = await this.getDatabase()
      
      const users = await db.collection('users').find({
        status
      }).toArray()

      return users
    } catch (error) {
      console.error('Error getting users by status:', error)
      return []
    }
  }

  /**
   * Get user presence data
   */
  public async getUserPresence(userId: string): Promise<{
    status: UserStatus
    lastActive: Date
    isOnline: boolean
  } | null> {
    try {
      const db = await this.getDatabase()
      
      const user = await db.collection('users').findOne(
        { _id: userId },
        { projection: { status: 1, lastActiveAt: 1 } }
      )

      if (!user) {
        return null
      }

      const now = new Date()
      const timeDiff = now.getTime() - user.lastActiveAt.getTime()
      const fiveMinutes = 5 * 60 * 1000
      const isOnline = user.status === 'online' && timeDiff <= fiveMinutes

      return {
        status: user.status,
        lastActive: user.lastActiveAt,
        isOnline
      }
    } catch (error) {
      console.error('Error getting user presence:', error)
      return null
    }
  }
}
