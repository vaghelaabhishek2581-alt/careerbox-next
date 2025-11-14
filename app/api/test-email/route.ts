import { NextRequest, NextResponse } from 'next/server'
import { sendCourseApplicationConfirmation, sendCourseApplicationAdminNotification } from '@/lib/services/email-service'

export async function POST(request: NextRequest) {
  try {
    const { type, email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (type === 'user') {
      // Test user confirmation email
      const result = await sendCourseApplicationConfirmation(
        email,
        'John Doe',
        'Test Institute',
        'Computer Science Engineering',
        '507f1f77bcf86cd799439011'
      )
      
      return NextResponse.json({ 
        success: result.success, 
        message: 'User confirmation email sent',
        messageId: result.messageId 
      })
    } else if (type === 'admin') {
      // Test admin notification email
      const result = await sendCourseApplicationAdminNotification(
        email,
        'John Doe',
        'john.doe@example.com',
        '+1234567890',
        'New York',
        'Test Institute',
        'Computer Science Engineering',
        '507f1f77bcf86cd799439011',
        [
          { exam: 'JEE Main', score: '95 percentile' },
          { exam: 'SAT', score: '1450' }
        ]
      )
      
      return NextResponse.json({ 
        success: result.success, 
        message: 'Admin notification email sent',
        messageId: result.messageId 
      })
    } else {
      return NextResponse.json({ error: 'Invalid type. Use "user" or "admin"' }, { status: 400 })
    }
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { error: 'Failed to send test email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
