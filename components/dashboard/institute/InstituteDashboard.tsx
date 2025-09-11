import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/redux/store'
import { fetchMyInstitute } from '@/lib/redux/slices/instituteSlice'
import { fetchCourses } from '@/lib/redux/slices/courseSlice'
import { fetchExams } from '@/lib/redux/slices/examSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, GraduationCap, FileText, Users, TrendingUp, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function InstituteDashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const { currentInstitute, loading: instituteLoading } = useSelector((state: RootState) => state.institute)
  const { courses, loading: coursesLoading } = useSelector((state: RootState) => state.courses)
  const { exams, loading: examsLoading } = useSelector((state: RootState) => state.exams)
  const { currentSubscription } = useSelector((state: RootState) => state.subscription)

  useEffect(() => {
    dispatch(fetchMyInstitute())
    dispatch(fetchCourses({ instituteId: currentInstitute?.id }))
    dispatch(fetchExams({ createdBy: currentInstitute?.id, createdByType: 'institute' }))
  }, [dispatch, currentInstitute?.id])

  if (instituteLoading) {
    return <div className="flex items-center justify-center p-8">Loading dashboard...</div>
  }

  if (!currentInstitute) {
    return (
      <div className="text-center p-8">
        <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No institute profile</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating your institute profile.</p>
        <div className="mt-6">
          <Link href="/dashboard/institute/profile">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Institute Profile
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const activeCourses = courses.filter(course => course.status === 'active')
  const draftCourses = courses.filter(course => course.status === 'draft')
  const activeExams = exams.filter(exam => exam.status === 'active')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {currentInstitute.instituteName}</h1>
          <p className="text-muted-foreground">Manage your institute profile, courses, and admissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{currentSubscription?.plan}</Badge>
          <Badge variant={currentInstitute.isVerified ? 'default' : 'secondary'}>
            {currentInstitute.isVerified ? 'Verified' : 'Pending Verification'}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              {draftCourses.length} in draft
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
              Admission assessments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.reduce((sum, course) => sum + course.currentEnrollments, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all courses
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
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Courses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Courses</CardTitle>
                  <Link href="/dashboard/institute/courses">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courses.slice(0, 3).map((course) => (
                    <div key={course.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-muted-foreground">{course.category}</p>
                      </div>
                      <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                        {course.status}
                      </Badge>
                    </div>
                  ))}
                  {courses.length === 0 && (
                    <p className="text-sm text-muted-foreground">No courses created yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Exams */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Exams</CardTitle>
                  <Link href="/dashboard/institute/exams">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exams.slice(0, 3).map((exam) => (
                    <div key={exam.id} className="flex items-center justify-between">
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

        <TabsContent value="courses" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Course Management</h3>
            <Link href="/dashboard/institute/courses/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </Link>
          </div>
          <div className="grid gap-4">
            {courses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription>{course.category} • {course.level} • {course.duration} weeks</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                        {course.status}
                      </Badge>
                      <Link href={`/dashboard/institute/courses/edit/${course.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{course.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{course.currentEnrollments}/{course.maxStudents} enrolled</span>
                    <span>Fee: {course.fee} {course.currency}</span>
                    <span>Start: {new Date(course.startDate).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {courses.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No courses created</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating your first course.</p>
                  <div className="mt-6">
                    <Link href="/dashboard/institute/courses/create">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Course
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
            <Link href="/dashboard/institute/exams/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Exam
              </Button>
            </Link>
          </div>
          <div className="grid gap-4">
            {exams.map((exam) => (
              <Card key={exam.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      <CardDescription>{exam.type} • {exam.duration} minutes • {exam.totalMarks} marks</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={exam.status === 'active' ? 'default' : 'secondary'}>
                        {exam.status}
                      </Badge>
                      <Link href={`/dashboard/institute/exams/edit/${exam.id}`}>
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
                    <span>Fee: {exam.fee} USD</span>
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
                  <p className="mt-1 text-sm text-gray-500">Create admission exams to assess students.</p>
                  <div className="mt-6">
                    <Link href="/dashboard/institute/exams/create">
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

        <TabsContent value="students" className="space-y-4">
          <h3 className="text-lg font-semibold">Student Management</h3>
          <Card>
            <CardContent className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Student management</h3>
              <p className="mt-1 text-sm text-gray-500">View and manage student enrollments and applications.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h3 className="text-lg font-semibold">Academic Analytics</h3>
          <Card>
            <CardContent className="text-center py-8">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Analytics dashboard</h3>
              <p className="mt-1 text-sm text-gray-500">View detailed academic analytics and performance reports.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
