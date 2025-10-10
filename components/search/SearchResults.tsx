'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Filter, SortAsc, SortDesc, MapPin, Star, Users, Building2, GraduationCap, Briefcase, BookOpen, FileText, Clock, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { SearchFilters, SearchResult, SearchResponse, SEARCH_CATEGORIES, SORT_OPTIONS } from '@/lib/types/search.types'
import { parseSearchQuery, buildSearchQuery } from '@/lib/types/search.types'
import UniversalSearch from './UniversalSearch'
import apiClient from '@/lib/api/client'

export default function SearchResults() {
  const searchParams = useSearchParams()
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<SearchFilters>(() => parseSearchQuery(searchParams || new URLSearchParams()))
  const [showFilters, setShowFilters] = useState(false)
  const [facets, setFacets] = useState<any>({})

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const queryString = buildSearchQuery(filters)
        const response = await apiClient.get(`/api/search?${queryString}`)
        
        if (response.success) {
          const data = response.data as SearchResponse
          setResults(data.results)
          setFacets(data.facets || {})
        } else {
          throw new Error(response.error || 'Failed to fetch search results')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [filters])

  // Update URL when filters change
  useEffect(() => {
    const queryString = buildSearchQuery(filters)
    const newUrl = `/search?${queryString}`
    window.history.replaceState({}, '', newUrl)
  }, [filters])

  // Handle filter changes
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  // Handle search
  const handleSearch = (query: string, searchFilters: any) => {
    setFilters(prev => ({
      ...prev,
      query,
      ...searchFilters,
      page: 1
    }))
  }

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    results.forEach(result => {
      if (!groups[result.category]) {
        groups[result.category] = []
      }
      groups[result.category].push(result)
    })
    return groups
  }, [results])

  // Get result icon
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-5 w-5" />
      case 'business': return <Building2 className="h-5 w-5" />
      case 'institute': return <GraduationCap className="h-5 w-5" />
      case 'job': return <Briefcase className="h-5 w-5" />
      case 'course': return <BookOpen className="h-5 w-5" />
      case 'exam': return <FileText className="h-5 w-5" />
      default: return <Search className="h-5 w-5" />
    }
  }

  // Render result card
  const renderResultCard = (result: SearchResult) => {
    switch (result.type) {
      case 'user':
        return (
          <Card key={result.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  {result.profileImage ? (
                    <img src={result.profileImage} alt={result.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <Users className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{result.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Badge variant="outline">{result.role}</Badge>
                    {result.verified && <Badge variant="default">Verified</Badge>}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{result.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {result.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {result.location}
                  </div>
                )}
                {result.stats?.connections && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {result.stats.connections} connections
                  </div>
                )}
              </div>
              {result.skills && result.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {result.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {result.skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{result.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 'business':
        return (
          <Card key={result.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  {result.logo ? (
                    <img src={result.logo} alt={result.companyName} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{result.companyName}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Badge variant="outline">{result.industry}</Badge>
                    {result.verified && <Badge variant="default">Verified</Badge>}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{result.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {result.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {result.location}
                  </div>
                )}
                {result.stats?.jobPostings && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {result.stats.jobPostings} jobs
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 'job':
        return (
          <Card key={result.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{result.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span>{result.company}</span>
                    <Badge variant="outline">{result.employmentType}</Badge>
                  </CardDescription>
                </div>
                {result.salaryRange && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {result.salaryRange.min} - {result.salaryRange.max} {result.salaryRange.currency}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{result.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {result.location}
                </div>
                {result.applicationDeadline && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Deadline: {new Date(result.applicationDeadline).toLocaleDateString()}
                  </div>
                )}
                {result.stats?.applications && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {result.stats.applications} applications
                  </div>
                )}
              </div>
              {result.skills && result.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {result.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {result.skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{result.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )

      default:
        return (
          <Card key={result.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getResultIcon(result.type)}
                {result.title}
              </CardTitle>
              <CardDescription>{result.description}</CardDescription>
            </CardHeader>
          </Card>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <UniversalSearch
          placeholder="Search institutes, jobs, courses, exams, or people..."
          onSearch={handleSearch}
          showFilters={false}
        />
        
        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">
              {filters.query ? `Results for "${filters.query}"` : 'Search Results'}
            </h1>
            {!loading && (
              <Badge variant="outline">
                {results.length} results
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            
            <Select
              value={filters.sortBy}
              onValueChange={(value) => updateFilter('sortBy', value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h3 className="font-medium mb-3">Category</h3>
                  <div className="space-y-2">
                    {SEARCH_CATEGORIES.map((category) => (
                      <div key={category.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={category.value}
                          checked={filters.category === category.value}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFilter('category', category.value)
                            }
                          }}
                        />
                        <label
                          htmlFor={category.value}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {category.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <h3 className="font-medium mb-3">Location</h3>
                  <Input
                    placeholder="City, State, Country"
                    value={filters.location?.city || ''}
                    onChange={(e) => updateFilter('location', { ...filters.location, city: e.target.value })}
                  />
                </div>

                {/* Skills Filter */}
                {filters.skills && filters.skills.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-1">
                      {filters.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                          <button
                            onClick={() => updateFilter('skills', filters.skills?.filter(s => s !== skill))}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Salary Range Filter */}
                {filters.salary && (
                  <div>
                    <h3 className="font-medium mb-3">Salary Range</h3>
                    <div className="space-y-2">
                      <Slider
                        value={[filters.salary.min || 0, filters.salary.max || 100000]}
                        onValueChange={([min, max]) => updateFilter('salary', { min, max })}
                        max={100000}
                        step={1000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>${filters.salary.min || 0}</span>
                        <span>${filters.salary.max || 100000}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verified Filter */}
                <div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verified"
                      checked={filters.verified || false}
                      onCheckedChange={(checked) => updateFilter('verified', checked)}
                    />
                    <label
                      htmlFor="verified"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Verified only
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        <div className={cn("space-y-4", showFilters ? "lg:col-span-3" : "lg:col-span-4")}>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-destructive">Error: {error}</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : results.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedResults).map(([category, categoryResults]) => (
                <div key={category}>
                  <h2 className="text-lg font-semibold mb-3 capitalize">
                    {category} ({categoryResults.length})
                  </h2>
                  <div className="space-y-4">
                    {categoryResults.map(renderResultCard)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
