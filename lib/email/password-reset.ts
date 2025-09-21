import { connectToDatabase } from '@/lib/db/mongoose'
import { PasswordReset, User } from '@/src/models'
import crypto from 'crypto'

export interface PasswordResetToken {
  token: string
  email: string
  expiresAt: Date
  createdAt: Date
}

/**
 * Generate a secure password reset token
 */
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Create password reset record
 */
export async function createPasswordReset(email: string): Promise<{
  success: boolean
  token?: string
  error?: string
}> {
  try {
    await connectToDatabase()
    
    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return {
        success: false,
        error: 'No account found with this email address'
      }
    }
    
    // Generate token
    const token = generatePasswordResetToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    
    // Remove any existing password reset tokens for this email
    await PasswordReset.deleteMany({ email: email.toLowerCase() })
    
    // Create new password reset record
    const passwordReset = new PasswordReset({
      token,
      email: email.toLowerCase(),
      expiresAt,
      used: false
    })
    
    await passwordReset.save()
    
    return {
      success: true,
      token
    }
  } catch (error) {
    console.error('Error creating password reset:', error)
    return {
      success: false,
      error: 'Failed to create password reset token'
    }
  }
}

/**
 * Verify password reset token
 */
export async function verifyPasswordResetToken(token: string): Promise<{
  success: boolean
  email?: string
  error?: string
}> {
  try {
    await connectToDatabase()
    
    // Find password reset record
    const passwordReset = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    })
    
    if (!passwordReset) {
      return {
        success: false,
        error: 'Invalid or expired password reset token'
      }
    }
    
    return {
      success: true,
      email: passwordReset.email
    }
  } catch (error) {
    console.error('Error verifying password reset token:', error)
    return {
      success: false,
      error: 'Failed to verify password reset token'
    }
  }
}

/**
 * Reset password using token
 */
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    await connectToDatabase()
    
    // Find and verify password reset record
    const passwordReset = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    })
    
    if (!passwordReset) {
      return {
        success: false,
        error: 'Invalid or expired password reset token'
      }
    }
    
    // Hash new password
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    // Update user password
    await User.findOneAndUpdate(
      { email: passwordReset.email },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      }
    )
    
    // Mark password reset as used
    await PasswordReset.findByIdAndUpdate(
      passwordReset._id,
      { $set: { used: true, usedAt: new Date() } }
    )
    
    return {
      success: true
    }
  } catch (error) {
    console.error('Error resetting password:', error)
    return {
      success: false,
      error: 'Failed to reset password'
    }
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, name: string, token: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const nodemailer = require('nodemailer')
    
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`
    
    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
    
    // Send email
    const mailOptions = {
      from: `"CareerBox" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset your CareerBox password',
      html: generatePasswordResetEmailHTML(name, resetUrl)
    }

    await transporter.sendMail(mailOptions)
    
    console.log(`Password reset email sent to ${email}`)
    return { success: true }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return {
      success: false,
      error: 'Failed to send password reset email'
    }
  }
}

/**
 * Generate password reset email HTML template
 */
export function generatePasswordResetEmailHTML(name: string, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset your CareerBox password</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Hi ${name}!</h2>
        
        <p>We received a request to reset your password for your CareerBox account.</p>
        
        <p>If you requested this password reset, please click the button below to set a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px; font-family: monospace;">
          ${resetUrl}
        </p>
        
        <p><strong>This link will expire in 1 hour.</strong></p>
        
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #6c757d;">
          If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
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
