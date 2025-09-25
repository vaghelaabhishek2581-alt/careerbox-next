import type { Socket, Server } from 'socket.io'

/**
 * Connection Events Handler
 * Handles ping/pong for connection testing
 */
export function registerConnectionEvents(socket: Socket, io: Server) {
  // Ping/Pong functionality for connection testing
  socket.on('ping', () => {
    console.log('🏓 Ping received from:', socket.id)
    socket.emit('pong', {
      timestamp: new Date().toISOString(),
      socketId: socket.id
    })
  })
}
