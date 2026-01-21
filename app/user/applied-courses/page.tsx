"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
 
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
  BookOpen,
  X
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

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

const STATUS_CARD_STYLES: Record<string, { card: string; label: string }> = {
  new: { card: 'bg-sky-50 border-sky-200', label: 'text-sky-700' },
  contacted: { card: 'bg-indigo-50 border-indigo-200', label: 'text-indigo-700' },
  qualified: { card: 'bg-amber-50 border-amber-200', label: 'text-amber-700' },
  enrolled: { card: 'bg-emerald-50 border-emerald-200', label: 'text-emerald-700' },
  rejected: { card: 'bg-rose-50 border-rose-200', label: 'text-rose-700' },
}

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
        <div className="flex gap-2 items-center">
          {/* Mobile: icon-only */}
          <div className="flex gap-2 md:hidden">
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="icon"
              disabled={applications.length === 0}
              aria-label="Export CSV"
              title="Export CSV"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => fetchApplications()}
              variant="outline"
              size="icon"
              aria-label="Refresh"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          {/* Desktop: labeled buttons */}
          <div className="hidden md:flex gap-2">
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              disabled={applications.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={() => fetchApplications()}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-6 md:gap-4 no-scrollbar">
        <Card className="min-w-[140px] md:min-w-0 shadow-sm shrink-0 rounded-xl bg-white border-slate-200">
          <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
            <span className="text-sm font-medium text-gray-600">Total Applications</span>
            <span className="text-2xl font-bold text-gray-900">{statsLoading ? '-' : totalCount}</span>
          </CardContent>
        </Card>
        {['new', 'contacted', 'qualified', 'enrolled', 'rejected'].map((status) => {
          const count = (stats as any)[status] || 0
          const style = {
            new: 'bg-sky-50 border-sky-200 text-sky-700',
            contacted: 'bg-indigo-50 border-indigo-200 text-indigo-700',
            qualified: 'bg-amber-50 border-amber-200 text-amber-700',
            enrolled: 'bg-emerald-50 border-emerald-200 text-emerald-700',
            rejected: 'bg-rose-50 border-rose-200 text-rose-700',
          }[status] || 'bg-sky-50 border-sky-200 text-sky-700'
          const label = status === 'new' ? 'Under Review' : status
          return (
            <Card key={status} className={`min-w-[140px] md:min-w-0 shadow-sm shrink-0 rounded-xl ${style.split(' ')[0]} ${style.split(' ')[1]}`}>
              <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium capitalize ${style.split(' ')[2]}`}>{label}</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{statsLoading ? '-' : count}</span>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Sticky Filters */}
      <div className="sticky top-[72px] md:top-[80px] z-30 bg-white backdrop-blur-sm py-2 -mx-4 px-4 md:mx-0 md:px-0 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search applications..."
              className="pl-9 h-10 rounded-full bg-white border-slate-200 shadow-sm focus-visible:ring-1 focus-visible:ring-gray-300 w-full"
            />
            {searchTerm && <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer" onClick={() => setSearchTerm('')}/>}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-auto min-w-[120px] h-10 rounded-full border-slate-200 bg-white text-sm shadow-sm">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">Under Review</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="enrolled">Enrolled</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
              <SelectTrigger className="w-auto min-w-[120px] h-10 rounded-full border-slate-200 bg-white text-sm shadow-sm">
                <Filter className="h-4 w-4 mr-2" />
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
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <RefreshCw className="h-8 w-8 animate-spin mb-3 text-blue-500" />
            <p>Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="h-16 w-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No applications found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters or search query.</p>
            <Button variant="outline" className="mt-4" onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          applications.map((app) => (
            <Card 
              key={app._id} 
              className={`rounded-2xl border shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer ${STATUS_CARD_STYLES[app.status || 'new']?.card}`}
              role="button"
              tabIndex={0}
              onClick={() => { setSelectedApplication(app); setIsModalOpen(true); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { setSelectedApplication(app); setIsModalOpen(true); } }}
            >
              <div className="flex justify-between items-start gap-4 mb-3">
                <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2">
                  {app.courseName}
                </h3>
                <Badge className={statusColors[app.status as keyof typeof statusColors]}>
                  {statusOptions.find(s => s.value === app.status)?.label || app.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  <span>Applied <span className="font-medium text-gray-700">{formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  <span>{app.city || 'Location not specified'}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{app.instituteName || app.instituteSlug || 'Institute'}</span>
                </div>
                {/* View button removed; card is clickable */}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{app.email}</span>
                </div>
                {app.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{app.phone}</span>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-xl shadow-sm mt-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
                <span className="font-medium">{totalCount}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <Button
                  variant="outline"
                  className="rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-slate-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  className="rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-slate-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="z-[1000] sm:max-w-3xl w-full p-0 overflow-hidden rounded-2xl">
          {selectedApplication && (
            <>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                      <span className="truncate">{selectedApplication.courseName}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2 min-w-0">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span className="truncate">{selectedApplication.instituteName || selectedApplication.instituteSlug || 'Institute'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Applied {formatDate(selectedApplication.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={statusColors[selectedApplication.status as keyof typeof statusColors]}>
                    {statusOptions.find(s => s.value === selectedApplication.status)?.label || selectedApplication.status}
                  </Badge>
                </div>
              </div>
              <ScrollArea className="max-h-[70vh]">
                <div className="p-6 space-y-6">
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
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
