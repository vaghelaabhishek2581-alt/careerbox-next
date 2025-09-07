import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { getSession } from 'next-auth/react'

let io: SocketIOServer

interface SessionUser {
  id: string
  email: string
  name?: string
  role?: string
  lastActive: Date
  socketId: string
}

const activeSessions = new Map<string, SessionUser>()

export const initSocketServer = (server: HTTPServer) => {
  if (io) return io

  io = new SocketIOServer(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  })

  io.use(async (socket, next) => {
    try {
      const session = await getSession({ req: socket.request })
      if (!session) {
        return next(new Error('Unauthorized'))
      }
      socket.data.session = session
      next()
    } catch (error) {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', socket => {
    const userId = socket.data.session?.user?.id
    if (!userId) return

    // Add user to active sessions
    activeSessions.set(userId, {
      id: userId,
      email: socket.data.session.user.email,
      name: socket.data.session.user.name,
      role: socket.data.session.user.role,
      lastActive: new Date(),
      socketId: socket.id
    })

    // Join user-specific room for notifications
    socket.join(`user:${userId}`)

    // If user is admin, join admin room
    if (socket.data.session.user.roles?.includes('admin')) {
      socket.join('admin')
    }

    // Broadcast updated sessions to admin clients
    broadcastActiveSessions()

    socket.on('disconnect', () => {
      activeSessions.delete(userId)
      broadcastActiveSessions()
    })

    socket.on('heartbeat', () => {
      const session = activeSessions.get(userId)
      if (session) {
        session.lastActive = new Date()
        activeSessions.set(userId, session)
        broadcastActiveSessions()
      }
    })
  })

  return io
}

const broadcastActiveSessions = () => {
  const sessions = Array.from(activeSessions.values())
  io.emit('sessions:update', sessions)
}

export const getActiveSessions = () => {
  return Array.from(activeSessions.values())
}

export const getSocketServer = () => io
