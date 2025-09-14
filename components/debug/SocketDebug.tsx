'use client'

import React, { useState } from 'react'
import { useSocket } from '@/hooks/use-socket'

export function SocketDebug() {
  const { 
    socket, 
    isConnected, 
    connectionError, 
    sendPing, 
    updateStatus, 
    sendMessage,
    sendCustomEvent,
    sendNotification,
    markNotificationRead,
    clearNotifications,
    requestSystemHealth
  } = useSocket()
  const [messages, setMessages] = useState<string[]>([])

  const addMessage = (message: string) => {
    setMessages(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // Listen for various socket events
  React.useEffect(() => {
    if (socket) {
      const handlePong = (data: any) => {
        addMessage(`Received pong from server (${data.socketId})`)
      }
      
      const handleWelcome = (data: any) => {
        addMessage(`Welcome: ${data.message}`)
      }

      const handleUserStatusUpdate = (data: any) => {
        addMessage(`User status update: ${data.status}`)
      }

      const handleNotification = (data: any) => {
        addMessage(`Notification: ${data.message || 'New notification'}`)
      }

      const handleSystemHealth = (data: any) => {
        addMessage(`System health: ${data.status}`)
      }
      
      socket.on('pong', handlePong)
      socket.on('welcome', handleWelcome)
      socket.on('userStatusUpdate', handleUserStatusUpdate)
      socket.on('notification', handleNotification)
      socket.on('systemHealthResponse', handleSystemHealth)
      
      return () => {
        socket.off('pong', handlePong)
        socket.off('welcome', handleWelcome)
        socket.off('userStatusUpdate', handleUserStatusUpdate)
        socket.off('notification', handleNotification)
        socket.off('systemHealthResponse', handleSystemHealth)
      }
    }
  }, [socket])

  const testPing = () => {
    if (isConnected) {
      sendPing()
      addMessage('Sent ping')
    } else {
      addMessage('Socket not connected')
    }
  }

  const testSearch = async () => {
    try {
      const response = await fetch('/api/search/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: 'test query' }),
      })
      
      if (response.ok) {
        const data = await response.json()
        addMessage(`Search suggestions: ${JSON.stringify(data.suggestions)}`)
      } else {
        addMessage(`Search API error: ${response.status}`)
      }
    } catch (error) {
      addMessage(`Search API error: ${error}`)
    }
  }

  const testStatus = () => {
    if (isConnected) {
      updateStatus('online')
      addMessage('Status update: online')
    } else {
      addMessage('Socket not connected')
    }
  }

  const testMessage = () => {
    if (isConnected) {
      sendMessage({ 
        text: 'Hello from SocketDebug!', 
        timestamp: new Date().toISOString() 
      })
      addMessage('Sent test message')
    } else {
      addMessage('Socket not connected')
    }
  }

  const testCustomEvent = () => {
    if (isConnected) {
      sendCustomEvent({ 
        type: 'test', 
        data: 'Custom event from SocketDebug',
        timestamp: new Date().toISOString()
      })
      addMessage('Sent custom event')
    } else {
      addMessage('Socket not connected')
    }
  }

  const testNotification = () => {
    if (isConnected) {
      sendNotification({ 
        type: 'notification',
        message: 'Test notification from SocketDebug',
        timestamp: new Date().toISOString()
      })
      addMessage('Sent test notification')
    } else {
      addMessage('Socket not connected')
    }
  }

  const testSystemHealth = () => {
    if (isConnected) {
      requestSystemHealth()
      addMessage('Requested system health')
    } else {
      addMessage('Socket not connected')
    }
  }

  const testMarkNotificationRead = () => {
    if (isConnected) {
      markNotificationRead('test-notification-id')
      addMessage('Marked notification as read')
    } else {
      addMessage('Socket not connected')
    }
  }

  const testClearNotifications = () => {
    if (isConnected) {
      clearNotifications()
      addMessage('Cleared notifications')
    } else {
      addMessage('Socket not connected')
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm">
      <h3 className="font-semibold text-sm mb-2">Socket Debug</h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <span className="font-medium">Status:</span>{' '}
          <span className={`px-2 py-1 rounded text-xs ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        {connectionError && (
          <div className="text-red-600">
            <span className="font-medium">Error:</span> {connectionError}
          </div>
        )}
        
        <div>
          <span className="font-medium">Socket ID:</span> {socket?.id || 'N/A'}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <button
          onClick={testPing}
          disabled={!isConnected}
          className="w-full px-2 py-1 bg-blue-500 text-white text-xs rounded disabled:bg-gray-300"
        >
          Test Ping
        </button>
        
        <button
          onClick={testStatus}
          disabled={!isConnected}
          className="w-full px-2 py-1 bg-purple-500 text-white text-xs rounded disabled:bg-gray-300"
        >
          Test Status
        </button>

        <button
          onClick={testMessage}
          disabled={!isConnected}
          className="w-full px-2 py-1 bg-green-500 text-white text-xs rounded disabled:bg-gray-300"
        >
          Test Message
        </button>

        <button
          onClick={testCustomEvent}
          disabled={!isConnected}
          className="w-full px-2 py-1 bg-orange-500 text-white text-xs rounded disabled:bg-gray-300"
        >
          Test Custom Event
        </button>

        <button
          onClick={testNotification}
          disabled={!isConnected}
          className="w-full px-2 py-1 bg-red-500 text-white text-xs rounded disabled:bg-gray-300"
        >
          Test Notification
        </button>

        <button
          onClick={testSystemHealth}
          disabled={!isConnected}
          className="w-full px-2 py-1 bg-indigo-500 text-white text-xs rounded disabled:bg-gray-300"
        >
          System Health
        </button>

        <button
          onClick={testMarkNotificationRead}
          disabled={!isConnected}
          className="w-full px-2 py-1 bg-yellow-500 text-white text-xs rounded disabled:bg-gray-300"
        >
          Mark Read
        </button>

        <button
          onClick={testClearNotifications}
          disabled={!isConnected}
          className="w-full px-2 py-1 bg-pink-500 text-white text-xs rounded disabled:bg-gray-300"
        >
          Clear Notifications
        </button>
        
        <button
          onClick={testSearch}
          className="w-full px-2 py-1 bg-gray-500 text-white text-xs rounded"
        >
          Test Search API
        </button>
      </div>

      {messages.length > 0 && (
        <div className="mt-3">
          <div className="font-medium text-xs mb-1">Messages:</div>
          <div className="bg-gray-50 p-2 rounded text-xs max-h-32 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className="text-gray-600">{msg}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
