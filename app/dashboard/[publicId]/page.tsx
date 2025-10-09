'use client'

import React, { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Building, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Calendar,
  Users,
  BookOpen,
  Briefcase,
  Award,
  Star,
  ExternalLink,
  Share2,
  Heart,
  MessageCircle,
  Trophy,
  GraduationCap,
  Search,
  Filter,
  Clock,
  DollarSign
} from 'lucide-react'
import axios from 'axios'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ProfileData {
  type: 'user' | 'institute' | 'business'
  data: any
  notFound?: boolean
}

export default function PublicProfilePage() {
  const params = useParams<{ publicId?: string }>()
  const publicId = Array.isArray(params?.publicId) ? params?.publicId[0] : params?.publicId
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!publicId) return
    fetchProfileData()
  }, [publicId])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await axios.get(`/api/public/profile/${publicId}`)
      setProfileData(response.data)
    } catch (err: any) {
      console.error('Error fetching profile:', err)
      if (err.response?.status === 404) {
        setProfileData({ type: 'user', data: null, notFound: true })
      } else {
        setError('Failed to load profile')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!publicId) {
    return <ProfileSkeleton />
  }

  if (loading) {
    return <ProfileSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchProfileData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (profileData?.notFound) {
    notFound()
  }

  if (!profileData) {
    return null
  }

  switch (profileData.type) {
    case 'institute':
      return <InstituteProfile data={profileData.data} />
    case 'business':
      return <BusinessProfile data={profileData.data} />
    case 'user':
      return <UserProfile data={profileData.data} />
    default:
      return notFound()
  }
}

function InstituteProfile({ data }: { data: any }) {
  const [courses, setCourses] = useState<any[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  // Fetch courses for this institute
  useEffect(() => {
    if (data?._id) {
      fetchCourses()
    }
  }, [data?._id])

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true)
      console.log('Fetching courses for institute:', data._id)
      const response = await axios.get(`/api/courses?instituteId=${data._id}&limit=50`)
      console.log('Courses API response:', response.data)
      if (response.data.success !== false && response.data.data) {
        setCourses(response.data.data || [])
        console.log('Courses set:', response.data.data)
      } else if (response.data && Array.isArray(response.data)) {
        // Handle case where API returns data directly without success wrapper
        setCourses(response.data)
        console.log('Courses set (direct array):', response.data)
      } else {
        console.log('API response not in expected format:', response.data)
        setCourses([])
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      setCourses([])
    } finally {
      setCoursesLoading(false)
    }
  }

  // Filter courses based on search and filters
  // For public pages, we should primarily show published courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = (course.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (course.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (course.courseType?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === "all" || course.courseType === filterType
    
    // For public profile, show courses based on isPublished flag primarily
    const matchesStatus = filterStatus === "all" ? course.isPublished : // Default: only show published
                         (filterStatus === "published" && course.isPublished) ||
                         (filterStatus === "draft" && !course.isPublished)
    
    console.log(`Course "${course.title}": isPublished=${course.isPublished}, status=${course.status}, matchesStatus=${matchesStatus}`)
    
    return matchesSearch && matchesType && matchesStatus
  })

  console.log('Total courses:', courses.length, 'Filtered courses:', filteredCourses.length)

  const getStatusColor = (isPublished: boolean) => {
    return isPublished 
      ? "bg-green-100 text-green-700" 
      : "bg-yellow-100 text-yellow-700"
  }

  const getStatusText = (isPublished: boolean) => {
    return isPublished ? "Published" : "Draft"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Cover Image */}
      <div className="relative h-64 bg-gradient-to-r from-orange-400 to-orange-600">
        {data.coverImage && (
          <img 
            src={data.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover opacity-90"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-30" />
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={data.logo} />
              <AvatarFallback className="text-3xl bg-orange-100 text-orange-700">
                {data.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{data.name}</h1>
                {data.isVerified && (
                  <Badge className="bg-blue-500 text-white">
                    <Award className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Institute
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-3">{data.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {data.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {data.address.city}, {data.address.state}
                  </div>
                )}
                {data.establishmentYear && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Est. {data.establishmentYear}
                  </div>
                )}
                {data.website && (
                  <a 
                    href={data.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-orange-600"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{data.studentCount || 0}</div>
              <div className="text-sm text-gray-600">Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{data.courseCount || 0}</div>
              <div className="text-sm text-gray-600">Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{data.facultyCount || 0}</div>
              <div className="text-sm text-gray-600">Faculty</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="about" className="mb-8">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="courses">Programs</TabsTrigger>
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>About {data.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {data.description || 'No description available.'}
                </p>
                
                {data.accreditation && data.accreditation.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Accreditations</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.accreditation.map((acc: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {acc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="mt-6">
            <div className="space-y-6">
              {/* Course Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{courses.length}</div>
                    <div className="text-sm text-gray-600">Total Courses</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {courses.filter(c => c.isPublished).length}
                    </div>
                    <div className="text-sm text-gray-600">Published</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {courses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Enrollments</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {courses.length > 0 ? (courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length).toFixed(1) : '0.0'}
                    </div>
                    <div className="text-sm text-gray-600">Avg. Rating</div>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Courses & Programs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {/* Search */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Course Type Filter */}
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Course Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="degree">Degree</SelectItem>
                        <SelectItem value="diploma">Diploma</SelectItem>
                        <SelectItem value="certificate">Certificate</SelectItem>
                        <SelectItem value="post_graduate">Post Graduate</SelectItem>
                        <SelectItem value="under_graduate">Under Graduate</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Status Filter */}
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Course Grid */}
                  {coursesLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="border rounded-lg p-4">
                          <Skeleton className="h-4 w-20 mb-2" />
                          <Skeleton className="h-6 w-full mb-2" />
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredCourses.map((course) => (
                        <div key={course._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <Badge className={getStatusColor(course.isPublished)}>
                              {getStatusText(course.isPublished)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {course.courseType?.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                            {course.title}
                          </h3>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {course.description}
                          </p>
                          
                          <div className="space-y-2 text-sm text-gray-500">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {course.duration} years
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                ₹{course.fee?.toLocaleString()}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {course.maxStudents} seats
                              </div>
                              <div className="flex items-center gap-1">
                                <GraduationCap className="h-4 w-4" />
                                {course.enrollmentCount || 0} enrolled
                              </div>
                            </div>
                            
                            {course.modeOfStudy && (
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  {course.modeOfStudy.charAt(0).toUpperCase() + course.modeOfStudy.slice(1)}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                      <p className="text-gray-500">
                        {searchTerm || filterType !== "all" || filterStatus !== "all" 
                          ? "Try adjusting your search or filters" 
                          : "This institute hasn't published any courses yet"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="faculty" className="mt-6">
            <div className="space-y-6">
              {/* Faculty Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">45</div>
                    <div className="text-sm text-gray-600">Total Faculty</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">12</div>
                    <div className="text-sm text-gray-600">Professors</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">156</div>
                    <div className="text-sm text-gray-600">Publications</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">12</div>
                    <div className="text-sm text-gray-600">Avg. Experience</div>
                  </CardContent>
                </Card>
              </div>

              {/* Featured Faculty */}
              <Card>
                <CardHeader>
                  <CardTitle>Featured Faculty</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Mock faculty data - replace with actual data */}
                    <div className="text-center">
                      <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-lg">SJ</span>
                      </div>
                      <h3 className="font-semibold">Dr. Sarah Johnson</h3>
                      <p className="text-sm text-gray-600">Professor, Computer Science</p>
                      <p className="text-xs text-gray-500 mt-1">PhD MIT • 9 years experience</p>
                      <div className="flex justify-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">Machine Learning</Badge>
                        <Badge variant="secondary" className="text-xs">AI</Badge>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-lg">MC</span>
                      </div>
                      <h3 className="font-semibold">Prof. Michael Chen</h3>
                      <p className="text-sm text-gray-600">Associate Professor, Mechanical</p>
                      <p className="text-xs text-gray-500 mt-1">PhD Stanford • 6 years experience</p>
                      <div className="flex justify-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">Robotics</Badge>
                        <Badge variant="secondary" className="text-xs">Automation</Badge>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <span className="text-green-600 font-semibold text-lg">ED</span>
                      </div>
                      <h3 className="font-semibold">Dr. Emily Davis</h3>
                      <p className="text-sm text-gray-600">Assistant Professor, Management</p>
                      <p className="text-xs text-gray-500 mt-1">PhD Harvard • 4 years experience</p>
                      <div className="flex justify-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">Marketing</Badge>
                        <Badge variant="secondary" className="text-xs">Strategy</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="facilities" className="mt-6">
            <div className="space-y-6">
              {/* Facilities Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">25</div>
                    <div className="text-sm text-gray-600">Total Facilities</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">15</div>
                    <div className="text-sm text-gray-600">Laboratories</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">8</div>
                    <div className="text-sm text-gray-600">Sports Facilities</div>
                  </CardContent>
                </Card>
              </div>

              {/* Featured Facilities */}
              <Card>
                <CardHeader>
                  <CardTitle>Campus Facilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Mock facility data - replace with actual data */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                      <h3 className="font-semibold">Central Library</h3>
                      <p className="text-sm text-gray-600 mb-2">Capacity: 500 students</p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">Wi-Fi</Badge>
                        <Badge variant="outline" className="text-xs">AC</Badge>
                        <Badge variant="outline" className="text-xs">Digital Resources</Badge>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Building className="h-5 w-5 text-purple-600" />
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                      <h3 className="font-semibold">Computer Lab</h3>
                      <p className="text-sm text-gray-600 mb-2">Capacity: 60 workstations</p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">High-Speed Internet</Badge>
                        <Badge variant="outline" className="text-xs">Latest Software</Badge>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-green-600" />
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                      <h3 className="font-semibold">Sports Complex</h3>
                      <p className="text-sm text-gray-600 mb-2">Multi-purpose facility</p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">Basketball</Badge>
                        <Badge variant="outline" className="text-xs">Volleyball</Badge>
                        <Badge variant="outline" className="text-xs">Gymnasium</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rankings" className="mt-6">
            <div className="space-y-6">
              {/* Rankings Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">#45</div>
                    <div className="text-sm text-gray-600">NIRF Ranking</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">A+</div>
                    <div className="text-sm text-gray-600">NAAC Grade</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">5</div>
                    <div className="text-sm text-gray-600">Accreditations</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">8</div>
                    <div className="text-sm text-gray-600">Awards</div>
                  </CardContent>
                </Card>
              </div>

              {/* Rankings & Achievements */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rankings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      Rankings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">NIRF Engineering Ranking 2024</h3>
                        <p className="text-sm text-gray-600">National Institutional Ranking Framework</p>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-yellow-600">#45</div>
                        <Badge className="bg-green-100 text-green-700">Verified</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Times Higher Education Asia</h3>
                        <p className="text-sm text-gray-600">Asia University Rankings 2024</p>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-600">#150</div>
                        <Badge className="bg-green-100 text-green-700">Verified</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">State Engineering Ranking</h3>
                        <p className="text-sm text-gray-600">State Higher Education Council</p>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">#8</div>
                        <Badge className="bg-green-100 text-green-700">Verified</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-blue-100 text-blue-700">Accreditation</Badge>
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                      <h3 className="font-semibold">NAAC A+ Accreditation</h3>
                      <p className="text-sm text-gray-600">CGPA 3.6 • Valid until 2028</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-green-100 text-green-700">Certification</Badge>
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                      <h3 className="font-semibold">NBA Accreditation</h3>
                      <p className="text-sm text-gray-600">Computer Science Program • Valid until 2026</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-yellow-100 text-yellow-700">Award</Badge>
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                      <h3 className="font-semibold">Best Innovation Award 2024</h3>
                      <p className="text-sm text-gray-600">Ministry of Education</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{data.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{data.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Contact Person</p>
                    <p className="font-medium">{data.contactPerson}</p>
                  </div>
                </div>
                
                {data.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">
                        {data.address.street && `${data.address.street}, `}
                        {data.address.city}, {data.address.state}<br />
                        {data.address.country} - {data.address.zipCode}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function BusinessProfile({ data }: { data: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Cover Image */}
      <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600">
        {data.coverImage && (
          <img 
            src={data.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover opacity-90"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-30" />
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={data.logo} />
              <AvatarFallback className="text-3xl bg-blue-100 text-blue-700">
                {data.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{data.name}</h1>
                {data.isVerified && (
                  <Badge className="bg-blue-500 text-white">
                    <Award className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  Business
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-3">{data.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {data.industry && (
                  <Badge variant="secondary">{data.industry}</Badge>
                )}
                {data.size && (
                  <Badge variant="secondary">{data.size}</Badge>
                )}
                {data.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {data.address.city}, {data.address.state}
                  </div>
                )}
                {data.establishmentYear && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Est. {data.establishmentYear}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Briefcase className="h-4 w-4 mr-2" />
                View Jobs
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.employeeCount || 0}</div>
              <div className="text-sm text-gray-600">Employees</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.jobPostings || 0}</div>
              <div className="text-sm text-gray-600">Job Postings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                <Star className="h-6 w-6 inline text-yellow-500" />
              </div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function UserProfile({ data }: { data: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={data.personalDetails?.profileImage} />
                <AvatarFallback className="text-2xl">
                  {data.personalDetails?.firstName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  {data.personalDetails?.firstName} {data.personalDetails?.lastName}
                </h1>
                <p className="text-gray-600">{data.personalDetails?.headline}</p>
                <Badge variant="outline" className="mt-2">User Profile</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{data.personalDetails?.bio || 'No bio available.'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Skeleton className="h-64 w-full" />
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex items-center gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
