import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/redux/store'
import { fetchJobs } from '@/lib/redux/slices/jobSlice'
import { fetchCourses } from '@/lib/redux/slices/courseSlice'
import { fetchExams } from '@/lib/redux/slices/examSlice'
import { fetchInstitutes } from '@/lib/redux/slices/instituteSlice'
import { fetchMyApplications } from '@/lib/redux/slices/applicationSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search, Briefcase, GraduationCap, FileText, Building2, Clock, MapPin, DollarSign, Crown } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import SubscriptionUpgrade from './SubscriptionUpgrade'

export default function PublicDashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { jobs, loading: jobsLoading } = useSelector((state: RootState) => state.jobs)
  const { courses, loading: coursesLoading } = useSelector((state: RootState) => state.courses)
  const { exams, loading: examsLoading } = useSelector((state: RootState) => state.exams)
  const { institutes, loading: institutesLoading } = useSelector((state: RootState) => state.institute)
  const { applications } = useSelector((state: RootState) => state.applications)
  
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    dispatch(fetchJobs())
    dispatch(fetchCourses())
    dispatch(fetchExams())
    dispatch(fetchInstitutes())
    dispatch(fetchMyApplications())
  }, [dispatch])

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredExams = exams.filter(exam => 
    exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const recentApplications = applications.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground">Discover opportunities and track your applications</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Public User</Badge>
          <Link href="/dashboard/user/upgrade">
            <Button variant="outline" size="sm">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search jobs, courses, exams, or institutes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="text-xs text-muted-foreground">
              {applications.filter(app => app.status === 'pending').length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-muted-foreground">
              Active job postings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              From {institutes.length} institutes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Exams</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.length}</div>
            <p className="text-xs text-muted-foreground">
              Registration open
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="institutes">Institutes</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Job Opportunities</h3>
            <Badge variant="outline">{filteredJobs.length} jobs found</Badge>
          </div>
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          Company Name
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {job.employmentType}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {job.salaryRange.min} - {job.salaryRange.max} {job.salaryRange.currency}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {job.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {job.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{job.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/user/jobs/${job.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/dashboard/user/jobs/${job.id}/apply`}>
                        <Button size="sm">
                          Apply Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Application deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredJobs.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery ? 'Try adjusting your search terms.' : 'No job postings available at the moment.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Available Courses</h3>
            <Badge variant="outline">{filteredCourses.length} courses found</Badge>
          </div>
          <div className="grid gap-4">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" />
                          {course.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration} weeks
                        </span>
                        <Badge variant="outline">{course.level}</Badge>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {course.fee} {course.currency}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <span>Instructor: {course.instructor.name}</span>
                      <span className="mx-2">•</span>
                      <span>{course.currentEnrollments}/{course.maxStudents} enrolled</span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/user/courses/${course.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/dashboard/user/courses/${course.id}/apply`}>
                        <Button size="sm">
                          Apply Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Registration deadline: {new Date(course.registrationDeadline).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredCourses.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery ? 'Try adjusting your search terms.' : 'No courses available at the moment.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Available Exams</h3>
            <Badge variant="outline">{filteredExams.length} exams found</Badge>
          </div>
          <div className="grid gap-4">
            {filteredExams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <Badge variant="outline">{exam.type}</Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {exam.duration} minutes
                        </span>
                        <span>{exam.totalMarks} marks</span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {exam.fee} USD
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {exam.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <span>{exam.registrationsCount} registrations</span>
                      <span className="mx-2">•</span>
                      <span>Passing: {exam.passingMarks} marks</span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/user/exams/${exam.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/dashboard/user/exams/${exam.id}/register`}>
                        <Button size="sm">
                          Register
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Registration deadline: {new Date(exam.registrationDeadline).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredExams.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No exams found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery ? 'Try adjusting your search terms.' : 'No exams available at the moment.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="institutes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Educational Institutes</h3>
            <Badge variant="outline">{institutes.length} institutes</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {institutes.map((institute) => (
              <Card key={institute.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{institute.instituteName}</CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span>{institute.type}</span>
                        {institute.isVerified && (
                          <Badge variant="default" className="text-xs">Verified</Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {institute.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <span>{institute.address.city}, {institute.address.country}</span>
                    </div>
                    <Link href={`/dashboard/user/institutes/${institute.id}`}>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">My Applications</h3>
            <Badge variant="outline">{applications.length} total applications</Badge>
          </div>
          <div className="grid gap-4">
            {recentApplications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg capitalize">{application.type} Application</CardTitle>
                      <CardDescription>
                        Applied on {new Date(application.appliedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant={
                      application.status === 'accepted' ? 'default' :
                      application.status === 'rejected' ? 'destructive' :
                      application.status === 'pending' ? 'secondary' : 'outline'
                    }>
                      {application.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Target ID: {application.targetId}
                    </div>
                    <Link href={`/dashboard/user/applications/${application.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
            {applications.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Start applying to jobs, courses, or exams to see them here.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
