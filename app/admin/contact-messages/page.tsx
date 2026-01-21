"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Phone,
  MessageSquare,
  Search,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  Archive,
  RefreshCw,
  Building2,
  GraduationCap,
  HelpCircle,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  mobile: string;
  message: string;
  type: "general" | "business" | "institute" | "support";
  status: "new" | "read" | "replied" | "archived";
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface StatusStats {
  new: number;
  read: number;
  replied: number;
  archived: number;
}

const statusConfig = {
  new: { label: "New", color: "bg-blue-100 text-blue-700", icon: Clock },
  read: { label: "Read", color: "bg-yellow-100 text-yellow-700", icon: Eye },
  replied: {
    label: "Replied",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  archived: {
    label: "Archived",
    color: "bg-gray-100 text-gray-700",
    icon: Archive,
  },
};

const typeConfig = {
  general: { label: "General", icon: MessageSquare, color: "text-gray-600" },
  business: { label: "Business", icon: Building2, color: "text-purple-600" },
  institute: {
    label: "Institute",
    icon: GraduationCap,
    color: "text-orange-600",
  },
  support: { label: "Support", icon: HelpCircle, color: "text-blue-600" },
};

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [statusStats, setStatusStats] = useState<StatusStats>({
    new: 0,
    read: 0,
    replied: 0,
    archived: 0,
  });
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    search: "",
  });
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.type !== "all") params.append("type", filters.type);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/admin/contact-messages?${params}`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.data.messages);
        setPagination(data.data.pagination);
        setStatusStats(data.data.statusStats);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setAdminNotes(message.adminNotes || "");
    setIsDialogOpen(true);

    // Mark as read if new
    if (message.status === "new") {
      await updateMessageStatus(message.id, "read");
    }
  };

  const updateMessageStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/contact-messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchMessages();
        if (selectedMessage?.id === id) {
          setSelectedMessage((prev) =>
            prev ? { ...prev, status: status as any } : null
          );
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const saveAdminNotes = async () => {
    if (!selectedMessage) return;

    setUpdating(true);
    try {
      const response = await fetch(
        `/api/admin/contact-messages/${selectedMessage.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminNotes }),
        }
      );

      if (response.ok) {
        fetchMessages();
        setSelectedMessage((prev) => (prev ? { ...prev, adminNotes } : null));
      }
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setUpdating(false);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const response = await fetch(`/api/admin/contact-messages/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchMessages();
        if (selectedMessage?.id === id) {
          setIsDialogOpen(false);
          setSelectedMessage(null);
        }
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const totalMessages =
    statusStats.new +
    statusStats.read +
    statusStats.replied +
    statusStats.archived;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-600 mt-1">
            Manage and respond to contact form submissions
          </p>
        </div>
        <Button onClick={fetchMessages} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{totalMessages}</p>
              </div>
              <Mail className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        {Object.entries(statusConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <Card
              key={key}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setFilters((f) => ({ ...f, status: key }))}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{config.label}</p>
                    <p className="text-2xl font-bold">
                      {statusStats[key as keyof StatusStats]}
                    </p>
                  </div>
                  <Icon className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, mobile, or message..."
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, search: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && fetchMessages()}
                />
              </div>
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((f) => ({ ...f, status: value }))
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.type}
              onValueChange={(value) =>
                setFilters((f) => ({ ...f, type: value }))
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="institute">Institute</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Messages ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No messages found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const status = statusConfig[message.status];
                const type = typeConfig[message.type];
                const StatusIcon = status.icon;
                const TypeIcon = type.icon;

                return (
                  <div
                    key={message.id}
                    className={`p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer ${
                      message.status === "new"
                        ? "bg-blue-50/50 border-blue-200"
                        : "bg-white"
                    }`}
                    onClick={() => handleViewMessage(message)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {message.name}
                          </h4>
                          <Badge className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                          <Badge variant="outline" className={type.color}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {type.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {message.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {message.mobile}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {message.message}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMessage(message.id);
                            }}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page + 1 }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Message</DialogTitle>
            <DialogDescription>
              View and manage this contact message
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6">
              {/* Sender Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-gray-500">Name</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{selectedMessage.name}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-500">Type</Label>
                  <Badge
                    variant="outline"
                    className={typeConfig[selectedMessage.type].color}
                  >
                    {typeConfig[selectedMessage.type].label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-500">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-500">Mobile</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a
                      href={`tel:${selectedMessage.mobile}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedMessage.mobile}
                    </a>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label className="text-gray-500">Message</Label>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-gray-500">Status</Label>
                <div className="flex gap-2">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <Button
                      key={key}
                      variant={
                        selectedMessage.status === key ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        updateMessageStatus(selectedMessage.id, key)
                      }
                      className={
                        selectedMessage.status === key ? "" : "hover:bg-gray-50"
                      }
                    >
                      {config.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label className="text-gray-500">Admin Notes</Label>
                <Textarea
                  placeholder="Add internal notes about this message..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
                <Button onClick={saveAdminNotes} disabled={updating} size="sm">
                  {updating ? "Saving..." : "Save Notes"}
                </Button>
              </div>

              {/* Timestamps */}
              <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t">
                <span>
                  Received:{" "}
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </span>
                <span>
                  Updated:{" "}
                  {new Date(selectedMessage.updatedAt).toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => deleteMessage(selectedMessage.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
