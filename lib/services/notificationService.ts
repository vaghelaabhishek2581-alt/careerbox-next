import { Notification, INotification } from '@/src/models/Notification';
import { EmailLog, IEmailLog } from '@/src/models/EmailLog';
import User from '@/src/models/User';
import { connectToDatabase } from '@/lib/db/mongodb';
import nodemailer from 'nodemailer';

// Global socket server declaration
declare global {
  var socketIO: any;
}

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'vaghelaabhishek2580@gmail.com',
    pass: process.env.EMAIL_PASSWORD,
  },
});

export interface CreateNotificationData {
  userId: string;
  type: INotification['type'];
  title: string;
  message: string;
  data?: INotification['data'];
  priority?: INotification['priority'];
  sendEmail?: boolean;
  sendSocket?: boolean;
  emailTemplate?: string;
  emailVariables?: Record<string, any>;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

// Email templates
const emailTemplates: Record<string, (variables: any) => EmailTemplate> = {
  registration_submitted: (vars) => ({
    subject: `Registration Request Submitted - ${vars.organizationName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Registration Submitted</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Registration Request Submitted</h1>
              <p>CareerBox Platform</p>
            </div>
            <div class="content">
              <p>Dear ${vars.contactName},</p>
              
              <p>Thank you for submitting your registration request for <strong>${vars.organizationName}</strong>. We have received your application and it is now under review.</p>
              
              <div class="info-box">
                <h3>📋 Application Details</h3>
                <p><strong>Organization:</strong> ${vars.organizationName}</p>
                <p><strong>Type:</strong> ${vars.type}</p>
                <p><strong>Contact:</strong> ${vars.contactName}</p>
                <p><strong>Email:</strong> ${vars.email}</p>
                <p><strong>Phone:</strong> ${vars.contactPhone}</p>
                <p><strong>Location:</strong> ${vars.city}, ${vars.state}, ${vars.country}</p>
                <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p>Our team will review your application within 2-3 business days. You will receive an email notification once the review is complete.</p>
              
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
              
              <p>Best regards,<br>The CareerBox Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Registration Request Submitted - ${vars.organizationName}\n\nDear ${vars.contactName},\n\nThank you for submitting your registration request. We will review it within 2-3 business days.`
  }),

  registration_approved: (vars) => ({
    subject: `🎉 Registration Approved - Welcome to CareerBox!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Registration Approved</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .success-box { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Registration Approved!</h1>
              <p>Welcome to CareerBox</p>
            </div>
            <div class="content">
              <p>Dear ${vars.contactName},</p>
              
              <div class="success-box">
                <h3>✅ Congratulations!</h3>
                <p>Your registration for <strong>${vars.organizationName}</strong> has been approved. You can now access all CareerBox features.</p>
              </div>
              
              ${vars.subscriptionGranted ? `
                <p><strong>🎁 Special Grant:</strong> You have been granted a <strong>${vars.planType}</strong> subscription at no cost!</p>
              ` : ''}
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Access Your Dashboard</a>
              
              <p>You can now:</p>
              <ul>
                <li>Set up your organization profile</li>
                <li>Manage courses and programs</li>
                <li>Connect with students and professionals</li>
                <li>Access premium features</li>
              </ul>
              
              <p>If you need any assistance getting started, our support team is here to help.</p>
              
              <p>Welcome aboard!<br>The CareerBox Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Registration Approved - Welcome to CareerBox!\n\nDear ${vars.contactName},\n\nYour registration has been approved. Access your dashboard at ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
  }),

  registration_rejected: (vars) => ({
    subject: `Registration Update - ${vars.organizationName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Registration Update</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 20px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Registration Update</h1>
              <p>CareerBox Platform</p>
            </div>
            <div class="content">
              <p>Dear ${vars.contactName},</p>
              
              <p>Thank you for your interest in joining CareerBox. After careful review, we are unable to approve your registration request at this time.</p>
              
              ${vars.adminNotes ? `
                <div class="info-box">
                  <h3>📝 Review Notes</h3>
                  <p>${vars.adminNotes}</p>
                </div>
              ` : ''}
              
              <p>This decision may be due to:</p>
              <ul>
                <li>Incomplete or insufficient information</li>
                <li>Current capacity limitations</li>
                <li>Specific requirements not met</li>
              </ul>
              
              <p>You are welcome to reapply in the future. If you have questions about this decision, please contact our support team.</p>
              
              <p>Thank you for your understanding.<br>The CareerBox Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Registration Update\n\nDear ${vars.contactName},\n\nWe are unable to approve your registration request at this time. Please contact support for more information.`
  }),

  admin_notification: (vars) => ({
    subject: `🔔 New Registration Request - ${vars.organizationName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Registration Request</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .alert-box { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 20px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 New Registration Request</h1>
              <p>Admin Notification</p>
            </div>
            <div class="content">
              <div class="alert-box">
                <h3>⚠️ Action Required</h3>
                <p>A new registration request requires your review.</p>
              </div>
              
              <h3>📋 Application Details</h3>
              <p><strong>Organization:</strong> ${vars.organizationName}</p>
              <p><strong>Type:</strong> ${vars.type}</p>
              <p><strong>Contact:</strong> ${vars.contactName}</p>
              <p><strong>Email:</strong> ${vars.email}</p>
              <p><strong>Phone:</strong> ${vars.contactPhone}</p>
              <p><strong>Location:</strong> ${vars.city}, ${vars.state}, ${vars.country}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
              
              ${vars.description ? `<p><strong>Description:</strong> ${vars.description}</p>` : ''}
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/registrations" class="button">Review Application</a>
              
              <p>Please review and take appropriate action on this registration request.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `New Registration Request - ${vars.organizationName}\n\nA new registration request from ${vars.contactName} requires your review. Visit the admin dashboard to take action.`
  }),

  admin_subscription_purchased: (vars) => ({
    subject: `💰 New Subscription Purchase - ${vars.organizationName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Subscription Purchased</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: #e8f4fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .success-box { background: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ddd; }
            .amount { font-size: 24px; font-weight: bold; color: #4caf50; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 New Subscription Purchase</h1>
              <p>A new subscription has been purchased on CareerBox</p>
            </div>
            <div class="content">
              <div class="success-box">
                <h3>🎉 Subscription Details</h3>
                <p><strong>${vars.organizationName}</strong> has successfully purchased a subscription!</p>
              </div>
              
              <div class="details">
                <h3>📋 Purchase Information</h3>
                <p><strong>Organization:</strong> ${vars.organizationName}</p>
                <p><strong>Type:</strong> ${vars.organizationType.charAt(0).toUpperCase() + vars.organizationType.slice(1)}</p>
                <p><strong>Plan:</strong> ${vars.subscriptionPlan.charAt(0).toUpperCase() + vars.subscriptionPlan.slice(1)} Plan</p>
                <p><strong>Amount:</strong> <span class="amount">₹${(vars.amount/100).toLocaleString()}</span></p>
                <p><strong>Purchase Date:</strong> ${vars.purchaseDate}</p>
              </div>
              
              <div class="info-box">
                <h3>👤 Customer Details</h3>
                <p><strong>Contact Person:</strong> ${vars.contactName}</p>
                <p><strong>Email:</strong> ${vars.contactEmail}</p>
                <p><strong>Phone:</strong> ${vars.contactPhone}</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${vars.dashboardUrl}" class="button">View Subscription Details</a>
              </div>
              
              <p>The organization's account has been automatically activated and they now have access to their dashboard.</p>
              
              <div class="info-box">
                <p><strong>💡 Next Steps:</strong></p>
                <ul>
                  <li>Monitor subscription usage and engagement</li>
                  <li>Provide onboarding support if needed</li>
                  <li>Track subscription metrics in admin dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `New Subscription Purchase - ${vars.organizationName}\n\n${vars.organizationName} (${vars.organizationType}) has purchased a ${vars.subscriptionPlan} plan for ₹${(vars.amount/100).toLocaleString()}.\n\nContact: ${vars.contactName} (${vars.contactEmail})\nPurchase Date: ${vars.purchaseDate}\n\nView details: ${vars.dashboardUrl}`
  })
};

export class NotificationService {
  static async createNotification(data: CreateNotificationData): Promise<INotification> {
    await connectToDatabase();

    // Create notification record
    const notification = new Notification({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data,
      priority: data.priority || 'medium',
      sentVia: [],
      emailSent: false,
      socketSent: false
    });

    await notification.save();

    // Send via different channels
    const promises = [];

    if (data.sendEmail) {
      promises.push(this.sendEmailNotification(notification, data.emailTemplate, data.emailVariables));
    }

    if (data.sendSocket) {
      promises.push(this.sendSocketNotification(notification));
    }

    // Execute all sending operations
    await Promise.allSettled(promises);

    return notification;
  }

  static async sendEmailNotification(
    notification: INotification, 
    templateName?: string, 
    variables?: Record<string, any>
  ): Promise<void> {
    try {
      await connectToDatabase();

      // Get user email
      const user = await User.findById(notification.userId);
      if (!user?.email) {
        throw new Error('User email not found');
      }

      let emailContent: EmailTemplate;
      
      if (templateName && emailTemplates[templateName]) {
        emailContent = emailTemplates[templateName](variables || {});
      } else {
        // Default template
        emailContent = {
          subject: notification.title,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>${notification.title}</h2>
              <p>${notification.message}</p>
              <hr>
              <p style="color: #666; font-size: 12px;">This is an automated message from CareerBox.</p>
            </div>
          `,
          text: `${notification.title}\n\n${notification.message}`
        };
      }

      // Create email log entry
      const emailLog = new EmailLog({
        to: [user.email],
        from: process.env.EMAIL_USER || 'vaghelaabhishek2580@gmail.com',
        subject: emailContent.subject,
        htmlContent: emailContent.html,
        textContent: emailContent.text,
        type: this.mapNotificationTypeToEmailType(notification.type),
        status: 'pending',
        provider: 'gmail',
        relatedEntityId: notification.userId,
        relatedEntityType: 'User',
        notificationId: notification._id,
        metadata: {
          templateUsed: templateName,
          variables: variables
        }
      });

      await emailLog.save();

      // Send email
      const mailOptions = {
        from: `CareerBox <${process.env.EMAIL_USER || 'vaghelaabhishek2580@gmail.com'}>`,
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      };

      const info = await transporter.sendMail(mailOptions);

      // Update email log
      await EmailLog.findByIdAndUpdate(emailLog._id, {
        status: 'sent',
        messageId: info.messageId,
        sentAt: new Date()
      });

      // Update notification
      await Notification.findByIdAndUpdate(notification._id, {
        emailSent: true,
        emailLogId: emailLog._id,
        $addToSet: { sentVia: 'email' }
      });

    } catch (error) {
      console.error('Error sending email notification:', error);
      
      // Update email log with error
      if (notification.emailLogId) {
        await EmailLog.findByIdAndUpdate(notification.emailLogId, {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async sendSocketNotification(notification: INotification): Promise<void> {
    try {
      // Get the global socket server instance
      const io = global.socketIO;
      
      if (!io) {
        console.log('Socket server not available, skipping socket notification');
        return;
      }

      // Create notification payload
      const notificationPayload = {
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        priority: notification.priority,
        createdAt: notification.createdAt,
        timestamp: new Date().toISOString()
      };

      // Emit to user's room (using userId as room name)
      const userRoom = `user_${notification.userId}`;
      io.to(userRoom).emit('notification', notificationPayload);
      
      console.log('Socket notification sent to room:', userRoom, {
        type: notification.type,
        title: notification.title,
        connectedClients: io.engine.clientsCount
      });

      // Update notification as sent
      await Notification.findByIdAndUpdate(notification._id, {
        socketSent: true,
        $addToSet: { sentVia: 'socket' }
      });

    } catch (error) {
      console.error('Error sending socket notification:', error);
    }
  }

  static async sendAdminNotification(data: Omit<CreateNotificationData, 'userId'>): Promise<void> {
    await connectToDatabase();

    // Get all admin users
    const adminUsers = await User.find({ roles: 'admin' });

    // Send notification to each admin
    const promises = adminUsers.map((admin: any) => 
      this.createNotification({
        ...data,
        userId: admin._id.toString()
      })
    );

    await Promise.allSettled(promises);
  }

  private static mapNotificationTypeToEmailType(notificationType: string): IEmailLog['type'] {
    const mapping: Record<string, IEmailLog['type']> = {
      'registration_submitted': 'registration_confirmation',
      'registration_approved': 'registration_approved',
      'registration_rejected': 'registration_rejected',
      'payment_received': 'payment_confirmation',
      'subscription_granted': 'subscription_granted',
      'subscription_purchased': 'admin_notification',
      'system_alert': 'system_notification',
      'admin_message': 'admin_notification'
    };

    return mapping[notificationType] || 'system_notification';
  }
}

export default NotificationService;
