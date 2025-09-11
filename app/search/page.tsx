import { Suspense } from 'react'
import { Metadata } from 'next'
import SearchResults from '@/components/search/SearchResults'

export const metadata: Metadata = {
  title: 'Search Results | CareerBox',
  description: 'Search for institutes, jobs, courses, exams, and people on CareerBox',
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  )
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-muted animate-pulse rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="lg:col-span-3">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
