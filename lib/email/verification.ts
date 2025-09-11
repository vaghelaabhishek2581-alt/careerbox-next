import { connectToDatabase } from '@/lib/db/mongodb'
import crypto from 'crypto'

export interface EmailVerificationToken {
  token: string
  email: string
  expiresAt: Date
  createdAt: Date
}

/**
 * Generate a secure verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Create email verification record
 */
export async function createEmailVerification(email: string): Promise<{
  success: boolean
  token?: string
  error?: string
}> {
  try {
    const { db } = await connectToDatabase()
    
    // Generate token
    const token = generateVerificationToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    // Remove any existing verification tokens for this email
    await db.collection('email_verifications').deleteMany({ email })
    
    // Create new verification record
    await db.collection('email_verifications').insertOne({
      token,
      email: email.toLowerCase(),
      expiresAt,
      createdAt: new Date(),
      verified: false
    })
    
    return {
      success: true,
      token
    }
  } catch (error) {
    console.error('Error creating email verification:', error)
    return {
      success: false,
      error: 'Failed to create verification token'
    }
  }
}

/**
 * Verify email token
 */
export async function verifyEmailToken(token: string): Promise<{
  success: boolean
  email?: string
  error?: string
}> {
  try {
    const { db } = await connectToDatabase()
    
    // Find verification record
    const verification = await db.collection('email_verifications').findOne({
      token,
      verified: false,
      expiresAt: { $gt: new Date() }
    })
    
    if (!verification) {
      return {
        success: false,
        error: 'Invalid or expired verification token'
      }
    }
    
    // Mark as verified
    await db.collection('email_verifications').updateOne(
      { token },
      { $set: { verified: true, verifiedAt: new Date() } }
    )
    
    // Update user email verification status
    await db.collection('users').updateOne(
      { email: verification.email },
      { $set: { emailVerified: true, updatedAt: new Date() } }
    )
    
    return {
      success: true,
      email: verification.email
    }
  } catch (error) {
    console.error('Error verifying email token:', error)
    return {
      success: false,
      error: 'Failed to verify email'
    }
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email: string, name: string, token: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // TODO: Implement actual email sending service (SendGrid, AWS SES, etc.)
    // For now, just log the verification link
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`
    
    console.log(`Verification email for ${email}:`)
    console.log(`Verification URL: ${verificationUrl}`)
    
    // In production, you would send an actual email here
    // Example with SendGrid:
    // const msg = {
    //   to: email,
    //   from: 'noreply@careerbox.com',
    //   subject: 'Verify your CareerBox account',
    //   html: generateVerificationEmailHTML(name, verificationUrl)
    // }
    // await sgMail.send(msg)
    
    return { success: true }
  } catch (error) {
    console.error('Error sending verification email:', error)
    return {
      success: false,
      error: 'Failed to send verification email'
    }
  }
}

/**
 * Generate verification email HTML template
 */
export function generateVerificationEmailHTML(name: string, verificationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your CareerBox account</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to CareerBox!</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Hi ${name}!</h2>
        
        <p>Thank you for signing up for CareerBox! We're excited to have you join our community of students, professionals, and organizations.</p>
        
        <p>To get started, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px; font-family: monospace;">
          ${verificationUrl}
        </p>
        
        <p><strong>This link will expire in 24 hours.</strong></p>
        
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #6c757d;">
          If you didn't create an account with CareerBox, you can safely ignore this email.
        </p>
        
        <p style="font-size: 14px; color: #6c757d;">
          Best regards,<br>
          The CareerBox Team
        </p>
      </div>
    </body>
    </html>
  `
}
