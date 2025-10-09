'use client'

import React, { useState } from 'react'
import { Search, MapPin, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

interface InstituteSearchHeaderProps {
  totalResults: number
  currentQuery?: string
  currentLocation?: string
  currentType?: string
}

export function InstituteSearchHeader({
  totalResults,
  currentQuery = '',
  currentLocation = '',
  currentType = ''
}: InstituteSearchHeaderProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(currentQuery)
  const [location, setLocation] = useState(currentLocation)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    if (location.trim()) params.set('location', location.trim())
    if (currentType) params.set('type', currentType)
    
    router.push(`/recommendation-collections?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setLocation('')
    router.push('/recommendation-collections')
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header Content */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Find Your Perfect Institute
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Discover top engineering colleges and universities across India with comprehensive details about courses, placements, and rankings.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Query */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search institutes, courses, or specializations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Location */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="City, State (e.g., Mumbai, Delhi)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Search Button */}
              <Button 
                type="submit" 
                className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                <Search className="h-5 w-5 mr-2" />
                Search Institutes
              </Button>
            </div>

            {/* Active Filters & Clear */}
            {(currentQuery || currentLocation || currentType) && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">Active filters:</span>
                
                {currentQuery && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Query: {currentQuery}
                  </span>
                )}
                
                {currentLocation && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Location: {currentLocation}
                  </span>
                )}
                
                {currentType && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Type: {currentType}
                  </span>
                )}
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </form>

        {/* Results Summary */}
        <div className="text-center mt-6">
          <p className="text-blue-100">
            {totalResults > 0 ? (
              <>
                Found <span className="font-semibold text-white">{totalResults.toLocaleString()}</span> institutes
                {currentLocation && ` in ${currentLocation}`}
                {currentQuery && ` matching "${currentQuery}"`}
              </>
            ) : (
              'No institutes found matching your criteria'
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
