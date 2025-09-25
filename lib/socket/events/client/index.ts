import type { Socket } from 'socket.io-client'

/**
 * Register essential client-side socket event listeners
 * Only includes: pong, profileId:validation, and systemHealthResponse
 */
export function registerClientEventListeners(socket: Socket) {
  console.log('📋 Registering essential client-side socket event listeners for:', socket.id)

  // Connection events - pong response
  socket.on('pong', (data) => {
    console.log('🏓 Pong received:', data)
  })

  // Profile events - validation response
  socket.on('profileId:validation', (data) => {
    console.log('🔍 Client received profileId:validation event:', {
      data,
      timestamp: new Date().toISOString(),
      socketId: socket.id
    })
  })

  // System events - health response
  socket.on('systemHealthResponse', (data) => {
    console.log('🏥 System health response:', data)
  })

  console.log('✅ Essential client-side socket event listeners registered')
}

/**
 * Remove essential client-side event listeners
 */
export function removeClientEventListeners(socket: Socket) {
  console.log('🧹 Removing essential client-side socket event listeners')
  
  const events = [
    'pong',
    'profileId:validation',
    'systemHealthResponse'
  ]

  events.forEach(event => {
    socket.off(event)
  })

  console.log('✅ Essential client-side socket event listeners removed')
}
