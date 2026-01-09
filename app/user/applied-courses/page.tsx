"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { 
  GraduationCap, 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Search,
  Filter,
  Download,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  BookOpen
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface AppliedCourse {
  _id: string
  fullName: string
  email: string
  phone?: string
  city?: string
  courseName: string
  instituteId?: string
  instituteSlug?: string
  instituteName?: string
  status: 'new' | 'contacted' | 'qualified' | 'enrolled' | 'rejected'
  createdAt: string
  updatedAt?: string
  eligibilityExams?: Array<{ exam: string; score: string }>
  source?: string
  message?: string
  utm?: {
    source?: string
    medium?: string
    campaign?: string
  }
}

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800", 
  qualified: "bg-green-100 text-green-800",
  enrolled: "bg-purple-100 text-purple-800",
  rejected: "bg-red-100 text-red-800"
}

const statusOptions = [
  { value: "new", label: "Under Review" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "enrolled", label: "Enrolled" },
  { value: "rejected", label: "Rejected" }
]

interface ApplicationStats {
  total: number
  new: number
  contacted: number
  qualified: number
  enrolled: number
  rejected: number
}

export default function AppliedCoursesPage() {
  const { data: session } = useSession()
  const [applications, setApplications] = useState<AppliedCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  
  // Sorting state
  const [sortBy, setSortBy] = useState<'createdAt' | 'courseName' | 'status'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("")
  
  // Statistics
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    enrolled: 0,
    rejected: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)
  
  // Modal state
  const [selectedApplication, setSelectedApplication] = useState<AppliedCourse | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchApplications = async (resetPage = false) => {
    try {
      setLoading(true)
      
      const page = resetPage ? 1 : currentPage
      if (resetPage) setCurrentPage(1)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        search: debouncedSearch,
        status: statusFilter === 'all' ? '' : statusFilter,
        sortBy,
        sortOrder
      })
      
      const response = await fetch(`/api/user/applied-courses?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setApplications(data.applications || [])
        setTotalCount(data.total || 0)
        setTotalPages(Math.ceil((data.total || 0) / pageSize))
        
        // Calculate stats
        const allApps = data.applications || []
        const newStats = {
          total: allApps.length,
          new: allApps.filter((app: AppliedCourse) => app.status === 'new').length,
          contacted: allApps.filter((app: AppliedCourse) => app.status === 'contacted').length,
          qualified: allApps.filter((app: AppliedCourse) => app.status === 'qualified').length,
          enrolled: allApps.filter((app: AppliedCourse) => app.status === 'enrolled').length,
          rejected: allApps.filter((app: AppliedCourse) => app.status === 'rejected').length,
        }
        setStats(newStats)
      } else {
        toast.error(data.error || 'Failed to fetch applications')
      }
    } catch (error) {
      toast.error('Failed to fetch applications')
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
      setStatsLoading(false)
    }
  }

  const handleSort = (column: 'createdAt' | 'courseName' | 'status') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }
  
  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="h-4 w-4" />
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchTerm])
  
  // Fetch applications on component mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchApplications()
    }
  }, [session?.user?.id])
  
  // Fetch applications when filters, pagination, or sorting changes
  useEffect(() => {
    if (debouncedSearch !== searchTerm) return // Wait for debounced search
    if (session?.user?.id) {
      fetchApplications(true) // Reset to page 1 when filters change
    }
  }, [debouncedSearch, statusFilter, sortBy, sortOrder, pageSize])
  
  // Fetch applications when page changes (without reset)
  useEffect(() => {
    if (currentPage > 1 && session?.user?.id) {
      fetchApplications()
    }
  }, [currentPage])

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy')
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Course', 'Institute', 'Status', 'Applied Date', 'Email', 'Phone', 'City'].join(','),
      ...applications.map((app: AppliedCourse) => [
        app.courseName,
        app.instituteName || app.instituteSlug || '',
        app.status,
        formatDate(app.createdAt),
        app.email,
        app.phone || '',
        app.city || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `my-applications-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Applied Courses</h1>
          <p className="text-gray-600">Track the status of your course applications</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm" disabled={applications.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => fetchApplications()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats - Mobile horizontal scroll */}
      <div className="md:hidden">
        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <div className="flex gap-4 snap-x snap-mandatory">
            <Card className="min-w-[140px] snap-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Applications</CardTitle>
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
              <Card key={status.value} className={`min-w-[140px] snap-center ${statusFilter === status.value ? "ring-2 ring-blue-500" : ""}`}>
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
                        {stats[status.value as keyof ApplicationStats]}
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Stats - Desktop grid */}
      <div className="hidden md:grid md:grid-cols-6 gap-4 md:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Applications</CardTitle>
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
          <Card key={status.value} className={`${statusFilter === status.value ? "ring-2 ring-blue-500" : ""}`}>
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
                    {stats[status.value as keyof ApplicationStats]}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sticky Filters */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 py-2 shadow-sm">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by course, institute, or status..."
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
      </div>

      {/* Listing: Responsive table on md+, cards on mobile */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* Desktop/Tablet Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('courseName')}
                          className="h-auto p-0 font-semibold"
                        >
                          Course Details
                          {getSortIcon('courseName')}
                        </Button>
                      </TableHead>
                      <TableHead>Institute</TableHead>
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
                          Applied Date
                          {getSortIcon('createdAt')}
                        </Button>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex flex-col items-center gap-4">
                            <GraduationCap className="h-16 w-16 text-gray-300" />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                              <p className="text-gray-600 mb-4">
                                You haven't applied to any courses yet. Start exploring institutes and courses.
                              </p>
                              <Button onClick={() => window.location.href = '/search'}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Browse Courses
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      applications.map((application: AppliedCourse) => (
                        <TableRow key={application._id}>
                          <TableCell>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-blue-600" />
                                {application.courseName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {application.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">
                                {application.instituteName || application.instituteSlug || 'Institute'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                              {statusOptions.find(s => s.value === application.status)?.label || application.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{formatDate(application.createdAt)}</div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedApplication(application)
                                setIsModalOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card List */}
              <div className="md:hidden">
                {applications.length === 0 ? (
                  <div className="text-center py-10">
                    <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                    <p className="text-gray-600 mb-4">
                      You haven't applied to any courses yet. Start exploring institutes and courses.
                    </p>
                    <Button onClick={() => window.location.href = '/search'}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Browse Courses
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 p-3">
                    {applications.map((app: AppliedCourse) => (
                      <div key={app._id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-blue-600 flex-shrink-0" />
                              <span className="truncate">{app.courseName}</span>
                            </div>
                            <div className="mt-1 text-xs text-gray-600 flex items-center gap-2">
                              <Building2 className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{app.instituteName || app.instituteSlug || 'Institute'}</span>
                            </div>
                          </div>
                          <Badge className={`${statusColors[app.status as keyof typeof statusColors]} flex-shrink-0`}>
                            {statusOptions.find(s => s.value === app.status)?.label || app.status}
                          </Badge>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Applied {formatDate(app.createdAt)}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSelectedApplication(app); setIsModalOpen(true); }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
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
                const page = Math.max(1, Math.min(totalPages - 2, currentPage - 1)) + i
                if (page > totalPages) return null
                
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
                )
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

      {/* Application Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="z-[1000] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Application Details
            </DialogTitle>
            <DialogDescription>
              Comprehensive information about your course application
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Course Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Course Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Course Name</label>
                          <p className="text-sm font-semibold">{selectedApplication.courseName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Institute</label>
                          <p className="text-sm flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {selectedApplication.instituteName || selectedApplication.instituteSlug || 'Institute'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Status</label>
                          <div className="mt-1">
                            <Badge className={statusColors[selectedApplication.status as keyof typeof statusColors]}>
                              {statusOptions.find(s => s.value === selectedApplication.status)?.label || selectedApplication.status}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Applied Date</label>
                          <p className="text-sm flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(selectedApplication.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Full Name</label>
                          <p className="text-sm font-semibold">{selectedApplication.fullName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Email</label>
                          <p className="text-sm flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {selectedApplication.email}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {selectedApplication.phone && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Phone</label>
                            <p className="text-sm flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {selectedApplication.phone}
                            </p>
                          </div>
                        )}
                        {selectedApplication.city && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">City</label>
                            <p className="text-sm flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {selectedApplication.city}
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
              {selectedApplication.eligibilityExams && selectedApplication.eligibilityExams.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Eligibility Exams
                  </h3>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {selectedApplication.eligibilityExams.map((exam: any, index: number) => (
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

              {/* Technical Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Technical Details</h3>
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Application ID</label>
                        <p className="text-sm font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {selectedApplication._id}
                        </p>
                      </div>
                      {selectedApplication.source && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Source</label>
                          <p className="text-sm">{selectedApplication.source}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
