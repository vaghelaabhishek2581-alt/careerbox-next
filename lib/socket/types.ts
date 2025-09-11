// Socket.IO Type Definitions
export interface ServerToClientEvents {
  notification: (notification: NotificationData) => void
  profileUpdate: (data: ProfileUpdateData) => void
  userOnline: (userId: string) => void
  userOffline: (userId: string) => void
  searchSuggestion: (suggestions: SearchSuggestion[]) => void
  systemHealth: (health: SystemHealthData) => void
  adminAlert: (alert: AdminAlertData) => void
  userStatusUpdate: (data: UserStatusUpdate) => void
  userTyping: (data: TypingData) => void
  systemUpdate: (update: SystemUpdateData) => void
  pong: () => void
  error: (error: { code: string; message: string; timestamp: Date }) => void
}

export interface ClientToServerEvents {
  validateProfileId: (profileId: string, callback: (result: ProfileValidationResult) => void) => void
  searchSuggestions: (query: string, callback: (suggestions: SearchSuggestion[]) => void) => void
  joinRoom: (room: string) => void
  leaveRoom: (room: string) => void
  updateStatus: (status: UserStatus) => void
  typing: (data: { room: string; isTyping: boolean }) => void
  adminMonitor: (data: AdminMonitorData) => void
  activity: (activity: UserActivity) => void
  ping: () => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {
  session: any
  userId: string
  userRole: UserRole
  lastActivity: Date
  status: UserStatus
}

// Data Types
export interface NotificationData {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'application' | 'system' | 'social' | 'admin'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  actionUrl?: string
  metadata?: Record<string, any>
}

export interface ProfileUpdateData {
  userId: string
  profileId: string
  changes: Record<string, any>
  timestamp: Date
}

export interface SearchSuggestion {
  id: string
  text: string
  type: 'user' | 'business' | 'institute' | 'skill' | 'job' | 'course'
  category: string
  metadata?: Record<string, any>
}

export interface SystemHealthData {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: Date
  metrics: {
    totalUsers: number
    activeUsers: number
    uptime: number
    memoryUsage: NodeJS.MemoryUsage
    cpuUsage: NodeJS.CpuUsage
  }
  error?: string
}

export interface AdminAlertData {
  type: 'monitoring' | 'error' | 'warning' | 'info'
  data: any
  timestamp: Date
  adminId?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface UserStatusUpdate {
  userId: string
  status: UserStatus
  timestamp: Date
}

export interface TypingData {
  userId: string
  isTyping: boolean
  timestamp: Date
}

export interface SystemUpdateData {
  type: 'maintenance' | 'feature' | 'security' | 'general'
  message: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface ProfileValidationResult {
  isValid: boolean
  message: string
  suggestions: string[]
}

export interface AdminMonitorData {
  action: string
  target?: string
  metadata?: Record<string, any>
}

export interface UserActivity {
  action: string
  target?: string
  metadata?: Record<string, any>
  ip?: string
  userAgent?: string
}

// Enums
export type UserStatus = 'online' | 'away' | 'busy' | 'offline'
export type UserRole = 'user' | 'business' | 'institute' | 'admin'

// Room Types
export type RoomType = 
  | `user:${string}`
  | `status:${string}`
  | `role:${UserRole}`
  | `admin`
  | `admin:monitoring`
  | `business:${string}`
  | `institute:${string}`
  | string

// Socket Configuration
export interface SocketConfig {
  path: string
  cors: {
    origin: string | string[]
    methods: string[]
  }
  pingTimeout: number
  pingInterval: number
}
