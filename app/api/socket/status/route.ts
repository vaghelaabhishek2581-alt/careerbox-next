import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Access the global socket server if available
    const io = (global as any).socketIO
    
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
        serverId: 'socket-server',
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
