import { createServer } from 'node:http'
import next from 'next'
import { Server } from 'socket.io'
import { getServerSession } from 'next-auth'
import { authOptions } from './app/api/auth/[...nextauth]/route'

// ✅ Dynamically choose the allowed origin
const allowedOrigin =
  process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_ORIGIN
    : 'http://localhost:3000'

const dev = process.env.NODE_ENV != 'production'
const hostname = process.env.HOSTNAME || '0.0.0.0'
const port = parseInt(process.env.SOCKET_PORT || process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Socket data interface
interface SocketData {
  userId?: string
  userRole?: string
  userEmail?: string
}

app.prepare().then(() => {
  const httpServer = createServer(handle)
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigin,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
  })

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      // Get session from cookies
      const session = await getServerSession(authOptions)

      if (!session?.user?.id) {
        console.log('❌ Socket authentication failed: No session')
        return next(new Error('Authentication failed'))
      }

      // Store user data in socket
      const socketData = socket as any & { data: SocketData }
      socketData.data = {
        userId: session.user.id,
        userRole: session.user.activeRole || 'user',
        userEmail: session.user.email
      }

      console.log(`✅ Socket authenticated for user: ${session.user.email}`)
      next()
    } catch (error) {
      console.error('Socket authentication error:', error)
      next(new Error('Authentication error'))
    }
  })

  // Tiny in-memory de-dupe per room (MVP)
  const lastByRoom = new Map<string, string>()

  io.on('connection', socket => {
    const socketData = socket as any & { data: SocketData }
    const { userId, userRole, userEmail } = socketData.data

    console.log(`🔌 User connected: ${userEmail} (${userId})`)

    // Join user-specific rooms
    socket.join(`user:${userId}`)
    socket.join(`role:${userRole}`)

    if (userRole === 'admin') {
      socket.join('admin')
    }

    console.log(
      `📋 User ${userEmail} joined rooms: user:${userId}, role:${userRole}`
    )

    // = = == = = = = = = = =
    // Emit and Listen for Events
    // = = == = = = = = = = =

    // Basic ping/pong for connection testing
    socket.on('ping', () => {
      socket.emit('pong')
    })

    // Search suggestions handler
    socket.on('searchSuggestions', async (query: string, callback) => {
      try {
        console.log(`🔍 Search suggestions request from ${userEmail}: ${query}`)
        // Return empty suggestions for now
        callback([])
      } catch (error) {
        console.error('Error handling search suggestions:', error)
        callback([])
      }
    })

    // Status update handler - broadcast to user's connections
    socket.on('updateStatus', status => {
      console.log(`📊 Status update from ${userEmail}: ${status}`)

      // Broadcast to user's room
      socket.to(`user:${userId}`).emit('userStatusUpdate', {
        userId,
        status,
        timestamp: new Date()
      })
    })

    // Activity handler
    socket.on('activity', activity => {
      console.log(`📝 Activity from ${userEmail}: ${activity.action}`)
    })

    // Room management
    socket.on('joinRoom', (room: string) => {
      socket.join(room)
      console.log(`📋 User ${userEmail} joined room: ${room}`)
    })

    socket.on('leaveRoom', (room: string) => {
      socket.leave(room)
      console.log(`📋 User ${userEmail} left room: ${room}`)
    })

    // Join branch room based on branch ID
    socket.on('joinBranch', branchID => {
      socket.join(branchID)
      console.log(`Socket ${socket.id} joined branch: ${branchID}`)
    })

    // Disconnection handling
    socket.on('disconnect', reason => {
      console.log(`🔌 User ${userEmail} disconnected: ${reason}`)

      // Notify user's room about disconnection
      socket.to(`user:${userId}`).emit('userOffline', {
        userId,
        timestamp: new Date()
      })
    })
  })

  // Make io available globally for status endpoint
  global.socketIO = io

  httpServer
    .listen(port, hostname, () => {
      console.log(`Server running on http://${hostname}:${port}`)
      console.log('✅ Socket.IO server initialized with user authentication')
    })
    .on('error', err => {
      console.error('❌ Server failed to start:', err)
    })
})

// Global socket server getter for status endpoint
declare global {
  var socketIO: Server | undefined
}

export function getSocketServer (): Server | undefined {
  return global.socketIO
}
