import { createServer } from 'node:http'
import next from 'next'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'

// Extend Socket interface to include user properties
declare module 'socket.io' {
  interface Socket {
    userId?: string
    userEmail?: string
    authenticated?: boolean
  }
}

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

// Create Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(handle)

  // Initialize Socket.IO server inline
  const io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
      origin: dev
        ? ['http://localhost:3000', 'http://127.0.0.1:3000']
        : process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST'],
      credentials: true
    },
    addTrailingSlash: false,
  })

  // Simple authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token ||
        socket.handshake.query.token ||
        socket.handshake.headers.cookie?.split(';')
          .find(c => c.trim().startsWith('auth-token='))
          ?.split('=')[1]

      if (!token) {
        return next(new Error('Authentication token required'))
      }

      const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET
      if (!jwtSecret) {
        return next(new Error('Server configuration error'))
      }

      const decoded = jwt.verify(token, jwtSecret) as any
      socket.userId = decoded.userId || decoded.sub
      socket.userEmail = decoded.email
      socket.authenticated = true

      next()
    } catch (error) {
      return next(new Error('Authentication failed'))
    }
  })

  // Connection handling with basic events
  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id, socket.userId)

    // Basic ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() })
    })

    // System health check
    socket.on('health', () => {
      socket.emit('health-response', {
        status: 'ok',
        timestamp: Date.now(),
        uptime: process.uptime()
      })
    })

    // Disconnect handling
    socket.on('disconnect', (reason) => {
      console.log('❌ Client disconnected:', socket.id, reason)
    })
  })

  // Make io available globally for status endpoint
  global.socketIO = io

  // Start the server
  httpServer.listen(port, hostname, (err?: Error) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log('🔌 Socket.IO server initialized and ready')
    console.log(`📡 Socket.IO path: /api/socket`)
  })
})

// Global socket server getter for status endpoint
declare global {
  var socketIO: any
}

export function getSocketServer() {
  return global.socketIO
}