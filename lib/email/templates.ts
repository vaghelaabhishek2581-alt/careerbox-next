import { z } from 'zod';

// Email template schema
export const EmailTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  subject: z.string(),
  content: z.string(), // HTML content
  category: z.enum(['welcome', 'transactional', 'marketing', 'administrative']),
  variables: z.array(z.string()), // Available variables like {{userName}}, {{courseName}}
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(), // Admin user ID
  version: z.number().default(1)
});

export type EmailTemplate = z.infer<typeof EmailTemplateSchema>;

// Email categories
export const EMAIL_CATEGORIES = {
  WELCOME: 'welcome',
  TRANSACTIONAL: 'transactional',
  MARKETING: 'marketing',
  ADMINISTRATIVE: 'administrative'
} as const;

// Default email templates
export const DEFAULT_EMAIL_TEMPLATES: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>[] = [
  {
    name: 'Welcome Email',
    subject: 'Welcome to CareerBox, {{userName}}!',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to CareerBox!</h1>
        <p>Hi {{userName}},</p>
        <p>Welcome to CareerBox! We're excited to have you join our community of professionals, students, and educational institutions.</p>
        <p>Here's what you can do on CareerBox:</p>
        <ul>
          <li>Discover job opportunities and career paths</li>
          <li>Find courses and educational programs</li>
          <li>Connect with professionals in your field</li>
          <li>Access exclusive resources and tools</li>
        </ul>
        <p>Get started by completing your profile and exploring our platform.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{profileUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Complete Your Profile</a>
        </div>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The CareerBox Team</p>
      </div>
    `,
    category: 'welcome',
    variables: ['userName', 'profileUrl'],
    isActive: true,
    version: 1
  },
  {
    name: 'Payment Confirmation',
    subject: 'Payment Confirmation - {{planType}} Subscription',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">Payment Confirmed!</h1>
        <p>Hi {{userName}},</p>
        <p>Your payment has been successfully processed. Here are the details:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Subscription Details</h3>
          <p><strong>Plan:</strong> {{planType}}</p>
          <p><strong>Billing Cycle:</strong> {{billingCycle}}</p>
          <p><strong>Amount:</strong> ₹{{amount}}</p>
          <p><strong>Payment ID:</strong> {{paymentId}}</p>
          <p><strong>Valid Until:</strong> {{endDate}}</p>
        </div>
        <p>You now have access to all premium features. Start exploring your new capabilities!</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Go to Dashboard</a>
        </div>
        <p>Thank you for choosing CareerBox!</p>
        <p>Best regards,<br>The CareerBox Team</p>
      </div>
    `,
    category: 'transactional',
    variables: ['userName', 'planType', 'billingCycle', 'amount', 'paymentId', 'endDate', 'dashboardUrl'],
    isActive: true,
    version: 1
  },
  {
    name: 'Job Application Received',
    subject: 'Application Received for {{jobTitle}}',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Application Received!</h1>
        <p>Hi {{userName}},</p>
        <p>Thank you for applying to the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong>.</p>
        <p>Your application has been received and is being reviewed by our team. We'll get back to you within 5-7 business days.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Application Details</h3>
          <p><strong>Position:</strong> {{jobTitle}}</p>
          <p><strong>Company:</strong> {{companyName}}</p>
          <p><strong>Applied On:</strong> {{applicationDate}}</p>
          <p><strong>Application ID:</strong> {{applicationId}}</p>
        </div>
        <p>In the meantime, you can:</p>
        <ul>
          <li>Update your profile to make it more attractive to employers</li>
          <li>Browse other job opportunities</li>
          <li>Take skill assessments to showcase your abilities</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{profileUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Update Profile</a>
        </div>
        <p>Good luck with your application!</p>
        <p>Best regards,<br>The CareerBox Team</p>
      </div>
    `,
    category: 'transactional',
    variables: ['userName', 'jobTitle', 'companyName', 'applicationDate', 'applicationId', 'profileUrl'],
    isActive: true,
    version: 1
  },
  {
    name: 'Course Enrollment Confirmation',
    subject: 'Enrollment Confirmed - {{courseName}}',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">Enrollment Confirmed!</h1>
        <p>Hi {{userName}},</p>
        <p>Congratulations! You have been successfully enrolled in <strong>{{courseName}}</strong> at <strong>{{instituteName}}</strong>.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Course Details</h3>
          <p><strong>Course:</strong> {{courseName}}</p>
          <p><strong>Institute:</strong> {{instituteName}}</p>
          <p><strong>Duration:</strong> {{courseDuration}}</p>
          <p><strong>Start Date:</strong> {{startDate}}</p>
          <p><strong>Enrollment ID:</strong> {{enrollmentId}}</p>
        </div>
        <p>Your course materials and schedule will be available in your dashboard. Make sure to check your email regularly for updates and announcements.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{courseUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Access Course</a>
        </div>
        <p>We wish you the best of luck in your studies!</p>
        <p>Best regards,<br>The CareerBox Team</p>
      </div>
    `,
    category: 'transactional',
    variables: ['userName', 'courseName', 'instituteName', 'courseDuration', 'startDate', 'enrollmentId', 'courseUrl'],
    isActive: true,
    version: 1
  },
  {
    name: 'Marketing - Job Recommendations',
    subject: 'New Job Opportunities for You',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">New Job Opportunities!</h1>
        <p>Hi {{userName}},</p>
        <p>We found some exciting job opportunities that match your profile and interests:</p>
        <div style="margin: 20px 0;">
          {{#each jobs}}
          <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h3 style="margin: 0 0 10px 0; color: #1f2937;">{{title}}</h3>
            <p style="margin: 0 0 5px 0; color: #6b7280;">{{companyName}} • {{location}}</p>
            <p style="margin: 0 0 10px 0;">{{description}}</p>
            <a href="{{applyUrl}}" style="background-color: #2563eb; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px;">Apply Now</a>
          </div>
          {{/each}}
        </div>
        <p>Don't miss out on these opportunities! Apply now to take the next step in your career.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{jobsUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View All Jobs</a>
        </div>
        <p>Best regards,<br>The CareerBox Team</p>
      </div>
    `,
    category: 'marketing',
    variables: ['userName', 'jobs', 'jobsUrl'],
    isActive: true,
    version: 1
  }
];

// Email template variables
export const EMAIL_VARIABLES = {
  // User variables
  userName: '{{userName}}',
  userEmail: '{{userEmail}}',
  userRole: '{{userRole}}',
  profileUrl: '{{profileUrl}}',
  dashboardUrl: '{{dashboardUrl}}',
  
  // Job variables
  jobTitle: '{{jobTitle}}',
  companyName: '{{companyName}}',
  applicationDate: '{{applicationDate}}',
  applicationId: '{{applicationId}}',
  
  // Course variables
  courseName: '{{courseName}}',
  instituteName: '{{instituteName}}',
  courseDuration: '{{courseDuration}}',
  startDate: '{{startDate}}',
  enrollmentId: '{{enrollmentId}}',
  courseUrl: '{{courseUrl}}',
  
  // Payment variables
  planType: '{{planType}}',
  billingCycle: '{{billingCycle}}',
  amount: '{{amount}}',
  paymentId: '{{paymentId}}',
  endDate: '{{endDate}}',
  
  // System variables
  appName: '{{appName}}',
  supportEmail: '{{supportEmail}}',
  unsubscribeUrl: '{{unsubscribeUrl}}'
};

// Email sending status
export const EMAIL_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  OPENED: 'opened',
  CLICKED: 'clicked',
  BOUNCED: 'bounced',
  FAILED: 'failed'
} as const;

// Email analytics schema
export const EmailAnalyticsSchema = z.object({
  id: z.string(),
  templateId: z.string(),
  recipientEmail: z.string(),
  recipientId: z.string(),
  status: z.enum(['pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed']),
  sentAt: z.date(),
  deliveredAt: z.date().optional(),
  openedAt: z.date().optional(),
  clickedAt: z.date().optional(),
  bounceReason: z.string().optional(),
  errorMessage: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

export type EmailAnalytics = z.infer<typeof EmailAnalyticsSchema>;
