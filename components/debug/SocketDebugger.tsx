'use client'

import { useState, useEffect } from 'react'
import { useSocket } from '@/hooks/use-socket'
import { useProfileIdValidation } from '@/hooks/use-profile-id-validation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SocketDebugger() {
  const { socket, isConnected, connectionError } = useSocket()
  const { validateProfileId, isValidating, validationResult } = useProfileIdValidation()
  const [testProfileId, setTestProfileId] = useState('')
  const [socketEvents, setSocketEvents] = useState<string[]>([])

  useEffect(() => {
    if (!socket) return

    const addEvent = (event: string) => {
      setSocketEvents(prev => [
        `${new Date().toLocaleTimeString()}: ${event}`,
        ...prev.slice(0, 9) // Keep last 10 events
      ])
    }

    // Listen to all socket events for debugging
    const events = [
      'connect', 'disconnect', 'connect_error', 'reconnect', 
      'reconnect_attempt', 'reconnect_error', 'reconnect_failed',
      'notification', 'error', 'pong'
    ]

    events.forEach(event => {
      socket.on(event, (data) => {
        addEvent(`${event}: ${JSON.stringify(data)}`)
      })
    })

    return () => {
      events.forEach(event => {
        socket.off(event)
      })
    }
  }, [socket])

  const handleTestValidation = async () => {
    if (!testProfileId.trim()) return
    
    try {
      const result = await validateProfileId(testProfileId)
      console.log('Validation result:', result)
    } catch (error) {
      console.error('Validation error:', error)
    }
  }

  const handleTestConnection = () => {
    if (socket) {
      socket.emit('ping')
    }
  }

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Socket Connection Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span>Connection Status:</span>
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          
          {connectionError && (
            <Alert variant="destructive">
              <AlertDescription>{connectionError}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-2">
            <span>Socket ID:</span>
            <code className="text-sm bg-muted px-2 py-1 rounded">
              {socket?.id || 'Not connected'}
            </code>
          </div>

          <Button onClick={handleTestConnection} disabled={!isConnected}>
            Test Ping
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile ID Validation Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter profile ID to test"
              value={testProfileId}
              onChange={(e) => setTestProfileId(e.target.value)}
            />
            <Button 
              onClick={handleTestValidation} 
              disabled={!isConnected || isValidating || !testProfileId.trim()}
            >
              {isValidating ? 'Validating...' : 'Test'}
            </Button>
          </div>

          {validationResult && (
            <Alert variant={validationResult.isValid ? 'default' : 'destructive'}>
              <AlertDescription>
                <div className="space-y-2">
                  <div><strong>Valid:</strong> {validationResult.isValid ? 'Yes' : 'No'}</div>
                  <div><strong>Message:</strong> {validationResult.message}</div>
                  {validationResult.suggestions.length > 0 && (
                    <div>
                      <strong>Suggestions:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {validationResult.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Socket Events (Last 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {socketEvents.length === 0 ? (
              <p className="text-muted-foreground text-sm">No events yet</p>
            ) : (
              socketEvents.map((event, index) => (
                <div key={index} className="text-xs font-mono bg-muted p-2 rounded">
                  {event}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
