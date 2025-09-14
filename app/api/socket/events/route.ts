// app/api/events/route.ts - Server-Sent Events endpoint
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

// Store active connections
const connections = new Map<string, ReadableStreamDefaultController>()

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const userId = session.user.id
  
  const stream = new ReadableStream({
    start(controller) {
      // Store the connection
      connections.set(userId, controller)
      
      console.log(`SSE connection established for user: ${session.user?.email}`)
      
      // Send initial connection message
      const data = JSON.stringify({
        type: 'connected',
        message: 'Connected to real-time updates',
        timestamp: new Date().toISOString()
      })
      
      controller.enqueue(`data: ${data}\n\n`)
      
      // Keep connection alive with periodic heartbeat
      const heartbeat = setInterval(() => {
        try {
          const heartbeatData = JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString()
          })
          controller.enqueue(`data: ${heartbeatData}\n\n`)
        } catch (error) {
          console.log('Heartbeat failed, connection likely closed')
          clearInterval(heartbeat)
          connections.delete(userId)
        }
      }, 30000) // Every 30 seconds
      
      // Clean up on connection close
      request.signal.addEventListener('abort', () => {
        console.log(`SSE connection closed for user: ${session.user?.email}`)
        clearInterval(heartbeat)
        connections.delete(userId)
        try {
          controller.close()
        } catch (error) {
          // Controller already closed
        }
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Nginx optimization
    }
  })
}

// app/api/notifications/send/route.ts - Send notifications via SSE
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, notification } = await request.json()
    
    // Get the connection for this user
    const connection = connections.get(userId)
    
    if (connection) {
      const data = JSON.stringify({
        type: 'notification',
        payload: notification,
        timestamp: new Date().toISOString()
      })
      
      try {
        connection.enqueue(`data: ${data}\n\n`)
        return NextResponse.json({ success: true, message: 'Notification sent' })
      } catch (error) {
        console.error('Failed to send notification:', error)
        connections.delete(userId) // Remove dead connection
        return NextResponse.json({ success: false, error: 'Connection closed' }, { status: 410 })
      }
    } else {
      return NextResponse.json({ success: false, error: 'User not connected' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// Utility function to broadcast to all connections
export function broadcastToAll(data: any) {
  const message = JSON.stringify({
    type: 'broadcast',
    payload: data,
    timestamp: new Date().toISOString()
  })
  
  connections.forEach((connection, userId) => {
    try {
      connection.enqueue(`data: ${message}\n\n`)
    } catch (error) {
      console.log(`Failed to broadcast to user ${userId}, removing connection`)
      connections.delete(userId)
    }
  })
}

// hooks/use-realtime.ts - Client hook for SSE
import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'

interface RealtimeEvent {
  type: string
  payload?: any
  message?: string
  timestamp: string
}

interface UseRealtimeReturn {
  isConnected: boolean
  connectionError: string | null
  lastEvent: RealtimeEvent | null
  sendNotification: (userId: string, notification: any) => Promise<boolean>
}

export function useRealtime(): UseRealtimeReturn {
  const { data: session, status } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (status === 'loading' || !session?.user) {
      return
    }

    console.log('Establishing SSE connection...')
    
    const connectSSE = () => {
      try {
        const eventSource = new EventSource('/api/events')
        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
          console.log('SSE connection established')
          setIsConnected(true)
          setConnectionError(null)
        }

        eventSource.onmessage = (event) => {
          try {
            const data: RealtimeEvent = JSON.parse(event.data)
            console.log('Received SSE event:', data.type)
            setLastEvent(data)
          } catch (error) {
            console.error('Failed to parse SSE event:', error)
          }
        }

        eventSource.onerror = (error) => {
          console.error('SSE connection error:', error)
          setIsConnected(false)
          setConnectionError('Connection lost')
          
          // Attempt to reconnect after delay
          if (eventSource.readyState === EventSource.CLOSED) {
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('Attempting to reconnect SSE...')
              connectSSE()
            }, 5000)
          }
        }

      } catch (error) {
        console.error('Failed to establish SSE connection:', error)
        setConnectionError('Failed to connect')
      }
    }

    connectSSE()

    return () => {
      console.log('Cleaning up SSE connection')
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      
      setIsConnected(false)
    }
  }, [session, status])

  const sendNotification = async (userId: string, notification: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, notification }),
      })

      return response.ok
    } catch (error) {
      console.error('Failed to send notification:', error)
      return false
    }
  }

  return {
    isConnected,
    connectionError,
    lastEvent,
    sendNotification
  }
}

// hooks/use-search-suggestions.ts - API-based search suggestions
import { useState, useCallback } from 'react'

interface UseSearchSuggestionsReturn {
  isLoading: boolean
  getSuggestions: (query: string) => Promise<any[]>
}

export function useSearchSuggestions(): UseSearchSuggestionsReturn {
  const [isLoading, setIsLoading] = useState(false)

  const getSuggestions = useCallback(async (query: string): Promise<any[]> => {
    if (query.length < 2) {
      return []
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/search/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.suggestions || []
      }
    } catch (error) {
      console.error('Error fetching search suggestions:', error)
    } finally {
      setIsLoading(false)
    }

    return []
  }, [])

  return {
    isLoading,
    getSuggestions
  }
}

// app/api/search/suggestions/route.ts - Search suggestions API
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // Implement your search suggestions logic here
    // This is just a mock response
    const suggestions = [
      { id: 1, text: `${query} suggestion 1`, type: 'general' },
      { id: 2, text: `${query} suggestion 2`, type: 'general' },
      { id: 3, text: `${query} suggestion 3`, type: 'general' },
    ]

    return NextResponse.json({ 
      suggestions: suggestions.slice(0, 5) // Limit to 5 suggestions
    })
  } catch (error) {
    console.error('Error generating search suggestions:', error)
    return NextResponse.json({ suggestions: [] })
  }
}