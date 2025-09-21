const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

// Create Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  // Create Socket.IO server
  const io = new Server(httpServer, {
    path: '/socket.io',
    cors: {
      origin: dev
        ? ['http://localhost:3000', 'http://127.0.0.1:3000']
        : process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST'],
      credentials: true
    },
    addTrailingSlash: false,
  })

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id)

    // Send a welcome message immediately
    socket.emit('welcome', {
      message: 'Connected to CareerBox Socket.IO server',
      socketId: socket.id,
      timestamp: new Date().toISOString()
    })

    // Basic message handling
    socket.on('message', (data) => {
      console.log('📨 Message received:', data)
      io.emit('message', data)
    })

    socket.on('custom-event', (data) => {
      console.log('🎯 Custom event received:', data)
      socket.emit('custom-response', { success: true, data })
    })

    // Ping/Pong functionality for connection testing
    socket.on('ping', () => {
      console.log('🏓 Ping received from:', socket.id)
      socket.emit('pong', {
        timestamp: new Date().toISOString(),
        socketId: socket.id
      })
    })

    // User status updates
    socket.on('updateStatus', (status) => {
      console.log('👤 Status update from:', socket.id, 'Status:', status)
      // Broadcast status update to all connected clients
      io.emit('userStatusUpdate', {
        socketId: socket.id,
        status: status,
        timestamp: new Date().toISOString()
      })
    })

    // User online/offline tracking
    socket.on('userOnline', (userId) => {
      console.log('👤 User came online:', userId)
      io.emit('userOnline', userId)
    })

    socket.on('userOffline', (userId) => {
      console.log('👤 User went offline:', userId)
      io.emit('userOffline', userId)
    })

    // Notification handling
    socket.on('notification', (notification) => {
      console.log('📢 Notification received:', notification)
      // Broadcast notification to specific user or all users
      if (notification.userId) {
        socket.to(notification.userId).emit('notification', notification)
      } else {
        io.emit('notification', notification)
      }
    })

    socket.on('markNotificationRead', (notificationId) => {
      console.log('✅ Marking notification as read:', notificationId)
      // Handle notification read status
      socket.emit('notificationRead', { notificationId, success: true })
    })

    socket.on('clearNotifications', () => {
      console.log('🗑️ Clearing notifications for:', socket.id)
      socket.emit('notificationsCleared', { success: true })
    })

    // Search suggestions (fallback to API)
    socket.on('searchSuggestions', (query, callback) => {
      console.log('🔍 Search suggestions requested for:', query)
      // For now, return empty suggestions
      // In a real implementation, you'd query your database
      if (typeof callback === 'function') {
        callback([])
      }
    })

    // Admin monitoring
    socket.on('adminMonitor', (data) => {
      console.log('🔧 Admin monitoring data:', data)
      // Handle admin monitoring requests
      socket.emit('adminResponse', { success: true, data })
    })

    // System health check
    socket.on('systemHealth', () => {
      console.log('🏥 System health check requested')
      socket.emit('systemHealthResponse', {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
      })
    })

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log('❌ User disconnected:', socket.id, 'Reason:', reason)

      // Notify other clients that this user went offline
      io.emit('userOffline', socket.id)
    })

    // Error handling
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error)
    })
  })

  // Start the server
  httpServer.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log('🔌 Socket.IO server initialized and ready')
  })
})
