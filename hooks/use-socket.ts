// import { useEffect, useState, useRef } from 'react'
// import { io, Socket } from 'socket.io-client'
// import { useSession } from 'next-auth/react'

// interface UseSocketReturn {
//   socket: Socket | null
//   isConnected: boolean
//   connectionError: string | null
// }

// export function useSocket(): UseSocketReturn {
//   const { data: session, status } = useSession()
//   const [isConnected, setIsConnected] = useState(false)
//   const [connectionError, setConnectionError] = useState<string | null>(null)
//   const [socketDisabled, setSocketDisabled] = useState(false)
//   const socketRef = useRef<Socket | null>(null)
//   const initializingRef = useRef(false)
//   const timeoutRef = useRef<NodeJS.Timeout | null>(null)

//   useEffect(() => {
//     // Don't initialize socket until session is fully loaded
//     if (status === 'loading') return
//     if (!session) return
//     if (socketDisabled) return
    
//     // Prevent re-initializing socket if it already exists or is being initialized
//     if (socketRef.current || initializingRef.current) return
    
//     console.log('🔌 Initializing socket connection for user:', session.user?.email)
    
//     // Mark as initializing to prevent duplicate initialization
//     initializingRef.current = true
    
//     const initSocket = () => {
//       // Get the base URL for socket connection
//       const socketUrl = process.env.NEXT_PUBLIC_APP_URL || 
//         (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
      
//       console.log('Connecting to socket server at:', socketUrl)
      
//       // Initialize socket connection with improved configuration
//       const socket = io(socketUrl, {
//         path: '/api/socket',
//         transports: ['websocket', 'polling'],
//         autoConnect: true,
//         reconnection: true,
//         reconnectionAttempts: 5,
//         reconnectionDelay: 2000,
//         reconnectionDelayMax: 10000,
//         timeout: 10000, // Increased timeout to 10 seconds
//         forceNew: false,
//         upgrade: true,
//         rememberUpgrade: true,
//         // Client-side options for better stability
//       })

//       return socket
//     }

//     // Initialize socket with error handling
//     let socket: Socket
//     try {
//       socket = initSocket()
//       socketRef.current = socket
//     } catch (error) {
//       console.error('Failed to initialize socket:', error)
//       setConnectionError('Failed to initialize socket connection')
//       initializingRef.current = false
//       return
//     }

//     // Connection timeout handler
//     timeoutRef.current = setTimeout(() => {
//       if (!socket.connected && !socketDisabled) {
//         console.error('Socket connection timeout after 15 seconds')
//         setConnectionError('Connection timeout - server may be unavailable')
//         setIsConnected(false)
//         setSocketDisabled(true)
//         socket.disconnect()
//       }
//     }, 15000) // 15 second timeout

//     // Connection events
//     socket.on('connect', () => {
//       console.log('✅ Socket connected:', socket.id)
//       setIsConnected(true)
//       setConnectionError(null)
//       initializingRef.current = false
      
//       // Clear timeout on successful connection
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current)
//         timeoutRef.current = null
//       }
//     })

//     socket.on('disconnect', (reason) => {
//       console.log('❌ Socket disconnected:', reason)
//       setIsConnected(false)
      
//       // Handle different disconnect reasons
//       if (reason === 'io server disconnect') {
//         // Server disconnected, try to reconnect
//         console.log('Server initiated disconnect, attempting to reconnect...')
//         socket.connect()
//       } else if (reason === 'transport close' || reason === 'transport error') {
//         // Network issues, let auto-reconnection handle it
//         console.log('Network issue detected, auto-reconnection will handle it')
//       }
//     })

//     socket.on('connect_error', (error) => {
//       console.error('❌ Socket connection error:', error)
//       setConnectionError(`Connection failed: ${error.message}`)
//       setIsConnected(false)
//       initializingRef.current = false
      
//       // Clear timeout on connection error
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current)
//         timeoutRef.current = null
//       }
      
//       // Check if this is a server availability issue
//       if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
//         console.log('Server appears to be unavailable')
//         setSocketDisabled(true) // Temporarily disable to prevent spam
        
//         // Re-enable after 30 seconds
//         setTimeout(() => {
//           if (!socket.connected) {
//             setSocketDisabled(false)
//             setConnectionError(null)
//           }
//         }, 30000)
//       }
//     })

//     // Reconnection events
//     socket.on('reconnect', (attemptNumber) => {
//       console.log('✅ Socket reconnected after', attemptNumber, 'attempts')
//       setIsConnected(true)
//       setConnectionError(null)
//       setSocketDisabled(false)
//     })

//     socket.on('reconnect_attempt', (attemptNumber) => {
//       console.log('🔄 Socket reconnection attempt:', attemptNumber)
//       setConnectionError(`Reconnecting... (attempt ${attemptNumber})`)
//     })

//     socket.on('reconnect_error', (error) => {
//       console.error('❌ Socket reconnection error:', error)
//       setConnectionError(`Reconnection failed: ${error.message}`)
//     })

//     socket.on('reconnect_failed', () => {
//       console.error('❌ Socket reconnection failed after all attempts')
//       setConnectionError('Failed to reconnect to server after multiple attempts')
//       setSocketDisabled(true)
      
//       // Re-enable after 2 minutes
//       setTimeout(() => {
//         setSocketDisabled(false)
//         setConnectionError(null)
//       }, 120000)
//     })

//     // Health check events
//     socket.on('ping', () => {
//       console.log('📡 Received ping from server')
//       socket.emit('pong')
//     })

//     socket.on('pong', () => {
//       console.log('📡 Received pong from server')
//     })

//     // Cleanup function
//     return () => {
//       console.log('🧹 Cleaning up socket connection')
//       initializingRef.current = false
      
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current)
//         timeoutRef.current = null
//       }
      
//       if (socket) {
//         socket.removeAllListeners()
//         socket.disconnect()
//       }
      
//       socketRef.current = null
//       setIsConnected(false)
//     }
//   }, [session, status, socketDisabled])

//   // Cleanup on unmount or dependency change
//   useEffect(() => {
//     return () => {
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current)
//       }
//     }
//   }, [])

//   return {
//     socket: socketRef.current,
//     isConnected,
//     connectionError
//   }
// }

// // Hook for search suggestions (using API fallback)
// export function useSearchSuggestions() {
//   const [isLoading, setIsLoading] = useState(false)

//   const getSuggestions = async (query: string): Promise<any[]> => {
//     if (query.length < 2) {
//       return []
//     }

//     setIsLoading(true)
    
//     try {
//       // Use API fallback instead of Socket.IO
//       const response = await fetch('/api/search/suggestions', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ query }),
//       })

//       if (response.ok) {
//         const data = await response.json()
//         return data.suggestions || []
//       } else {
//         console.warn('Search suggestions API returned non-OK status:', response.status)
//       }
//     } catch (error) {
//       console.error('Error fetching search suggestions:', error)
//     } finally {
//       setIsLoading(false)
//     }

//     return []
//   }

//   return {
//     getSuggestions,
//     isLoading
//   }
// }

// // Hook for notifications
// export function useNotifications() {
//   const { socket, isConnected } = useSocket()
//   const [notifications, setNotifications] = useState<any[]>([])

//   useEffect(() => {
//     if (!socket || !isConnected) return

//     const handleNotification = (notification: any) => {
//       console.log('📢 Received notification:', notification)
//       setNotifications(prev => [notification, ...prev.slice(0, 49)]) // Keep last 50
//     }

//     socket.on('notification', handleNotification)

//     return () => {
//       socket.off('notification', handleNotification)
//     }
//   }, [socket, isConnected])

//   const markAsRead = (notificationId: string) => {
//     setNotifications(prev => 
//       prev.map(notif => 
//         notif.id === notificationId 
//           ? { ...notif, read: true }
//           : notif
//       )
//     )
    
//     // Optionally emit to server
//     if (socket && isConnected) {
//       socket.emit('markNotificationRead', notificationId)
//     }
//   }

//   const clearNotifications = () => {
//     setNotifications([])
    
//     // Optionally emit to server
//     if (socket && isConnected) {
//       socket.emit('clearNotifications')
//     }
//   }

//   return {
//     notifications,
//     markAsRead,
//     clearNotifications
//   }
// }

// // Hook for user status
// export function useUserStatus() {
//   const { socket, isConnected } = useSocket()
//   const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
//   const [userStatuses, setUserStatuses] = useState<Record<string, string>>({})

//   useEffect(() => {
//     if (!socket || !isConnected) return

//     const handleUserOnline = (userId: string) => {
//       console.log('👤 User came online:', userId)
//       setOnlineUsers(prev => new Set([...Array.from(prev), userId]))
//       setUserStatuses(prev => ({ ...prev, [userId]: 'online' }))
//     }

//     const handleUserOffline = (userId: string) => {
//       console.log('👤 User went offline:', userId)
//       setOnlineUsers(prev => {
//         const newSet = new Set(prev)
//         newSet.delete(userId)
//         return newSet
//       })
//       setUserStatuses(prev => ({ ...prev, [userId]: 'offline' }))
//     }

//     const handleUserStatusUpdate = (data: { userId: string; status: string }) => {
//       console.log('👤 User status update:', data)
//       setUserStatuses(prev => ({ ...prev, [data.userId]: data.status }))
//     }

//     socket.on('userOnline', handleUserOnline)
//     socket.on('userOffline', handleUserOffline)
//     socket.on('userStatusUpdate', handleUserStatusUpdate)

//     return () => {
//       socket.off('userOnline', handleUserOnline)
//       socket.off('userOffline', handleUserOffline)
//       socket.off('userStatusUpdate', handleUserStatusUpdate)
//     }
//   }, [socket, isConnected])

//   const updateStatus = (status: 'online' | 'away' | 'busy' | 'offline') => {
//     if (socket && isConnected) {
//       socket.emit('updateStatus', status)
//     }
//   }

//   const isUserOnline = (userId: string) => {
//     return onlineUsers.has(userId)
//   }

//   const getUserStatus = (userId: string) => {
//     return userStatuses[userId] || 'offline'
//   }

//   return {
//     onlineUsers,
//     userStatuses,
//     updateStatus,
//     isUserOnline,
//     getUserStatus
//   }
// }

// // Hook for admin monitoring
// export function useAdminMonitoring() {
//   const { socket, isConnected } = useSocket()
//   const [systemHealth, setSystemHealth] = useState<any>(null)
//   const [alerts, setAlerts] = useState<any[]>([])

//   useEffect(() => {
//     if (!socket || !isConnected) return

//     const handleSystemHealth = (health: any) => {
//       console.log('🏥 System health update:', health)
//       setSystemHealth(health)
//     }

//     const handleAdminAlert = (alert: any) => {
//       console.log('🚨 Admin alert:', alert)
//       setAlerts(prev => [alert, ...prev.slice(0, 49)]) // Keep last 50
//     }

//     socket.on('systemHealth', handleSystemHealth)
//     socket.on('adminAlert', handleAdminAlert)

//     return () => {
//       socket.off('systemHealth', handleSystemHealth)
//       socket.off('adminAlert', handleAdminAlert)
//     }
//   }, [socket, isConnected])

//   const sendAdminAlert = (data: any) => {
//     if (socket && isConnected) {
//       socket.emit('adminMonitor', data)
//     }
//   }

//   return {
//     systemHealth,
//     alerts,
//     sendAdminAlert
//   }
// }
import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  connectionError: string | null
  sendMessage: (message: any) => void
  sendCustomEvent: (data: any) => void
  onMessage: (callback: (data: any) => void) => void
  onCustomResponse: (callback: (data: any) => void) => void
}

export const useSocket = (): UseSocketReturn => {
  const { data: session, status } = useSession()
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const initializingRef = useRef<boolean>(false)

  useEffect(() => {
    // Don't initialize socket until session is fully loaded
    if (status === 'loading') return
    if (!session) return
    
    // Prevent re-initializing socket if it already exists or is being initialized
    if (socketRef.current || initializingRef.current) return
    
    console.log('🔌 Initializing socket connection for user:', session.user?.email)
    
    // Mark as initializing to prevent duplicate initialization
    initializingRef.current = true
    
    const socketInitializer = async () => {
      try {
        // Get the base URL for socket connection
        const socketUrl = process.env.NEXT_PUBLIC_APP_URL || 
          (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
        
        console.log('🔗 Connecting to socket server at:', socketUrl)
        
        // Initialize socket connection
        const socket = io(socketUrl, {
          path: '/socket.io',
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
          reconnectionDelay: 2000,
          reconnectionDelayMax: 10000,
        timeout: 10000,
        forceNew: false,
        upgrade: true,
        rememberUpgrade: true,
        })

    socketRef.current = socket

    socket.on('connect', () => {
          console.log('✅ Socket connected:', socket.id)
      setIsConnected(true)
      setConnectionError(null)
          initializingRef.current = false
    })

    socket.on('disconnect', (reason) => {
          console.log('❌ Socket disconnected:', reason)
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error)
          setConnectionError(`Connection failed: ${error.message}`)
      setIsConnected(false)
          initializingRef.current = false
        })

    socket.on('reconnect', (attemptNumber) => {
          console.log('✅ Socket reconnected after', attemptNumber, 'attempts')
      setIsConnected(true)
      setConnectionError(null)
    })

    socket.on('reconnect_attempt', (attemptNumber) => {
          console.log('🔄 Socket reconnection attempt:', attemptNumber)
          setConnectionError(`Reconnecting... (attempt ${attemptNumber})`)
    })

    socket.on('reconnect_error', (error) => {
          console.error('❌ Socket reconnection error:', error)
          setConnectionError(`Reconnection failed: ${error.message}`)
    })

    socket.on('reconnect_failed', () => {
          console.error('❌ Socket reconnection failed after all attempts')
          setConnectionError('Failed to reconnect to server after multiple attempts')
        })

        socket.on('welcome', (data) => {
          console.log('🎉 Welcome message:', data)
        })

        // Handle pong responses for ping/pong testing
        socket.on('pong', (data) => {
          console.log('🏓 Pong received:', data)
        })

        // Handle user status updates
        socket.on('userStatusUpdate', (data) => {
          console.log('👤 User status update:', data)
        })

        // Handle user online/offline events
        socket.on('userOnline', (userId) => {
          console.log('👤 User came online:', userId)
        })

        socket.on('userOffline', (userId) => {
          console.log('👤 User went offline:', userId)
        })

        // Handle notifications
        socket.on('notification', (notification) => {
          console.log('📢 Notification received:', notification)
        })

        socket.on('notificationRead', (data) => {
          console.log('✅ Notification marked as read:', data)
        })

        socket.on('notificationsCleared', (data) => {
          console.log('🗑️ Notifications cleared:', data)
        })

        // Handle admin responses
        socket.on('adminResponse', (data) => {
          console.log('🔧 Admin response:', data)
        })

        // Handle system health responses
        socket.on('systemHealthResponse', (data) => {
          console.log('🏥 System health response:', data)
        })

      } catch (error) {
        console.error('❌ Failed to initialize socket:', error)
        setConnectionError('Failed to initialize socket connection')
        initializingRef.current = false
      }
    }

    socketInitializer()

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up socket connection')
      initializingRef.current = false
      
      if (socketRef.current) {
        socketRef.current.removeAllListeners()
        socketRef.current.disconnect()
        socketRef.current = null
      }
      
      setIsConnected(false)
    }
  }, [session, status])

  const sendMessage = (message: any) => {
    if (socketRef.current && isConnected) {
      console.log('📤 Sending message:', message)
      socketRef.current.emit('message', message)
    } else {
      console.warn('⚠️ Cannot send message: socket not connected')
    }
  }

  const sendCustomEvent = (data: any) => {
    if (socketRef.current && isConnected) {
      console.log('📤 Sending custom event:', data)
      socketRef.current.emit('custom-event', data)
    } else {
      console.warn('⚠️ Cannot send custom event: socket not connected')
    }
  }

  const onMessage = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('message', callback)
    }
  }

  const onCustomResponse = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('custom-response', callback)
    }
  }

  const sendPing = () => {
    if (socketRef.current && isConnected) {
      console.log('🏓 Sending ping')
      socketRef.current.emit('ping')
    } else {
      console.warn('⚠️ Cannot send ping: socket not connected')
    }
  }

  const updateStatus = (status: string) => {
    if (socketRef.current && isConnected) {
      console.log('👤 Updating status to:', status)
      socketRef.current.emit('updateStatus', status)
    } else {
      console.warn('⚠️ Cannot update status: socket not connected')
    }
  }

  const sendNotification = (notification: any) => {
    if (socketRef.current && isConnected) {
      console.log('📢 Sending notification:', notification)
      socketRef.current.emit('notification', notification)
    } else {
      console.warn('⚠️ Cannot send notification: socket not connected')
    }
  }

  const markNotificationRead = (notificationId: string) => {
    if (socketRef.current && isConnected) {
      console.log('✅ Marking notification as read:', notificationId)
      socketRef.current.emit('markNotificationRead', notificationId)
    } else {
      console.warn('⚠️ Cannot mark notification as read: socket not connected')
    }
  }

  const clearNotifications = () => {
    if (socketRef.current && isConnected) {
      console.log('🗑️ Clearing notifications')
      socketRef.current.emit('clearNotifications')
    } else {
      console.warn('⚠️ Cannot clear notifications: socket not connected')
    }
  }

  const requestSystemHealth = () => {
    if (socketRef.current && isConnected) {
      console.log('🏥 Requesting system health')
      socketRef.current.emit('systemHealth')
    } else {
      console.warn('⚠️ Cannot request system health: socket not connected')
    }
  }

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    sendMessage,
    sendCustomEvent,
    onMessage,
    onCustomResponse,
    sendPing,
    updateStatus,
    sendNotification,
    markNotificationRead,
    clearNotifications,
    requestSystemHealth
  }
}
