"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Bell, Settings, Home, Users, BookOpen, Target, BarChart2, MessageSquare, User, Building2, Briefcase, GraduationCap, LogOut, X, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

import Logo from "../logo";
import UserProfileMenu from "../user-profile-menu";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { format } from "date-fns";
import { useSocket } from "@/hooks/use-socket";


interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived';
  createdAt: string;
  data?: {
    actionUrl?: string;
    metadata?: any;
  };
}

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const { profile } = useSelector((state: RootState) => state.profile);
  const { socket, isConnected } = useSocket();

  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Fetch notifications and request notification permission
  useEffect(() => {
    fetchNotifications();
    
    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  // Listen for real-time socket notifications
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = (notification: any) => {
      console.log('🔔 New notification received via socket:', notification);
      
      // Add to notifications list
      setNotifications(prev => [notification, ...(prev || []).slice(0, 9)]); // Keep only 10 most recent
      
      // Increment unread count
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/cboxLogo.png',
          tag: notification.id
        });
      }
    };

    // Listen for notifications
    socket.on('notification', handleNewNotification);

    // Cleanup listener on unmount
    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [socket, isConnected]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=10&status=unread');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount || 0);
      } else {
        // Fallback to empty array if data is not in expected format
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Ensure notifications is always an array even if API fails
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }),
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          (prev || []).map(notif => 
            notificationIds.includes(notif.id) 
              ? { ...notif, status: 'read' as const }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAll: true }),
      });

      if (response.ok) {
        setNotifications(prev => 
          (prev || []).map(notif => ({ ...notif, status: 'read' as const }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (notification.status === 'unread') {
      markAsRead([notification.id]);
    }

    // Navigate to action URL if provided
    if (notification.data?.actionUrl) {
      router.push(notification.data.actionUrl);
      setNotificationsOpen(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (!session) {
    return null;
  }

  return (
    <header className="h-16 bg-white border-b px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-40">
      {/* Logo */}
      <div onClick={() => router.push("/dashboard")} className="flex items-center space-x-2 group">
        <Logo />
      </div>
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search jobs, courses, skills..."
            className="pl-10 bg-gray-50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Notifications Dropdown */}
        <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
            
            <ScrollArea className="h-96">
              {!notifications || notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        notification.status === 'unread' ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm truncate">
                              {notification.title}
                            </p>
                            {notification.status === 'unread' && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {format(new Date(notification.createdAt), 'MMM dd, HH:mm')}
                            </span>
                            <span className={`text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            {notifications.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => {
                      router.push('/dashboard/notifications');
                      setNotificationsOpen(false);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View all notifications
                  </Button>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
        <UserProfileMenu />
      </div>
    </header>
  );
}
