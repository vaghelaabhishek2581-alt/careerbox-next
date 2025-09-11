import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { getServerSession } from 'next-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import { UserDocument } from '@/lib/types/unified.types'

// Socket event types
interface ServerToClientEvents {
  notification: (notification: any) => void
  profileUpdate: (data: any) => void
  userOnline: (userId: string) => void
  userOffline: (userId: string) => void
  searchSuggestion: (suggestions: any[]) => void
  systemHealth: (health: any) => void
  adminAlert: (alert: any) => void
}

interface ClientToServerEvents {
  validateProfileId: (profileId: string, callback: (result: any) => void) => void
  searchSuggestions: (query: string, callback: (suggestions: any[]) => void) => void
  joinRoom: (room: string) => void
  leaveRoom: (room: string) => void
  updateStatus: (status: 'online' | 'away' | 'busy' | 'offline') => void
  typing: (data: { room: string; isTyping: boolean }) => void
  adminMonitor: (data: any) => void
}

interface InterServerEvents {
  ping: () => void
}

interface SocketData {
  session: any
  userId: string
  userRole: string
  lastActivity: Date
  status: 'online' | 'away' | 'busy' | 'offline'
}

export function initSocketServer(server: HTTPServer) {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
  })

  // Store socket server instance globally for access in API routes
  ;(global as any).socketIo = io

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const session = await getServerSession()
      if (!session) {
        return next(new Error('Unauthorized'))
      }
      
      socket.data.session = session
      socket.data.userId = session.user.id
      socket.data.userRole = session.user.role || 'user'
      socket.data.lastActivity = new Date()
      socket.data.status = 'online'
      
      next()
    } catch (error) {
      next(new Error('Authentication error'))
    }
  })

  // Connection handling
  io.on('connection', (socket) => {
    const userId = socket.data.userId
    const userRole = socket.data.userRole

    console.log(`User ${userId} connected with role ${userRole}`)

    // Join user-specific room for notifications
    socket.join(`user:${userId}`)
    socket.join(`status:${userId}`)

    // Join role-based rooms
    socket.join(`role:${userRole}`)
    
    // If user is admin, join admin room
    if (userRole === 'admin') {
      socket.join('admin')
      socket.join('admin:monitoring')
    }

    // If user is business or institute, join their specific room
    if (userRole === 'business' || userRole === 'institute') {
      socket.join(`${userRole}:${userId}`)
    }

    // Notify others that user is online
    socket.broadcast.emit('userOnline', userId)

    // Update user status in database
    updateUserStatus(userId, 'online')

    // ============================================================================
    // PROFILE VALIDATION
    // ============================================================================
    
    socket.on('validateProfileId', async (profileId: string, callback) => {
      try {
        const db = await connectToDatabase()
        
        // Check if profile ID is already taken
        const existingUser = await db.collection('users').findOne({
          'personalDetails.publicProfileId': profileId,
          _id: { $ne: userId } // Exclude current user
        })

        const existingBusiness = await db.collection('businesses').findOne({
          'publicProfileId': profileId,
          userId: { $ne: userId }
        })

        const existingInstitute = await db.collection('institutes').findOne({
          'publicProfileId': profileId,
          userId: { $ne: userId }
        })

        const isTaken = !!(existingUser || existingBusiness || existingInstitute)

        callback({
          isValid: !isTaken,
          message: isTaken ? 'This profile ID is already taken' : 'Profile ID is available',
          suggestions: isTaken ? generateProfileIdSuggestions(profileId) : []
        })
      } catch (error) {
        console.error('Profile ID validation error:', error)
        callback({
          isValid: false,
          message: 'Error validating profile ID',
          suggestions: []
        })
      }
    })

    // ============================================================================
    // SEARCH SUGGESTIONS
    // ============================================================================
    
    socket.on('searchSuggestions', async (query: string, callback) => {
      try {
        if (query.length < 2) {
          callback([])
          return
        }

        const db = await connectToDatabase()
        const suggestions = []

        // Search users
        const users = await db.collection('users').find({
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { 'personalDetails.publicProfileId': { $regex: query, $options: 'i' } }
          ]
        }).limit(5).toArray()

        suggestions.push(...users.map(user => ({
          id: user._id.toString(),
          text: user.name,
          type: 'user',
          category: 'users',
          metadata: { profileId: user.personalDetails?.publicProfileId }
        })))

        // Search businesses
        const businesses = await db.collection('businesses').find({
          companyName: { $regex: query, $options: 'i' }
        }).limit(5).toArray()

        suggestions.push(...businesses.map(business => ({
          id: business._id.toString(),
          text: business.companyName,
          type: 'business',
          category: 'businesses',
          metadata: { industry: business.industry }
        })))

        // Search institutes
        const institutes = await db.collection('institutes').find({
          instituteName: { $regex: query, $options: 'i' }
        }).limit(5).toArray()

        suggestions.push(...institutes.map(institute => ({
          id: institute._id.toString(),
          text: institute.instituteName,
          type: 'institute',
          category: 'institutes',
          metadata: { type: institute.type }
        })))

        // Search skills
        const skills = await db.collection('skills').find({
          name: { $regex: query, $options: 'i' }
        }).limit(5).toArray()

        suggestions.push(...skills.map(skill => ({
          id: skill._id.toString(),
          text: skill.name,
          type: 'skill',
          category: 'skills',
          metadata: { category: skill.category }
        })))

        callback(suggestions.slice(0, 10))
      } catch (error) {
        console.error('Search suggestions error:', error)
        callback([])
      }
    })

    // ============================================================================
    // ROOM MANAGEMENT
    // ============================================================================
    
    socket.on('joinRoom', (room: string) => {
      socket.join(room)
      console.log(`User ${userId} joined room: ${room}`)
    })

    socket.on('leaveRoom', (room: string) => {
      socket.leave(room)
      console.log(`User ${userId} left room: ${room}`)
    })

    // ============================================================================
    // STATUS UPDATES
    // ============================================================================
    
    socket.on('updateStatus', async (status: 'online' | 'away' | 'busy' | 'offline') => {
      socket.data.status = status
      socket.data.lastActivity = new Date()
      
      await updateUserStatus(userId, status)
      
      // Broadcast status update to relevant rooms
      socket.to(`status:${userId}`).emit('userStatusUpdate', {
        userId,
        status,
        timestamp: new Date()
      })
    })

    // ============================================================================
    // TYPING INDICATORS
    // ============================================================================
    
    socket.on('typing', (data: { room: string; isTyping: boolean }) => {
      socket.to(data.room).emit('userTyping', {
        userId,
        isTyping: data.isTyping,
        timestamp: new Date()
      })
    })

    // ============================================================================
    // ADMIN MONITORING
    // ============================================================================
    
    if (userRole === 'admin') {
      socket.on('adminMonitor', (data: any) => {
        // Handle admin monitoring requests
        socket.to('admin:monitoring').emit('adminAlert', {
          type: 'monitoring',
          data,
          timestamp: new Date(),
          adminId: userId
        })
      })
    }

    // ============================================================================
    // ACTIVITY TRACKING
    // ============================================================================
    
    socket.on('activity', (activity: any) => {
      socket.data.lastActivity = new Date()
      
      // Log user activity
      logUserActivity(userId, activity)
    })

    // ============================================================================
    // DISCONNECTION HANDLING
    // ============================================================================
    
    socket.on('disconnect', async (reason) => {
      console.log(`User ${userId} disconnected: ${reason}`)
      
      // Update user status to offline
      await updateUserStatus(userId, 'offline')
      
      // Notify others that user is offline
      socket.broadcast.emit('userOffline', userId)
      
      // Clean up any temporary rooms or data
      socket.leave(`user:${userId}`)
      socket.leave(`status:${userId}`)
      socket.leave(`role:${userRole}`)
      
      if (userRole === 'admin') {
        socket.leave('admin')
        socket.leave('admin:monitoring')
      }
    })

    // ============================================================================
    // HEARTBEAT
    // ============================================================================
    
    socket.on('ping', () => {
      socket.data.lastActivity = new Date()
      socket.emit('pong')
    })
  })

  // ============================================================================
  // SYSTEM HEALTH MONITORING
  // ============================================================================
  
  setInterval(async () => {
    const health = await getSystemHealth()
    io.to('admin:monitoring').emit('systemHealth', health)
  }, 30000) // Every 30 seconds

  return io
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function updateUserStatus(userId: string, status: string) {
  try {
    const db = await connectToDatabase()
    await db.collection('users').updateOne(
      { _id: userId },
      { 
        $set: { 
          status,
          lastActiveAt: new Date()
        }
      }
    )
  } catch (error) {
    console.error('Error updating user status:', error)
  }
}

async function logUserActivity(userId: string, activity: any) {
  try {
    const db = await connectToDatabase()
    await db.collection('user_activities').insertOne({
      userId,
      activity,
      timestamp: new Date(),
      ip: activity.ip,
      userAgent: activity.userAgent
    })
  } catch (error) {
    console.error('Error logging user activity:', error)
  }
}

async function getSystemHealth() {
  try {
    const db = await connectToDatabase()
    
    // Get basic system metrics
    const userCount = await db.collection('users').countDocuments()
    const activeUsers = await db.collection('users').countDocuments({
      lastActiveAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
    })
    
    return {
      status: 'healthy',
      timestamp: new Date(),
      metrics: {
        totalUsers: userCount,
        activeUsers,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      }
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date(),
      error: error.message
    }
  }
}

function generateProfileIdSuggestions(profileId: string): string[] {
  const suggestions = []
  const base = profileId.toLowerCase()
  
  // Add numbers
  for (let i = 1; i <= 5; i++) {
    suggestions.push(`${base}${i}`)
  }
  
  // Add random suffix
  const randomSuffix = Math.random().toString(36).substring(2, 6)
  suggestions.push(`${base}${randomSuffix}`)
  
  return suggestions.slice(0, 5)
}

// ============================================================================
// NOTIFICATION FUNCTIONS (for use in API routes)
// ============================================================================

export function sendNotification(userId: string, notification: any) {
  const io = (global as any).socketIo
  if (io) {
    io.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date()
    })
  }
}

export function sendAdminAlert(alert: any) {
  const io = (global as any).socketIo
  if (io) {
    io.to('admin').emit('adminAlert', {
      ...alert,
      timestamp: new Date()
    })
  }
}

export function broadcastSystemUpdate(update: any) {
  const io = (global as any).socketIo
  if (io) {
    io.emit('systemUpdate', {
      ...update,
      timestamp: new Date()
    })
  }
}
