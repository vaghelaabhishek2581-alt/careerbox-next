'use client'

import React, { useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Institute } from '@/types/institute'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select'
import { ProgrammesSection } from '@/components/publicCollections/ProgrammesSection'
import { saveUserDetails, loadUserDetails } from '@/lib/utils/localStorage'
import { useToast } from '@/components/ui/use-toast'
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
  Plus,
  ChevronRight,
  ArrowLeft
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

export function InstituteDetailPage({ institute }: InstituteDetailPageProps) {
  console.log("institute", institute)
  console.log("programmes", institute.programmes)
  
  const { data: session } = useSession()
  const { toast } = useToast()
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string | null>(null)
  const [expandedProgramme, setExpandedProgramme] = useState<string | null>(null)
  const [formData, setFormData] = useState<ApplicationFormData>(() => {
    const savedDetails = loadUserDetails()
    if (savedDetails) {
      return {
        name: savedDetails.name,
        email: savedDetails.email,
        phone: savedDetails.phone,
        city: savedDetails.city,
        course: '',
        eligibilityExams: [],
      }
    }
    return {
      name: '',
      email: '',
      phone: '',
      city: '',
      course: '',
      eligibilityExams: [],
    }
  })
  const [currentExam, setCurrentExam] = useState('')
  const [currentScore, setCurrentScore] = useState('')
  const [programmeSearchQuery, setProgrammeSearchQuery] = useState('')
  
  // Filter programmes by search query
  const filteredProgrammes = useMemo(() => {
    if (!institute.programmes) return []
    if (!programmeSearchQuery.trim()) return institute.programmes
    
    const searchLower = programmeSearchQuery.toLowerCase()
    return institute.programmes.filter(programme => 
      programme.name?.toLowerCase().includes(searchLower) ||
      programme.eligibilityExams?.some(exam => exam.toLowerCase().includes(searchLower))
    )
  }, [institute.programmes, programmeSearchQuery])

  // Find selected programme
  const selectedProgramme = selectedProgrammeId 
    ? institute.programmes?.find(p => (p.id || p.name) === selectedProgrammeId)
    : null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleProgrammeClick = (programmeId: string) => {
    setSelectedProgrammeId(programmeId)
  }

  const handleBackToProgrammes = () => {
    setSelectedProgrammeId(null)
  }

  const handleApplyClick = async (courseName: string) => {
    if (session?.user) {
      // Authenticated: Direct apply without modal
      try {
        const selectedCourseObj = institute.courses.find(c => `${c.degree}${c.name ? ` in ${c.name}` : ''}` === courseName)
        const courseId = selectedCourseObj?.id

        const res = await fetch('/api/student-leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: (session as any)?.user?.id,
            courseId,
            courseName,
            instituteId: institute.id,
            instituteSlug: institute.slug,
            isAdminInstitute: true,
            source: 'institute_detail_page',
          }),
        })

        const data = await res.json()
        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || 'Failed to submit application')
        }

        // Success feedback
        toast({
          title: "Application Submitted!",
          description: "Your application has been submitted successfully. We will contact you soon.",
          variant: "default",
        })
        console.log('Application submitted with id:', data.id)
      } catch (error: any) {
        console.error('Failed to submit application:', error?.message || error)
        toast({
          title: "Application Failed",
          description: error?.message || 'Failed to submit application. Please try again.',
          variant: "destructive",
        })
      }
    } else {
      // Guest: Load saved details and open modal
      const savedDetails = loadUserDetails()
      if (savedDetails) {
        setFormData(prev => ({
          name: savedDetails.name,
          email: savedDetails.email,
          phone: savedDetails.phone,
          city: savedDetails.city,
          course: courseName,
          eligibilityExams: prev.eligibilityExams,
        }))
      } else {
        setFormData(prev => ({ ...prev, course: courseName }))
      }
      setSelectedCourse(courseName)
      setShowApplicationModal(true)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Derive courseId from the selected course display name
      const selectedCourseObj = institute.courses.find(c => `${c.degree}${c.name ? ` in ${c.name}` : ''}` === formData.course)
      const courseId = selectedCourseObj?.id

      const res = await fetch('/api/student-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: (session as any)?.user?.id,
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          courseId,
          courseName: formData.course,
          instituteId: institute.id,
          instituteSlug: institute.slug,
          isAdminInstitute: true,
          source: 'institute_detail_page',
        }),
      })

      const data = await res.json()
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Failed to submit lead')
      }

      // Success UI feedback
      console.log('Lead created with id:', data.id)

      // Save user details to localStorage
      saveUserDetails({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
      })

      setShowApplicationModal(false)

      // Reset only course and eligibility exams, keep user details
      setFormData(prev => ({
        ...prev,
        course: '',
        eligibilityExams: []
      }))
      setCurrentExam('')
      setCurrentScore('')
    } catch (error: any) {
      console.error('Failed to create lead:', error?.message || error)
      if (typeof window !== 'undefined') {
        alert(error?.message || 'Failed to submit')
      }
    }
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
console.log(institute.placements)
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


          {/* Detailed Facilities Section */}
          {(institute as any).campusDetails?.detailedFacilities && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Campus Facilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {(institute as any).campusDetails.detailedFacilities.map((facility: any, index: number) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-lg mb-2">{facility.name}</h3>
                      <p className="text-gray-600 mb-3">{facility.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {facility.features.map((feature: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Programmes Section */}
          {!selectedProgramme && institute.programmes && institute.programmes.length > 0 ? (
            <Card>
<CardHeader>
  <CardTitle className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-2">
      <BookOpen className="h-5 w-5" />
      Programmes ({filteredProgrammes.length})
    </div>
    <div className="relative w-full max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder="Search programmes..."
        value={programmeSearchQuery}
        onChange={(e) => setProgrammeSearchQuery(e.target.value)}
        className="pl-9"
      />
    </div>
  </CardTitle>
</CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProgrammes.map((programme) => (
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
) : selectedProgramme ? (
  <div className="space-y-4">
    {/* Back Button */}
    <Button
      variant="outline"
      onClick={handleBackToProgrammes}
      className="flex items-center gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to All Programmes
    </Button>
    
    <ProgrammesSection programmes={[selectedProgramme]} onApplyClick={handleApplyClick} autoExpand={true} />
  </div>
) : null}

          {/* Desktop Grid Layout */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6 lg:gap-8">
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
                {institute?.overview?.stats?.[0]?.description && (
  <>
    {institute?.overview?.stats?.[0]?.title && (
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {institute.overview.stats[0].title}
      </h3>
    )}
    <p className="text-gray-700 leading-relaxed">
      {institute.overview.stats[0].description}
    </p>
  </>
)}

                </CardContent>
              </Card>

              {/* Courses Section */}
             

              {/* Campus Gallery Section */}
              {(institute as any).mediaGallery && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Campus Gallery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(((institute as any).mediaGallery?.photos ?? {})).map(([category, photos]: [string, any]) =>(Array.isArray(photos) ? photos : [])
.filter(p => p != null)
.slice(0, 2)
.map((photo: any, index: number) => {
  const isString = typeof photo === 'string';
  const src = isString ? photo : (photo.widgetThumbUrl || photo.thumbUrl || photo.mediaUrl);
  const alt = isString ? category : (photo.altText || photo.mediaTitle || category);

  return (
    <div key={`${category}-${index}`} className="relative group cursor-pointer">
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-32 object-cover rounded-lg transition-transform group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-32 bg-gray-100 rounded-lg" />
      )}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
        <span className="text-white text-sm font-medium">{isString ? category : (photo.mediaTitle || category)}</span>
      </div>
      <Badge className="absolute top-2 left-2 text-xs">{category}</Badge>
    </div>
  );
})
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Placements & Career Prospects */}
              {institute.placements && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Placements & Career Prospects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <TrendingUp className="h-6 w-6 text-blue-600" />
                          <div className="text-sm text-blue-600 font-medium">Average Package</div>
                        </div>
                        <div className="text-2xl font-bold text-blue-700">₹{institute.placements.averageSalary}</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Award className="h-6 w-6 text-green-600" />
                          <div className="text-sm text-green-600 font-medium">Highest Package</div>
                        </div>
                        <div className="text-2xl font-bold text-green-700">₹{institute.placements.highestSalary}</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Building2 className="h-6 w-6 text-purple-600" />
                          <div className="text-sm text-purple-600 font-medium">Companies Visited</div>
                        </div>
                        <div className="text-2xl font-bold text-purple-700">{institute.placements.companiesVisited}</div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Users className="h-6 w-6 text-orange-600" />
                          <div className="text-sm text-orange-600 font-medium">Total Offers</div>
                        </div>
                        <div className="text-2xl font-bold text-orange-700">{institute.placements.totalOffers}</div>
                      </div>
                    </div>

                    {/* Top Recruiters */}
                    {institute.placements.topRecruiters && institute.placements.topRecruiters.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-blue-500" />
                          Top Recruiters
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                          {institute.placements.topRecruiters.map((recruiter, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition-shadow">
                              <div className="text-sm font-medium text-gray-700">{recruiter}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Placement Sectors */}
                    {institute.placements.sectors && institute.placements.sectors.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          Placement Sectors
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {institute.placements.sectors.map((sector, index) => (
                            <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">{sector}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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

              {/* Media Gallery */}
              {institute.mediaGallery && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Campus Gallery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Photos */}
                    {institute.mediaGallery.photos && Object.keys(institute.mediaGallery.photos).length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Campus Photos</h4>
                        <div className="space-y-6">
                          {Object.entries(institute.mediaGallery.photos).map(([category, images]) => (
                            <div key={category}>
                              <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                {category}
                              </h5>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {Array.isArray(images) ? images.slice(0, 6).map((image, index) => (
                                  <div key={index} className="relative group overflow-hidden rounded-lg bg-gray-100 aspect-video">
                                    <img
                                      src={typeof image === 'string' ? image : image.mediaUrl}
                                      alt={typeof image === 'string' ? `${category} ${index + 1}` : image.altText || `${category} ${index + 1}`}
                                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                                  </div>
                                )) : null}
                              </div>
                              {Array.isArray(images) && images.length > 6 && (
                                <div className="text-center mt-3">
                                  <Button variant="outline" size="sm">
                                    View All {images.length} {category} Photos
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Videos */}
                    {institute.mediaGallery.videos && institute.mediaGallery.videos.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Campus Videos</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {institute.mediaGallery.videos.slice(0, 4).map((video, index) => (
                            <div key={index} className="relative group">
                              <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
                                <img
                                  src={video.thumbnail || video.thumbUrl}
                                  alt={video.title || video.mediaTitle}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                                    <div className="w-0 h-0 border-l-[8px] border-l-gray-700 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2">
                                <h6 className="font-medium text-sm text-gray-900">{video.title || video.mediaTitle}</h6>
                              </div>
                            </div>
                          ))}
                        </div>
                        {institute.mediaGallery.videos.length > 4 && (
                          <div className="text-center mt-4">
                            <Button variant="outline" size="sm">
                              View All {institute.mediaGallery.videos.length} Videos
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
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
          {/* Rankings Section */}
          {institute.rankings.national.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Rankings & Recognition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {institute.rankings.national.map((ranking, index) => (
                    <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-blue-600">#{ranking.rank}</div>
                      <div className="text-sm text-gray-600">{ranking.agency} {ranking.year}</div>
                      <div className="text-sm font-medium">{ranking.category}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Research & Innovation Section */}
          {institute.researchAndInnovation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Research & Innovation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{institute.researchAndInnovation.researchCenters}</div>
                    <div className="text-sm text-gray-600">Research Centers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{institute.researchAndInnovation.patentsFiled}</div>
                    <div className="text-sm text-gray-600">Patents Filed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{institute.researchAndInnovation.publicationsPerYear}</div>
                    <div className="text-sm text-gray-600">Publications/Year</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{institute.researchAndInnovation.phdScholars}</div>
                    <div className="text-sm text-gray-600">PhD Scholars</div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">{institute.researchAndInnovation.incubationCenter.name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Startups Funded:</span> {institute.researchAndInnovation.incubationCenter.startupsFunded}
                    </div>
                    <div>
                      <span className="font-medium">Total Funding:</span> ₹{institute.researchAndInnovation.incubationCenter.totalFunding}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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