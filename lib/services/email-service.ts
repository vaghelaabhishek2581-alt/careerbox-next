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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to CareerBox!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background-color: #6366f1; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #4f46e5;">${verificationLink}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account with CareerBox, please ignore this email.</p>
      </div>
    `
  })
}

export async function sendOTPEmail (email: string, otp: string) {
  return sendEmail({
    to: email,
    subject: 'Your verification code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify your email address</h2>
        <p>Your verification code is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #4f46e5;">
            ${otp}
          </div>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Address Change</h2>
        <p>Your email address has been changed to: ${newEmail}</p>
        <p>If you didn't make this change, please contact support immediately.</p>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #6366f1; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #4f46e5;">${resetLink}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px; font-weight: bold;">CB</span>
            </div>
            <h1 style="color: #1f2937; margin: 0; font-size: 24px;">CareerBox</h1>
          </div>

          <!-- Main Content -->
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background-color: #10b981; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 36px;">✓</span>
            </div>
            <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 28px;">Registration Request Received!</h2>
            <p style="color: #6b7280; font-size: 16px; margin: 0;">Your institute registration has been successfully submitted.</p>
          </div>

          <!-- Registration Details -->
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Registration Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Registration ID:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">#${registrationId
                  .slice(-8)
                  .toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Institute Name:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${organizationName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Contact Person:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${contactName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Status:</td>
                <td style="padding: 8px 0;">
                  <span style="background-color: #fbbf24; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">UNDER REVIEW</span>
                </td>
              </tr>
            </table>
          </div>

          <!-- What's Next -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">What happens next?</h3>
            <div style="text-align: left;">
              <div style="display: flex; margin-bottom: 12px; align-items: flex-start;">
                <span style="color: #6366f1; font-weight: bold; margin-right: 10px; margin-top: 2px;">1.</span>
                <span style="color: #4b5563;">Our team will review your registration details within 2-3 business days</span>
              </div>
              <div style="display: flex; margin-bottom: 12px; align-items: flex-start;">
                <span style="color: #6366f1; font-weight: bold; margin-right: 10px; margin-top: 2px;">2.</span>
                <span style="color: #4b5563;">We may contact you for additional information or verification</span>
              </div>
              <div style="display: flex; margin-bottom: 12px; align-items: flex-start;">
                <span style="color: #6366f1; font-weight: bold; margin-right: 10px; margin-top: 2px;">3.</span>
                <span style="color: #4b5563;">Once approved, you'll receive access to your institute dashboard</span>
              </div>
              <div style="display: flex; align-items: flex-start;">
                <span style="color: #6366f1; font-weight: bold; margin-right: 10px; margin-top: 2px;">4.</span>
                <span style="color: #4b5563;">You can then start managing courses, students, and more!</span>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${dashboardLink}" 
               style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
              Go to Dashboard
            </a>
          </div>

          <!-- Support -->
          <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <h4 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">Need Help?</h4>
            <p style="color: #1e40af; margin: 0; font-size: 14px;">
              If you have any questions about your registration, please contact our support team at 
              <a href="mailto:support@careerbox.in" style="color: #1e40af; text-decoration: underline;">support@careerbox.in</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px; font-weight: bold;">CB</span>
            </div>
            <h1 style="color: #1f2937; margin: 0; font-size: 24px;">CareerBox</h1>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background-color: #10b981; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 36px;">✓</span>
            </div>
            <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 28px;">Application Submitted!</h2>
            <p style="color: #6b7280; font-size: 16px; margin: 0;">Dear ${userName}, your course application has been successfully submitted.</p>
          </div>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Application Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Application ID:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">#${applicationId
                  .slice(-8)
                  .toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Institute:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${instituteName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Course:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${courseName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Status:</td>
                <td style="padding: 8px 0;">
                  <span style="background-color: #fbbf24; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">UNDER REVIEW</span>
                </td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">What happens next?</h3>
            <div style="text-align: left;">
              <div style="display: flex; margin-bottom: 12px; align-items: flex-start;">
                <span style="color: #6366f1; font-weight: bold; margin-right: 10px; margin-top: 2px;">1.</span>
                <span style="color: #4b5563;">Our admission team will review your application within 2-3 business days</span>
              </div>
              <div style="display: flex; margin-bottom: 12px; align-items: flex-start;">
                <span style="color: #6366f1; font-weight: bold; margin-right: 10px; margin-top: 2px;">2.</span>
                <span style="color: #4b5563;">We may contact you for additional information or documents</span>
              </div>
              <div style="display: flex; margin-bottom: 12px; align-items: flex-start;">
                <span style="color: #6366f1; font-weight: bold; margin-right: 10px; margin-top: 2px;">3.</span>
                <span style="color: #4b5563;">You'll receive an update on your application status via email</span>
              </div>
              <div style="display: flex; align-items: flex-start;">
                <span style="color: #6366f1; font-weight: bold; margin-right: 10px; margin-top: 2px;">4.</span>
                <span style="color: #4b5563;">If selected, you'll receive further instructions for enrollment</span>
              </div>
            </div>
          </div>

          <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <h4 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">Need Help?</h4>
            <p style="color: #1e40af; margin: 0; font-size: 14px;">
              If you have any questions about your application, please contact us at 
              <a href="mailto:support@careerbox.in" style="color: #1e40af; text-decoration: underline;">support@careerbox.in</a>
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This email was sent to ${email}. If you didn't apply for this course, please ignore this email.
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #dc2626, #b91c1c); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px; font-weight: bold;">!</span>
            </div>
            <h1 style="color: #1f2937; margin: 0; font-size: 24px;">New Course Application</h1>
          </div>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Student Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
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
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${
                  userPhone || 'Not provided'
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">City:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${
                  userCity || 'Not provided'
                }</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Application Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Application ID:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">#${applicationId
                  .slice(-8)
                  .toUpperCase()}</td>
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

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Eligibility Exams</h3>
            <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
              ${examsHtml}
            </ul>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${
              process.env.NEXT_PUBLIC_APP_URL
            }/dashboard/admin/student-leads" 
               style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
              View Application
            </a>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This is an automated notification from CareerBox.
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px; font-weight: bold;">CB</span>
            </div>
            <h1 style="color: #1f2937; margin: 0; font-size: 24px;">CareerBox</h1>
          </div>

          <!-- Main Content -->
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background-color: #10b981; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 36px;">✓</span>
            </div>
            <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 28px;">Registration Request Received!</h2>
            <p style="color: #6b7280; font-size: 16px; margin: 0;">Your business registration has been successfully submitted.</p>
          </div>

          <!-- Registration Details -->
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Registration Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Registration ID:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">#${registrationId
                  .slice(-8)
                  .toUpperCase()}</td>
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
                  <span style="background-color: #fbbf24; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">UNDER REVIEW</span>
                </td>
              </tr>
            </table>
          </div>

          <!-- What's Next -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">What happens next?</h3>
            <div style="text-align: left;">
              <div style="display: flex; margin-bottom: 12px; align-items: flex-start;">
                <span style="color: #f59e0b; font-weight: bold; margin-right: 10px; margin-top: 2px;">1.</span>
                <span style="color: #4b5563;">Our team will review your registration details within 2-3 business days</span>
              </div>
              <div style="display: flex; margin-bottom: 12px; align-items: flex-start;">
                <span style="color: #f59e0b; font-weight: bold; margin-right: 10px; margin-top: 2px;">2.</span>
                <span style="color: #4b5563;">We may contact you for additional information or verification</span>
              </div>
              <div style="display: flex; margin-bottom: 12px; align-items: flex-start;">
                <span style="color: #f59e0b; font-weight: bold; margin-right: 10px; margin-top: 2px;">3.</span>
                <span style="color: #4b5563;">Once approved, you'll receive access to your business dashboard</span>
              </div>
              <div style="display: flex; align-items: flex-start;">
                <span style="color: #f59e0b; font-weight: bold; margin-right: 10px; margin-top: 2px;">4.</span>
                <span style="color: #4b5563;">You can then start posting jobs, finding talent, and more!</span>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${dashboardLink}" 
               style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
              Go to Dashboard
            </a>
          </div>

          <!-- Support -->
          <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h4 style="color: #d97706; margin: 0 0 10px 0; font-size: 16px;">Need Help?</h4>
            <p style="color: #d97706; margin: 0; font-size: 14px;">
              If you have any questions about your registration, please contact our support team at 
              <a href="mailto:support@careerbox.in" style="color: #d97706; text-decoration: underline;">support@careerbox.in</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
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
