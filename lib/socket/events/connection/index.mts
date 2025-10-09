import type { Socket, Server } from 'socket.io'

/**
 * Connection Events Handler
 * Handles ping/pong for connection testing and user room management
 */
export function registerConnectionEvents(socket: Socket, io: Server) {
  // Join user to their personal room for notifications
  if (socket.userId) {
    const userRoom = `user_${socket.userId}`;
    socket.join(userRoom);
    console.log('👤 User joined room:', userRoom, 'Socket:', socket.id);
    
    // Emit connection confirmation
    socket.emit('connected', {
      userId: socket.userId,
      userEmail: socket.userEmail,
      room: userRoom,
      timestamp: new Date().toISOString()
    });
  }

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log('👋 User disconnected:', {
      socketId: socket.id,
      userId: socket.userId,
      reason
    });
  });

  // Ping/Pong functionality for connection testing
  socket.on('ping', () => {
    console.log('🏓 Ping received from:', socket.id)
    socket.emit('pong', {
      timestamp: new Date().toISOString(),
      socketId: socket.id,
      userId: socket.userId
    })
  })
}
