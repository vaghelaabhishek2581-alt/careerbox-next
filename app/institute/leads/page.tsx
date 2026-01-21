"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/src/hooks/use-toast";
import {
  RefreshCw,
  Search,
  Users,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Filter,
  MapPin,
  Clock,
  ThumbsDown,
  X,
  Phone,
  Mail,
  Download,
  Calendar,
  Lock,
  Crown,
} from "lucide-react";
import { IStudentLead } from "@/src/models/StudentLead";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export default function InstituteLeadsPage() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<IStudentLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseLevelFilter, setCourseLevelFilter] = useState("all");
  const [isPaidPlan, setIsPaidPlan] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [stats, setStats] = useState<{ [key: string]: number }>({});
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const STATUS_CARD_STYLES: Record<string, { card: string; label: string }> = {
    new: { card: "bg-sky-50 border-sky-200", label: "text-sky-700" },
    contacted: {
      card: "bg-indigo-50 border-indigo-200",
      label: "text-indigo-700",
    },
    qualified: {
      card: "bg-amber-50 border-amber-200",
      label: "text-amber-700",
    },
    enrolled: {
      card: "bg-emerald-50 border-emerald-200",
      label: "text-emerald-700",
    },
    rejected: { card: "bg-rose-50 border-rose-200", label: "text-rose-700" },
  };

  const router = useRouter();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchLeads = async (page = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: debouncedSearch,
        status: statusFilter,
        courseLevel: courseLevelFilter,
      });

      const res = await fetch(`/api/institute/leads?${queryParams.toString()}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      if (data.isPaid === false) {
        setIsPaidPlan(false);
      } else {
        setIsPaidPlan(true);
      }

      setLeads(data.data || []);
      setTotalCount(data.count || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
      setStats(data.stats || {});
    } catch (e: any) {
      toast({
        title: "Failed to load leads",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(currentPage);
  }, [currentPage, debouncedSearch, statusFilter, courseLevelFilter]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    if (!isPaidPlan) {
      toast({
        title: "Upgrade Required",
        description: "Please upgrade your plan to manage leads.",
        action: (
          <Button
            variant="outline"
            onClick={() => window.open("/pricing", "_blank")}
          >
            Upgrade Now
          </Button>
        ),
      });
      return;
    }

    try {
      const res = await fetch(`/api/institute/leads`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.isPaid === false) {
          toast({
            title: "Upgrade Required",
            description: "Please upgrade your plan to manage leads.",
            action: (
              <Button
                variant="outline"
                onClick={() => window.open("/pricing", "_blank")}
              >
                Upgrade Now
              </Button>
            ),
          });
          return;
        }
        throw new Error(data.message || "Failed to update status");
      }

      toast({ title: "Status updated" });
      fetchLeads(currentPage); // Refresh leads after update
    } catch (e: any) {
      toast({
        title: "Failed to update status",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Top Container with Padding */}
      <div className="space-y-4">
        {/* 1. Page Heading & Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Student Leads
            </h1>
            <p className="hidden md:block text-sm text-gray-500 mt-1">
              Manage and track your student leads efficiently.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLeads(currentPage)}
              className="bg-white border-slate-200 text-gray-600"
            >
              <RefreshCw className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Refresh</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-slate-200 text-gray-600 gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden md:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* 2. Stats Section - Horizontal Scroll Mobile / Grid Desktop */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-5 md:gap-4 no-scrollbar">
          {["new", "contacted", "qualified", "enrolled", "rejected"].map(
            (status) => {
              const count = stats[status] || 0;
              const style =
                STATUS_CARD_STYLES[status] || STATUS_CARD_STYLES["new"];
              return (
                <Card
                  key={status}
                  className={`min-w-[140px] md:min-w-0 shadow-sm shrink-0 rounded-xl ${style.card}`}
                >
                  <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
                    <div className="flex justify-between items-start">
                      <span
                        className={`text-sm font-medium capitalize ${style.label}`}
                      >
                        {status}
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                      {count}
                    </span>
                  </CardContent>
                </Card>
              );
            }
          )}
        </div>

        {/* 3. Sticky Search & Filters */}
        <div className="sticky top-[72px] md:top-[80px] z-30 bg-white backdrop-blur-sm py-2 -mx-4 px-4 md:mx-0 md:px-0 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search leads..."
                className="pl-9 h-10 rounded-full bg-white border-slate-200 shadow-sm focus-visible:ring-1 focus-visible:ring-gray-300 w-full"
              />
              {searchTerm && (
                <X
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>

            {/* Filter Pills - Scrollable on Mobile */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              <Select
                value={courseLevelFilter}
                onValueChange={setCourseLevelFilter}
              >
                <SelectTrigger className="w-auto min-w-[150px] h-10 rounded-full border-slate-200 bg-white text-sm shadow-sm">
                  <SelectValue placeholder="All Course Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Course Level</SelectItem>
                  <SelectItem value="ug">Undergraduate</SelectItem>
                  <SelectItem value="pg">Postgraduate</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-auto min-w-[120px] h-10 rounded-full border-slate-200 bg-white text-sm shadow-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="enrolled">Enrolled</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 4. Leads List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <RefreshCw className="h-8 w-8 animate-spin mb-3 text-blue-500" />
              <p>Loading leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
              <div className="h-16 w-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                No leads found
              </h3>
              <p className="text-gray-500 mt-1">
                Try adjusting your filters or search query.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setCourseLevelFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            leads.map((lead) => (
              <Card
                key={lead._id.toString()}
                className={`rounded-2xl border shadow-sm p-5 hover:shadow-md transition-shadow ${
                  STATUS_CARD_STYLES[lead.status?.toLowerCase() || "new"]?.card
                }`}
              >
                {/* Row 1: Course & Status */}
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2">
                    {lead.courseName || "General Inquiry"}
                  </h3>
                  <div className="shrink-0">
                    <Select
                      value={lead.status?.toLowerCase() || "new"}
                      onValueChange={(newStatus) =>
                        handleStatusChange(lead._id.toString(), newStatus)
                      }
                      disabled={!isPaidPlan}
                    >
                      <SelectTrigger className="h-8 rounded-full border-slate-200 bg-white px-3 text-xs font-medium min-w-[110px]">
                        <SelectValue
                          placeholder="Status"
                          className="capitalize"
                        />
                      </SelectTrigger>
                      <SelectContent align="end">
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="enrolled">Enrolled</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Meta Data */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span>
                      Posted{" "}
                      <span className="font-medium text-gray-700">
                        {lead.createdAt
                          ? formatDistanceToNow(new Date(lead.createdAt), {
                              addSuffix: true,
                            })
                          : "recently"}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    <span>{lead.city || "Location not specified"}</span>
                  </div>
                </div>

                {/* Row 3: Name & Action Menu */}
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-900 text-lg">
                    {lead.fullName}
                  </span>
                  {lead.publicProfileId && (
                    <a
                      href={`/user/public-profile/${lead.publicProfileId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Profile
                    </a>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-50 -mr-2"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(lead._id.toString(), "contacted")
                        }
                        disabled={!isPaidPlan}
                      >
                        <Phone className="mr-2 h-4 w-4" /> Mark Contacted
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(lead._id.toString(), "qualified")
                        }
                        disabled={!isPaidPlan}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" /> Mark Qualified
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(lead._id.toString(), "rejected")
                        }
                        disabled={!isPaidPlan}
                        className="text-red-600"
                      >
                        <ThumbsDown className="mr-2 h-4 w-4" /> Reject Lead
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Row 4: Contact Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a
                      href={`tel:${lead.phone}`}
                      className={
                        !isPaidPlan
                          ? "pointer-events-none"
                          : "hover:text-blue-600 transition-colors"
                      }
                    >
                      {lead.phone || "+91 98*** ***95"}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a
                      href={`mailto:${lead.email}`}
                      className={
                        !isPaidPlan
                          ? "pointer-events-none"
                          : "hover:text-blue-600 transition-colors"
                      }
                    >
                      {lead.email || "student@example.com"}
                    </a>
                  </div>
                  {!isPaidPlan && (
                    <Button
                      variant="link"
                      className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                      onClick={() => setUpgradeOpen(true)}
                    >
                      <Lock className="h-4 w-4 mr-1" />
                      View contact details
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* 5. Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-xl shadow-sm mt-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * 10 + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * 10, totalCount)}
                  </span>{" "}
                  of <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div>
                <nav
                  className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <Button
                    variant="outline"
                    className="rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-slate-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <span className="sr-only">Previous</span>
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === page
                            ? "z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            : "text-gray-900 ring-1 ring-inset ring-slate-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    )
                  )}
                  <Button
                    variant="outline"
                    className="rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-slate-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <span className="sr-only">Next</span>
                    Next
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}

        <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Upgrade to view contact details
              </DialogTitle>
              <DialogDescription>
                Unlock phone and email details by upgrading your plan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-end gap-2">
              <Button variant="outline" onClick={() => setUpgradeOpen(false)}>
                Not now
              </Button>
              <Button
                onClick={() => {
                  setUpgradeOpen(false);
                  router.push("/institute/subscription");
                }}
              >
                Upgrade Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
