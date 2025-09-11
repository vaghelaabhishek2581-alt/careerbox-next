import { Server as SocketIOServer } from 'socket.io'
import { 
  ServerToClientEvents, 
  NotificationData, 
  AdminAlertData, 
  SystemUpdateData 
} from './types'

export class NotificationService {
  private io: SocketIOServer<ServerToClientEvents>

  constructor(io: SocketIOServer<ServerToClientEvents>) {
    this.io = io
  }

  /**
   * Send notification to a specific user
   */
  public sendNotification(userId: string, notification: Omit<NotificationData, 'timestamp'>): void {
    try {
      if (!userId || !notification) {
        throw new Error('Invalid userId or notification data')
      }

      const notificationData: NotificationData = {
        ...notification,
        timestamp: new Date()
      }

      this.io.to(`user:${userId}`).emit('notification', notificationData)
      
      console.log(`Sent notification to user ${userId}: ${notification.title}`)
    } catch (error) {
      console.error('Error sending notification:', error)
      throw error
    }
  }

  /**
   * Send notification to multiple users
   */
  public sendNotificationToUsers(userIds: string[], notification: Omit<NotificationData, 'timestamp'>): void {
    try {
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        throw new Error('Invalid userIds array')
      }

      const notificationData: NotificationData = {
        ...notification,
        timestamp: new Date()
      }

      userIds.forEach(userId => {
        this.io.to(`user:${userId}`).emit('notification', notificationData)
      })

      console.log(`Sent notification to ${userIds.length} users: ${notification.title}`)
    } catch (error) {
      console.error('Error sending notification to users:', error)
      throw error
    }
  }

  /**
   * Send notification to all users in a role
   */
  public sendNotificationToRole(role: string, notification: Omit<NotificationData, 'timestamp'>): void {
    try {
      if (!role || !notification) {
        throw new Error('Invalid role or notification data')
      }

      const notificationData: NotificationData = {
        ...notification,
        timestamp: new Date()
      }

      this.io.to(`role:${role}`).emit('notification', notificationData)
      
      console.log(`Sent notification to role ${role}: ${notification.title}`)
    } catch (error) {
      console.error('Error sending notification to role:', error)
      throw error
    }
  }

  /**
   * Send admin alert
   */
  public sendAdminAlert(alert: Omit<AdminAlertData, 'timestamp'>): void {
    try {
      if (!alert) {
        throw new Error('Invalid alert data')
      }

      const alertData: AdminAlertData = {
        ...alert,
        timestamp: new Date()
      }

      this.io.to('admin').emit('adminAlert', alertData)
      
      console.log(`Sent admin alert: ${alert.type}`)
    } catch (error) {
      console.error('Error sending admin alert:', error)
      throw error
    }
  }

  /**
   * Send system update to all users
   */
  public broadcastSystemUpdate(update: Omit<SystemUpdateData, 'timestamp'>): void {
    try {
      if (!update) {
        throw new Error('Invalid update data')
      }

      const updateData: SystemUpdateData = {
        ...update,
        timestamp: new Date()
      }

      this.io.emit('systemUpdate', updateData)
      
      console.log(`Broadcasted system update: ${update.type}`)
    } catch (error) {
      console.error('Error broadcasting system update:', error)
      throw error
    }
  }

  /**
   * Send system health update to admin monitoring room
   */
  public sendSystemHealthUpdate(health: any): void {
    try {
      this.io.to('admin:monitoring').emit('systemHealth', health)
    } catch (error) {
      console.error('Error sending system health update:', error)
      throw error
    }
  }

  /**
   * Send user online status update
   */
  public sendUserOnlineStatus(userId: string, isOnline: boolean): void {
    try {
      if (isOnline) {
        this.io.emit('userOnline', userId)
      } else {
        this.io.emit('userOffline', userId)
      }
    } catch (error) {
      console.error('Error sending user online status:', error)
      throw error
    }
  }

  /**
   * Send profile update notification
   */
  public sendProfileUpdate(userId: string, profileId: string, changes: Record<string, any>): void {
    try {
      this.io.to(`user:${userId}`).emit('profileUpdate', {
        userId,
        profileId,
        changes,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Error sending profile update:', error)
      throw error
    }
  }

  /**
   * Send search suggestions
   */
  public sendSearchSuggestions(userId: string, suggestions: any[]): void {
    try {
      this.io.to(`user:${userId}`).emit('searchSuggestion', suggestions)
    } catch (error) {
      console.error('Error sending search suggestions:', error)
      throw error
    }
  }

  /**
   * Create notification for job application
   */
  public createJobApplicationNotification(
    userId: string,
    jobTitle: string,
    companyName: string,
    applicationId: string
  ): void {
    this.sendNotification(userId, {
      id: `job_application_${applicationId}`,
      type: 'success',
      category: 'application',
      title: 'Application Submitted',
      message: `Your application for ${jobTitle} at ${companyName} has been submitted successfully.`,
      isRead: false,
      actionUrl: `/dashboard/applications/${applicationId}`
    })
  }

  /**
   * Create notification for course enrollment
   */
  public createCourseEnrollmentNotification(
    userId: string,
    courseTitle: string,
    instituteName: string,
    enrollmentId: string
  ): void {
    this.sendNotification(userId, {
      id: `course_enrollment_${enrollmentId}`,
      type: 'success',
      category: 'application',
      title: 'Enrollment Confirmed',
      message: `You have been successfully enrolled in ${courseTitle} at ${instituteName}.`,
      isRead: false,
      actionUrl: `/dashboard/courses/${enrollmentId}`
    })
  }

  /**
   * Create notification for payment confirmation
   */
  public createPaymentConfirmationNotification(
    userId: string,
    amount: number,
    planType: string,
    paymentId: string
  ): void {
    this.sendNotification(userId, {
      id: `payment_${paymentId}`,
      type: 'success',
      category: 'system',
      title: 'Payment Confirmed',
      message: `Your payment of ₹${amount} for ${planType} subscription has been processed successfully.`,
      isRead: false,
      actionUrl: '/dashboard/subscription'
    })
  }

  /**
   * Create notification for payment failure
   */
  public createPaymentFailureNotification(
    userId: string,
    amount: number,
    planType: string,
    errorMessage: string
  ): void {
    this.sendNotification(userId, {
      id: `payment_failure_${Date.now()}`,
      type: 'error',
      category: 'system',
      title: 'Payment Failed',
      message: `Your payment of ₹${amount} for ${planType} subscription failed. ${errorMessage}`,
      isRead: false,
      actionUrl: '/dashboard/subscription'
    })
  }

  /**
   * Create notification for new connection request
   */
  public createConnectionRequestNotification(
    userId: string,
    requesterName: string,
    requesterId: string
  ): void {
    this.sendNotification(userId, {
      id: `connection_request_${requesterId}`,
      type: 'info',
      category: 'social',
      title: 'New Connection Request',
      message: `${requesterName} wants to connect with you.`,
      isRead: false,
      actionUrl: `/dashboard/connections`
    })
  }

  /**
   * Create admin alert for new user registration
   */
  public createNewUserRegistrationAlert(userId: string, userName: string, userRole: string): void {
    this.sendAdminAlert({
      type: 'monitoring',
      data: {
        action: 'new_user_registration',
        userId,
        userName,
        userRole
      },
      severity: 'low'
    })
  }

  /**
   * Create admin alert for payment issue
   */
  public createPaymentIssueAlert(
    userId: string,
    paymentId: string,
    errorMessage: string
  ): void {
    this.sendAdminAlert({
      type: 'error',
      data: {
        action: 'payment_issue',
        userId,
        paymentId,
        errorMessage
      },
      severity: 'high'
    })
  }

  /**
   * Create system maintenance notification
   */
  public createMaintenanceNotification(
    startTime: Date,
    endTime: Date,
    description: string
  ): void {
    this.broadcastSystemUpdate({
      type: 'maintenance',
      message: `Scheduled maintenance from ${startTime.toLocaleString()} to ${endTime.toLocaleString()}. ${description}`,
      metadata: {
        startTime,
        endTime,
        description
      }
    })
  }
}
