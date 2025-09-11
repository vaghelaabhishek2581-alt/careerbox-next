import { NextRequest, NextResponse } from 'next/server'
import { getSocketServer } from '../socket'

export async function GET(request: NextRequest) {
  try {
    const io = getSocketServer()
    
    if (!io) {
      return NextResponse.json({
        status: 'error',
        message: 'Socket server not initialized'
      }, { status: 500 })
    }

    // Get basic socket server info
    const connectedSockets = await io.fetchSockets()
    
    return NextResponse.json({
      status: 'success',
      message: 'Socket server is running',
      data: {
        connectedClients: connectedSockets.length,
        serverId: io.id,
        namespace: io.name,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Socket status check error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check socket status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
