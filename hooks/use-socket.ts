'use client'

import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

export function useSocket () {
  const socketRef = useRef<Socket | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user) return

    const socket = io(
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      {
        path: '/api/socket',
        autoConnect: true
      }
    )

    socketRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [session])

  return socketRef.current
}
