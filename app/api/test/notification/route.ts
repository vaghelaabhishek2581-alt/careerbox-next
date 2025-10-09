import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/unified-auth';
import NotificationService from '@/lib/services/notificationService';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, user } = authResult;

    // Create a test notification
    await NotificationService.createNotification({
      userId: userId,
      type: 'system_alert',
      title: 'Test Notification',
      message: 'This is a test notification to verify the real-time notification system is working properly.',
      data: {
        actionUrl: '/dashboard',
        metadata: {
          testType: 'socket_notification_test',
          timestamp: new Date().toISOString()
        }
      },
      priority: 'medium',
      sendEmail: false, // Don't send email for test
      sendSocket: true, // Send socket notification
    });

    return NextResponse.json({
      success: true,
      message: 'Test notification sent successfully',
      data: {
        userId,
        userEmail: user?.email,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}
