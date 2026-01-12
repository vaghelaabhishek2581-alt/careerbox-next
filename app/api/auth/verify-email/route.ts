import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailToken } from '@/lib/email/verification'

// Helper function for logging with timestamps
function logVerification (step: string, data: Record<string, any>) {
  const timestamp = new Date().toISOString()
  console.log(`\n========== [VERIFY-EMAIL] ${timestamp} ==========`)
  console.log(`[STEP]: ${step}`)
  Object.entries(data).forEach(([key, value]) => {
    console.log(`[${key.toUpperCase()}]:`, value)
  })
  console.log(`=================================================\n`)
}

// GET handler - for verification via URL query param (from email links)
export async function GET (request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logVerification('Request received (GET)', {
      requestId,
      url: request.url,
      method: 'GET'
    })

    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    logVerification('Token extracted from query params', {
      requestId,
      tokenReceived: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token
        ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}`
        : 'null'
    })

    if (!token) {
      logVerification('Validation failed - No token', { requestId })
      return NextResponse.json(
        { success: false, message: 'Verification token is required' },
        { status: 400 }
      )
    }

    logVerification('Calling verifyEmailToken', {
      requestId,
      token: `${token.substring(0, 10)}...`
    })

    const result = await verifyEmailToken(token)

    logVerification('verifyEmailToken result', {
      requestId,
      success: result.success,
      email: result.email || 'N/A',
      error: result.error || 'N/A'
    })

    if (!result.success) {
      logVerification('Verification failed', {
        requestId,
        reason: result.error
      })
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      )
    }

    logVerification('Verification SUCCESS', {
      requestId,
      email: result.email
    })

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      email: result.email
    })
  } catch (error) {
    logVerification('ERROR caught', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'N/A'
    })
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST handler - for verification via request body
export async function POST (request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    logVerification('Request received (POST)', {
      requestId,
      url: request.url,
      method: 'POST'
    })

    const body = await request.json()
    const { token } = body

    logVerification('Token extracted from body', {
      requestId,
      tokenReceived: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token
        ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}`
        : 'null'
    })

    if (!token) {
      logVerification('Validation failed - No token', { requestId })
      return NextResponse.json(
        { success: false, message: 'Verification token is required' },
        { status: 400 }
      )
    }

    logVerification('Calling verifyEmailToken', {
      requestId,
      token: `${token.substring(0, 10)}...`
    })

    const result = await verifyEmailToken(token)

    logVerification('verifyEmailToken result', {
      requestId,
      success: result.success,
      email: result.email || 'N/A',
      error: result.error || 'N/A'
    })

    if (!result.success) {
      logVerification('Verification failed', {
        requestId,
        reason: result.error
      })
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      )
    }

    logVerification('Verification SUCCESS', {
      requestId,
      email: result.email
    })

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      email: result.email
    })
  } catch (error) {
    logVerification('ERROR caught', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'N/A'
    })
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
