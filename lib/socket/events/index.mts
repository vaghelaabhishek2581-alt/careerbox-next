import type { Socket, Server } from 'socket.io'

// Import essential event handlers
import { registerConnectionEvents } from './connection/index.mjs'
import { registerProfileEvents } from './profile/index.mjs'
import { registerSystemEvents } from './system/index.mjs'

/**
 * Register essential socket events for a connected socket
 * Only includes: ping/pong, health, and validate events
 */
export function registerAllEvents(socket: Socket, io: Server) {
    console.log('📋 Registering essential socket events for:', socket.id)

    // Register only essential events
    registerConnectionEvents(socket, io) // ping/pong
    registerProfileEvents(socket, io)    // validate
    registerSystemEvents(socket, io)     // health

    console.log('✅ Essential socket events registered for:', socket.id)
}

// Export individual event handlers for selective use
export {
    registerConnectionEvents,
    registerProfileEvents,
    registerSystemEvents
}