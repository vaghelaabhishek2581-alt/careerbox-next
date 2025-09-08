'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSocket } from './use-socket';

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
  const socket = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (options: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  } = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.unreadOnly) params.append('unreadOnly', 'true');
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());

      const response = await fetch(`/api/notifications?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch notifications');
      }

      setNotifications(data.notifications);
      setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length);
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch notifications';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      setError(null);

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark notification as read');
      }

      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => prev - 1);

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to mark notification as read';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark all notifications as read');
      }

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to mark all notifications as read';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      setError(null);

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete notification');
      }

      setNotifications(prev =>
        prev.filter(n => n._id !== notificationId)
      );
      setUnreadCount(prev =>
        notifications.find(n => n._id === notificationId)?.read ? prev : prev - 1
      );

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete notification';
      setError(message);
      return { success: false, error: message };
    }
  }, [notifications]);

  const deleteAllNotifications = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch('/api/notifications/delete-all', {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete all notifications');
      }

      setNotifications([]);
      setUnreadCount(0);

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete all notifications';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const getPreferences = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch('/api/notifications/preferences');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get notification preferences');
      }

      return { success: true, preferences: data.preferences };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get notification preferences';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const updatePreferences = useCallback(async (preferences: NotificationPreferences) => {
    try {
      setError(null);

      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update notification preferences');
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update notification preferences';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session, fetchNotifications]);

  useEffect(() => {
    if (socket && session?.user) {
      socket.on('notification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [socket, session]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    getPreferences,
    updatePreferences,
  };
}
