// Socket.IO utilities and services
export * from './types'
export * from './auth'
export * from './room-manager'
export * from './profile-validator'
export * from './search-handler'
export * from './user-manager'
export * from './system-monitor'
export * from './notification-service'

// Re-export main socket server functions
export {
  initSocketServer,
  getSocketServer,
  sendNotification,
  sendAdminAlert,
  broadcastSystemUpdate,
  sendUserOnlineStatus,
  sendProfileUpdate,
  sendSearchSuggestions,
  getOnlineUsers,
  getUserStatus,
  getSystemHealth
} from '../../app/api/socket/socket'
