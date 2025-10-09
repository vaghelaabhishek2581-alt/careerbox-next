'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Archive,
  Send,
  Users,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived';
  createdAt: string;
  readAt?: string;
}

interface EmailLog {
  id: string;
  to: string[];
  from: string;
  subject: string;
  type: string;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  provider: string;
  messageId?: string;
  errorMessage?: string;
  sentAt?: string;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Selected items
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [selectedEmailLog, setSelectedEmailLog] = useState<EmailLog | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [emailViewDialog, setEmailViewDialog] = useState(false);

  // Stats
  const [notificationStats, setNotificationStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    archived: 0
  });

  const [emailStats, setEmailStats] = useState({
    total: 0,
    pending: 0,
    sent: 0,
    failed: 0,
    bounced: 0
  });

  useEffect(() => {
    fetchNotifications();
    fetchEmailLogs();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/notifications?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data);
        setNotificationStats({
          total: data.pagination.totalItems,
          unread: data.unreadCount,
          read: data.pagination.totalItems - data.unreadCount,
          archived: 0 // TODO: Add archived count
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailLogs = async () => {
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/email-logs?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setEmailLogs(data.data);
        setEmailStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching email logs:', error);
    }
  };

  const fetchEmailLogDetails = async (logId: string) => {
    try {
      const response = await fetch(`/api/admin/email-logs/${logId}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedEmailLog(data.data);
        setEmailViewDialog(true);
      }
    } catch (error) {
      console.error('Error fetching email log details:', error);
    }
  };

  const handleSearch = () => {
    if (activeTab === 'notifications') {
      fetchNotifications();
    } else {
      fetchEmailLogs();
    }
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      medium: { color: 'bg-blue-100 text-blue-800', icon: Bell },
      high: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      urgent: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {priority}
      </Badge>
    );
  };

  const getStatusBadge = (status: string, type: 'notification' | 'email' = 'notification') => {
    if (type === 'notification') {
      const statusConfig = {
        unread: { color: 'bg-blue-100 text-blue-800', icon: Bell },
        read: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
        archived: { color: 'bg-gray-100 text-gray-800', icon: Archive },
      };
      
      const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unread;
      const IconComponent = config.icon;
      
      return (
        <Badge className={config.color}>
          <IconComponent className="w-3 h-3 mr-1" />
          {status}
        </Badge>
      );
    } else {
      const statusConfig = {
        pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
        sent: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
        failed: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
        bounced: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      };
      
      const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
      const IconComponent = config.icon;
      
      return (
        <Badge className={config.color}>
          <IconComponent className="w-3 h-3 mr-1" />
          {status}
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification Management</h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage all notifications and email communications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => activeTab === 'notifications' ? fetchNotifications() : fetchEmailLogs()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{notificationStats.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{notificationStats.unread}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                <p className="text-2xl font-bold text-gray-900">{emailStats.sent}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Send className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Emails</p>
                <p className="text-2xl font-bold text-gray-900">{emailStats.failed + emailStats.bounced}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {activeTab === 'notifications' ? (
                  <>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="bounced">Bounced</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="registration_submitted">Registration Submitted</SelectItem>
                <SelectItem value="registration_approved">Registration Approved</SelectItem>
                <SelectItem value="registration_rejected">Registration Rejected</SelectItem>
                <SelectItem value="payment_received">Payment Received</SelectItem>
                <SelectItem value="subscription_granted">Subscription Granted</SelectItem>
                <SelectItem value="system_alert">System Alert</SelectItem>
                <SelectItem value="admin_message">Admin Message</SelectItem>
              </SelectContent>
            </Select>

            {activeTab === 'notifications' && (
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Button onClick={handleSearch} className="w-full">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Communication Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications ({notificationStats.total})
              </TabsTrigger>
              <TabsTrigger value="emails" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Logs ({emailStats.total})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="mt-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  Loading notifications...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {notification.message}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {notification.type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(notification.priority)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(notification.status)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{format(new Date(notification.createdAt), 'MMM dd, yyyy')}</p>
                            <p className="text-xs text-gray-500">{format(new Date(notification.createdAt), 'HH:mm')}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedNotification(notification);
                              setViewDialog(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="emails" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium truncate max-w-xs">{log.subject}</p>
                          <p className="text-sm text-gray-500">{log.from}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{log.to[0]}</p>
                          {log.to.length > 1 && (
                            <p className="text-xs text-gray-500">+{log.to.length - 1} more</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {log.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(log.status, 'email')}
                      </TableCell>
                      <TableCell>
                        <div>
                          {log.sentAt ? (
                            <>
                              <p className="text-sm">{format(new Date(log.sentAt), 'MMM dd, yyyy')}</p>
                              <p className="text-xs text-gray-500">{format(new Date(log.sentAt), 'HH:mm')}</p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">Not sent</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => fetchEmailLogDetails(log.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Notification View Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <p className="text-sm text-gray-600 capitalize">
                    {selectedNotification.type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <div className="mt-1">
                    {getPriorityBadge(selectedNotification.priority)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedNotification.status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <p className="text-sm text-gray-600">
                    {format(new Date(selectedNotification.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Title</label>
                <p className="text-sm text-gray-600 mt-1">{selectedNotification.title}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Message</label>
                <p className="text-sm text-gray-600 mt-1">{selectedNotification.message}</p>
              </div>
              
              {selectedNotification.data && (
                <div>
                  <label className="text-sm font-medium">Additional Data</label>
                  <pre className="text-xs bg-gray-100 p-3 rounded mt-1 overflow-auto">
                    {JSON.stringify(selectedNotification.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Email View Dialog */}
      <Dialog open={emailViewDialog} onOpenChange={setEmailViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Email Details</DialogTitle>
          </DialogHeader>
          {selectedEmailLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">From</label>
                  <p className="text-sm text-gray-600">{selectedEmailLog.from}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedEmailLog.status, 'email')}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Provider</label>
                  <p className="text-sm text-gray-600 capitalize">{selectedEmailLog.provider}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Message ID</label>
                  <p className="text-sm text-gray-600 font-mono text-xs">
                    {selectedEmailLog.messageId || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">To</label>
                <p className="text-sm text-gray-600">{selectedEmailLog.to.join(', ')}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Subject</label>
                <p className="text-sm text-gray-600">{selectedEmailLog.subject}</p>
              </div>
              
              {selectedEmailLog.errorMessage && (
                <div>
                  <label className="text-sm font-medium text-red-600">Error Message</label>
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded mt-1">
                    {selectedEmailLog.errorMessage}
                  </p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium">HTML Content</label>
                <div className="border rounded mt-1 p-4 bg-white">
                  <iframe
                    srcDoc={(selectedEmailLog as any).htmlContent}
                    className="w-full h-96 border-0"
                    title="Email Preview"
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
