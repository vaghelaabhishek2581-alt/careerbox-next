import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { getServerSession } from 'next-auth'

export function initSocketServer (server: HTTPServer) {
  const io = new SocketIOServer(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  })

  // Store socket server instance globally for access in API routes
  ;(global as any).socketIo = io

  io.use(async (socket, next) => {
    try {
      const session = await getServerSession()
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

    // Join user-specific room for notifications
    socket.join(`user:${userId}`)

    // If user is admin, join admin room
    if (socket.data.session.user.roles?.includes('admin')) {
      socket.join('admin')
    }

    socket.on('disconnect', () => {
      // Handle cleanup if needed
    })
  })

  return io
}
