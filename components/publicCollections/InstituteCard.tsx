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
  const getAccreditationBadges = () => {
    const badges = []
    
    if (institute.accreditation.naac) {
      badges.push(
        <Badge key="naac" variant="secondary" className="bg-green-100 text-green-800">
          NAAC {institute.accreditation.naac.grade}
        </Badge>
      )
    }
    
    if (institute.accreditation.nirf?.overallRank) {
      badges.push(
        <Badge key="nirf" variant="secondary" className="bg-blue-100 text-blue-800">
          NIRF #{institute.accreditation.nirf.overallRank}
        </Badge>
      )
    }
    
    if (institute.accreditation.aicte?.approved) {
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
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link 
                href={`/recommendation-collections/${institute.slug}`}
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {institute.name}
              </Link>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{institute.location.city}, {institute.location.state}</span>
                <Badge variant="outline" className="ml-2">
                  {institute.type}
                </Badge>
              </div>
              <div className="flex gap-2 mt-2">
                {getAccreditationBadges().slice(0, 2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Est. {institute.establishedYear}</div>
              <div className="text-sm font-medium text-green-600">
                {getPlacementData()?.averageSalary ? `₹${getPlacementData()?.averageSalary.toLocaleString()}` : 'N/A'} Avg Package
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'detailed') {
    const placementData = getPlacementData()
    
    return (
      <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
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
              
              <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                {institute.overview.description}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Location and Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{institute.location.city}, {institute.location.state}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Established {institute.establishedYear}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{institute.contact.phone[0]}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>
                  {institute.academics?.totalStudents 
                    ? typeof institute.academics.totalStudents === 'number' 
                      ? institute.academics.totalStudents.toLocaleString() 
                      : institute.academics.totalStudents
                    : 'N/A'} Students
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <GraduationCap className="h-4 w-4" />
                <span>{institute.academics?.totalPrograms || 'N/A'} Programs</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BookOpen className="h-4 w-4" />
                <span>Ratio {institute.academics?.studentFacultyRatio || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Placement Stats */}
          {placementData && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Placement Highlights
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-green-600">
                    {typeof placementData.averageSalary === 'number' 
                      ? `₹${placementData.averageSalary.toLocaleString()}` 
                      : typeof placementData.averageSalary === 'string' 
                        ? placementData.averageSalary 
                        : 'N/A'}
                  </div>
                  <div className="text-gray-600">Average Package</div>
                </div>
                <div>
                  <div className="font-medium text-blue-600">
                    {typeof placementData.highestSalary === 'number' 
                      ? `₹${placementData.highestSalary.toLocaleString()}` 
                      : typeof placementData.highestSalary === 'string' 
                        ? placementData.highestSalary 
                        : 'N/A'}
                  </div>
                  <div className="text-gray-600">Highest Package</div>
                </div>
                <div>
                  <div className="font-medium text-purple-600">
                    {typeof placementData.overallPlacementRate === 'string' 
                      ? placementData.overallPlacementRate 
                      : typeof placementData.overallPlacementRate === 'number' 
                        ? `${placementData.overallPlacementRate}%` 
                        : 'N/A'}
                  </div>
                  <div className="text-gray-600">Placement Rate</div>
                </div>
                <div>
                  <div className="font-medium text-orange-600">
                    {typeof placementData.companiesVisited === 'number' 
                      ? placementData.companiesVisited.toString() 
                      : placementData.companiesVisited || 'N/A'}
                  </div>
                  <div className="text-gray-600">Companies</div>
                </div>
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
          {showCourses && institute.courses.length > 0 && (
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
            <Button asChild size="sm" className="flex-1">
              <Link href={`/recommendation-collections/${institute.slug}`}>
                View Details
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={institute.contact.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Website
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default variant
  const placementData = getPlacementData()
  
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link 
              href={`/recommendation-collections/${institute.slug}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {institute.name}
            </Link>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{institute.location.city}, {institute.location.state}</span>
              <span className="text-gray-400">•</span>
              <span>Est. {institute.establishedYear}</span>
            </div>
          </div>
          <Badge variant="outline" className="ml-2">
            {institute.type}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-3">
          {getAccreditationBadges().slice(0, 3)}
        </div>
        
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {institute.overview.description}
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4" />
            <span>
              {institute.academics?.totalStudents 
                ? typeof institute.academics.totalStudents === 'number' 
                  ? institute.academics.totalStudents.toLocaleString() 
                  : institute.academics.totalStudents
                : 'N/A'} Students
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <GraduationCap className="h-4 w-4" />
            <span>{institute.academics?.totalPrograms || 'N/A'} Programs</span>
          </div>
        </div>

        {placementData && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-green-600">
                  {typeof placementData.averageSalary === 'number' 
                    ? `₹${placementData.averageSalary.toLocaleString()}` 
                    : typeof placementData.averageSalary === 'string' 
                      ? placementData.averageSalary 
                      : 'N/A'}
                </div>
                <div className="text-gray-600">Average Package</div>
              </div>
              <div>
                <div className="font-medium text-blue-600">
                  {typeof placementData.overallPlacementRate === 'string' 
                    ? placementData.overallPlacementRate 
                    : typeof placementData.overallPlacementRate === 'number' 
                      ? `${placementData.overallPlacementRate}%` 
                      : 'N/A'}
                </div>
                <div className="text-gray-600">Placement Rate</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/recommendation-collections/${institute.slug}`}>
              View Details
            </Link>
          </Button>
          {showCourses && institute.courses.length > 0 && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/recommendation-collections/${institute.slug}/courses`}>
                Courses ({institute.courses.length})
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
