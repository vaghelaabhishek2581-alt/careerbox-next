'use client'

import React from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Calendar, 
  Users, 
  GraduationCap, 
  Award, 
  Star,
  Building2,
  Phone,
  Mail,
  ExternalLink,
  TrendingUp,
  BookOpen,
  Globe,
  Briefcase,
  School,
  Wifi
} from 'lucide-react'
import { Institute } from '@/types/institute'

interface InstituteCardProps {
  institute: Institute
  variant?: 'default' | 'compact' | 'detailed'
  showCourses?: boolean
}

export function InstituteCard({ 
  institute, 
  variant = 'default',
  showCourses = false 
}: InstituteCardProps) {
  const nf = new Intl.NumberFormat('en-IN')
  
  // Helper function to check if value is valid (not null, not 0, not empty string, not "N/A")
  const isValidValue = (value: any): boolean => {
    if (value === null || value === undefined) return false
    if (value === 0) return false
    if (value === '') return false
    if (value === 'N/A') return false
    if (typeof value === 'string' && value.trim() === '') return false
    return true
  }

  const getAccreditationBadges = () => {
    const badges = []
    
    if (institute.accreditation?.naac?.grade && isValidValue(institute.accreditation.naac.grade) && institute.accreditation.naac.grade !== 'None') {
      badges.push(
        <Badge key="naac" variant="secondary" className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border border-green-200 shadow-sm">
          NAAC {institute.accreditation.naac.grade}
        </Badge>
      )
    }
    
    if (institute.accreditation?.nirf?.overallRank && isValidValue(institute.accreditation.nirf.overallRank)) {
      badges.push(
        <Badge key="nirf" variant="secondary" className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-200 shadow-sm">
          NIRF #{institute.accreditation.nirf.overallRank}
        </Badge>
      )
    }
    
    if (institute.accreditation?.aicte?.approved) {
      badges.push(
        <Badge key="aicte" variant="secondary" className="bg-gradient-to-r from-purple-50 to-violet-50 text-purple-800 border border-purple-200 shadow-sm">
          AICTE Approved
        </Badge>
      )
    }
    
    return badges
  }

  const getPlacementData = () => {
    if (institute.placements) {
      if ('averageSalary' in institute.placements) {
        return institute.placements
      }
      const latestYear = Object.keys(institute.placements).find(key => key !== 'sectors' && key !== 'topRecruiters')
      if (latestYear && institute.placements[latestYear]) {
        const data = institute.placements[latestYear]
        if (typeof data === 'object' && !Array.isArray(data) && 'averageSalary' in data) {
          return data
        }
      }
    }
    return null
  }

  const getOverviewStats = () => {
    const stats: Array<{key: string, value: string, icon?: any}> = []
    if (institute.rawOverview && Array.isArray(institute.rawOverview)) {
      const relevantKeys = ['Number of schools', 'International Collaborations', 'Alumni Network', 'Number of courses offered', 'Flagship Courses']
      institute.rawOverview.forEach((item: any) => {
        if (item && item.key && item.value && typeof item.key === 'string' && isValidValue(item.value)) {
          if (relevantKeys.some(k => item.key.toLowerCase().includes(k.toLowerCase()))) {
            stats.push({key: item.key, value: item.value})
          }
        }
      })
    }
    return stats
  }

  const getTopRecruiters = () => {
    if (institute.placements?.topRecruiters && Array.isArray(institute.placements.topRecruiters)) {
      return institute.placements.topRecruiters.filter(r => isValidValue(r))
    }
    return []
  }

  const getFacilitiesCount = () => {
    if (institute.campusDetails?.facilities && Array.isArray(institute.campusDetails.facilities)) {
      return institute.campusDetails.facilities.length
    }
    return 0
  }

  const getInstituteDescription = () => {
    const facultyStudentData = (institute as any).faculty_student_ratio
    if (facultyStudentData?.students && Array.isArray(facultyStudentData.students)) {
      const descItem = facultyStudentData.students.find((item: any) => 
        item.key?.toLowerCase() === 'description'
      )
      if (descItem?.value && isValidValue(descItem.value)) {
        return descItem.value
      }
    }
    
    if ((institute as any).overview?.description && isValidValue((institute as any).overview.description)) {
      return (institute as any).overview.description
    }
    return ''
  }

  const getTotalCourses = () => {
    const coursesItem = getOverviewStats().find((item: any) => 
      item.key?.toLowerCase().includes('courses offered')
    )
    if (coursesItem?.value) {
      const match = coursesItem.value.match(/\d+/)
      return match ? parseInt(match[0]) : 0
    }
    
    if (institute.programmes && Array.isArray(institute.programmes) && institute.programmes.length > 0) {
      return institute.programmes.reduce((acc: number, p: any) => acc + (p.courseCount || 0), 0)
    }
    return 0
  }

  const getNumberOfSchools = () => {
    const schoolsItem = getOverviewStats().find((item: any) => 
      item.key?.toLowerCase().includes('number of schools')
    )
    if (schoolsItem?.value) {
      const match = schoolsItem.value.match(/\d+/)
      return match ? parseInt(match[0]) : 0
    }
    return 0
  }

  if (variant === 'compact') {
    const placementData = getPlacementData();
    const accreditationBadges = getAccreditationBadges();
    
    return (
      <Card className="group hover:shadow-2xl transition-all duration-300 border border-gray-100 shadow-lg hover:scale-[1.02] h-full bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 hover:border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-gray-200 shadow-md group-hover:border-blue-300 group-hover:shadow-xl transition-all bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              {institute.logo ? (
                <img 
                  src={institute.logo} 
                  alt={institute.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {institute.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <Link 
                href={`/recommendation-collections/${institute.slug}`}
                className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 group-hover:text-blue-600"
              >
                {institute.name}
              </Link>
              
              {institute.location && isValidValue(institute.location.city) && (
                <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-600">
                  <MapPin className="h-3.5 w-3.5 text-blue-500" />
                  <span>{institute.location.city}{isValidValue(institute.location.state) && `, ${institute.location.state}`}</span>
                </div>
              )}
              
              {/* Type and Established */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {isValidValue(institute.type) && (
                  <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                    {institute.type}
                  </Badge>
                )}
                {isValidValue(institute.establishedYear) && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                    <Calendar className="h-3 w-3" />
                    Est. {institute.establishedYear}
                  </div>
                )}
              </div>
              
              {/* Accreditation Badges */}
              {accreditationBadges.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {accreditationBadges.slice(0, 3)}
                </div>
              )}
              
              {/* Stats */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {getTotalCourses() > 0 && (
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-pink-50 px-2.5 py-1.5 rounded-lg border border-purple-200 shadow-sm">
                    <School className="h-3.5 w-3.5 text-purple-600" />
                    <span className="font-semibold text-purple-700 text-xs">{getTotalCourses()} Courses</span>
                  </div>
                )}
                {getFacilitiesCount() > 0 && (
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 px-2.5 py-1.5 rounded-lg border border-blue-200 shadow-sm">
                    <Wifi className="h-3.5 w-3.5 text-blue-600" />
                    <span className="font-medium text-blue-700 text-xs">{getFacilitiesCount()} Facilities</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Placement & CTA */}
            <div className="flex flex-col items-end gap-2.5">
              {placementData?.averageSalary && isValidValue(placementData.averageSalary) && (
                <div className="text-right bg-gradient-to-br from-green-50 to-emerald-50 px-3 py-2.5 rounded-xl border border-green-200 shadow-md">
                  <div className="text-xs text-green-600 font-semibold uppercase tracking-wide">Avg Package</div>
                  <div className="text-sm font-bold text-green-700 mt-0.5">
                    ₹{typeof placementData.averageSalary === 'number' ? nf.format(placementData.averageSalary) : placementData.averageSalary}
                  </div>
                </div>
              )}
              {getOverviewStats().slice(0, 1).map((stat, idx) => (
                <div key={idx} className="text-right bg-gradient-to-br from-orange-50 to-amber-50 px-3 py-2 rounded-xl border border-orange-200 shadow-md">
                  <div className="text-[10px] text-orange-600 font-semibold uppercase tracking-wide">{stat.key}</div>
                  <div className="text-xs font-bold text-orange-700 mt-0.5">{stat.value}</div>
                </div>
              ))}
              <Button size="sm" asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 whitespace-nowrap h-8 text-xs px-4 shadow-lg hover:shadow-xl transition-all font-semibold">
                <Link href={`/recommendation-collections/${institute.slug}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'detailed') {
    const placementData = getPlacementData()
    const description = getInstituteDescription()
    
    return (
      <Card className="group hover:shadow-2xl transition-all duration-300 border border-gray-100 shadow-lg hover:scale-[1.01] bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
        <CardHeader className="pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border-2 border-white">
                  {institute.logo ? (
                    <img 
                      src={institute.logo} 
                      alt={institute.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {institute.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <Link 
                    href={`/recommendation-collections/${institute.slug}`}
                    className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {institute.name}
                  </Link>
                  {isValidValue(institute.shortName) && (
                    <div className="text-sm text-gray-600 mt-1">{institute.shortName}</div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {getAccreditationBadges()}
                {isValidValue(institute.type) && (
                  <Badge variant="outline" className="border-orange-300 text-orange-700 bg-gradient-to-r from-orange-50 to-amber-50">
                    {institute.type} {isValidValue(institute.status) && institute.status}
                  </Badge>
                )}
              </div>
              
              {description && (
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4 rounded-xl border border-blue-200 mb-3 shadow-sm">
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                    {description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-5">
          {/* Location and Contact - Single Line */}
          {(institute.location || isValidValue(institute.establishedYear) || institute.contact?.phone?.[0]) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-5 pb-5 border-b border-gray-100">
              {institute.location && isValidValue(institute.location.city) && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span>{institute.location.city}{isValidValue(institute.location.state) && `, ${institute.location.state}`}</span>
                </div>
              )}
              {isValidValue(institute.establishedYear) && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span>Est. {institute.establishedYear}</span>
                </div>
              )}
              {institute.contact?.phone?.[0] && isValidValue(institute.contact.phone[0]) && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span>{institute.contact.phone[0]}</span>
                </div>
              )}
            </div>
          )}

          {/* Academic Stats */}
          {(getTotalCourses() > 0 || getFacilitiesCount() > 0 || getOverviewStats().length > 0) && (
            <div className="mb-5">
              <h4 className="font-bold text-gray-900 mb-3 text-base flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Academic Overview
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {getTotalCourses() > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-shadow">
                    <div className="text-3xl font-bold text-blue-700">{getTotalCourses()}</div>
                    <div className="text-xs text-gray-600 mt-1 font-medium">Total Courses</div>
                  </div>
                )}
                {getNumberOfSchools() > 0 && (
                  <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-4 rounded-xl border border-green-200 shadow-md hover:shadow-lg transition-shadow">
                    <div className="text-3xl font-bold text-green-700">{getNumberOfSchools()}</div>
                    <div className="text-xs text-gray-600 mt-1 font-medium">Schools</div>
                  </div>
                )}
                {getFacilitiesCount() > 0 && (
                  <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100 p-4 rounded-xl border border-teal-200 shadow-md hover:shadow-lg transition-shadow">
                    <div className="text-3xl font-bold text-teal-700">{getFacilitiesCount()}</div>
                    <div className="text-xs text-gray-600 mt-1 font-medium">Facilities</div>
                  </div>
                )}
                {getOverviewStats().find((s: any) => s.key?.toLowerCase().includes('collaboration')) && (
                  <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 p-4 rounded-xl border border-orange-200 shadow-md hover:shadow-lg transition-shadow">
                    <div className="text-3xl font-bold text-orange-700">{getOverviewStats().find((s: any) => s.key?.toLowerCase().includes('collaboration'))?.value}</div>
                    <div className="text-xs text-gray-600 mt-1 font-medium">Collaborations</div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Placement Stats */}
          {placementData && (
            (isValidValue(placementData.averageSalary)) ||
            (isValidValue(placementData.highestSalary)) ||
            (isValidValue(placementData.overallPlacementRate)) ||
            (isValidValue(placementData.companiesVisited))
          ) && (
            <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-xl p-5 mb-5 border border-green-200 shadow-md">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Placement Highlights
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {isValidValue(placementData.averageSalary) && (
                  <div className="bg-white/60 rounded-lg p-3 border border-green-200">
                    <div className="font-bold text-green-700 text-base">
                      ₹{typeof placementData.averageSalary === 'number' 
                        ? nf.format(placementData.averageSalary) 
                        : placementData.averageSalary}
                    </div>
                    <div className="text-gray-600 text-xs mt-1 font-medium">Average Package</div>
                  </div>
                )}
                {isValidValue(placementData.highestSalary) && (
                  <div className="bg-white/60 rounded-lg p-3 border border-blue-200">
                    <div className="font-bold text-blue-700 text-base">
                      ₹{typeof placementData.highestSalary === 'number' 
                        ? nf.format(placementData.highestSalary) 
                        : placementData.highestSalary}
                    </div>
                    <div className="text-gray-600 text-xs mt-1 font-medium">Highest Package</div>
                  </div>
                )}
                {isValidValue(placementData.overallPlacementRate) && (
                  <div className="bg-white/60 rounded-lg p-3 border border-purple-200">
                    <div className="font-bold text-purple-700 text-base">
                      {typeof placementData.overallPlacementRate === 'number' 
                        ? `${nf.format(placementData.overallPlacementRate)}%` 
                        : placementData.overallPlacementRate}
                    </div>
                    <div className="text-gray-600 text-xs mt-1 font-medium">Placement Rate</div>
                  </div>
                )}
                {isValidValue(placementData.companiesVisited) && (
                  <div className="bg-white/60 rounded-lg p-3 border border-orange-200">
                    <div className="font-bold text-orange-700 text-base">
                      {typeof placementData.companiesVisited === 'number' 
                        ? nf.format(placementData.companiesVisited) 
                        : placementData.companiesVisited}
                    </div>
                    <div className="text-gray-600 text-xs mt-1 font-medium">Companies</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Top Recruiters */}
          {getTopRecruiters().length > 0 && (
            <div className="mb-5">
              <h4 className="font-bold text-gray-900 mb-3 text-base flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-600" />
                Top Recruiters
              </h4>
              <div className="flex flex-wrap gap-2">
                {getTopRecruiters().slice(0, 8).map((recruiter: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 hover:bg-indigo-100 transition-colors font-medium">
                    {recruiter}
                  </Badge>
                ))}
                {getTopRecruiters().length > 8 && (
                  <Badge variant="outline" className="text-xs bg-gray-100 border-gray-300 font-medium">
                    +{getTopRecruiters().length - 8} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Key Highlights */}
          {getOverviewStats().length > 0 && (
            <div className="mb-5">
              <h4 className="font-bold text-gray-900 mb-3 text-base flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Key Highlights
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {getOverviewStats().map((stat, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 p-3 rounded-xl border border-yellow-300 shadow-md hover:shadow-lg transition-all">
                    <div className="text-xs text-gray-600 mb-1 leading-tight font-medium">{stat.key}</div>
                    <div className="text-lg font-bold text-orange-700">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Programs Available */}
          {institute.programmes && Array.isArray(institute.programmes) && institute.programmes.length > 0 && (
            <div className="mb-5">
              <h4 className="font-bold text-gray-900 mb-3 text-base flex items-center gap-2">
                <School className="h-5 w-5 text-purple-600" />
                Programs Offered ({institute.programmes.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {institute.programmes.slice(0, 6).map((program: any, idx: number) => (
                  <div key={idx} className="bg-gradient-to-r from-purple-50 to-indigo-50 px-3 py-2.5 rounded-xl border border-purple-300 hover:border-purple-400 hover:shadow-md transition-all">
                    <div className="text-xs font-bold text-purple-700">{program.name}</div>
                    {isValidValue(program.courseCount) && program.courseCount > 0 && (
                      <div className="text-[10px] text-gray-600 mt-0.5 font-medium">{program.courseCount} courses</div>
                    )}
                  </div>
                ))}
                {institute.programmes.length > 6 && (
                  <div className="bg-gray-100 px-3 py-2.5 rounded-xl border border-gray-300 flex items-center justify-center">
                    <span className="text-xs text-gray-700 font-semibold">+{institute.programmes.length - 6} more</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Courses Preview */}
          {showCourses && institute.courses && Array.isArray(institute.courses) && institute.courses.length > 0 && (
            <div className="mb-5">
              <h4 className="font-bold text-gray-900 mb-3 text-base">Popular Courses</h4>
              <div className="flex flex-wrap gap-2">
                {institute.courses.slice(0, 3).map((course) => (
                  <Link
                    key={course.id}
                    href={`/recommendation-collections/${institute.slug}/courses/${course.slug}`}
                    className="text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 font-medium"
                  >
                    {course.degree} {course.name}
                  </Link>
                ))}
                {institute.courses.length > 3 && (
                  <Link
                    href={`/recommendation-collections/${institute.slug}/courses`}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300 font-medium"
                  >
                    +{institute.courses.length - 3} more courses
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3 border-t border-gray-100">
            <Button asChild size="sm" className="h-10 text-sm px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all font-semibold">
              <Link href={`/recommendation-collections/${institute.slug}`}>
                View Details
              </Link>
            </Button>
            {institute.contact?.website && isValidValue(institute.contact.website) && (
              <Button asChild variant="outline" size="sm" className="h-10 text-sm px-6 border-2 border-blue-200 hover:bg-blue-50 transition-all font-semibold">
                <Link href={institute.contact.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Website
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default variant (Grid View)
  const placementData = getPlacementData();
  const accreditationBadges = getAccreditationBadges();
  const description = getInstituteDescription()
  
  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 border border-gray-100 shadow-lg hover:scale-[1.03] h-full flex flex-col bg-gradient-to-br from-white via-blue-50/20 to-purple-50/30 hover:border-blue-200">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-gray-200 shadow-md group-hover:border-blue-300 group-hover:shadow-xl transition-all bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            {institute.logo ? (
              <img 
                src={institute.logo} 
                alt={institute.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-white">
                {institute.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link 
              href={`/recommendation-collections/${institute.slug}`}
              className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors group-hover:text-blue-600 line-clamp-2"
            >
              {institute.name}
            </Link>
            {institute.location && isValidValue(institute.location.city) && (
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-600">
                <MapPin className="h-3.5 w-3.5 text-blue-500" />
                <span>{institute.location.city}{isValidValue(institute.location.state) && `, ${institute.location.state}`}</span>
              </div>
            )}
            {isValidValue(institute.type) && (
              <Badge variant="outline" className="mt-2 text-xs border-blue-200 text-blue-700 bg-blue-50">
                {institute.type}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 flex-1 flex flex-col">
        {/* Accreditation Badges */}
        {getAccreditationBadges().length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {getAccreditationBadges().slice(0, 3)}
          </div>
        )}
        
        {/* Description */}
        {description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
        
        {/* Stats */}
        {(isValidValue(institute.establishedYear) || getTotalCourses() > 0 || getFacilitiesCount() > 0 || getOverviewStats().length > 0) && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {isValidValue(institute.establishedYear) && (
              <div className="flex items-center gap-1.5 text-gray-600 bg-gradient-to-r from-gray-50 to-slate-50 px-2.5 py-2 rounded-lg border border-gray-200 shadow-sm">
                <Calendar className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-xs font-medium">Est. {institute.establishedYear}</span>
              </div>
            )}
            {getTotalCourses() > 0 && (
              <div className="flex items-center gap-1.5 text-gray-600 bg-gradient-to-r from-purple-50 to-pink-50 px-2.5 py-2 rounded-lg border border-purple-200 shadow-sm">
                <School className="h-3.5 w-3.5 text-purple-600" />
                <span className="font-semibold text-xs text-purple-700">{getTotalCourses()} Courses</span>
              </div>
            )}
            {getFacilitiesCount() > 0 && (
              <div className="flex items-center gap-1.5 text-gray-600 bg-gradient-to-r from-blue-50 to-cyan-50 px-2.5 py-2 rounded-lg border border-blue-200 shadow-sm">
                <Wifi className="h-3.5 w-3.5 text-blue-600" />
                <span className="font-medium text-xs text-blue-700">{getFacilitiesCount()} Facilities</span>
              </div>
            )}
            {getOverviewStats().find((s: any) => s.key?.toLowerCase().includes('collaboration')) && (
              <div className="flex items-center gap-1.5 text-gray-600 bg-gradient-to-r from-green-50 to-emerald-50 px-2.5 py-2 rounded-lg border border-green-200 shadow-sm">
                <Globe className="h-3.5 w-3.5 text-green-600" />
                <span className="font-medium text-xs text-green-700">{getOverviewStats().find((s: any) => s.key?.toLowerCase().includes('collaboration'))?.value}</span>
              </div>
            )}
          </div>
        )}

        {/* Placement Stats */}
        {placementData && (isValidValue(placementData.averageSalary) || isValidValue(placementData.overallPlacementRate)) && (
          <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-xl p-3 mb-3 border border-green-200 shadow-md">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {isValidValue(placementData.averageSalary) && (
                <div>
                  <div className="font-bold text-green-700 text-base">
                    ₹{typeof placementData.averageSalary === 'number' 
                      ? nf.format(placementData.averageSalary) 
                      : placementData.averageSalary}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">Avg Package</div>
                </div>
              )}
              {isValidValue(placementData.overallPlacementRate) && (
                <div>
                  <div className="font-bold text-blue-700 text-base">
                    {typeof placementData.overallPlacementRate === 'number' 
                      ? `${nf.format(placementData.overallPlacementRate)}%` 
                      : placementData.overallPlacementRate}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">Placement Rate</div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Top Recruiters */}
        {getTopRecruiters().length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
              Top Recruiters:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {getTopRecruiters().slice(0, 4).map((recruiter: string, index: number) => (
                <Badge key={index} variant="outline" className="text-[10px] bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 font-medium">
                  {recruiter}
                </Badge>
              ))}
              {getTopRecruiters().length > 4 && (
                <span className="text-[10px] text-gray-600 px-2 py-1 bg-gray-50 rounded border border-gray-200 font-medium">+{getTopRecruiters().length - 4}</span>
              )}
            </div>
          </div>
        )}

        {/* Key Stats Badge */}
        {getOverviewStats().length > 0 && (
          <div className="mb-3">
            <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border border-orange-200 rounded-xl p-2.5 shadow-md">
              {getOverviewStats().slice(0, 2).map((stat, idx) => (
                <div key={idx} className="flex justify-between items-center mb-1.5 last:mb-0">
                  <span className="text-[10px] text-gray-600 font-medium">{stat.key}:</span>
                  <span className="text-xs font-bold text-orange-700">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* CTA Button */}
        <div className="mt-auto">
          <Button asChild size="sm" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-9 text-sm shadow-lg hover:shadow-xl transition-all font-semibold">
            <Link href={`/recommendation-collections/${institute.slug}`}>
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}