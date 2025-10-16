'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Search, MapPin, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/use-debounce'

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
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 250);
  const debouncedLocation = useDebounce(location, 250);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const locationContainerRef = useRef<HTMLDivElement | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    if (location.trim()) params.set('location', location.trim())
    if (currentType) params.set('type', currentType)
    
    router.push(`/recommendation-collections?${params.toString()}`)
  }

  // Fetch suggestions (debounced)
  useEffect(() => {
    let abort = false
    const run = async () => {
      const q = debouncedQuery.trim()
      if (q.length < 2) {
        setSuggestions([])
        setOpen(false)
        return
      }
      try {
        setLoading(true)
        const res = await fetch('/api/search/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q }),
        })
        if (!res.ok) throw new Error('Failed to fetch suggestions')
        const data = await res.json()
        if (!abort) {
          setSuggestions(data.suggestions || [])
          setOpen(true)
        }
      } catch (err) {
        if (!abort) {
          setSuggestions([])
          setOpen(false)
        }
      } finally {
        if (!abort) setLoading(false)
      }
    }
    run()
    return () => {
      abort = true
    }
  }, [debouncedQuery]);

  // Fetch location suggestions (debounced)
  useEffect(() => {
    let abort = false;
    const run = async () => {
      const loc = debouncedLocation.trim();
      if (loc.length < 2) {
        setLocationSuggestions([]);
        setLocationOpen(false);
        return;
      }
      try {
        setLocationLoading(true);
        const res = await fetch('/api/search/location-suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: loc }),
        });
        if (!res.ok) throw new Error('Failed to fetch location suggestions');
        const data = await res.json();
        if (!abort) {
          setLocationSuggestions(data.suggestions || []);
          setLocationOpen(true);
        }
      } catch (err) {
        if (!abort) {
          setLocationSuggestions([]);
          setLocationOpen(false);
        }
      } finally {
        if (!abort) setLocationLoading(false);
      }
    };
    run();
    return () => { abort = true; };
  }, [debouncedLocation]);

  // Hide suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Hide location suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationContainerRef.current && !locationContainerRef.current.contains(e.target as Node)) {
        setLocationOpen(false);
      }
    };
    if (locationOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [locationOpen]);

  const applySuggestion = (s: any) => {
    // Fill input with a sensible text before navigating
    if (s.type === 'course' && s.instituteName) {
      setSearchQuery(s.instituteName)
    } else {
      setSearchQuery(s.label || '')
    }
    setOpen(false)
    // Navigate using the normal search submit behavior
    const params = new URLSearchParams()
    if (s.type === 'institute' && s.slug) {
      // bias the search towards the exact institute label
      params.set('q', s.label)
    } else if (s.type === 'course') {
      // When selecting a course suggestion, show that institute in results
      // by searching using the institute name
      if (s.instituteName) {
        params.set('q', s.instituteName)
      } else if (s.instituteSlug) {
        // fallback: use slug text if name missing
        params.set('q', s.instituteSlug.replace(/-/g, ' '))
      } else if (s.courseName) {
        // last resort
        params.set('q', s.courseName)
      }
    } else if (searchQuery.trim()) {
      params.set('q', searchQuery.trim())
    }
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search Query */}
              <div className="relative md:col-span-2" ref={containerRef}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search institutes, courses, or specializations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                />

                {/* Suggestions dropdown */}
                {open && (suggestions.length > 0 || loading) && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-72 overflow-auto">
                    {loading && (
                      <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                    )}
                    {!loading && suggestions.length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500">No suggestions</div>
                    )}
                    {!loading && suggestions.map((s: any, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applySuggestion(s)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50"
                      >
                        <div className="text-sm text-gray-900">{s.label}</div>
                        <div className="text-xs text-gray-500">
                          {s.type === 'course' ? 'Course' : 'Institute'} {s.source ? `• ${s.source}` : ''}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="relative md:col-span-2" ref={locationContainerRef}>
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="City, State (e.g., Mumbai, Delhi)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                />
                {/* Location Suggestions dropdown */}
                {locationOpen && (locationSuggestions.length > 0 || locationLoading) && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-72 overflow-auto">
                    {locationLoading && <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>}
                    {!locationLoading && locationSuggestions.length === 0 && <div className="px-3 py-2 text-sm text-gray-500">No suggestions</div>}
                    {!locationLoading && locationSuggestions.map((loc: string, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => { setLocation(loc); setLocationOpen(false); }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50"
                      >
                        <div className="text-sm text-gray-900">{loc}</div>
                      </button>
                    ))}
                  </div>
                )}
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
