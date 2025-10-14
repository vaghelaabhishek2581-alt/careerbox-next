'use client'

import React, { useState } from 'react'
import { Programme } from '@/types/institute'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BookOpen,
  Clock,
  Users,
  Award,
  TrendingUp,
  CreditCard,
  GraduationCap,
  X,
  Plus
} from 'lucide-react'

interface ProgrammesSectionProps {
  programmes: Programme[]
  onApplyClick: (courseName: string) => void
  autoExpand?: boolean
}

export function ProgrammesSection({ programmes, onApplyClick, autoExpand = false }: ProgrammesSectionProps) {
  const [expandedProgramme, setExpandedProgramme] = useState<string | null>(
    autoExpand && programmes.length > 0 ? programmes[0].name : null
  )

  if (!programmes || programmes.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Programmes ({programmes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {programmes.map((programme) => (
            <div key={programme.id || programme.name} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Programme Header - Clickable */}
              <button
                onClick={() => setExpandedProgramme(expandedProgramme === programme.name ? null : programme.name)}
                className="w-full bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-200 p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{programme.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {programme.course && programme.course.length > 0 && (
                        <Badge className="bg-blue-100 text-blue-700 px-2 py-0.5 text-xs">
                          {programme.course.length} Courses
                        </Badge>
                      )}
                      {programme.placementRating && (
                        <Badge className="bg-green-100 text-green-700 px-2 py-0.5 text-xs">
                          {programme.placementRating}★ Placement
                        </Badge>
                      )}
                      {programme.eligibilityExams && programme.eligibilityExams.length > 0 && (
                        <Badge className="bg-purple-100 text-purple-700 px-2 py-0.5 text-xs">
                          {programme.eligibilityExams.join(', ')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  {expandedProgramme === programme.name ? (
                    <X className="h-5 w-5 text-gray-600" />
                  ) : (
                    <Plus className="h-5 w-5 text-gray-600" />
                  )}
                </div>
              </button>

              {/* Courses List - Expandable */}
              {expandedProgramme === programme.name && programme.course && programme.course.length > 0 && (
                <div className="bg-white p-4 space-y-3">
                  <p className="text-sm text-gray-600 mb-2">
                    {programme.course.length} course{programme.course.length !== 1 ? 's' : ''} available in this programme
                  </p>
                  {programme.course.map((course) => (
                    <div key={course.id} className="bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 border border-blue-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="relative z-10">
                        {/* Course Header */}
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <h4 className="text-base font-bold text-gray-900 mb-2">
                              {course.degree}{course.name && ` in ${course.name}`}
                            </h4>
                            <div className="flex flex-wrap gap-1.5 mb-2">
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

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs"
                              onClick={() => onApplyClick(`${course.degree}${course.name ? ` in ${course.name}` : ''}`)}
                            >
                              Apply Now
                            </Button>
                            {course.brochure && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="border-blue-300 text-blue-600 hover:bg-blue-50 text-xs"
                              >
                                <a href={course.brochure.url} target="_blank" rel="noopener noreferrer">
                                  Brochure
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Course Details Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
                          {course.duration && (
                            <div className="flex items-center gap-2 bg-white/70 rounded-lg p-2 border border-blue-100">
                              <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-gray-500">Duration</div>
                                <div className="font-medium text-gray-700 text-xs">{course.duration}</div>
                              </div>
                            </div>
                          )}
                          {course.totalSeats && (
                            <div className="flex items-center gap-2 bg-white/70 rounded-lg p-2 border border-purple-100">
                              <Users className="h-4 w-4 text-purple-500 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-gray-500">Seats</div>
                                <div className="font-medium text-gray-700 text-xs">{course.totalSeats}</div>
                              </div>
                            </div>
                          )}
                          {course.reviewCount && (
                            <div className="flex items-center gap-2 bg-white/70 rounded-lg p-2 border border-yellow-100">
                              <Award className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-gray-500">Reviews</div>
                                <div className="font-medium text-gray-700 text-xs">{course.reviewCount}</div>
                              </div>
                            </div>
                          )}
                          {course.questionsCount && (
                            <div className="flex items-center gap-2 bg-white/70 rounded-lg p-2 border border-indigo-100">
                              <BookOpen className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-gray-500">Q&A</div>
                                <div className="font-medium text-gray-700 text-xs">{course.questionsCount}</div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Fee and Placement Info */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          {/* Fees Information */}
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
                                    <span className="font-bold text-blue-600 text-sm">₹{course.fees.tuitionFee.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Placement Information */}
                          {course.placements && (course.placements.averagePackage || course.placements.highestPackage || course.placements.placementRate) && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                              <h5 className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                <TrendingUp className="h-3 w-3" />
                                Placements
                              </h5>
                              <div className="space-y-1">
                                {course.placements.averagePackage && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">Average</span>
                                    <span className="font-bold text-green-600 text-sm">₹{course.placements.averagePackage.toLocaleString()}</span>
                                  </div>
                                )}
                                {course.placements.highestPackage && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">Highest</span>
                                    <span className="font-bold text-purple-600 text-sm">₹{course.placements.highestPackage.toLocaleString()}</span>
                                  </div>
                                )}
                                {course.placements.placementRate && (
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
