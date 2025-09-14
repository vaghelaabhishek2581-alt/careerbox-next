
import { NextRequest, NextResponse } from 'next/server'

// Simple endpoint to check if socket server is available
export async function GET(request: NextRequest) {
  console.log('🔌 Socket endpoint accessed')
  
  return NextResponse.json({ 
    success: true, 
    message: 'Socket.IO server endpoint is available',
    timestamp: new Date().toISOString()
  })
}
