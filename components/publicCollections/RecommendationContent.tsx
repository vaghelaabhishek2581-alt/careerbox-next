'use client'

import React, { useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { InstituteCard } from './InstituteCard'
import { ProgramCard } from './ProgramCard'
import { CourseCard } from './CourseCard'
import { LoadingSkeleton } from './LoadingSkeleton'
import { Building2, BookOpen, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react'
import type { UnifiedSearchResult } from '@/lib/actions/unified-recommendations'

interface RecommendationContentProps {
  type: 'institutes' | 'programs' | 'courses'
  data: UnifiedSearchResult
  query?: string
  location?: string
}

export function RecommendationContent({ 
  type, 
  data, 
  query, 
  location 
}: RecommendationContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleTabChange = (newType: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('type', newType)
    params.delete('page') // Reset to page 1 when changing tabs
    
    startTransition(() => {
      router.push(`/recommendation-collections?${params.toString()}`)
    })
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('page', newPage.toString())
    
    startTransition(() => {
      router.push(`/recommendation-collections?${params.toString()}`)
    })
  }

  const currentPage = data.currentPage
  const totalPages = data.totalPages

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {query ? `Search Results for "${query}"` : 'Discover Your Path'}
            </h1>
            <p className="text-gray-600 mt-1">
              {data.total.toLocaleString()} {type} found
              {location && ` in ${location}`}
            </p>
          </div>
        </div>

        <Tabs value={type} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="institutes" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>Institutes</span>
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Programs</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span>Courses</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Loading State */}
      {isPending && <LoadingSkeleton type={type} count={12} />}

      {/* Content Grid */}
      {!isPending && (
        <>
          {type === 'institutes' && data.institutes && data.institutes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.institutes.map((institute) => (
                <InstituteCard 
                  key={institute.id} 
                  institute={institute} 
                  variant="default"
                  showCourses={true}
                />
              ))}
            </div>
          )}

          {type === 'programs' && data.programs && data.programs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.programs.map((program) => (
                <ProgramCard 
                  key={program.id} 
                  program={program} 
                  variant="default"
                />
              ))}
            </div>
          )}

          {type === 'courses' && data.courses && data.courses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.courses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  variant="default"
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {data.total === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {type === 'institutes' && <Building2 className="h-8 w-8 text-gray-400" />}
                  {type === 'programs' && <BookOpen className="h-8 w-8 text-gray-400" />}
                  {type === 'courses' && <GraduationCap className="h-8 w-8 text-gray-400" />}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No {type} found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search criteria to find what you're looking for.
                </p>
                <Button 
                  onClick={() => {
                    const params = new URLSearchParams()
                    params.set('type', type)
                    router.push(`/recommendation-collections?${params.toString()}`)
                  }}
                  variant="outline"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isPending}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isPending}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isPending}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
