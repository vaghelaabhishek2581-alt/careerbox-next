'use client'

import React, { useState } from 'react'
import { useSocket } from '@/hooks/use-socket'

export function SocketDebug() {
  const { 
    socket, 
    isConnected, 
    connectionError, 
    sendPing, 
    validateProfileId,
    requestSystemHealth
  } = useSocket()
  const [messages, setMessages] = useState<string[]>([])

  const addMessage = (message: string) => {
    setMessages(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // Listen for essential socket events
  React.useEffect(() => {
    if (socket) {
      const handlePong = (data: any) => {
        addMessage(`Received pong from server (${data.socketId})`)
      }

      const handleProfileValidation = (data: any) => {
        addMessage(`Profile validation: ${data.profileId} - ${data.message}`)
      }

      const handleSystemHealth = (data: any) => {
        addMessage(`System health: ${data.status}`)
      }
      
      socket.on('pong', handlePong)
      socket.on('profileId:validation', handleProfileValidation)
      socket.on('systemHealthResponse', handleSystemHealth)
      
      return () => {
        socket.off('pong', handlePong)
        socket.off('profileId:validation', handleProfileValidation)
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

  const testProfileValidation = () => {
    if (isConnected) {
      validateProfileId('test-profile-id')
      addMessage('Sent profile validation request')
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

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm">
      <h3 className="font-semibold text-sm mb-2">Socket Debug</h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <span className="font-medium">Status:</span>{' '}
          <span className={`px-2 py-1 rounded text-xs ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? 'Connected (Stable)' : 'Disconnected'}
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
          onClick={testProfileValidation}
          disabled={!isConnected}
          className="w-full px-2 py-1 bg-green-500 text-white text-xs rounded disabled:bg-gray-300"
        >
          Test Profile Validation
        </button>

        <button
          onClick={testSystemHealth}
          disabled={!isConnected}
          className="w-full px-2 py-1 bg-indigo-500 text-white text-xs rounded disabled:bg-gray-300"
        >
          Test System Health
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
