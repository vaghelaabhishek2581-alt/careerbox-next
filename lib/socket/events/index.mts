import type { Socket, Server } from 'socket.io'

/**
 * Register essential socket events for a connected socket
 * Only includes: ping/pong, health, and validate events
 * 
 * Note: Individual event handlers are temporarily inlined to avoid import issues
 */
export function registerAllEvents(socket: Socket, io: Server) {
    console.log('📋 Registering essential socket events for:', socket.id)

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

    // Profile validation (basic implementation)
    socket.on('validate:profileId', (data) => {
        // Basic validation response
        socket.emit('profileId:validation', {
            profileId: data.profileId,
            isAvailable: true, // Simplified for now
            timestamp: Date.now()
        })
    })

    console.log('✅ Essential socket events registered for:', socket.id)
}

// Individual event handlers are inlined above for simplicity
// This avoids complex import dependencies during build