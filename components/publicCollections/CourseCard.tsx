'use client'

import React from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Clock, 
  GraduationCap, 
  TrendingUp,
  Building2,
  Users,
  IndianRupee,
  Award
} from 'lucide-react'
import type { Course } from '@/types/institute'

interface CourseCardProps {
  course: Course & { 
    institute: { 
      id: string
      name: string
      slug: string
      logo?: string
      location: { city: string; state: string }
    } 
  }
  variant?: 'default' | 'compact'
}

export function CourseCard({ course, variant = 'default' }: CourseCardProps) {
  const nf = new Intl.NumberFormat('en-IN')

  if (variant === 'compact') {
    return (
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-sm hover:scale-[1.01] h-full bg-gradient-to-br from-white to-green-50/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Logo */}
            {course.institute?.logo && (
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-gray-100 shadow-sm group-hover:border-green-200 transition-colors">
                <img 
                  src={course.institute.logo} 
                  alt={course.institute.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              {/* Title */}
              <Link 
                href={course.institute?.slug ? `/recommendation-collections/${course.institute.slug}/courses/${course.slug}` : '#'}
                className="text-base font-bold text-gray-900 hover:text-green-600 transition-colors line-clamp-2 group-hover:text-green-600"
              >
                {course.degree} in {course.name}
              </Link>
              
              {/* Institute */}
              {course.institute && (
                <Link 
                  href={`/recommendation-collections/${course.institute.slug}`}
                  className="flex items-center gap-1 mt-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                >
                  <Building2 className="h-3 w-3" />
                  {course.institute.name}
                </Link>
              )}
              
              {/* Location & Duration */}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                {course.institute?.location && (
                  <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                    <MapPin className="h-3 w-3" />
                    <span>{course.institute.location.city}, {course.institute.location.state}</span>
                  </div>
                )}
                {course.duration && (
                  <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded text-blue-700">
                    <Clock className="h-3 w-3" />
                    <span>{course.duration}</span>
                  </div>
                )}
                {course.level && (
                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">{course.level}</Badge>
                )}
              </div>
              
              {/* Additional Info */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {course.totalSeats && course.totalSeats > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-700 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                    <Users className="h-3 w-3 text-orange-600" />
                    <span className="font-medium">{course.totalSeats} Seats</span>
                  </div>
                )}
                {course.educationType && (
                  <Badge variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {course.educationType}
                  </Badge>
                )}
                {course.category && (
                  <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">
                    {course.category}
                  </Badge>
                )}
              </div>
              
              {/* Placement Stats */}
              {(course.placements?.averagePackage || course.placements?.placementRate) && (
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                  {course.placements.averagePackage && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-blue-600" />
                      <span>Avg: ₹{nf.format(course.placements.averagePackage)}</span>
                    </div>
                  )}
                  {course.placements.placementRate && (
                    <div>
                      Placement: {course.placements.placementRate}%
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Fees & CTA */}
            <div className="flex flex-col items-end gap-3">
              {course.fees?.totalFee && (
                <div className="text-right bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                  <div className="text-xs text-green-600 font-medium">Total Fee</div>
                  <div className="text-base font-bold text-green-700">
                    ₹{nf.format(course.fees.totalFee)}
                  </div>
                  {course.fees.tuitionFee && (
                    <div className="text-xs text-green-600 mt-0.5">
                      Tuition: ₹{nf.format(Number(course.fees.tuitionFee))}
                    </div>
                  )}
                </div>
              )}
              <Button size="sm" asChild className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 whitespace-nowrap h-8 text-xs px-6 shadow-sm hover:shadow-md transition-all">
                <Link href={course.institute?.slug ? `/recommendation-collections/${course.institute.slug}/courses/${course.slug}` : '#'}>
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md group">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {course.institute?.logo && (
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
              <img 
                src={course.institute.logo} 
                alt={course.institute.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <Link 
              href={course.institute?.slug ? `/recommendation-collections/${course.institute.slug}/courses/${course.slug}` : '#'}
              className="text-xl font-bold text-gray-900 hover:text-green-600 transition-colors group-hover:text-green-600"
            >
              {course.degree} {course.name}
            </Link>
            {course.institute && (
              <Link 
                href={`/recommendation-collections/${course.institute.slug}`}
                className="text-sm text-gray-600 hover:text-green-600 transition-colors flex items-center gap-1 mt-1"
              >
                <Building2 className="h-3 w-3" />
                {course.institute.name}
              </Link>
            )}
            {course.institute?.location && (
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <MapPin className="h-3 w-3" />
                <span>{course.institute.location.city}, {course.institute.location.state}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Course Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {course.duration && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{course.duration}</span>
            </div>
          )}
          {course.level && (
            <div className="flex items-center gap-2 text-gray-600">
              <GraduationCap className="h-4 w-4" />
              <span>{course.level}</span>
            </div>
          )}
          {course.totalSeats && (
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-4 w-4" />
              <span>{course.totalSeats} Seats</span>
            </div>
          )}
          {course.category && (
            <div className="flex items-center gap-2 text-gray-600">
              <Award className="h-4 w-4" />
              <span>{course.category}</span>
            </div>
          )}
        </div>

        {/* Fees */}
        {course.fees?.totalFee && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600 mb-1">Total Fee</div>
                <div className="text-2xl font-bold text-green-700 flex items-center gap-1">
                  <IndianRupee className="h-5 w-5" />
                  {nf.format(course.fees.totalFee)}
                </div>
              </div>
              {course.fees.tuitionFee && (
                <div className="text-right">
                  <div className="text-xs text-gray-600 mb-1">Tuition Fee</div>
                  <div className="text-lg font-semibold text-green-600">
                    ₹{nf.format(Number(course.fees.tuitionFee))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Placements */}
        {course.placements && (
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Placement Stats
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {course.placements.averagePackage && (
                <div>
                  <div className="text-xs text-gray-600">Avg Package</div>
                  <div className="font-semibold text-blue-700">
                    ₹{nf.format(course.placements.averagePackage)}
                  </div>
                </div>
              )}
              {course.placements.highestPackage && (
                <div>
                  <div className="text-xs text-gray-600">Highest Package</div>
                  <div className="font-semibold text-blue-700">
                    ₹{nf.format(course.placements.highestPackage)}
                  </div>
                </div>
              )}
              {course.placements.placementRate && (
                <div>
                  <div className="text-xs text-gray-600">Placement Rate</div>
                  <div className="font-semibold text-blue-700">
                    {course.placements.placementRate}%
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Education Type Badge */}
        {course.educationType && (
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {course.educationType}
            </Badge>
          </div>
        )}

        {/* Action Button */}
        <Button asChild size="sm" className="w-full bg-green-600 hover:bg-green-700">
          <Link href={course.institute?.slug ? `/recommendation-collections/${course.institute.slug}/courses/${course.slug}` : '#'}>
            View Details
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
