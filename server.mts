import { createServer } from 'node:http'
import next from 'next'
import { initializeSocketServer } from './lib/socket/server.mjs'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

// Create Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(handle)

  // Initialize Socket.IO server using separate module
  const io = initializeSocketServer(httpServer, dev)

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