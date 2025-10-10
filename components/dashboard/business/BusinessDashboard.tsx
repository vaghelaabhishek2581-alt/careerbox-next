import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/redux/store'
import { fetchBusinesses } from '@/lib/redux/slices/businessSlice'
import { fetchJobs } from '@/lib/redux/slices/jobSlice'
import { fetchExams } from '@/lib/redux/slices/examSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Building2, Briefcase, FileText, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function BusinessDashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const { currentBusiness, loading: businessLoading } = useSelector((state: RootState) => state.business)
  const { jobs, loading: jobsLoading } = useSelector((state: RootState) => state.jobs)
  const { exams, loading: examsLoading } = useSelector((state: RootState) => state.exams)
  const { currentSubscription } = useSelector((state: RootState) => state.subscription)

  useEffect(() => {
    // Fetch businesses without parameters for now
    // TODO: Implement fetchMyBusiness or filter businesses by current user
    if (currentBusiness?._id) {
      dispatch(fetchJobs({ businessId: currentBusiness._id }))
      dispatch(fetchExams({ createdBy: currentBusiness._id, createdByType: 'business' }))
    }
  }, [dispatch, currentBusiness?._id])

  if (businessLoading) {
    return <div className="flex items-center justify-center p-8">Loading dashboard...</div>
  }

  if (!currentBusiness) {
    return (
      <div className="text-center p-8">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No business profile</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating your business profile.</p>
        <div className="mt-6">
          <Link href="/dashboard/business/profile">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Business Profile
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const activeJobs = jobs.filter(job => job.status === 'active')
  const draftJobs = jobs.filter(job => job.status === 'draft' || job.status === 'paused')
  const activeExams = exams.filter(exam => exam.status === 'active')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {currentBusiness.name}</h1>
          <p className="text-muted-foreground">Manage your business profile, jobs, and recruitment</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{currentSubscription?.plan}</Badge>
          <Badge variant={currentBusiness.isVerified ? 'default' : 'secondary'}>
            {currentBusiness.isVerified ? 'Verified' : 'Pending Verification'}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs.length}</div>
            <p className="text-xs text-muted-foreground">
              {draftJobs.length} in draft
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeExams.length}</div>
            <p className="text-xs text-muted-foreground">
              Recruitment assessments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.reduce((sum, job) => sum + ((job as any).applicationsCount || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Jobs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Jobs</CardTitle>
                  <Link href="/dashboard/business/jobs">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jobs.slice(0, 3).map((job) => (
                    <div key={job._id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">{job.location}</p>
                      </div>
                      <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                        {job.status}
                      </Badge>
                    </div>
                  ))}
                  {jobs.length === 0 && (
                    <p className="text-sm text-muted-foreground">No jobs posted yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Exams */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Exams</CardTitle>
                  <Link href="/dashboard/business/exams">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exams.slice(0, 3).map((exam) => (
                    <div key={(exam as any)._id || (exam as any).id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{exam.title}</p>
                        <p className="text-sm text-muted-foreground">{exam.type}</p>
                      </div>
                      <Badge variant={exam.status === 'active' ? 'default' : 'secondary'}>
                        {exam.status}
                      </Badge>
                    </div>
                  ))}
                  {exams.length === 0 && (
                    <p className="text-sm text-muted-foreground">No exams created yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Job Management</h3>
            <Link href="/dashboard/business/jobs/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Job
              </Button>
            </Link>
          </div>
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Card key={job._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <CardDescription>{job.location} • {(job as any).employmentType || 'Full-time'}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                        {job.status}
                      </Badge>
                      <Link href={`/dashboard/business/jobs/edit/${job._id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{job.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{(job as any).applicationsCount || 0} applications</span>
                    <span>Deadline: {(job as any).applicationDeadline ? new Date((job as any).applicationDeadline).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {jobs.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs posted</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating your first job posting.</p>
                  <div className="mt-6">
                    <Link href="/dashboard/business/jobs/create">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Job
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Exam Management</h3>
            <Link href="/dashboard/business/exams/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Exam
              </Button>
            </Link>
          </div>
          <div className="grid gap-4">
            {exams.map((exam) => (
              <Card key={(exam as any)._id || (exam as any).id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      <CardDescription>{exam.type} • {exam.duration} minutes</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={exam.status === 'active' ? 'default' : 'secondary'}>
                        {exam.status}
                      </Badge>
                      <Link href={`/dashboard/business/exams/edit/${(exam as any)._id || (exam as any).id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{exam.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{exam.registrationsCount} registrations</span>
                    <span>Date: {new Date(exam.examDate).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {exams.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No exams created</h3>
                  <p className="mt-1 text-sm text-gray-500">Create recruitment exams to assess candidates.</p>
                  <div className="mt-6">
                    <Link href="/dashboard/business/exams/create">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Exam
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-4">
          <h3 className="text-lg font-semibold">Candidate Management</h3>
          <Card>
            <CardContent className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Candidate management</h3>
              <p className="mt-1 text-sm text-gray-500">View and manage job applications and exam results.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h3 className="text-lg font-semibold">Analytics & Reports</h3>
          <Card>
            <CardContent className="text-center py-8">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Analytics dashboard</h3>
              <p className="mt-1 text-sm text-gray-500">View detailed analytics and performance reports.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
