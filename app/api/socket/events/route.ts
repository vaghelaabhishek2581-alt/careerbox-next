// app/api/socket/events/route.ts - Server-Sent Events endpoint
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'

// Store active connections
const connections = new Map<string, ReadableStreamDefaultController>()

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { userId } = authResult
    
    const stream = new ReadableStream({
      start(controller) {
        // Store the connection
        connections.set(userId, controller)
        
        console.log(`SSE connection established for user: ${userId}`)
        
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
          console.log(`SSE connection closed for user: ${userId}`)
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
  } catch (error) {
    console.error('Error establishing SSE connection:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

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

// Internal utility function to broadcast to all connections (not exported)
function broadcastToAll(data: any) {
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