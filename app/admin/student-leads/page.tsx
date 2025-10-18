"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Search, Filter, Download, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, Eye, MapPin, Phone, Mail, Calendar, BookOpen, Building } from "lucide-react";
import { toast } from "sonner";

interface StudentLead {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  courseName?: string;
  instituteSlug?: string;
  courseId?: string;
  instituteId?: string;
  publicProfileId?: string;
  isAdminInstitute?: boolean;
  message?: string;
  source?: string;
  eligibilityExams?: Array<{ exam: string; score: string }>;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  status: 'new' | 'contacted' | 'qualified' | 'enrolled' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800", 
  qualified: "bg-green-100 text-green-800",
  enrolled: "bg-purple-100 text-purple-800",
  rejected: "bg-red-100 text-red-800"
};

const statusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "enrolled", label: "Enrolled" },
  { value: "rejected", label: "Rejected" }
];

interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  enrolled: number;
  rejected: number;
}

export default function StudentLeadsPage() {
  const [leads, setLeads] = useState<StudentLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Sorting state
  const [sortBy, setSortBy] = useState<'createdAt' | 'fullName' | 'email' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Statistics
  const [stats, setStats] = useState<LeadStats>({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    enrolled: 0,
    rejected: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Modal state
  const [selectedLead, setSelectedLead] = useState<StudentLead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch('/api/student-leads/stats');
      const data = await response.json();
      
      if (data.ok) {
        setStats(data.stats);
      } else {
        toast.error(data.error || 'Failed to fetch statistics');
      }
    } catch (error) {
      toast.error('Failed to fetch statistics');
      console.error('Error fetching statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchLeads = async (resetPage = false) => {
    try {
      setLoading(true);
      
      const page = resetPage ? 1 : currentPage;
      if (resetPage) setCurrentPage(1);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        search: debouncedSearch,
        status: statusFilter === 'all' ? '' : statusFilter,
        sortBy,
        sortOrder
      });
      
      const response = await fetch(`/api/student-leads?${params}`);
      const data = await response.json();
      
      if (data.ok) {
        setLeads(data.leads || []);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 1);
      } else {
        toast.error(data.error || 'Failed to fetch leads');
      }
    } catch (error) {
      toast.error('Failed to fetch leads');
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      setUpdatingStatus(leadId);
      const response = await fetch('/api/student-leads', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadId, status: newStatus }),
      });
      
      const data = await response.json();
      
      if (data.ok) {
        // Refresh the current page and stats to get updated data
        await Promise.all([fetchLeads(), fetchStats()]);
        toast.success('Lead status updated successfully');
      } else {
        toast.error(data.error || 'Failed to update lead status');
      }
    } catch (error) {
      toast.error('Failed to update lead status');
      console.error('Error updating lead status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleSort = (column: 'createdAt' | 'fullName' | 'email' | 'status') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };
  
  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Fetch leads and stats on component mount
  useEffect(() => {
    Promise.all([fetchLeads(), fetchStats()]);
  }, []);
  
  // Fetch leads when filters, pagination, or sorting changes
  useEffect(() => {
    if (debouncedSearch !== searchTerm) return; // Wait for debounced search
    fetchLeads(true); // Reset to page 1 when filters change
  }, [debouncedSearch, statusFilter, sortBy, sortOrder, pageSize]);
  
  // Fetch leads when page changes (without reset)
  useEffect(() => {
    if (currentPage > 1) {
      fetchLeads();
    }
  }, [currentPage]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'City', 'Course', 'Institute', 'Status', 'Created At'].join(','),
      ...leads.map((lead: StudentLead) => [
        lead.fullName,
        lead.email,
        lead.phone || '',
        lead.city || '',
        lead.courseName || '',
        lead.instituteSlug || '',
        lead.status,
        formatDate(lead.createdAt)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Leads</h1>
          <p className="text-gray-600">Manage and track student lead applications</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => Promise.all([fetchLeads(), fetchStats()])} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <div className="h-8 w-12 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                stats.total
              )}
            </div>
          </CardContent>
        </Card>
        
        {statusOptions.map((status) => (
          <Card key={status.value} className={statusFilter === status.value ? "ring-2 ring-blue-500" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{status.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? (
                  <div className="h-8 w-8 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <button
                    onClick={() => setStatusFilter(status.value)}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {stats[status.value as keyof LeadStats]}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, course, or institute..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('fullName')}
                      className="h-auto p-0 font-semibold"
                    >
                      Student Details
                      {getSortIcon('fullName')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('email')}
                      className="h-auto p-0 font-semibold"
                    >
                      Contact Info
                      {getSortIcon('email')}
                    </Button>
                  </TableHead>
                  <TableHead>Course & Institute</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('status')}
                      className="h-auto p-0 font-semibold"
                    >
                      Status
                      {getSortIcon('status')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('createdAt')}
                      className="h-auto p-0 font-semibold"
                    >
                      Created
                      {getSortIcon('createdAt')}
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No leads found
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead: StudentLead) => (
                    <TableRow key={lead._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.fullName}</div>
                          {lead.city && (
                            <div className="text-sm text-gray-500">{lead.city}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{lead.email}</div>
                          {lead.phone && (
                            <div className="text-sm text-gray-500">{lead.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {lead.courseName && (
                            <div className="font-medium text-sm">{lead.courseName}</div>
                          )}
                          {lead.instituteSlug && (
                            <div className="text-sm text-gray-500">{lead.instituteSlug}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[lead.status as keyof typeof statusColors]}>
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(lead.createdAt)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedLead(lead);
                              setIsModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select
                            value={lead.status}
                            onValueChange={(value) => updateLeadStatus(lead._id, value)}
                            disabled={updatingStatus === lead._id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map(status => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {/* First page */}
              {currentPage > 2 && (
                <>
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(1)} className="cursor-pointer">
                      1
                    </PaginationLink>
                  </PaginationItem>
                  {currentPage > 3 && <PaginationEllipsis />}
                </>
              )}
              
              {/* Current page and neighbors */}
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 2, currentPage - 1)) + i;
                if (page > totalPages) return null;
                
                return (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {/* Last page */}
              {currentPage < totalPages - 1 && (
                <>
                  {currentPage < totalPages - 2 && <PaginationEllipsis />}
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(totalPages)} className="cursor-pointer">
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Lead Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Lead Details
            </DialogTitle>
            <DialogDescription>
              Comprehensive information about the student lead
            </DialogDescription>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-6">
              {/* Student Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Full Name</label>
                          <p className="text-sm font-semibold">{selectedLead.fullName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Email</label>
                          <p className="text-sm flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {selectedLead.email}
                          </p>
                        </div>
                        {selectedLead.phone && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Phone</label>
                            <p className="text-sm flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {selectedLead.phone}
                            </p>
                          </div>
                        )}
                        {selectedLead.city && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">City</label>
                            <p className="text-sm flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {selectedLead.city}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Status</label>
                          <div className="mt-1">
                            <Badge className={statusColors[selectedLead.status as keyof typeof statusColors]}>
                              {selectedLead.status.charAt(0).toUpperCase() + selectedLead.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Created At</label>
                          <p className="text-sm flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(selectedLead.createdAt)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Last Updated</label>
                          <p className="text-sm flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(selectedLead.updatedAt)}
                          </p>
                        </div>
                        {selectedLead.source && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Source</label>
                            <p className="text-sm">{selectedLead.source}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* Course & Institute Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course & Institute Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Course Name</label>
                          <p className="text-sm font-semibold">
                            {selectedLead.courseName || 'Not specified'}
                          </p>
                        </div>
                        {selectedLead.courseId && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Course ID</label>
                            <p className="text-sm font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {selectedLead.courseId}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Institute</label>
                          <p className="text-sm font-semibold flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {selectedLead.instituteSlug || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Institute Type</label>
                          <p className="text-sm">
                            {selectedLead.isAdminInstitute ? 'Admin Institute' : 'Public Institute'}
                          </p>
                        </div>
                        {selectedLead.instituteId && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Institute ID</label>
                            <p className="text-sm font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {selectedLead.instituteId}
                            </p>
                          </div>
                        )}
                        {selectedLead.publicProfileId && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Public Profile ID</label>
                            <p className="text-sm font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {selectedLead.publicProfileId}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* Eligibility Exams */}
              {selectedLead.eligibilityExams && selectedLead.eligibilityExams.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Eligibility Exams</h3>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {selectedLead.eligibilityExams.map((exam: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{exam.exam}</p>
                            </div>
                            <div>
                              <Badge variant="secondary">{exam.score}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Message */}
              {selectedLead.message && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Message</h3>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm whitespace-pre-wrap">{selectedLead.message}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* UTM Parameters */}
              {selectedLead.utm && (selectedLead.utm.source || selectedLead.utm.medium || selectedLead.utm.campaign) && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Marketing Information</h3>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {selectedLead.utm.source && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">UTM Source</label>
                            <p className="text-sm">{selectedLead.utm.source}</p>
                          </div>
                        )}
                        {selectedLead.utm.medium && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">UTM Medium</label>
                            <p className="text-sm">{selectedLead.utm.medium}</p>
                          </div>
                        )}
                        {selectedLead.utm.campaign && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">UTM Campaign</label>
                            <p className="text-sm">{selectedLead.utm.campaign}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Technical Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Technical Details</h3>
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Lead ID</label>
                        <p className="text-sm font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {selectedLead._id}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
