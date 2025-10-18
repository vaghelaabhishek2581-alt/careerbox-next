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
  BookOpen
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
  const getAccreditationBadges = () => {
    const badges = []
    
    if (institute.accreditation?.naac) {
      badges.push(
        <Badge key="naac" variant="secondary" className="bg-green-100 text-green-800">
          NAAC {institute.accreditation.naac.grade}
        </Badge>
      )
    }
    
    if (institute.accreditation?.nirf?.overallRank) {
      badges.push(
        <Badge key="nirf" variant="secondary" className="bg-blue-100 text-blue-800">
          NIRF #{institute.accreditation.nirf.overallRank}
        </Badge>
      )
    }
    
    if (institute.accreditation?.aicte?.approved) {
      badges.push(
        <Badge key="aicte" variant="secondary" className="bg-purple-100 text-purple-800">
          AICTE Approved
        </Badge>
      )
    }
    
    return badges
  }

  const getPlacementData = () => {
    // Check if placements data exists and has the expected structure
    if (institute.placements) {
      // Handle both old and new placement data structures
      if ('averageSalary' in institute.placements) {
        return institute.placements
      }
      // Legacy structure - get latest year
      const latestYear = Object.keys(institute.placements).find(key => key !== 'sectors')
      if (latestYear && institute.placements[latestYear]) {
        const data = institute.placements[latestYear]
        if (typeof data === 'object' && !Array.isArray(data) && 'averageSalary' in data) {
          return data
        }
      }
    }
    return null
  }

  if (variant === 'compact') {
    const placementData = getPlacementData();
    const accreditationBadges = getAccreditationBadges();
    
    return (
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-sm hover:scale-[1.01] h-full bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-gray-100 shadow-sm group-hover:border-blue-200 transition-colors bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
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
              
              {institute.location && (
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <MapPin className="h-3 w-3" />
                  <span>{institute.location.city}, {institute.location.state}</span>
                </div>
              )}
              
              {/* Type and Established */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {institute.type && (
                  <Badge variant="outline" className="text-xs">
                    {institute.type}
                  </Badge>
                )}
                {institute.establishedYear && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    Est. {institute.establishedYear}
                  </div>
                )}
              </div>
              
              {/* Accreditation Badges */}
              {accreditationBadges.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {accreditationBadges.slice(0, 3)}
                </div>
              )}
              
              {/* Stats */}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-600">
                {institute.academics?.totalPrograms && institute.academics.totalPrograms > 0 && (
                  <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                    <GraduationCap className="h-3 w-3 text-blue-600" />
                    <span className="font-medium text-blue-700">{institute.academics.totalPrograms} Programs</span>
                  </div>
                )}
                {institute.academics?.totalStudents && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{typeof institute.academics.totalStudents === 'number' ? nf.format(institute.academics.totalStudents) : institute.academics.totalStudents} Students</span>
                  </div>
                )}
                {institute.academics?.studentFacultyRatio && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    <span>Ratio {institute.academics.studentFacultyRatio}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Placement & CTA */}
            <div className="flex flex-col items-end gap-3">
              {placementData?.averageSalary && placementData.averageSalary !== 'N/A' && (
                <div className="text-right bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                  <div className="text-xs text-green-600 font-medium">Avg Package</div>
                  <div className="text-sm font-bold text-green-700">
                    ₹{typeof placementData.averageSalary === 'number' ? nf.format(placementData.averageSalary) : placementData.averageSalary}
                  </div>
                </div>
              )}
              <Button size="sm" asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 whitespace-nowrap h-6 text-[10px] px-2 shadow-sm hover:shadow-md transition-all">
                <Link href={`/recommendation-collections/${institute.slug}`}>
                  View
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
    
    return (
      <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-md hover:scale-[1.01] bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center overflow-hidden">
                  {institute.logo ? (
                    <img 
                      src={institute.logo} 
                      alt={institute.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-white">
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
                  <div className="text-sm text-gray-600">{institute.shortName}</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {getAccreditationBadges()}
                <Badge variant="outline" className="border-orange-200 text-orange-700">
                  {institute.type} {institute.status}
                </Badge>
              </div>
              
              {institute.overview?.description && (
                <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                  {institute.overview.description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Location and Contact - Single Line */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
            {institute.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{institute.location.city}, {institute.location.state}</span>
              </div>
            )}
            {institute.establishedYear && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Est. {institute.establishedYear}</span>
              </div>
            )}
            {institute.contact?.phone?.[0] && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                <span>{institute.contact.phone[0]}</span>
              </div>
            )}
          </div>

          {/* Academic Stats */}
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              {institute.academics?.totalStudents && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>
                    {typeof institute.academics.totalStudents === 'number' 
                      ? institute.academics.totalStudents.toLocaleString() 
                      : institute.academics.totalStudents} Students
                  </span>
                </div>
              )}
              {institute.academics?.totalPrograms && institute.academics.totalPrograms > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <GraduationCap className="h-4 w-4" />
                  <span>{institute.academics.totalPrograms} Programs</span>
                </div>
              )}
              {institute.academics?.studentFacultyRatio && (
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>Ratio {institute.academics.studentFacultyRatio}</span>
                </div>
              )}
            </div>
          </div>

          {/* Placement Stats - Only show if at least one valid value exists */}
          {placementData && (
            (placementData.averageSalary && placementData.averageSalary !== 'N/A') ||
            (placementData.highestSalary && placementData.highestSalary !== 'N/A') ||
            (placementData.overallPlacementRate && placementData.overallPlacementRate !== 'N/A') ||
            (placementData.companiesVisited && placementData.companiesVisited !== 'N/A')
          ) && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Placement Highlights
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {placementData.averageSalary && placementData.averageSalary !== 'N/A' && (
                  <div>
                    <div className="font-medium text-green-600">
                      ₹{typeof placementData.averageSalary === 'number' 
                        ? nf.format(placementData.averageSalary) 
                        : placementData.averageSalary}
                    </div>
                    <div className="text-gray-600">Average Package</div>
                  </div>
                )}
                {placementData.highestSalary && placementData.highestSalary !== 'N/A' && (
                  <div>
                    <div className="font-medium text-blue-600">
                      ₹{typeof placementData.highestSalary === 'number' 
                        ? nf.format(placementData.highestSalary) 
                        : placementData.highestSalary}
                    </div>
                    <div className="text-gray-600">Highest Package</div>
                  </div>
                )}
                {placementData.overallPlacementRate && placementData.overallPlacementRate !== 'N/A' && (
                  <div>
                    <div className="font-medium text-purple-600">
                      {typeof placementData.overallPlacementRate === 'number' 
                        ? `${nf.format(placementData.overallPlacementRate)}%` 
                        : placementData.overallPlacementRate}
                    </div>
                    <div className="text-gray-600">Placement Rate</div>
                  </div>
                )}
                {placementData.companiesVisited && placementData.companiesVisited !== 'N/A' && (
                  <div>
                    <div className="font-medium text-orange-600">
                      {typeof placementData.companiesVisited === 'number' 
                        ? nf.format(placementData.companiesVisited) 
                        : placementData.companiesVisited}
                    </div>
                    <div className="text-gray-600">Companies</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Top Recruiters */}
          {placementData?.topRecruiters && Array.isArray(placementData.topRecruiters) && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Top Recruiters</h4>
              <div className="flex flex-wrap gap-2">
                {placementData.topRecruiters.slice(0, 6).map((recruiter: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {recruiter}
                  </Badge>
                ))}
                {placementData.topRecruiters.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{placementData.topRecruiters.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Courses Preview */}
          {showCourses && institute.courses && Array.isArray(institute.courses) && institute.courses.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Popular Courses</h4>
              <div className="flex flex-wrap gap-2">
                {institute.courses.slice(0, 3).map((course) => (
                  <Link
                    key={course.id}
                    href={`/recommendation-collections/${institute.slug}/courses/${course.slug}`}
                    className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                  >
                    {course.degree} {course.name}
                  </Link>
                ))}
                {institute.courses.length > 3 && (
                  <Link
                    href={`/recommendation-collections/${institute.slug}/courses`}
                    className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    +{institute.courses.length - 3} more courses
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button asChild size="sm" className="h-8 text-xs px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all">
              <Link href={`/recommendation-collections/${institute.slug}`}>
                View Details
              </Link>
            </Button>
            {institute.contact?.website && (
              <Button asChild variant="outline" size="sm" className="h-8 text-xs px-4 border-2 hover:bg-gray-50 transition-all">
                <Link href={institute.contact.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
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
  
  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-md hover:scale-[1.02] h-full flex flex-col bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-gray-100 shadow-sm group-hover:border-blue-200 transition-colors bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
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
            {institute.location && (
              <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                <MapPin className="h-3 w-3" />
                <span>{institute.location.city}, {institute.location.state}</span>
              </div>
            )}
            {institute.type && (
              <Badge variant="outline" className="mt-1 text-xs">
                {institute.type}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 flex-1 flex flex-col">
        {/* Accreditation Badges */}
        {accreditationBadges.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {accreditationBadges.slice(0, 3)}
          </div>
        )}
        
        {/* Description */}
        {institute.overview?.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {institute.overview.description}
          </p>
        )}
        
        {/* Stats - Only show if values exist */}
        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
          {institute.establishedYear && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Est. {institute.establishedYear}</span>
            </div>
          )}
          {institute.academics?.totalPrograms && institute.academics.totalPrograms > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <GraduationCap className="h-4 w-4" />
              <span>{institute.academics.totalPrograms} Programs</span>
            </div>
          )}
          {institute.academics?.totalStudents && (
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-4 w-4" />
              <span>
                {typeof institute.academics.totalStudents === 'number' 
                  ? nf.format(institute.academics.totalStudents) 
                  : institute.academics.totalStudents} Students
              </span>
            </div>
          )}
        </div>

        {/* Placement Stats - Only show if data exists */}
        {placementData && (placementData.averageSalary || placementData.overallPlacementRate) && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 mb-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {placementData.averageSalary && placementData.averageSalary !== 'N/A' && (
                <div>
                  <div className="font-bold text-green-700">
                    ₹{typeof placementData.averageSalary === 'number' 
                      ? nf.format(placementData.averageSalary) 
                      : placementData.averageSalary}
                  </div>
                  <div className="text-xs text-gray-600">Avg Package</div>
                </div>
              )}
              {placementData.overallPlacementRate && placementData.overallPlacementRate !== 'N/A' && (
                <div>
                  <div className="font-bold text-blue-700">
                    {typeof placementData.overallPlacementRate === 'number' 
                      ? `${nf.format(placementData.overallPlacementRate)}%` 
                      : placementData.overallPlacementRate}
                  </div>
                  <div className="text-xs text-gray-600">Placement Rate</div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Top Recruiters */}
        {placementData?.topRecruiters && Array.isArray(placementData.topRecruiters) && placementData.topRecruiters.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-700 mb-1">Top Recruiters:</p>
            <div className="flex flex-wrap gap-1">
              {placementData.topRecruiters.slice(0, 3).map((recruiter: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {recruiter}
                </Badge>
              ))}
              {placementData.topRecruiters.length > 3 && (
                <span className="text-xs text-gray-500">+{placementData.topRecruiters.length - 3}</span>
              )}
            </div>
          </div>
        )}
        
        {/* CTA Button */}
        <div className="mt-auto">
          <Button asChild size="sm" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-6 text-[10px] shadow-sm hover:shadow-md transition-all">
            <Link href={`/recommendation-collections/${institute.slug}`}>
              View
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
