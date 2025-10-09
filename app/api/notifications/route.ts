import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth/unified-auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Notification } from '@/src/models/Notification';

// Validation schemas
const notificationsQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).default('20'),
  status: z.enum(['unread', 'read', 'archived']).optional(),
  type: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

// GET /api/notifications
// Get user's notifications
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = authResult;
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const validatedParams = notificationsQuerySchema.parse(queryParams);
    const { page, limit, status, type, priority } = validatedParams;

    await connectToDatabase();

    // Build query filter
    const filter: any = { userId };
    
    if (status) {
      filter.status = status;
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (priority) {
      filter.priority = priority;
    }

    // Get total count
    const totalItems = await Notification.countDocuments(filter);

    // Get notifications with pagination
    const skip = (page - 1) * limit;
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform for response
    const transformedNotifications = notifications.map((notification: any) => ({
      id: notification._id.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      priority: notification.priority,
      status: notification.status,
      createdAt: notification.createdAt,
      readAt: notification.readAt,
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      notifications: transformedNotifications.map(n => ({
        ...n,
        isRead: n.status === 'read'
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      },
      unreadCount: await Notification.countDocuments({ userId, status: 'unread' })
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications
// Update notification status (mark as read/unread)
export async function PATCH(request: NextRequest) {
  try {
    // Authentication check
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = authResult;
    const body = await request.json();
    const { notificationId, isRead, markAllAsRead } = body;

    await connectToDatabase();

    let result;
    
    if (markAllAsRead) {
      // Mark all notifications as read
      result = await Notification.updateMany(
        { userId, status: 'unread' },
        { 
          $set: { 
            status: 'read', 
            readAt: new Date() 
          } 
        }
      );
    } else if (notificationId) {
      // Update specific notification
      const updateData: any = {
        status: isRead ? 'read' : 'unread'
      };
      
      if (isRead) {
        updateData.readAt = new Date();
      } else {
        updateData.$unset = { readAt: 1 };
      }

      result = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        updateData,
        { new: true }
      );

      if (!result) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Either notificationId or markAllAsRead must be provided' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: markAllAsRead 
        ? `${result.modifiedCount} notifications marked as read`
        : 'Notification updated successfully',
      data: markAllAsRead ? null : {
        id: result._id.toString(),
        status: result.status,
        readAt: result.readAt
      }
    });

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/notifications/mark-read
// Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = authResult;
    const body = await request.json();
    const { notificationIds, markAll } = body;

    await connectToDatabase();

    let result;
    
    if (markAll) {
      // Mark all notifications as read
      result = await Notification.updateMany(
        { userId, status: 'unread' },
        { 
          $set: { 
            status: 'read', 
            readAt: new Date() 
          } 
        }
      );
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      result = await Notification.updateMany(
        { 
          _id: { $in: notificationIds }, 
          userId, 
          status: 'unread' 
        },
        { 
          $set: { 
            status: 'read', 
            readAt: new Date() 
          } 
        }
      );
    } else {
      return NextResponse.json(
        { error: 'Either notificationIds or markAll must be provided' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications
// Delete notifications
export async function DELETE(request: NextRequest) {
  try {
    // Authentication check
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = authResult;
    const body = await request.json();
    const { notificationIds, deleteAll } = body;

    await connectToDatabase();

    let result;
    
    if (deleteAll) {
      // Delete all notifications
      result = await Notification.deleteMany({ userId });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Delete specific notifications
      result = await Notification.deleteMany({
        _id: { $in: notificationIds },
        userId
      });
    } else {
      return NextResponse.json(
        { error: 'Either notificationIds or deleteAll must be provided' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} notifications deleted`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
