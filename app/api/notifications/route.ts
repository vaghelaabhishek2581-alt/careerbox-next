import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  updateNotificationPreferences,
  getNotificationPreferences,
} from '@/lib/services/notification-service';

// GET /api/notifications
// Get user's notifications
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await getNotifications(session.user.id, {
      unreadOnly,
      limit,
      offset,
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get notifications:', error);
    return NextResponse.json(
      { error: 'Failed to get notifications' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/:id
// Mark notification as read
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await markNotificationAsRead(params.id);
    if (!result.success) {
      throw new Error(result.error);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/mark-all-read
// Mark all notifications as read
export async function markAllRead(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await markAllNotificationsAsRead(session.user.id);
    if (!result.success) {
      throw new Error(result.error);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/:id
// Delete a notification
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await deleteNotification(params.id);
    if (!result.success) {
      throw new Error(result.error);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/delete-all
// Delete all notifications
export async function deleteAll(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await deleteAllNotifications(session.user.id);
    if (!result.success) {
      throw new Error(result.error);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to delete all notifications:', error);
    return NextResponse.json(
      { error: 'Failed to delete all notifications' },
      { status: 500 }
    );
  }
}

// GET /api/notifications/preferences
// Get notification preferences
export async function getPreferences(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await getNotificationPreferences(session.user.id);
    if (!result.success) {
      throw new Error(result.error);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to get notification preferences' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/preferences
// Update notification preferences
export async function updatePreferences(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const preferences = await req.json();
    const result = await updateNotificationPreferences(session.user.id, preferences);
    if (!result.success) {
      throw new Error(result.error);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to update notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}
