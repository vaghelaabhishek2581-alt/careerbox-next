import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { Socket } from 'socket.io'

// Import our modular components
import { 
  ServerToClientEvents, 
  ClientToServerEvents, 
  InterServerEvents, 
  SocketData,
  SocketConfig 
} from '@/lib/socket/types'
import { authenticateSocket, setupSocketData } from '@/lib/socket/auth'
import { RoomManager } from '@/lib/socket/room-manager'
import { ProfileValidator } from '@/lib/socket/profile-validator'
import { SearchHandler } from '@/lib/socket/search-handler'
import { UserManager } from '@/lib/socket/user-manager'
import { SystemMonitor } from '@/lib/socket/system-monitor'
import { NotificationService } from '@/lib/socket/notification-service'
import { SocketErrorHandler, ValidationSchemas } from '@/lib/socket/error-handler'

// Global socket server instance
let globalSocketIo: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null

export function initSocketServer(server: HTTPServer): SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> {
  // Socket configuration
  const config: SocketConfig = {
    path: '/api/socket',
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
  }

  // Initialize Socket.IO server
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, config)

  // Store globally for access in API routes
  globalSocketIo = io
  ;(global as any).socketIo = io

  // Initialize services
  const profileValidator = new ProfileValidator()
  const searchHandler = new SearchHandler()
  const userManager = new UserManager()
  const systemMonitor = new SystemMonitor()
  const notificationService = new NotificationService(io)

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const authResult = await authenticateSocket(socket)
      
      if (!authResult.success) {
        return next(new Error(authResult.error || 'Authentication failed'))
      }

      setupSocketData(socket, authResult.session!)
      next()
    } catch (error) {
      console.error('Socket authentication error:', error)
      next(new Error('Authentication error'))
    }
  })

  // Connection handling
  io.on('connection', (socket) => {
    const userId = socket.data.userId
    const userRole = socket.data.userRole

    console.log(`User ${userId} connected with role ${userRole}`)

    // Initialize room manager for this socket
    const roomManager = new RoomManager(socket)

    // Join initial rooms
    roomManager.joinInitialRooms().catch(error => {
      console.error('Error joining initial rooms:', error)
    })

    // Notify others that user is online
    notificationService.sendUserOnlineStatus(userId, true)

    // Update user status in database
    userManager.updateUserStatus(userId, 'online').catch(error => {
      console.error('Error updating user status:', error)
    })

    // ============================================================================
    // PROFILE VALIDATION HANDLER
    // ============================================================================
    
    socket.on('validateProfileId', async (profileId: string, callback) => {
      await SocketErrorHandler.handleAsyncError(
        socket,
        async () => {
          // Validate input
          if (!SocketErrorHandler.validateInput(socket, { profileId }, ValidationSchemas.profileId, 'profile_validation')) {
            return
          }

          const result = await profileValidator.validateProfileId(profileId, userId)
          callback(result)
        },
        'profile_validation'
      )
    })

    // ============================================================================
    // SEARCH SUGGESTIONS HANDLER
    // ============================================================================
    
    socket.on('searchSuggestions', async (query: string, callback) => {
      await SocketErrorHandler.handleAsyncError(
        socket,
        async () => {
          // Validate input
          if (!SocketErrorHandler.validateInput(socket, { query }, ValidationSchemas.searchQuery, 'search_suggestions')) {
            callback([])
            return
          }

          const suggestions = await searchHandler.getSearchSuggestions(query)
          callback(suggestions)
          
          // Log search query for analytics
          searchHandler.logSearchQuery(query, userId).catch(error => {
            console.error('Error logging search query:', error)
          })
        },
        'search_suggestions'
      )
    })

    // ============================================================================
    // ROOM MANAGEMENT HANDLERS
    // ============================================================================
    
    socket.on('joinRoom', async (room: string) => {
      try {
        await roomManager.joinRoom(room)
      } catch (error) {
        console.error('Error joining room:', error)
        socket.emit('error', { 
          code: 'ROOM_JOIN_ERROR', 
          message: 'Failed to join room',
          timestamp: new Date()
        })
      }
    })

    socket.on('leaveRoom', async (room: string) => {
      try {
        await roomManager.leaveRoom(room)
      } catch (error) {
        console.error('Error leaving room:', error)
        socket.emit('error', { 
          code: 'ROOM_LEAVE_ERROR', 
          message: 'Failed to leave room',
          timestamp: new Date()
        })
      }
    })

    // ============================================================================
    // STATUS UPDATE HANDLER
    // ============================================================================
    
    socket.on('updateStatus', async (status) => {
      try {
        socket.data.status = status
        socket.data.lastActivity = new Date()
        
        await userManager.updateUserStatus(userId, status)
        
        // Broadcast status update to relevant rooms
        socket.to(`status:${userId}`).emit('userStatusUpdate', {
          userId,
          status,
          timestamp: new Date()
        })
      } catch (error) {
        console.error('Error updating status:', error)
        socket.emit('error', { 
          code: 'STATUS_UPDATE_ERROR', 
          message: 'Failed to update status',
          timestamp: new Date()
        })
      }
    })

    // ============================================================================
    // TYPING INDICATOR HANDLER
    // ============================================================================
    
    socket.on('typing', (data) => {
      try {
        socket.to(data.room).emit('userTyping', {
          userId,
          isTyping: data.isTyping,
          timestamp: new Date()
        })
      } catch (error) {
        console.error('Error handling typing indicator:', error)
      }
    })

    // ============================================================================
    // ADMIN MONITORING HANDLER
    // ============================================================================
    
    if (userRole === 'admin') {
      socket.on('adminMonitor', (data) => {
        try {
          notificationService.sendAdminAlert({
            type: 'monitoring',
            data,
            severity: 'medium'
          })
        } catch (error) {
          console.error('Error handling admin monitor:', error)
        }
      })
    }

    // ============================================================================
    // ACTIVITY TRACKING HANDLER
    // ============================================================================
    
    socket.on('activity', async (activity) => {
      try {
        socket.data.lastActivity = new Date()
        
        // Log user activity
        await userManager.logUserActivity(userId, activity)
      } catch (error) {
        console.error('Error logging activity:', error)
      }
    })

    // ============================================================================
    // HEARTBEAT HANDLER
    // ============================================================================
    
    socket.on('ping', () => {
      try {
        socket.data.lastActivity = new Date()
        socket.emit('pong')
      } catch (error) {
        console.error('Error handling ping:', error)
      }
    })

    // ============================================================================
    // DISCONNECTION HANDLER
    // ============================================================================
    
    socket.on('disconnect', async (reason) => {
      try {
        console.log(`User ${userId} disconnected: ${reason}`)
        
        // Update user status to offline
        await userManager.updateUserStatus(userId, 'offline')
        
        // Notify others that user is offline
        notificationService.sendUserOnlineStatus(userId, false)
        
        // Leave all rooms
        await roomManager.leaveAllRooms()
      } catch (error) {
        console.error('Error handling disconnect:', error)
      }
    })
  })

  // ============================================================================
  // SYSTEM HEALTH MONITORING
  // ============================================================================
  
  // Start system health monitoring
  systemMonitor.startHealthMonitoring(30000) // Every 30 seconds

  // Send health updates to admin monitoring room
  setInterval(async () => {
    try {
      const health = await systemMonitor.getSystemHealth()
      notificationService.sendSystemHealthUpdate(health)
    } catch (error) {
      console.error('Error sending system health update:', error)
    }
  }, 30000)

  return io
}

// ============================================================================
// EXPORTED FUNCTIONS FOR USE IN API ROUTES
// ============================================================================

export function getSocketServer(): SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null {
  return globalSocketIo
}

export function sendNotification(userId: string, notification: any): void {
  const io = getSocketServer()
  if (io) {
    const notificationService = new NotificationService(io)
    notificationService.sendNotification(userId, notification)
  }
}

export function sendAdminAlert(alert: any): void {
  const io = getSocketServer()
  if (io) {
    const notificationService = new NotificationService(io)
    notificationService.sendAdminAlert(alert)
  }
}

export function broadcastSystemUpdate(update: any): void {
  const io = getSocketServer()
  if (io) {
    const notificationService = new NotificationService(io)
    notificationService.broadcastSystemUpdate(update)
  }
}

export function sendUserOnlineStatus(userId: string, isOnline: boolean): void {
  const io = getSocketServer()
  if (io) {
    const notificationService = new NotificationService(io)
    notificationService.sendUserOnlineStatus(userId, isOnline)
  }
}

export function sendProfileUpdate(userId: string, profileId: string, changes: Record<string, any>): void {
  const io = getSocketServer()
  if (io) {
    const notificationService = new NotificationService(io)
    notificationService.sendProfileUpdate(userId, profileId, changes)
  }
}

export function sendSearchSuggestions(userId: string, suggestions: any[]): void {
  const io = getSocketServer()
  if (io) {
    const notificationService = new NotificationService(io)
    notificationService.sendSearchSuggestions(userId, suggestions)
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function getOnlineUsers(): Promise<string[]> {
  try {
    const userManager = new UserManager()
    return await userManager.getOnlineUsers()
  } catch (error) {
    console.error('Error getting online users:', error)
    return []
  }
}

export async function getUserStatus(userId: string): Promise<string | null> {
  try {
    const userManager = new UserManager()
    return await userManager.getUserStatus(userId)
  } catch (error) {
    console.error('Error getting user status:', error)
    return null
  }
}

export async function getSystemHealth(): Promise<any> {
  try {
    const systemMonitor = new SystemMonitor()
    return await systemMonitor.getSystemHealth()
  } catch (error) {
    console.error('Error getting system health:', error)
    return {
      status: 'unhealthy',
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}