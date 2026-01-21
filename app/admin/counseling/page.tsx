"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  HeadphonesIcon,
  Search,
  Clock,
  User,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  BookOpen,
  Target,
  MapPin,
  RefreshCw,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface CounselingRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  city: string;
  courseLevel: string;
  courseInterest: string;
  status: "pending" | "contacted" | "completed";
  submittedAt: string;
  source?: string;
  adminNotes?: string;
  counselorAssigned?: string;
  contactedAt?: string;
  completedAt?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface StatusStats {
  pending: number;
  contacted: number;
  completed: number;
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  contacted: {
    label: "Contacted",
    color: "bg-blue-100 text-blue-800",
    icon: Phone,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
};

const courseLevelLabels: Record<string, string> = {
  undergraduate: "Undergraduate",
  postgraduate: "Postgraduate",
  professional: "Professional",
  medical: "Medical",
  diploma: "Diploma",
  certification: "Certification",
  other: "Other",
  Undergraduate: "Undergraduate (After 12th)",
  PG: "Post Graduate (After Graduation)",
  Doctorate: "M.Phil / Ph.D",
  Advance_diploma: "Advance Diploma",
  abroad: "Abroad Education",
  Job_guarantee: "Job Guarantee Program",
};

export default function CareerCounselingPage() {
  const [requests, setRequests] = useState<CounselingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [statusStats, setStatusStats] = useState<StatusStats>({
    pending: 0,
    contacted: 0,
    completed: 0,
  });
  const [selectedRequest, setSelectedRequest] =
    useState<CounselingRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [adminNotes, setAdminNotes] = useState("");
  const [counselorAssigned, setCounselorAssigned] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/admin/counselling?${params}`);
      const data = await response.json();

      if (data.success) {
        setRequests(data.data.requests);
        setPagination(data.data.pagination);
        setStatusStats(data.data.statusStats);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, searchTerm]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleViewRequest = (request: CounselingRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || "");
    setCounselorAssigned(request.counselorAssigned || "");
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/counselling/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchRequests();
        if (selectedRequest?.id === requestId) {
          setSelectedRequest((prev) =>
            prev ? { ...prev, status: newStatus as any } : null
          );
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleSaveDetails = async () => {
    if (!selectedRequest) return;

    setUpdating(true);
    try {
      const response = await fetch(
        `/api/admin/counselling/${selectedRequest.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminNotes, counselorAssigned }),
        }
      );

      if (response.ok) {
        fetchRequests();
        setSelectedRequest((prev) =>
          prev ? { ...prev, adminNotes, counselorAssigned } : null
        );
      }
    } catch (error) {
      console.error("Error saving details:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;

    try {
      const response = await fetch(`/api/admin/counselling/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchRequests();
        if (selectedRequest?.id === id) {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }
      }
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const totalRequests =
    statusStats.pending + statusStats.contacted + statusStats.completed;

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <HeadphonesIcon className="h-5 w-5 text-blue-600" />
            Career Counseling
          </h1>
          <p className="text-sm text-gray-600">Manage counseling requests</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={fetchRequests}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Compact Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card
          className="bg-gradient-to-r from-blue-50 to-blue-100 cursor-pointer"
          onClick={() => setStatusFilter("all")}
        >
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-lg font-bold text-blue-700">{totalRequests}</p>
              <p className="text-xs text-blue-600">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="bg-gradient-to-r from-yellow-50 to-yellow-100 cursor-pointer"
          onClick={() => setStatusFilter("pending")}
        >
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-lg font-bold text-yellow-700">
                {statusStats.pending}
              </p>
              <p className="text-xs text-yellow-600">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="bg-gradient-to-r from-purple-50 to-purple-100 cursor-pointer"
          onClick={() => setStatusFilter("contacted")}
        >
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-lg font-bold text-purple-700">
                {statusStats.contacted}
              </p>
              <p className="text-xs text-purple-600">Contacted</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="bg-gradient-to-r from-green-50 to-green-100 cursor-pointer"
          onClick={() => setStatusFilter("completed")}
        >
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-lg font-bold text-green-700">
                {statusStats.completed}
              </p>
              <p className="text-xs text-green-600">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compact Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, phone, course interest..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchRequests()}
            className="pl-10 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <HeadphonesIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No counseling requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => {
            const status = statusConfig[request.status] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <Card
                key={request.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <h3 className="font-semibold text-gray-900">
                          {request.name}
                        </h3>
                      </div>
                      <Badge className={status.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewRequest(request)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      <Select
                        value={request.status}
                        onValueChange={(value) =>
                          handleUpdateStatus(request.id, value)
                        }
                      >
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRequest(request.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-3 w-3" />
                      <span>{request.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{request.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">
                        {request.city}, {request.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(request.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <BookOpen className="h-3 w-3" />
                      <span>
                        {courseLevelLabels[request.courseLevel] ||
                          request.courseLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Target className="h-3 w-3" />
                      <span className="truncate">{request.courseInterest}</span>
                    </div>
                  </div>

                  {request.counselorAssigned && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Counselor: </span>
                      <span className="font-medium text-blue-600">
                        {request.counselorAssigned}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
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
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Full Screen Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Career Counseling Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900">
                    Contact Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>
                        <strong>Name:</strong> {selectedRequest.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>
                        <strong>Email:</strong>{" "}
                        <a
                          href={`mailto:${selectedRequest.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {selectedRequest.email}
                        </a>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>
                        <strong>Phone:</strong>{" "}
                        <a
                          href={`tel:${selectedRequest.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {selectedRequest.phone}
                        </a>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>
                        <strong>Location:</strong> {selectedRequest.city},{" "}
                        {selectedRequest.state}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900">
                    Request Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Status:</strong>
                      <Badge
                        className={`${
                          statusConfig[selectedRequest.status]?.color ||
                          "bg-gray-100"
                        } ml-2`}
                      >
                        {statusConfig[selectedRequest.status]?.label ||
                          selectedRequest.status}
                      </Badge>
                    </p>
                    <p>
                      <strong>Course Level:</strong>{" "}
                      {courseLevelLabels[selectedRequest.courseLevel] ||
                        selectedRequest.courseLevel}
                    </p>
                    <p>
                      <strong>Interest:</strong>{" "}
                      {selectedRequest.courseInterest}
                    </p>
                    <p>
                      <strong>Submitted:</strong>{" "}
                      {new Date(selectedRequest.submittedAt).toLocaleString()}
                    </p>
                    {selectedRequest.contactedAt && (
                      <p>
                        <strong>Contacted:</strong>{" "}
                        {new Date(selectedRequest.contactedAt).toLocaleString()}
                      </p>
                    )}
                    {selectedRequest.completedAt && (
                      <p>
                        <strong>Completed:</strong>{" "}
                        {new Date(selectedRequest.completedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-gray-900">
                  Update Status
                </h3>
                <div className="flex gap-2">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <Button
                      key={key}
                      variant={
                        selectedRequest.status === key ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        handleUpdateStatus(selectedRequest.id, key)
                      }
                    >
                      {config.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-gray-700 font-semibold">
                  Counselor Assigned
                </Label>
                <Input
                  value={counselorAssigned}
                  onChange={(e) => setCounselorAssigned(e.target.value)}
                  placeholder="Enter counselor name..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-semibold">
                  Admin Notes
                </Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this request..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteRequest(selectedRequest.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Close
                  </Button>
                  <Button onClick={handleSaveDetails} disabled={updating}>
                    {updating ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
