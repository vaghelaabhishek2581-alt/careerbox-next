'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Institute } from '@/types/institute'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select'
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  Award,
  TrendingUp,
  Building2,
  BookOpen,
  Search,
  Clock,
  CreditCard,
  GraduationCap,
  X,
  Plus
} from 'lucide-react'

interface InstituteDetailPageProps {
  institute: Institute
}

interface ApplicationFormData {
  name: string
  email: string
  phone: string
  city: string
  course: string
  eligibilityExams: Array<{ exam: string; score: string }>
}

interface EligibilityEntry {
  exam: string
  score: string
}

export function InstituteDetailPage({ institute }: InstituteDetailPageProps) {
  const { data: session } = useSession()
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [formData, setFormData] = useState<ApplicationFormData>({
    name: '',
    email: '',
    phone: '',
    city: '',
    course: '',
    eligibilityExams: []
  })
  const [currentExam, setCurrentExam] = useState('')
  const [currentScore, setCurrentScore] = useState('')

  const handleApplyClick = (courseName: string) => {
    if (session?.user) {
      // User is authenticated, proceed with normal application flow
      console.log('User is authenticated, proceeding with application for:', courseName)
    } else {
      // User is not authenticated, show modal
      setSelectedCourse(courseName)
      setFormData(prev => ({ ...prev, course: courseName }))
      setShowApplicationModal(true)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Application form data:', formData)
    setShowApplicationModal(false)
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      city: '',
      course: '',
      eligibilityExams: []
    })
    setCurrentExam('')
    setCurrentScore('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addEligibilityExam = () => {
    if (currentExam.trim() && currentScore.trim()) {
      setFormData(prev => ({
        ...prev,
        eligibilityExams: [...prev.eligibilityExams, { exam: currentExam.trim(), score: currentScore.trim() }]
      }))
      setCurrentExam('')
      setCurrentScore('')
    }
  }

  const removeEligibilityExam = (index: number) => {
    setFormData(prev => ({
      ...prev,
      eligibilityExams: prev.eligibilityExams.filter((_, i) => i !== index)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addEligibilityExam()
    }
  }

  const getLatestPlacementData = () => {
    const latestYear = Object.keys(institute.placements).find(key => key !== 'sectors')
    if (latestYear && institute.placements[latestYear]) {
      const data = institute.placements[latestYear]
      // Type guard to ensure we get PlacementData, not string[]
      if (typeof data === 'object' && !Array.isArray(data) && 'averageSalary' in data) {
        return data
      }
    }
    return null
  }

  const placementData = getLatestPlacementData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Cover Image */}
      <div className="relative">
        {/* Cover Image Background */}
        <div className="h-80 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
          {/* Actual cover image */}
          {institute.coverImage && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${institute.coverImage})` }}
            ></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 to-purple-700/40"></div>

          {/* Header Content */}
          <div className="relative z-10 container mx-auto px-4 pt-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">
              {/* Institute Logo */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-2xl shadow-2xl flex items-center justify-center border-4 border-white/20 overflow-hidden">
                  {/* Actual institute logo */}
                  {institute.logo ? (
                    <img
                      src={institute.logo}
                      alt={`${institute.name} Logo`}
                      className="w-full h-full object-contain p-2 lg:p-3"
                    />
                  ) : (
                    <Building2 className="h-12 w-12 lg:h-16 lg:w-16 text-blue-600" />
                  )}
                </div>
                <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white px-2 py-1 text-xs lg:text-sm font-semibold">
                  100% Verified
                </Badge>
              </div>

              {/* Institute Info */}
              <div className="flex-1 text-white text-center lg:text-left">
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 lg:gap-3 mb-4">
                  {institute.accreditation.naac && (
                    <Badge className="bg-green-500 text-white px-2 py-1 text-xs lg:text-sm font-semibold">
                      NAAC {institute.accreditation.naac.grade}
                    </Badge>
                  )}
                  {institute.accreditation.nirf?.overallRank && (
                    <Badge className="bg-blue-500 text-white px-2 py-1 text-xs lg:text-sm font-semibold">
                      NIRF #{institute.accreditation.nirf.overallRank}
                    </Badge>
                  )}
                  <Badge className="bg-purple-500 text-white px-2 py-1 text-xs lg:text-sm font-semibold">
                    {institute.type}
                  </Badge>
                </div>

                <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2">{institute.name}</h1>
                <p className="text-lg lg:text-xl text-blue-100 mb-4 lg:mb-6">{institute.shortName}</p>

                {/* Key Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 text-white/90 text-sm lg:text-base">
                  <div className="flex items-center justify-center lg:justify-start gap-2 lg:gap-3">
                    <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-blue-200 flex-shrink-0" />
                    <span className="font-medium">{institute.location.city}, {institute.location.state}</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2 lg:gap-3">
                    <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-blue-200 flex-shrink-0" />
                    <span className="font-medium">Established {institute.establishedYear}</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2 lg:gap-3 sm:col-span-2 lg:col-span-1">
                    <Users className="h-4 w-4 lg:h-5 lg:w-5 text-blue-200 flex-shrink-0" />
                    <span className="font-medium">{institute.academics.totalStudents.toLocaleString()} Students</span>
                  </div>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto lg:w-auto">
                <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto">
                  <a href={institute.contact.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white bg-green-600 text-white hover:bg-white hover:text-blue-600 w-full sm:w-auto">
                  <a href={`tel:${institute.contact.phone[0]}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Contact
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Placement Statistics Tiles */}
        {placementData && (
          <div className="container mx-auto px-4 -mt-8 lg:-mt-16 relative z-20 mb-4 lg:mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-6">
              {/* Average Package */}
              <Card className="bg-white shadow-xl border-t-4 border-t-green-500">
                <CardContent className="p-3 lg:p-6 text-center">
                  <div className="w-6 h-6 lg:w-10 lg:h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1 lg:mb-3">
                    <TrendingUp className="h-3 w-3 lg:h-5 lg:w-5 text-green-600" />
                  </div>
                  <div className="text-sm lg:text-2xl font-bold text-green-600 mb-1">{placementData.averageSalary}</div>
                  <div className="text-xs lg:text-sm text-gray-600">Average Package</div>
                </CardContent>
              </Card>

              {/* Highest Package */}
              <Card className="bg-white shadow-xl border-t-4 border-t-blue-500">
                <CardContent className="p-3 lg:p-6 text-center">
                  <div className="w-6 h-6 lg:w-10 lg:h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1 lg:mb-3">
                    <Award className="h-3 w-3 lg:h-5 lg:w-5 text-blue-600" />
                  </div>
                  <div className="text-sm lg:text-2xl font-bold text-blue-600 mb-1">{placementData.highestSalary}</div>
                  <div className="text-xs lg:text-sm text-gray-600">Highest Package</div>
                </CardContent>
              </Card>

              {/* Placement Rate */}
              <Card className="bg-white shadow-xl border-t-4 border-t-purple-500">
                <CardContent className="p-3 lg:p-6 text-center">
                  <div className="w-6 h-6 lg:w-10 lg:h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1 lg:mb-3">
                    <Users className="h-3 w-3 lg:h-5 lg:w-5 text-purple-600" />
                  </div>
                  <div className="text-sm lg:text-2xl font-bold text-purple-600 mb-1">{placementData.overallPlacementRate}</div>
                  <div className="text-xs lg:text-sm text-gray-600">Placement Rate</div>
                </CardContent>
              </Card>

              {/* Companies Visited */}
              <Card className="bg-white shadow-xl border-t-4 border-t-orange-500">
                <CardContent className="p-3 lg:p-6 text-center">
                  <div className="w-6 h-6 lg:w-10 lg:h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-1 lg:mb-3">
                    <Building2 className="h-3 w-3 lg:h-5 lg:w-5 text-orange-600" />
                  </div>
                  <div className="text-sm lg:text-2xl font-bold text-orange-600 mb-1">{placementData.companiesVisited}</div>
                  <div className="text-xs lg:text-sm text-gray-600">Companies Visited</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="space-y-6">
          {/* Mobile: Courses First, Desktop: Grid Layout */}

          {/* Mobile Courses Section - Shows first on mobile */}
          <div className="block lg:hidden">
            {institute.courses.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Courses ({institute.courses.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Search and Filters */}
                  <div className="flex flex-col gap-4 mb-6">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search courses..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      <Select>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Degrees" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Degrees</SelectItem>
                          {Array.from(new Set(institute.courses.map(c => c.degree))).map((degree) => (
                            <SelectItem key={degree} value={degree}>{degree}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          {Array.from(new Set(institute.courses.map(c => c.level))).map((level) => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select>
                        <SelectTrigger className="w-full col-span-2 sm:col-span-1">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Sort by Name</SelectItem>
                          <SelectItem value="duration">Sort by Duration</SelectItem>
                          <SelectItem value="fee">Sort by Fee</SelectItem>
                          <SelectItem value="relevance">Sort by Relevance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Courses List View */}
                  <div className="space-y-4">
                    {institute.courses.slice(0, 3).map((course) => (
                      <div key={course.id} className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-5">
                        <div className="flex flex-col gap-4">
                          {/* Course Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                  <GraduationCap className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900">
                                    {course.degree} in {course.name}
                                  </h3>
                                  <div className="flex gap-2 mt-1">
                                    <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-1">{course.level}</Badge>
                                    <Badge className="bg-purple-100 text-purple-700 text-xs px-2 py-1">{course.category}</Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6"
                              onClick={() => handleApplyClick(`${course.degree} in ${course.name}`)}
                            >
                              Apply Now
                            </Button>
                          </div>

                          {/* Course Description */}
                          <p className="text-sm text-gray-700 leading-relaxed line-clamp-2 pl-12">
                            {course.description}
                          </p>

                          {/* Course Details Grid */}
                          <div className="grid grid-cols-2 gap-4 pl-12">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span className="text-gray-600">{course.duration}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <BookOpen className="h-4 w-4 text-green-500" />
                              <span className="text-gray-600">{course.curriculum?.totalCredits || 'N/A'} Credits</span>
                            </div>
                          </div>

                          {/* Fee & Package Info */}
                          <div className="flex gap-6 pl-12">
                            {course.fees && (
                              <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                                <div className="text-xs text-gray-500">Annual Fee</div>
                                <div className="font-bold text-green-600">{course.fees.totalAnnualFee}</div>
                              </div>
                            )}
                            {course.careerProspects && (
                              <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                                <div className="text-xs text-gray-500">Avg Package</div>
                                <div className="font-bold text-blue-600">{course.careerProspects.averageSalary}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {institute.courses.length > 3 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" className="w-full">
                          View All {institute.courses.length} Courses
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Courses Coming Soon</h3>
                  <p className="text-gray-500">Detailed course information will be available soon.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Desktop Grid Layout */}
          <div className="hidden lg:flex lg:grid lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-3 space-y-6">
              {/* About Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    About {institute.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {institute.overview.description}
                  </p>

                </CardContent>
              </Card>

              {/* Courses Section */}
              {institute.courses.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Courses ({institute.courses.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>

                    {/* Search and Filters */}
                    <div className="flex flex-col gap-4 mb-6">
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="text"
                          placeholder="Search courses..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Filter Dropdowns */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="All Degrees" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Degrees</SelectItem>
                            {Array.from(new Set(institute.courses.map(c => c.degree))).map((degree) => (
                              <SelectItem key={degree} value={degree}>{degree}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="All Levels" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            {Array.from(new Set(institute.courses.map(c => c.level))).map((level) => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {Array.from(new Set(institute.courses.map(c => c.category))).map((category) => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="All Durations" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Durations</SelectItem>
                            {Array.from(new Set(institute.courses.map(c => c.duration))).map((duration) => (
                              <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select>
                          <SelectTrigger className="w-full col-span-2 sm:col-span-1">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name">Sort by Name</SelectItem>
                            <SelectItem value="duration">Sort by Duration</SelectItem>
                            <SelectItem value="fee">Sort by Fee</SelectItem>
                            <SelectItem value="relevance">Sort by Relevance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Courses List View */}
                    <div className="space-y-6">
                      {institute.courses.map((course) => (
                        <div key={course.id} className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border border-blue-100 rounded-3xl p-6 lg:p-8 relative overflow-hidden">
                          {/* Background Pattern */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full -translate-y-16 translate-x-16"></div>

                          <div className="relative z-10">
                            {/* Course Header */}
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 lg:gap-6 mb-6">
                              <div className="flex-1">
                                <div className="flex items-start gap-4 mb-4">
                                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <GraduationCap className="h-7 w-7 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                                      {course.degree} in {course.name}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                      <Badge className="bg-blue-100 text-blue-700 px-3 py-1 text-sm">{course.level}</Badge>
                                      <Badge className="bg-purple-100 text-purple-700 px-3 py-1 text-sm">{course.category}</Badge>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-gray-700 leading-relaxed line-clamp-2 text-base">{course.description}</p>
                              </div>

                              {/* Action Button */}
                              <Button
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                onClick={() => handleApplyClick(`${course.degree} in ${course.name}`)}
                              >
                                Apply Now
                              </Button>
                            </div>

                            {/* Course Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                              <div className="flex items-center gap-3 bg-white/70 rounded-xl p-3">
                                <Clock className="h-5 w-5 text-blue-500" />
                                <div>
                                  <div className="text-xs text-gray-500">Duration</div>
                                  <div className="font-medium text-gray-700">{course.duration}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 bg-white/70 rounded-xl p-3">
                                <BookOpen className="h-5 w-5 text-green-500" />
                                <div>
                                  <div className="text-xs text-gray-500">Credits</div>
                                  <div className="font-medium text-gray-700">{course.curriculum?.totalCredits || 'N/A'}</div>
                                </div>
                              </div>
                              {course.fees && (
                                <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3">
                                  <CreditCard className="h-5 w-5 text-green-500" />
                                  <div>
                                    <div className="text-xs text-gray-500">Annual Fee</div>
                                    <div className="font-bold text-green-600">{course.fees.totalAnnualFee}</div>
                                  </div>
                                </div>
                              )}
                              {course.careerProspects && (
                                <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3">
                                  <TrendingUp className="h-5 w-5 text-blue-500" />
                                  <div>
                                    <div className="text-xs text-gray-500">Avg Package</div>
                                    <div className="font-bold text-blue-600">{course.careerProspects.averageSalary}</div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Eligibility */}
                            {course.eligibilityCriteria && (
                              <div className="bg-purple-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <GraduationCap className="h-4 w-4 text-purple-500" />
                                  <span className="font-medium text-purple-700 text-sm">Eligibility Criteria</span>
                                </div>
                                <p className="text-sm text-purple-600">{course.eligibilityCriteria.academicRequirement}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Courses Coming Soon</h3>
                    <p className="text-gray-500">Detailed course information will be available soon.</p>
                  </CardContent>
                </Card>
              )}

              {/* Campus Facilities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Campus Facilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Academic Facilities</h4>
                      <div className="space-y-2">
                        {institute.campusDetails.facilities.academic?.map((facility, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            {facility}
                          </div>
                        )) || <div className="text-sm text-gray-500">No academic facilities listed</div>}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Sports & Recreation</h4>
                      <div className="space-y-2">
                        {institute.campusDetails.facilities.recreational?.map((facility, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {facility}
                          </div>
                        )) || <div className="text-sm text-gray-500">No recreational facilities listed</div>}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Support Services</h4>
                      <div className="space-y-2">
                        {institute.campusDetails.facilities.support?.map((facility, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            {facility}
                          </div>
                        )) || <div className="text-sm text-gray-500">No support services listed</div>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Desktop Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader className="pb-3 lg:pb-6">
                  <CardTitle className="text-base lg:text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 lg:space-y-4">
                  <div className="flex items-start gap-2 lg:gap-3">
                    <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm lg:text-base">Address</div>
                      <div className="text-xs lg:text-sm text-gray-600">
                        {institute.location.address}<br />
                        {institute.location.city}, {institute.location.state} {institute.location.pincode}<br />
                        {institute.location.country}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 lg:gap-3">
                    <Phone className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm lg:text-base">Phone</div>
                      <div className="text-xs lg:text-sm text-gray-600 truncate">
                        {institute.contact.phone.join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 lg:gap-3">
                    <Mail className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm lg:text-base">Email</div>
                      <div className="text-xs lg:text-sm text-gray-600 truncate">{institute.contact.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 lg:gap-3">
                    <Globe className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm lg:text-base">Website</div>
                      <a
                        href={institute.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs lg:text-sm text-blue-600 hover:underline truncate block"
                      >
                        {institute.contact.website}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>


              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-3 lg:pb-6">
                  <CardTitle className="text-base lg:text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 lg:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm lg:text-base">Students</span>
                    <span className="font-semibold text-sm lg:text-base">{institute.academics.totalStudents.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm lg:text-base">Faculty</span>
                    <span className="font-semibold text-sm lg:text-base">{institute.academics.totalFaculty}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm lg:text-base">Programs</span>
                    <span className="font-semibold text-sm lg:text-base">{institute.academics.totalPrograms}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm lg:text-base">Student:Faculty</span>
                    <span className="font-semibold text-sm lg:text-base">{institute.academics.studentFacultyRatio}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm lg:text-base">Campus Area</span>
                    <span className="font-semibold text-sm lg:text-base">{institute.campusDetails.totalArea}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Rankings */}
              {institute.rankings.national.length > 0 && (
                <Card>
                  <CardHeader className="pb-3 lg:pb-6">
                    <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                      <Award className="h-4 w-4 lg:h-5 lg:w-5" />
                      Rankings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {institute.rankings.national.slice(0, 3).map((ranking, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-xs lg:text-sm truncate">{ranking.agency}</div>
                          <div className="text-xs text-gray-600 truncate">{ranking.category}</div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="font-bold text-blue-600 text-sm lg:text-base">#{ranking.rank}</div>
                          <div className="text-xs text-gray-600">{ranking.year}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Mobile Sidebar Content - Shows at bottom on mobile */}
          <div className="block lg:hidden space-y-4">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  About {institute.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {institute.overview.description}
                </p>
              </CardContent>
            </Card>

            {/* Campus Facilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Campus Facilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Academic Facilities</h4>
                    <div className="space-y-2">
                      {institute.campusDetails.facilities.academic?.map((facility, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {facility}
                        </div>
                      )) || <div className="text-sm text-gray-500">No academic facilities listed</div>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Sports & Recreation</h4>
                    <div className="space-y-2">
                      {institute.campusDetails.facilities.recreational?.map((facility, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {facility}
                        </div>
                      )) || <div className="text-sm text-gray-500">No recreational facilities listed</div>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Support Services</h4>
                    <div className="space-y-2">
                      {institute.campusDetails.facilities.support?.map((facility, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          {facility}
                        </div>
                      )) || <div className="text-sm text-gray-500">No support services listed</div>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-sm">Address</div>
                    <div className="text-xs text-gray-600">
                      {institute.location.address}<br />
                      {institute.location.city}, {institute.location.state} {institute.location.pincode}<br />
                      {institute.location.country}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-sm">Phone</div>
                    <div className="text-xs text-gray-600 truncate">
                      {institute.contact.phone.join(', ')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-sm">Email</div>
                    <div className="text-xs text-gray-600 truncate">{institute.contact.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-sm">Website</div>
                    <a
                      href={institute.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline truncate block"
                    >
                      {institute.contact.website}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Students</span>
                  <span className="font-semibold text-sm">{institute.academics.totalStudents.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Faculty</span>
                  <span className="font-semibold text-sm">{institute.academics.totalFaculty}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Programs</span>
                  <span className="font-semibold text-sm">{institute.academics.totalPrograms}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Student:Faculty</span>
                  <span className="font-semibold text-sm">{institute.academics.studentFacultyRatio}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Campus Area</span>
                  <span className="font-semibold text-sm">{institute.campusDetails.totalArea}</span>
                </div>
              </CardContent>
            </Card>

            {/* Rankings */}
            {institute.rankings.national.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Award className="h-4 w-4" />
                    Rankings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {institute.rankings.national.slice(0, 3).map((ranking, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-xs truncate">{ranking.agency}</div>
                        <div className="text-xs text-gray-600 truncate">{ranking.category}</div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="font-bold text-blue-600 text-sm">#{ranking.rank}</div>
                        <div className="text-xs text-gray-600">{ranking.year}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Application Modal - Completely Redesigned */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl mx-auto max-h-[90vh] overflow-hidden">

            {/* Mobile Layout - Single Column */}
            <div className="block md:hidden">
              {/* Mobile Header */}
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Apply for Course</h2>
                  <p className="text-blue-100">Start your educational journey today</p>
                </div>
              </div>

              {/* Mobile Form */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
                      Personal Details
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter your email"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Your phone"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Your city"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                        <input
                          type="text"
                          name="course"
                          value={formData.course}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Eligibility Exams */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">
                      Eligibility Exams
                    </h3>

                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Exam</label>
                        <Select value={currentExam} onValueChange={setCurrentExam}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose an exam" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Engineering (PCM)</SelectLabel>
                              <SelectItem value="JEE Main">JEE Main</SelectItem>
                              <SelectItem value="JEE Advanced">JEE Advanced</SelectItem>
                              <SelectItem value="BITSAT">BITSAT</SelectItem>
                              <SelectItem value="VITEEE">VITEEE</SelectItem>
                              <SelectItem value="COMEDK">COMEDK</SelectItem>
                              <SelectItem value="MHT CET">MHT CET</SelectItem>
                              <SelectItem value="KCET">KCET</SelectItem>
                              <SelectItem value="EAMCET">EAMCET</SelectItem>
                              <SelectItem value="GUJCET">GUJCET</SelectItem>
                              <SelectItem value="WBJEE">WBJEE</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Medical (PCB)</SelectLabel>
                              <SelectItem value="NEET">NEET</SelectItem>
                              <SelectItem value="AIIMS">AIIMS</SelectItem>
                              <SelectItem value="JIPMER">JIPMER</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Management</SelectLabel>
                              <SelectItem value="CAT">CAT</SelectItem>
                              <SelectItem value="XAT">XAT</SelectItem>
                              <SelectItem value="SNAP">SNAP</SelectItem>
                              <SelectItem value="CMAT">CMAT</SelectItem>
                              <SelectItem value="MAT">MAT</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Law</SelectLabel>
                              <SelectItem value="CLAT">CLAT</SelectItem>
                              <SelectItem value="AILET">AILET</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>General/Others</SelectLabel>
                              <SelectItem value="CUET">CUET</SelectItem>
                              <SelectItem value="GATE">GATE</SelectItem>
                              <SelectItem value="Diploma CET">Diploma CET</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Score/Rank</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={currentScore}
                            onChange={(e) => setCurrentScore(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 95 percentile, 1500 rank"
                          />
                          <button
                            type="button"
                            onClick={addEligibilityExam}
                            disabled={!currentExam.trim() || !currentScore.trim()}
                            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {formData.eligibilityExams.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {formData.eligibilityExams.map((exam, index) => (
                          <div key={index} className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
                            <span>{exam.exam}</span>
                            <span className="text-blue-600">•</span>
                            <span>{exam.score}</span>
                            <button
                              type="button"
                              onClick={() => removeEligibilityExam(index)}
                              className="ml-1 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowApplicationModal(false)}
                      className="flex-1 py-3 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold"
                    >
                      Submit Application
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Desktop Layout - Two Column */}
            <div className="hidden md:flex h-[80vh]">
              {/* Left Side - Visual */}
              <div className="w-2/5 bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center text-gray-800 p-8 relative">
                <div className="text-center max-w-sm">
                  {/* Illustration Above Text */}
                  <div className="mb-4">
                    <img
                      src="/3 SCENE.svg"
                      alt="Education Journey Illustration"
                      className="w-[614px] mx-auto object-contain"
                    />
                  </div>

                  <h3 className="text-2xl font-bold mb-3 text-gray-900">Begin Your Journey</h3>
                  <p className="text-gray-600 text-base leading-relaxed mb-4">
                    Take the first step towards your dream career. Join thousands of successful graduates.
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Quick Process</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Instant Response</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Course Application</h2>
                    <p className="text-gray-600 text-sm">Fill in your details to apply</p>
                  </div>
                  <button
                    onClick={() => setShowApplicationModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Form Content - No Scroll */}
                <div className="flex-1 p-6">
                  <form onSubmit={handleFormSubmit} className="h-full flex flex-col space-y-4">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-base font-semibold text-gray-900 pb-1 border-b border-gray-200">
                        Personal Information
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                            placeholder="Enter your full name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                            placeholder="Enter your email address"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                            placeholder="Enter your phone number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                            placeholder="Enter your city"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course Interested In</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="course"
                            value={formData.course}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm"
                          />
                          <GraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                    </div>

                    {/* Eligibility Exams */}
                    <div className="space-y-3 flex-1">
                      <h3 className="text-base font-semibold text-gray-900 pb-1 border-b border-gray-200">
                        Eligibility Exams
                      </h3>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Select Exam</label>
                          <Select value={currentExam} onValueChange={setCurrentExam}>
                            <SelectTrigger className="w-full h-9 text-sm">
                              <SelectValue placeholder="Choose an exam" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Engineering (PCM)</SelectLabel>
                                <SelectItem value="JEE Main">JEE Main</SelectItem>
                                <SelectItem value="JEE Advanced">JEE Advanced</SelectItem>
                                <SelectItem value="BITSAT">BITSAT</SelectItem>
                                <SelectItem value="VITEEE">VITEEE</SelectItem>
                                <SelectItem value="COMEDK">COMEDK</SelectItem>
                                <SelectItem value="MHT CET">MHT CET</SelectItem>
                                <SelectItem value="KCET">KCET</SelectItem>
                                <SelectItem value="EAMCET">EAMCET</SelectItem>
                                <SelectItem value="GUJCET">GUJCET</SelectItem>
                                <SelectItem value="WBJEE">WBJEE</SelectItem>
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>Medical (PCB)</SelectLabel>
                                <SelectItem value="NEET">NEET</SelectItem>
                                <SelectItem value="AIIMS">AIIMS</SelectItem>
                                <SelectItem value="JIPMER">JIPMER</SelectItem>
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>Management</SelectLabel>
                                <SelectItem value="CAT">CAT</SelectItem>
                                <SelectItem value="XAT">XAT</SelectItem>
                                <SelectItem value="SNAP">SNAP</SelectItem>
                                <SelectItem value="CMAT">CMAT</SelectItem>
                                <SelectItem value="MAT">MAT</SelectItem>
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>Law</SelectLabel>
                                <SelectItem value="CLAT">CLAT</SelectItem>
                                <SelectItem value="AILET">AILET</SelectItem>
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>General/Others</SelectLabel>
                                <SelectItem value="CUET">CUET</SelectItem>
                                <SelectItem value="GATE">GATE</SelectItem>
                                <SelectItem value="Diploma CET">Diploma CET</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Score/Rank</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={currentScore}
                              onChange={(e) => setCurrentScore(e.target.value)}
                              onKeyPress={handleKeyPress}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                              placeholder="e.g., 95 percentile, 1500 rank"
                            />
                            <button
                              type="button"
                              onClick={addEligibilityExam}
                              disabled={!currentExam.trim() || !currentScore.trim()}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {formData.eligibilityExams.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.eligibilityExams.map((exam, index) => (
                            <div key={index} className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              <span>{exam.exam}</span>
                              <span className="text-blue-600">•</span>
                              <span>{exam.score}</span>
                              <button
                                type="button"
                                onClick={() => removeEligibilityExam(index)}
                                className="ml-1 text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowApplicationModal(false)}
                          className="flex-1 py-2 rounded-lg border-2 hover:bg-gray-50 text-sm"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleFormSubmit}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                        >
                          Submit Application
                        </Button>
                      </div>

                      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <span>Your information is secure and confidential</span>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}