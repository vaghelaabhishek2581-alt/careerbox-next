import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongoose'
import { ContactMessage } from '@/src/models'

// POST - Create a new contact message (public endpoint)
export async function POST (request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, mobile, message, type } = body

    // Validation
    if (!name || !email || !mobile || !message) {
      return NextResponse.json(
        {
          success: false,
          message: 'Name, email, mobile, and message are required'
        },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Mobile validation (basic)
    const mobileRegex = /^[+]?[\d\s-]{10,}$/
    if (!mobileRegex.test(mobile)) {
      return NextResponse.json(
        { success: false, message: 'Invalid mobile number format' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Create contact message
    const contactMessage = new ContactMessage({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      message: message.trim(),
      type: type || 'general',
      status: 'new'
    })

    await contactMessage.save()

    console.log(
      `[CONTACT] New message from ${email} - Type: ${type || 'general'}`
    )

    return NextResponse.json({
      success: true,
      message:
        'Your message has been sent successfully. We will get back to you soon!'
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}
