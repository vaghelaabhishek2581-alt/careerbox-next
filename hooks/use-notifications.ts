'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSocket } from './use-socket';
import { API } from '@/lib/api/services';

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types?: Record<string, {
    email: boolean;
    push: boolean;
    inApp: boolean;
  }>;
}

export function useNotifications() {
  const { data: session } = useSession();
  // const socket = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const fetchNotifications = useCallback(async (options: {
  //   unreadOnly?: boolean;
  //   limit?: number;
  //   offset?: number;
  // } = {}) => {
  //   try {
  //     setIsLoading(true);
  //     setError(null);

  //     // const response = await API.notifications.getNotifications({
  //     //   unreadOnly: options.unreadOnly,
  //     //   limit: options.limit,
  //     //   offset: options.offset
  //     // });

  //     if (response.success) {
  //       setNotifications(response.data.notifications);
  //       setUnreadCount(response.data.notifications.filter((n: Notification) => !n.read).length);
  //       return response.data;
  //     } else {
  //       throw new Error(response.error || 'Failed to fetch notifications');
  //     }
  //   } catch (error) {
  //     const message = error instanceof Error ? error.message : 'Failed to fetch notifications';
  //     setError(message);
  //     return { success: false, error: message };
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      setError(null);

      const response = await API.notifications.markAsRead(notificationId);

      if (response.success) {
        setNotifications(prev =>
          prev.map(n =>
            n._id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => prev - 1);
        return { success: true };
      } else {
        throw new Error(response.error || 'Failed to mark notification as read');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to mark notification as read';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      setError(null);

      const response = await API.notifications.markAllAsRead();

      if (response.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
        return { success: true };
      } else {
        throw new Error(response.error || 'Failed to mark all notifications as read');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to mark all notifications as read';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  // const deleteNotification = useCallback(async (notificationId: string) => {
  //   try {
  //     setError(null);

  //     const response = await API.notifications.deleteNotification(notificationId);

  //     if (response.success) {
  //       setNotifications(prev =>
  //         prev.filter(n => n._id !== notificationId)
  //       );
  //       setUnreadCount(prev =>
  //         notifications.find(n => n._id === notificationId)?.read ? prev : prev - 1
  //       );
  //       return { success: true };
  //     } else {
  //       throw new Error(response.error || 'Failed to delete notification');
  //     }
  //   } catch (error) {
  //     const message = error instanceof Error ? error.message : 'Failed to delete notification';
  //     setError(message);
  //     return { success: false, error: message };
  //   }
  // }, [notifications]);

  // const deleteAllNotifications = useCallback(async () => {
  //   try {
  //     setError(null);

  //     const response = await API.notifications.deleteAllNotifications();

  //     if (response.success) {
  //       setNotifications([]);
  //       setUnreadCount(0);
  //       return { success: true };
  //     } else {
  //       throw new Error(response.error || 'Failed to delete all notifications');
  //     }
  //   } catch (error) {
  //     const message = error instanceof Error ? error.message : 'Failed to delete all notifications';
  //     setError(message);
  //     return { success: false, error: message };
  //   }
  // }, []);

  // const getPreferences = useCallback(async () => {
  //   try {
  //     setError(null);

  //     const response = await API.notifications.getPreferences();

  //     if (response.success) {
  //       return { success: true, preferences: response.data.preferences };
  //     } else {
  //       throw new Error(response.error || 'Failed to get notification preferences');
  //     }
  //   } catch (error) {
  //     const message = error instanceof Error ? error.message : 'Failed to get notification preferences';
  //     setError(message);
  //     return { success: false, error: message };
  //   }
  // }, []);

  // const updatePreferences = useCallback(async (preferences: NotificationPreferences) => {
  //   try {
  //     setError(null);

  //     const response = await API.notifications.updatePreferences(preferences);

  //     if (response.success) {
  //       return { success: true };
  //     } else {
  //       throw new Error(response.error || 'Failed to update notification preferences');
  //     }
  //   } catch (error) {
  //     const message = error instanceof Error ? error.message : 'Failed to update notification preferences';
  //     setError(message);
  //     return { success: false, error: message };
  //   }
  // }, []);

  // useEffect(() => {
  //   if (session?.user) {
  //     fetchNotifications();
  //   }
  // }, [session, fetchNotifications]);

  // useEffect(() => {
  //   if (socket && session?.user) {
  //     socket.on('notification', (notification: Notification) => {
  //       setNotifications(prev => [notification, ...prev]);
  //       setUnreadCount(prev => prev + 1);
  //     });

  //     return () => {
  //       socket.off('notification');
  //     };
  //   }
  // }, [socket, session]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    // fetchNotifications,
    // markAsRead,
    // markAllAsRead,
    // deleteNotification,
    // deleteAllNotifications,
    // getPreferences,
    // updatePreferences,
  };
}
