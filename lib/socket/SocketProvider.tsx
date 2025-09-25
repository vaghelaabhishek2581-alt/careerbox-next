'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'
import { registerClientEventListeners, removeClientEventListeners } from './events/client'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  connectionError: string | null
  sendPing: () => void
  validateProfileId: (profileId: string) => void
  requestSystemHealth: () => void
}

const SocketContext = createContext<SocketContextType | null>(null)

interface SocketProviderProps {
  children: React.ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { data: session, status } = useSession()
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const initializingRef = useRef<boolean>(false)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize socket connection at the top level
  useEffect(() => {
    // Don't initialize socket until session is fully loaded
    if (status === 'loading') return
    if (!session) {
      // If no session, disconnect existing socket
      if (socketRef.current) {
        console.log('🔌 No session, disconnecting socket')
        socketRef.current.disconnect()
        socketRef.current = null
        setIsConnected(false)
        setConnectionError(null)
      }
      return
    }

    // Prevent re-initializing socket if it already exists or is being initialized
    if (socketRef.current?.connected || initializingRef.current) {
      console.log('🔌 Socket already connected or initializing, skipping')
      return
    }

    console.log('🔌 Initializing top-level socket connection for user:', session.user?.email)

    // Mark as initializing to prevent duplicate initialization
    initializingRef.current = true

    const initializeSocket = async () => {
      try {
        // Get the base URL for socket connection
        const socketUrl = process.env.NEXT_PUBLIC_APP_URL ||
          (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')

        console.log('🔗 Connecting to socket server at:', socketUrl)

        // Initialize socket connection
        const socket = io(socketUrl, {
          path: '/api/socket',
          transports: ['websocket', 'polling'],
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 10, // Increased for better stability
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          forceNew: false,
          upgrade: true,
          rememberUpgrade: true,
          withCredentials: true, // Important: Send cookies with requests
        })

        socketRef.current = socket

        // Connection event handlers
        socket.on('connect', () => {
          console.log('✅ Socket connected:', socket.id)
          setIsConnected(true)
          setConnectionError(null)
          initializingRef.current = false

          // Clear any reconnection timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
          }
        })

        socket.on('disconnect', (reason) => {
          console.log('❌ Socket disconnected:', reason)
          setIsConnected(false)

          // Only show error for unexpected disconnections
          if (reason !== 'io client disconnect') {
            setConnectionError(`Disconnected: ${reason}`)
          }
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

          // Retry connection after 30 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Retrying socket connection...')
            socket.connect()
          }, 30000)
        })

        // Register all organized client-side event listeners
        registerClientEventListeners(socket)

      } catch (error) {
        console.error('❌ Failed to initialize socket:', error)
        setConnectionError('Failed to initialize socket connection')
        initializingRef.current = false
      }
    }

    initializeSocket()

    // Cleanup function - only runs on unmount or session change
    return () => {
      console.log('🧹 Socket provider cleanup')
      initializingRef.current = false

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }
  }, [session, status])

  // Cleanup on unmount (page refresh)
  useEffect(() => {
    return () => {
      console.log('🧹 Socket provider unmounting - disconnecting socket')
      if (socketRef.current) {
        removeClientEventListeners(socketRef.current)
        socketRef.current.removeAllListeners()
        socketRef.current.disconnect()
        socketRef.current = null
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  // Essential socket utility functions
  const sendPing = () => {
    if (socketRef.current && isConnected) {
      console.log('🏓 Sending ping')
      socketRef.current.emit('ping')
    } else {
      console.warn('⚠️ Cannot send ping: socket not connected')
    }
  }

  const validateProfileId = (profileId: string) => {
    console.log('🔍 SocketProvider validateProfileId called:', {
      profileId,
      hasSocket: !!socketRef.current,
      isConnected,
      socketId: socketRef.current?.id
    })

    if (socketRef.current && isConnected) {
      console.log('📤 Emitting validate:profileId event for:', profileId)
      socketRef.current.emit('validate:profileId', { profileId })
      console.log('✅ validate:profileId event emitted')
    } else {
      console.warn('⚠️ Cannot validate profile ID: socket not connected', {
        hasSocket: !!socketRef.current,
        isConnected
      })
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

  const contextValue: SocketContextType = {
    socket: socketRef.current,
    isConnected,
    connectionError,
    sendPing,
    validateProfileId,
    requestSystemHealth
  }

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  )
}

// Custom hook to use the socket context
export function useSocket(): SocketContextType {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
