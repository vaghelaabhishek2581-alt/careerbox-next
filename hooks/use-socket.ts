import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  connectionError: string | null
}

export function useSocket(): UseSocketReturn {
  const { data: session, status } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) return

    // Initialize socket connection
    const socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      path: '/api/socket',
      auth: {
        token: session.accessToken // Assuming you have accessToken in session
      },
      transports: ['websocket', 'polling']
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      setIsConnected(true)
      setConnectionError(null)
    })

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      setIsConnected(false)
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        socket.connect()
      }
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setConnectionError(error.message)
      setIsConnected(false)
    })

    // Reconnection events
    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts')
      setIsConnected(true)
      setConnectionError(null)
    })

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket reconnection attempt:', attemptNumber)
    })

    socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error)
      setConnectionError(error.message)
    })

    socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed')
      setConnectionError('Failed to reconnect to server')
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [session, status])

  return {
    socket: socketRef.current,
    isConnected,
    connectionError
  }
}

// Hook for profile ID validation
export function useProfileIdValidation() {
  const { socket, isConnected } = useSocket()
  const [isValidating, setIsValidating] = useState(false)

  const validateProfileId = (profileId: string): Promise<{
    isValid: boolean
    message: string
    suggestions: string[]
  }> => {
    return new Promise((resolve) => {
      if (!socket || !isConnected) {
        resolve({
          isValid: false,
          message: 'Connection not available',
          suggestions: []
        })
        return
      }

      setIsValidating(true)
      
      socket.emit('validateProfileId', profileId, (result) => {
        setIsValidating(false)
        resolve(result)
      })

      // Timeout after 5 seconds
      setTimeout(() => {
        setIsValidating(false)
        resolve({
          isValid: false,
          message: 'Validation timeout',
          suggestions: []
        })
      }, 5000)
    })
  }

  return {
    validateProfileId,
    isValidating
  }
}

// Hook for search suggestions
export function useSearchSuggestions() {
  const { socket, isConnected } = useSocket()
  const [isLoading, setIsLoading] = useState(false)

  const getSuggestions = (query: string): Promise<any[]> => {
    return new Promise((resolve) => {
      if (!socket || !isConnected || query.length < 2) {
        resolve([])
        return
      }

      setIsLoading(true)
      
      socket.emit('searchSuggestions', query, (suggestions) => {
        setIsLoading(false)
        resolve(suggestions)
      })

      // Timeout after 3 seconds
      setTimeout(() => {
        setIsLoading(false)
        resolve([])
      }, 3000)
    })
  }

  return {
    getSuggestions,
    isLoading
  }
}

// Hook for notifications
export function useNotifications() {
  const { socket, isConnected } = useSocket()
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!socket || !isConnected) return

    const handleNotification = (notification: any) => {
      setNotifications(prev => [notification, ...prev.slice(0, 49)]) // Keep last 50
    }

    socket.on('notification', handleNotification)

    return () => {
      socket.off('notification', handleNotification)
    }
  }, [socket, isConnected])

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    )
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  return {
    notifications,
    markAsRead,
    clearNotifications
  }
}

// Hook for user status
export function useUserStatus() {
  const { socket, isConnected } = useSocket()
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [userStatuses, setUserStatuses] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!socket || !isConnected) return

    const handleUserOnline = (userId: string) => {
      setOnlineUsers(prev => new Set([...prev, userId]))
      setUserStatuses(prev => ({ ...prev, [userId]: 'online' }))
    }

    const handleUserOffline = (userId: string) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
      setUserStatuses(prev => ({ ...prev, [userId]: 'offline' }))
    }

    const handleUserStatusUpdate = (data: { userId: string; status: string }) => {
      setUserStatuses(prev => ({ ...prev, [data.userId]: data.status }))
    }

    socket.on('userOnline', handleUserOnline)
    socket.on('userOffline', handleUserOffline)
    socket.on('userStatusUpdate', handleUserStatusUpdate)

    return () => {
      socket.off('userOnline', handleUserOnline)
      socket.off('userOffline', handleUserOffline)
      socket.off('userStatusUpdate', handleUserStatusUpdate)
    }
  }, [socket, isConnected])

  const updateStatus = (status: 'online' | 'away' | 'busy' | 'offline') => {
    if (socket && isConnected) {
      socket.emit('updateStatus', status)
    }
  }

  const isUserOnline = (userId: string) => {
    return onlineUsers.has(userId)
  }

  const getUserStatus = (userId: string) => {
    return userStatuses[userId] || 'offline'
  }

  return {
    onlineUsers,
    userStatuses,
    updateStatus,
    isUserOnline,
    getUserStatus
  }
}

// Hook for admin monitoring
export function useAdminMonitoring() {
  const { socket, isConnected } = useSocket()
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    if (!socket || !isConnected) return

    const handleSystemHealth = (health: any) => {
      setSystemHealth(health)
    }

    const handleAdminAlert = (alert: any) => {
      setAlerts(prev => [alert, ...prev.slice(0, 49)]) // Keep last 50
    }

    socket.on('systemHealth', handleSystemHealth)
    socket.on('adminAlert', handleAdminAlert)

    return () => {
      socket.off('systemHealth', handleSystemHealth)
      socket.off('adminAlert', handleAdminAlert)
    }
  }, [socket, isConnected])

  const sendAdminAlert = (data: any) => {
    if (socket && isConnected) {
      socket.emit('adminMonitor', data)
    }
  }

  return {
    systemHealth,
    alerts,
    sendAdminAlert
  }
}