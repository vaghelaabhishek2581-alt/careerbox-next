'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { InstituteCard } from './InstituteCard'
import { Institute } from '@/types/institute'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getInstituteRecommendations } from '@/lib/actions/institute-recommendations'

interface InstituteGridProps {
  initialInstitutes: Institute[]
  total: number
  sortBy: string
}

export function InstituteGrid({
  initialInstitutes,
  total,
  sortBy
}: InstituteGridProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [institutes, setInstitutes] = useState<Institute[]>(initialInstitutes)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialInstitutes.length < total)
  const [currentPage, setCurrentPage] = useState(1)
  // Always use list view with detailed cards
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // Load more institutes
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const nextPage = currentPage + 1
      const params = {
        location: searchParams?.get('location') || undefined,
        category: searchParams?.get('category') || undefined,
        type: searchParams?.get('type') || undefined,
        query: searchParams?.get('q') || undefined,
        page: nextPage,
        sortBy: sortBy,
        accreditation: searchParams?.get('accreditation') || undefined,
      }

      const result = await getInstituteRecommendations(params)
      
      if (result.institutes.length > 0) {
        setInstitutes(prev => [...prev, ...result.institutes])
        setCurrentPage(nextPage)
        setHasMore(result.institutes.length === 10 && institutes.length + result.institutes.length < total)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more institutes:', error)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, currentPage, searchParams, sortBy, institutes.length, total])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    observerRef.current.observe(loadMoreRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadMore, hasMore, loading])

  // Reset when search params change
  useEffect(() => {
    setInstitutes(initialInstitutes)
    setCurrentPage(1)
    setHasMore(initialInstitutes.length < total)
  }, [initialInstitutes, total])

  const generateSortUrl = (newSortBy: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('sortBy', newSortBy)
    params.delete('page')
    return `?${params.toString()}`
  }

  if (institutes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">No institutes found</div>
        <p className="text-gray-400">Try adjusting your search criteria or filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {total.toLocaleString()} Institutes Found
          </h2>
          <p className="text-sm text-gray-600">
            Showing {institutes.length} of {total} results
          </p>
        </div>
        
        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => router.push(generateSortUrl(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="popularity">Popularity</option>
            <option value="ranking">Ranking</option>
            <option value="name">Name (A-Z)</option>
            <option value="established">Established Year</option>
          </select>
        </div>
      </div>

      {/* Institute Cards - List Layout with Full Details */}
      <div className="flex flex-col space-y-6">
        {institutes.map((institute) => (
          <InstituteCard
            key={institute.id}
            institute={institute}
            variant="detailed"
            showCourses={true}
          />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading more institutes...</span>
            </div>
          ) : (
            <Button
              onClick={loadMore}
              variant="outline"
              className="px-8 py-2"
            >
              Load More Institutes
            </Button>
          )}
        </div>
      )}

      {/* End of Results */}
      {!hasMore && institutes.length > 0 && (
        <div className="text-center text-sm text-gray-500 py-8 border-t">
          <p>You've reached the end of the results</p>
          <p className="mt-1">{institutes.length} of {total.toLocaleString()} institutes shown</p>
        </div>
      )}
    </div>
  )
}
