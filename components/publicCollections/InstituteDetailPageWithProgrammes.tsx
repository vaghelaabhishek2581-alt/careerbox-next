'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Institute } from '@/types/institute'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgrammesSection } from '@/components/publicCollections/ProgrammesSection'
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
  ArrowLeft,
  ChevronRight
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
  eligibilityExams: Array<EligibilityEntry>
}
interface EligibilityEntry {
  exam: string
  score: string
}

export function InstituteDetailPageWithProgrammes({ institute }: InstituteDetailPageProps) {
  console.log('Institute data:', institute)
  console.log('Programmes:', institute.programmes)
  console.log('Programmes length:', institute.programmes?.length)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedProgrammeId = searchParams?.get('programme') || null
  
  const { data: session } = useSession()
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [formData, setFormData] = useState<ApplicationFormData>({
    name: '',
    email: '',
    phone: '',
    city: '',
    course: '',
    eligibilityExams: [],
  })

  // Find selected programme
  const selectedProgramme = selectedProgrammeId 
    ? institute.programmes?.find(p => p.id === selectedProgrammeId || p.name === selectedProgrammeId)
    : null
  
  console.log('Selected programme ID:', selectedProgrammeId)
  console.log('Selected programme:', selectedProgramme)

  const handleProgrammeClick = (programmeId: string) => {
    // Update URL with programme parameter
    const url = new URL(window.location.href)
    url.searchParams.set('programme', programmeId)
    router.push(url.pathname + url.search)
  }

  const handleBackToProgrammes = () => {
    // Remove programme parameter from URL
    const url = new URL(window.location.href)
    url.searchParams.delete('programme')
    router.push(url.pathname + url.search)
  }

  const handleApplyClick = (courseName: string) => {
    if (session?.user) {
      console.log('User is authenticated, proceeding with application for:', courseName)
    } else {
      setSelectedCourse(courseName)
      setFormData(prev => ({ ...prev, course: courseName }))
      setShowApplicationModal(true)
    }
  }

  const getLatestPlacementData = () => {
    const latestYear = Object.keys(institute.placements).find(key => key !== 'sectors')
    if (latestYear && institute.placements[latestYear]) {
      const data = institute.placements[latestYear]
      if (typeof data === 'object' && !Array.isArray(data) && 'averageSalary' in data) {
        return data
      }
    }
    return null
  }

  const placementData = getLatestPlacementData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative">
        <div className="h-80 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
          {institute.coverImage && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${institute.coverImage})` }}
            ></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 to-purple-700/40"></div>

          <div className="relative z-10 container mx-auto px-4 pt-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-2xl shadow-2xl flex items-center justify-center border-4 border-white/20 overflow-hidden">
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
              </div>

              <div className="flex-1 text-white text-center lg:text-left">
                <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2">{institute.name}</h1>
                <p className="text-lg lg:text-xl text-blue-100 mb-4 lg:mb-6">{institute.shortName}</p>

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
            </div>
          </div>
        </div>

        {/* Placement Statistics */}
        {placementData && (
          <div className="container mx-auto px-4 -mt-8 lg:-mt-16 relative z-20 mb-4 lg:mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-6">
              <Card className="bg-white shadow-xl border-t-4 border-t-green-500">
                <CardContent className="p-3 lg:p-6 text-center">
                  <div className="w-6 h-6 lg:w-10 lg:h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1 lg:mb-3">
                    <TrendingUp className="h-3 w-3 lg:h-5 lg:w-5 text-green-600" />
                  </div>
                  <div className="text-sm lg:text-2xl font-bold text-green-600 mb-1">{placementData.averageSalary}</div>
                  <div className="text-xs lg:text-sm text-gray-600">Average Package</div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-xl border-t-4 border-t-blue-500">
                <CardContent className="p-3 lg:p-6 text-center">
                  <div className="w-6 h-6 lg:w-10 lg:h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1 lg:mb-3">
                    <Award className="h-3 w-3 lg:h-5 lg:w-5 text-blue-600" />
                  </div>
                  <div className="text-sm lg:text-2xl font-bold text-blue-600 mb-1">{placementData.highestSalary}</div>
                  <div className="text-xs lg:text-sm text-gray-600">Highest Package</div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-xl border-t-4 border-t-purple-500">
                <CardContent className="p-3 lg:p-6 text-center">
                  <div className="w-6 h-6 lg:w-10 lg:h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1 lg:mb-3">
                    <Users className="h-3 w-3 lg:h-5 lg:w-5 text-purple-600" />
                  </div>
                  <div className="text-sm lg:text-2xl font-bold text-purple-600 mb-1">{placementData.overallPlacementRate}</div>
                  <div className="text-xs lg:text-sm text-gray-600">Placement Rate</div>
                </CardContent>
              </Card>

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
          {/* Breadcrumb when programme is selected */}
          {selectedProgramme && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <button
                onClick={handleBackToProgrammes}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                All Programmes
              </button>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-gray-900">{selectedProgramme.name}</span>
            </div>
          )}

          {/* Show Programmes List OR Selected Programme Courses */}
          {!selectedProgramme ? (
            // Programmes Grid View
            institute.programmes && institute.programmes.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Programmes ({institute.programmes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {institute.programmes.map((programme) => (
                      <button
                        key={programme.id || programme.name}
                        onClick={() => handleProgrammeClick(programme.id || programme.name)}
                        className="bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200 rounded-xl p-6 text-left transition-all duration-300 hover:shadow-lg group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            <GraduationCap className="h-6 w-6 text-white" />
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{programme.name}</h3>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {programme.course && programme.course.length > 0 && (
                            <Badge className="bg-blue-100 text-blue-700 px-2 py-1 text-xs">
                              {programme.course.length} Courses
                            </Badge>
                          )}
                          {programme.placementRating && (
                            <Badge className="bg-green-100 text-green-700 px-2 py-1 text-xs">
                              {programme.placementRating}★ Rating
                            </Badge>
                          )}
                        </div>

                        {programme.eligibilityExams && programme.eligibilityExams.length > 0 && (
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Exams:</span> {programme.eligibilityExams.join(', ')}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Fallback to courses if no programmes
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Courses ({institute.courses.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">No programmes available. Showing courses directly.</p>
                </CardContent>
              </Card>
            )
          ) : (
            // Selected Programme - Show its courses
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    {selectedProgramme.name} - Courses ({selectedProgramme.course?.length || 0})
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBackToProgrammes}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Programmes
                  </Button>
                </div>
                {selectedProgramme.eligibilityExams && selectedProgramme.eligibilityExams.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-sm text-gray-600">Eligibility Exams:</span>
                    {selectedProgramme.eligibilityExams.map((exam, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {exam}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {selectedProgramme.course && selectedProgramme.course.length > 0 ? (
                  <div className="space-y-4">
                    {selectedProgramme.course.map((course) => (
                      <div key={course.id} className="bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 border border-blue-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                                <GraduationCap className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                  {course.degree}{course.name && ` in ${course.name}`}
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                  {course.level && (
                                    <Badge className="bg-blue-100 text-blue-700 px-2 py-0.5 text-xs">{course.level}</Badge>
                                  )}
                                  {course.category && (
                                    <Badge className="bg-purple-100 text-purple-700 px-2 py-0.5 text-xs">{course.category}</Badge>
                                  )}
                                  {course.educationType && (
                                    <Badge className="bg-green-100 text-green-700 px-2 py-0.5 text-xs">{course.educationType}</Badge>
                                  )}
                                  {course.school && (
                                    <Badge className="bg-orange-100 text-orange-700 px-2 py-0.5 text-xs">{course.school}</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                              onClick={() => handleApplyClick(`${course.degree}${course.name ? ` in ${course.name}` : ''}`)}
                            >
                              Apply Now
                            </Button>
                            {course.brochure && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="border-blue-300 text-blue-600 hover:bg-blue-50"
                              >
                                <a href={course.brochure.url} target="_blank" rel="noopener noreferrer">
                                  Brochure
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Course Details Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                          {course.duration && (
                            <div className="flex items-center gap-2 bg-white/70 rounded-lg p-2.5 border border-blue-100">
                              <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-gray-500">Duration</div>
                                <div className="font-medium text-gray-700 text-sm">{course.duration}</div>
                              </div>
                            </div>
                          )}
                          {course.totalSeats && (
                            <div className="flex items-center gap-2 bg-white/70 rounded-lg p-2.5 border border-purple-100">
                              <Users className="h-4 w-4 text-purple-500 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-gray-500">Seats</div>
                                <div className="font-medium text-gray-700 text-sm">{course.totalSeats}</div>
                              </div>
                            </div>
                          )}
                          {course.reviewCount && (
                            <div className="flex items-center gap-2 bg-white/70 rounded-lg p-2.5 border border-yellow-100">
                              <Award className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-gray-500">Reviews</div>
                                <div className="font-medium text-gray-700 text-sm">{course.reviewCount}</div>
                              </div>
                            </div>
                          )}
                          {course.questionsCount && (
                            <div className="flex items-center gap-2 bg-white/70 rounded-lg p-2.5 border border-indigo-100">
                              <BookOpen className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-gray-500">Q&A</div>
                                <div className="font-medium text-gray-700 text-sm">{course.questionsCount}</div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Fee and Placement Info */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          {course.fees && (course.fees.totalFee || course.fees.tuitionFee) && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                              <h5 className="text-xs font-semibold text-green-800 mb-2 flex items-center gap-2">
                                <CreditCard className="h-3 w-3" />
                                Fee Structure
                              </h5>
                              <div className="space-y-1">
                                {course.fees.totalFee && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">Total Fee</span>
                                    <span className="font-bold text-green-600 text-sm">₹{course.fees.totalFee.toLocaleString()}</span>
                                  </div>
                                )}
                                {course.fees.tuitionFee && course.fees.tuitionFee !== course.fees.totalFee && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">Tuition Fee</span>
                                    <span className="font-bold text-blue-600 text-sm">₹{typeof course.fees.tuitionFee === 'number' ? course.fees.tuitionFee.toLocaleString() : course.fees.tuitionFee}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {course.placements && (course.placements.averagePackage || course.placements.highestPackage || course.placements.placementRate) && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                              <h5 className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                <TrendingUp className="h-3 w-3" />
                                Placements
                              </h5>
                              <div className="space-y-1">
                                {course.placements.averagePackage > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">Average</span>
                                    <span className="font-bold text-green-600 text-sm">₹{course.placements.averagePackage.toLocaleString()}</span>
                                  </div>
                                )}
                                {course.placements.highestPackage > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">Highest</span>
                                    <span className="font-bold text-purple-600 text-sm">₹{course.placements.highestPackage.toLocaleString()}</span>
                                  </div>
                                )}
                                {course.placements.placementRate > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">Rate</span>
                                    <span className="font-bold text-orange-600 text-sm">{course.placements.placementRate}%</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Top Recruiters */}
                        {course.placements?.topRecruiters && course.placements.topRecruiters.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <h5 className="text-xs font-semibold text-gray-700 mb-2">Top Recruiters</h5>
                            <div className="flex flex-wrap gap-2">
                              {course.placements.topRecruiters.slice(0, 5).map((recruiter, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {recruiter}
                                </Badge>
                              ))}
                              {course.placements.topRecruiters.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{course.placements.topRecruiters.length - 5} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Available</h3>
                    <p className="text-gray-500">This programme doesn't have any courses yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
