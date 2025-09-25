'use client'

import React from 'react'
import { useSocket } from '@/hooks/use-socket'

interface SocketStatusProps {
  className?: string
  showDetails?: boolean
}

export function SocketStatus({ className = '', showDetails = false }: SocketStatusProps) {
  const { isConnected, connectionError } = useSocket()

  if (!showDetails && isConnected) {
    // Don't show anything when connected and details not requested
    return null
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${
        isConnected ? 'bg-green-500' : 'bg-red-500'
      }`} />
      
      {showDetails && (
        <div className="text-xs">
          <span className={`font-medium ${
            isConnected ? 'text-green-600' : 'text-red-600'
          }`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          
          {connectionError && (
            <div className="text-red-500 text-xs mt-1">
              {connectionError}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Simple hook to get just the connection status
export function useSocketStatus() {
  const { isConnected, connectionError } = useSocket()
  return { isConnected, connectionError }
}
