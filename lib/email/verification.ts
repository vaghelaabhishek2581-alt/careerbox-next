import { connectToDatabase } from '@/lib/db/mongoose'
import { EmailVerification, User } from '@/src/models'
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
export function generateVerificationToken (): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Create email verification record
 */
export async function createEmailVerification (email: string): Promise<{
  success: boolean
  token?: string
  error?: string
}> {
  try {
    await connectToDatabase()

    // Generate token
    const token = generateVerificationToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Remove any existing verification tokens for this email
    await EmailVerification.deleteMany({ email })

    // Create new verification record
    const verification = new EmailVerification({
      token,
      email: email.toLowerCase(),
      expiresAt,
      verified: false
    })

    await verification.save()

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

// Helper function for logging
function logTokenVerification (step: string, data: Record<string, any>) {
  const timestamp = new Date().toISOString()
  console.log(`\n---------- [TOKEN-VERIFY] ${timestamp} ----------`)
  console.log(`[STEP]: ${step}`)
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'token') {
      console.log(
        `[${key.toUpperCase()}]:`,
        value
          ? `${String(value).substring(0, 10)}...${String(value).substring(
              String(value).length - 10
            )}`
          : 'null'
      )
    } else {
      console.log(`[${key.toUpperCase()}]:`, value)
    }
  })
  console.log(`-------------------------------------------------\n`)
}

/**
 * Verify email token
 */
export async function verifyEmailToken (token: string): Promise<{
  success: boolean
  email?: string
  error?: string
}> {
  try {
    logTokenVerification('Starting verification', {
      token,
      tokenLength: token?.length
    })

    await connectToDatabase()
    logTokenVerification('Database connected', {})

    // First, let's check if the token exists at all (without conditions)
    const tokenExists = await EmailVerification.findOne({ token })
    logTokenVerification('Token existence check', {
      tokenFound: !!tokenExists,
      recordDetails: tokenExists
        ? {
            id: tokenExists._id?.toString(),
            email: tokenExists.email,
            verified: tokenExists.verified,
            expiresAt: tokenExists.expiresAt?.toISOString(),
            createdAt: tokenExists.createdAt?.toISOString(),
            isExpired: tokenExists.expiresAt
              ? new Date() > tokenExists.expiresAt
              : 'unknown'
          }
        : 'No record found'
    })

    // If token doesn't exist at all
    if (!tokenExists) {
      // Let's also check how many verification records exist
      const totalRecords = await EmailVerification.countDocuments()
      const recentRecords = await EmailVerification.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()

      logTokenVerification('Token not found - diagnostics', {
        totalVerificationRecords: totalRecords,
        recentTokens: recentRecords.map(r => ({
          tokenPreview: r.token ? `${r.token.substring(0, 10)}...` : 'null',
          email: r.email,
          verified: r.verified,
          expiresAt: r.expiresAt
        }))
      })

      return {
        success: false,
        error: 'Invalid or expired verification token'
      }
    }

    // Check if already verified
    if (tokenExists.verified) {
      logTokenVerification('Token already used', {
        verifiedAt: tokenExists.verifiedAt?.toISOString()
      })
      return {
        success: false,
        error: 'This verification link has already been used'
      }
    }

    // Check if expired
    if (tokenExists.expiresAt && new Date() > tokenExists.expiresAt) {
      logTokenVerification('Token expired', {
        expiresAt: tokenExists.expiresAt.toISOString(),
        currentTime: new Date().toISOString()
      })
      return {
        success: false,
        error: 'This verification link has expired. Please request a new one.'
      }
    }

    // Mark as verified
    logTokenVerification('Marking token as verified', {
      id: tokenExists._id?.toString()
    })
    await EmailVerification.findByIdAndUpdate(tokenExists._id, {
      $set: { verified: true, verifiedAt: new Date() }
    })

    // Update user email verification status
    logTokenVerification('Updating user emailVerified status', {
      email: tokenExists.email
    })
    const userUpdateResult = await User.findOneAndUpdate(
      { email: tokenExists.email },
      { $set: { emailVerified: true, updatedAt: new Date() } },
      { new: true }
    )

    logTokenVerification('User update result', {
      userFound: !!userUpdateResult,
      userId: userUpdateResult?._id?.toString(),
      emailVerified: userUpdateResult?.emailVerified
    })

    logTokenVerification('Verification complete - SUCCESS', {
      email: tokenExists.email
    })

    return {
      success: true,
      email: tokenExists.email
    }
  } catch (error) {
    logTokenVerification('ERROR in verifyEmailToken', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'N/A'
    })
    return {
      success: false,
      error: 'Failed to verify email'
    }
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail (
  email: string,
  name: string,
  token: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const nodemailer = require('nodemailer')

    const verificationUrl = `${
      process.env.NEXTAUTH_URL || 'http://localhost:3000'
    }/auth/verify-email?token=${token}`

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
      subject: 'Verify your CareerBox account',
      html: generateVerificationEmailHTML(name, verificationUrl)
    }

    await transporter.sendMail(mailOptions)

    console.log(`Verification email sent to ${email}`)
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
export function generateVerificationEmailHTML (
  name: string,
  verificationUrl: string
): string {
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
