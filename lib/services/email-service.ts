import nodemailer from 'nodemailer'
import { generateOTP } from '@/lib/utils'

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

export async function sendEmail ({ to, subject, text, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"CareerBox" <noreply@careerbox.in>',
      to,
      subject,
      text,
      html
    })
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}

export async function sendVerificationEmail (email: string, token: string) {
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

  return sendEmail({
    to: email,
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden;">
          <div style="text-align: center; padding: 28px 24px 0;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/Logo.svg" alt="CareerBox Logo" width="32" height="32" style="display:inline-block; object-fit: contain;" />
            <h1 style="margin: 12px 0 0; font-size: 22px; color: #111827;">CareerBox</h1>
          </div>
          <div style="padding: 24px;">
            <h2 style="margin: 0 0 8px; font-size: 20px; color: #111827;">Verify your email</h2>
            <p style="margin: 0 0 16px; color: #4b5563; font-size: 14px;">Please confirm your email address to finish setting up your account.</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${verificationLink}" style="background: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">Verify Email</a>
            </div>
            <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px;">If the button doesn’t work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb; font-size: 12px;">${verificationLink}</p>
            <p style="margin: 16px 0 0; color: #6b7280; font-size: 12px;">This link expires in 24 hours. If you didn’t create an account, you can safely ignore this email.</p>
          </div>
          <div style="text-align: center; padding: 16px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} CareerBox. All rights reserved.</p>
          </div>
        </div>
      </div>
    `
  })
}

export async function sendOTPEmail (email: string, otp: string) {
  return sendEmail({
    to: email,
    subject: 'Your verification code',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden;">
          <div style="text-align: center; padding: 28px 24px 0;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/Logo.svg" alt="CareerBox Logo" width="32" height="32" style="display:inline-block; object-fit: contain;" />
            <h1 style="margin: 12px 0 0; font-size: 22px; color: #111827;">CareerBox</h1>
          </div>
          <div style="padding: 24px;">
            <h2 style="margin: 0 0 8px; font-size: 20px; color: #111827;">Verification code</h2>
            <p style="margin: 0 0 16px; color: #4b5563; font-size: 14px;">Use the code below to verify your email address.</p>
            <div style="text-align: center; margin: 24px 0;">
              <div style="font-size: 30px; letter-spacing: 10px; font-weight: 700; color: #4f46e5;">${otp}</div>
            </div>
            <p style="margin: 0; color: #6b7280; font-size: 12px;">This code expires in 10 minutes. If you didn’t request it, you can ignore this email.</p>
          </div>
          <div style="text-align: center; padding: 16px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} CareerBox. All rights reserved.</p>
          </div>
        </div>
      </div>
    `
  })
}

export async function sendEmailChangeNotification (
  email: string,
  newEmail: string
) {
  return sendEmail({
    to: email,
    subject: 'Email address change notification',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden;">
          <div style="text-align: center; padding: 28px 24px 0;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/Logo.svg" alt="CareerBox Logo" width="32" height="32" style="display:inline-block; object-fit: contain;" />
            <h1 style="margin: 12px 0 0; font-size: 22px; color: #111827;">CareerBox</h1>
          </div>
          <div style="padding: 24px;">
            <h2 style="margin: 0 0 8px; font-size: 20px; color: #111827;">Email address updated</h2>
            <p style="margin: 0 0 8px; color: #4b5563; font-size: 14px;">Your account email has been changed to <span style="font-weight:600; color:#111827">${newEmail}</span>.</p>
            <p style="margin: 0; color: #6b7280; font-size: 12px;">If you didn’t perform this change, contact support immediately at <a href="mailto:support@careerbox.in" style="color:#2563eb; text-decoration:underline">support@careerbox.in</a>.</p>
          </div>
          <div style="text-align: center; padding: 16px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} CareerBox. All rights reserved.</p>
          </div>
        </div>
      </div>
    `
  })
}

export async function sendPasswordResetEmail (email: string, token: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

  return sendEmail({
    to: email,
    subject: 'Reset your password',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden;">
          <div style="text-align: center; padding: 28px 24px 0;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/Logo.svg" alt="CareerBox Logo" width="32" height="32" style="display:inline-block; object-fit: contain;" />
            <h1 style="margin: 12px 0 0; font-size: 22px; color: #111827;">CareerBox</h1>
          </div>
          <div style="padding: 24px;">
            <h2 style="margin: 0 0 8px; font-size: 20px; color: #111827;">Reset your password</h2>
            <p style="margin: 0 0 16px; color: #4b5563; font-size: 14px;">Click the button below to create a new password for your account.</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetLink}" style="background: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">Reset Password</a>
            </div>
            <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px;">If the button doesn’t work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb; font-size: 12px;">${resetLink}</p>
            <p style="margin: 16px 0 0; color: #6b7280; font-size: 12px;">This link expires in 1 hour. If you didn’t request a reset, you can ignore this email.</p>
          </div>
          <div style="text-align: center; padding: 16px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} CareerBox. All rights reserved.</p>
          </div>
        </div>
      </div>
    `
  })
}

export async function sendInstituteRegistrationConfirmation (
  email: string,
  organizationName: string,
  contactName: string,
  registrationId: string
) {
  const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`

  return sendEmail({
    to: email,
    subject: 'Institute Registration Request Received - CareerBox',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden;">
          <div style="text-align: center; padding: 28px 24px 0;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/Logo.svg" alt="CareerBox Logo" width="32" height="32" style="display:inline-block; object-fit: contain;" />
            <h1 style="margin: 12px 0 0; font-size: 22px; color: #111827;">CareerBox</h1>
          </div>
          <div style="padding: 24px;">
            <h2 style="margin: 0 0 8px; font-size: 20px; color: #111827;">Registration received</h2>
            <p style="margin: 0 0 16px; color: #4b5563; font-size: 14px;">Your institute registration was submitted successfully. We’ll review the details shortly.</p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
                <tr><td style="padding:8px 0; color:#6b7280;">Registration ID</td><td style="padding:8px 0; font-weight:600;">#${registrationId.slice(-8).toUpperCase()}</td></tr>
                <tr><td style="padding:8px 0; color:#6b7280;">Institute Name</td><td style="padding:8px 0; font-weight:600;">${organizationName}</td></tr>
                <tr><td style="padding:8px 0; color:#6b7280;">Contact Person</td><td style="padding:8px 0; font-weight:600;">${contactName}</td></tr>
                <tr><td style="padding:8px 0; color:#6b7280;">Status</td><td style="padding:8px 0;"><span style="background:#fef3c7; color:#92400e; padding:4px 10px; border-radius:16px; font-size:12px; font-weight:600;">Under Review</span></td></tr>
              </table>
            </div>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${dashboardLink}" style="background: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">Go to Dashboard</a>
            </div>
            <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6; font-size: 13px; color:#1e40af;">
              If you have questions, contact <a href="mailto:support@careerbox.in" style="color:#1e40af; text-decoration:underline;">support@careerbox.in</a>.
            </div>
          </div>
          <div style="text-align: center; padding: 16px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} CareerBox. All rights reserved.</p>
          </div>
        </div>
      </div>
    `
  })
}

// Course Application Email Templates
export async function sendCourseApplicationConfirmation (
  email: string,
  userName: string,
  instituteName: string,
  courseName: string,
  applicationId: string
) {
  return sendEmail({
    to: email,
    subject: `Application Submitted Successfully - ${instituteName}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden;">
          <div style="text-align: center; padding: 28px 24px 0;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/Logo.svg" alt="CareerBox Logo" width="32" height="32" style="display:inline-block; object-fit: contain;" />
            <h1 style="margin: 12px 0 0; font-size: 22px; color: #111827;">CareerBox</h1>
          </div>
          <div style="padding: 24px;">
            <h2 style="margin: 0 0 8px; font-size: 20px; color: #111827;">Application submitted</h2>
            <p style="margin: 0 0 16px; color: #4b5563; font-size: 14px;">Dear ${userName}, your course application has been submitted successfully.</p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
                <tr><td style="padding:8px 0; color:#6b7280;">Application ID</td><td style="padding:8px 0; font-weight:600;">#${applicationId.slice(-8).toUpperCase()}</td></tr>
                <tr><td style="padding:8px 0; color:#6b7280;">Institute</td><td style="padding:8px 0; font-weight:600;">${instituteName}</td></tr>
                <tr><td style="padding:8px 0; color:#6b7280;">Course</td><td style="padding:8px 0; font-weight:600;">${courseName}</td></tr>
                <tr><td style="padding:8px 0; color:#6b7280;">Status</td><td style="padding:8px 0;"><span style="background:#fef3c7; color:#92400e; padding:4px 10px; border-radius:16px; font-size:12px; font-weight:600;">Under Review</span></td></tr>
              </table>
            </div>
            <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6; font-size: 13px; color:#1e40af;">
              If you have questions, contact <a href="mailto:support@careerbox.in" style="color:#1e40af; text-decoration:underline;">support@careerbox.in</a>.
            </div>
            <div style="text-align: center; margin-top: 24px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">Go to Dashboard</a>
            </div>
          </div>
          <div style="text-align: center; padding: 16px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} CareerBox. All rights reserved.</p>
          </div>
        </div>
      </div>
    `
  })
}

export async function sendCourseApplicationAdminNotification (
  adminEmail: string,
  userName: string,
  userEmail: string,
  userPhone: string,
  userCity: string,
  instituteName: string,
  courseName: string,
  applicationId: string,
  eligibilityExams?: Array<{ exam: string; score: string }>
) {
  const examsHtml =
    eligibilityExams && eligibilityExams.length > 0
      ? eligibilityExams
          .map(exam => `<li>${exam.exam}: ${exam.score}</li>`)
          .join('')
      : '<li>No exams provided</li>'

  return sendEmail({
    to: adminEmail,
    subject: `New Course Application - ${instituteName}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden;">
          <div style="text-align: center; padding: 28px 24px 0;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/Logo.svg" alt="CareerBox Logo" width="32" height="32" style="display:inline-block; object-fit: contain;" />
            <h1 style="margin: 12px 0 0; font-size: 22px; color: #111827;">CareerBox</h1>
          </div>
          <div style="padding: 24px;">
            <h2 style="margin: 0 0 8px; font-size: 20px; color: #111827;">New Course Application</h2>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3 style="color: #111827; margin: 0 0 12px; font-size: 16px;">Student Details</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Name:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${userName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Email:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${userEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Phone:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${userPhone || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">City:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${userCity || 'Not provided'}</td>
                </tr>
              </table>
            </div>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3 style="color: #111827; margin: 0 0 12px; font-size: 16px;">Application Details</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Application ID:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">#${applicationId.slice(-8).toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Institute:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${instituteName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Course:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${courseName}</td>
                </tr>
              </table>
            </div>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3 style="color: #111827; margin: 0 0 12px; font-size: 16px;">Eligibility Exams</h3>
              <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                ${examsHtml}
              </ul>
            </div>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/student-leads" 
                 style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
                View Application
              </a>
            </div>
          </div>
          <div style="text-align: center; padding: 16px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">This is an automated notification from CareerBox.</p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">© 2024 CareerBox. All rights reserved.</p>
          </div>
        </div>
      </div>
    `
  })
}

export async function sendBusinessRegistrationConfirmation (
  email: string,
  organizationName: string,
  contactName: string,
  registrationId: string
) {
  const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`

  return sendEmail({
    to: email,
    subject: 'Business Registration Request Received - CareerBox',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden;">
          <div style="text-align: center; padding: 28px 24px 0;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/Logo.svg" alt="CareerBox Logo" width="32" height="32" style="display:inline-block; object-fit: contain;" />
            <h1 style="margin: 12px 0 0; font-size: 22px; color: #111827;">CareerBox</h1>
          </div>
          <div style="padding: 24px;">
            <h2 style="margin: 0 0 8px; font-size: 20px; color: #111827;">Registration Request Received!</h2>
            <p style="margin: 0 0 16px; color: #4b5563; font-size: 14px;">Your business registration has been submitted successfully.</p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3 style="color: #111827; margin: 0 0 12px; font-size: 16px;">Registration Details</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Registration ID:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">#${registrationId.slice(-8).toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Business Name:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${organizationName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Contact Person:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${contactName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Status:</td>
                  <td style="padding: 8px 0;">
                    <span style="background:#fef3c7; color:#92400e; padding:4px 10px; border-radius:16px; font-size:12px; font-weight:600;">Under Review</span>
                  </td>
                </tr>
              </table>
            </div>
            <div style="margin-bottom: 16px;">
              <h3 style="color: #111827; margin: 0 0 12px; font-size: 16px;">What happens next?</h3>
              <div style="text-align: left; color: #4b5563; font-size: 14px;">
                <div style="display: flex; margin-bottom: 8px;">
                  <span style="color: #4f46e5; font-weight: 600; margin-right: 10px;">1.</span>
                  <span>Our team will review your registration details within 2-3 business days</span>
                </div>
                <div style="display: flex; margin-bottom: 8px;">
                  <span style="color: #4f46e5; font-weight: 600; margin-right: 10px;">2.</span>
                  <span>We may contact you for additional information or verification</span>
                </div>
                <div style="display: flex; margin-bottom: 8px;">
                  <span style="color: #4f46e5; font-weight: 600; margin-right: 10px;">3.</span>
                  <span>Once approved, you'll receive access to your business dashboard</span>
                </div>
                <div style="display: flex;">
                  <span style="color: #4f46e5; font-weight: 600; margin-right: 10px;">4.</span>
                  <span>You can then start posting jobs, finding talent, and more!</span>
                </div>
              </div>
            </div>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${dashboardLink}" 
                 style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
                Go to Dashboard
              </a>
            </div>
            <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6; font-size: 13px; color:#1e40af;">
              If you have any questions about your registration, please contact our support team at 
              <a href="mailto:support@careerbox.in" style="color:#1e40af; text-decoration:underline;">support@careerbox.in</a>
            </div>
          </div>
          <div style="text-align: center; padding: 16px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This email was sent to ${email}. If you didn't register for CareerBox, please ignore this email.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              © 2024 CareerBox. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `
  })
}

// Helper function to mask contact details for free plan users
export function maskContactDetails (
  fullName: string,
  email: string,
  phone: string
) {
  return {
    fullName: fullName
      ? fullName.replace(/(.{1})(.*)( .*)/, '$1*****$3')
      : 'Student',
    email: email ? email.replace(/(.{1})(.*)(@.*)/, '$1***$3') : '',
    phone: phone ? phone.replace(/(\d{2})\d+(\d{2})/, '$1******$2') : ''
  }
}

// Send notification to institute owner about new lead
export async function sendNewLeadNotificationToInstitute (
  ownerEmail: string,
  ownerName: string,
  instituteName: string,
  leadDetails: {
    fullName: string
    email: string
    phone: string
    city?: string
    courseName?: string
    applicationId: string
  },
  isPaidPlan: boolean
) {
  // Mask contact details if free plan
  const displayDetails = isPaidPlan
    ? leadDetails
    : {
        ...leadDetails,
        ...maskContactDetails(
          leadDetails.fullName,
          leadDetails.email,
          leadDetails.phone
        )
      }

  const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL}/institute/leads`
  const upgradeNote = !isPaidPlan
    ? `
    <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
      <p style="color: #92400e; margin: 0; font-size: 14px;">
        <strong>🔒 Contact details are masked.</strong> Upgrade to a Premium plan to view full contact information and connect with students directly.
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/institute/subscription" 
         style="color: #92400e; text-decoration: underline; font-weight: 600;">Upgrade Now</a>
    </div>
  `
    : ''

  return sendEmail({
    to: ownerEmail,
    subject: `🎉 New Student Lead for ${instituteName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px; font-weight: bold;">🎓</span>
            </div>
            <h1 style="color: #1f2937; margin: 0; font-size: 24px;">New Student Lead!</h1>
          </div>

          <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">Dear ${ownerName},</p>
          <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">
            Great news! A student has shown interest in <strong>${instituteName}</strong>.
          </p>

          ${upgradeNote}

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Lead Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Application ID:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">#${leadDetails.applicationId
                  .slice(-8)
                  .toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Student Name:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${
                  displayDetails.fullName
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Email:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${
                  displayDetails.email || 'Not provided'
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Phone:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${
                  displayDetails.phone || 'Not provided'
                }</td>
              </tr>
              ${
                displayDetails.city
                  ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">City:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${displayDetails.city}</td>
              </tr>
              `
                  : ''
              }
              ${
                displayDetails.courseName
                  ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Course Interest:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${displayDetails.courseName}</td>
              </tr>
              `
                  : ''
              }
            </table>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${dashboardLink}" 
               style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
              View All Leads
            </a>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This notification was sent for ${instituteName} on CareerBox.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              © 2024 CareerBox. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `
  })
}
