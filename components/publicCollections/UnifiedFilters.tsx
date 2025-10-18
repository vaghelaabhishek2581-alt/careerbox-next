'use client'

import React, { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { MapPin, Building2, Award, X, BookOpen, GraduationCap, Loader2, Search } from 'lucide-react'

interface FilterOptions {
  locations: { value: string; label: string; count: number }[]
  types: { value: string; label: string; count: number }[]
  categories: { value: string; label: string; count: number }[]
  accreditations: { value: string; label: string; count: number }[]
  degrees: { value: string; label: string; count: number }[]
}

interface UnifiedFiltersProps {
  currentType?: 'institutes' | 'programs' | 'courses'
  currentLocation?: string
  currentInstituteType?: string
  currentCategory?: string
  currentAccreditation?: string
  currentDegree?: string
  sortBy?: string
  availableFilters: FilterOptions
}

export function UnifiedFilters({
  currentType = 'institutes',
  currentLocation,
  currentInstituteType,
  currentCategory,
  currentAccreditation,
  currentDegree,
  sortBy = 'popularity',
  availableFilters
}: UnifiedFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [locationSearch, setLocationSearch] = useState('')
  const [typeSearch, setTypeSearch] = useState('')
  const [categorySearch, setCategorySearch] = useState('')
  const [degreeSearch, setDegreeSearch] = useState('')

  const updateFilter = (key: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    const currentValues = params.get(key)?.split(',').filter(Boolean) || []

    let newValues: string[]
    if (checked) {
      newValues = [...new Set([...currentValues, value])]
    } else {
      newValues = currentValues.filter((v) => v !== value)
    }

    if (newValues.length > 0) {
      params.set(key, newValues.join(','))
    } else {
      params.delete(key)
    }

    params.delete('page')
    
    startTransition(() => {
      router.push(`/recommendation-collections?${params.toString()}`)
    })
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.delete('location')
    params.delete('instituteType')
    params.delete('category')
    params.delete('accreditation')
    params.delete('degree')
    params.delete('page')
    
    startTransition(() => {
      router.push(`/recommendation-collections?${params.toString()}`)
    })
  }

  const activeLocations = currentLocation?.split(',').filter(Boolean) || []
  const activeTypes = currentInstituteType?.split(',').filter(Boolean) || []
  const activeCategories = currentCategory?.split(',').filter(Boolean) || []
  const activeAccreditations = currentAccreditation?.split(',').filter(Boolean) || []
  const activeDegrees = currentDegree?.split(',').filter(Boolean) || []

  const hasActiveFilters = 
    activeLocations.length > 0 || 
    activeTypes.length > 0 || 
    activeCategories.length > 0 || 
    activeAccreditations.length > 0 ||
    activeDegrees.length > 0

  return (
    <div className="space-y-6 relative">
      {/* Loading Overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Updating filters...</span>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {hasActiveFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Active Filters</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                disabled={isPending}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {activeLocations.map(loc => (
                <Badge key={loc} variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {availableFilters.locations.find(l => l.value === loc)?.label || loc}
                  <button
                    onClick={() => updateFilter('location', loc, false)}
                    disabled={isPending}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              
              {activeTypes.map(typ => (
                <Badge key={typ} variant="secondary" className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {availableFilters.types.find(t => t.value === typ)?.label || typ}
                  <button
                    onClick={() => updateFilter('instituteType', typ, false)}
                    disabled={isPending}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              
              {activeCategories.map(cat => (
                <Badge key={cat} variant="secondary" className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {availableFilters.categories.find(c => c.value === cat)?.label || cat}
                  <button
                    onClick={() => updateFilter('category', cat, false)}
                    disabled={isPending}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              
              {activeAccreditations.map(acc => (
                <Badge key={acc} variant="secondary" className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {availableFilters.accreditations.find(a => a.value === acc)?.label || acc}
                  <button
                    onClick={() => updateFilter('accreditation', acc, false)}
                    disabled={isPending}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}

              {activeDegrees.map(deg => (
                <Badge key={deg} variant="secondary" className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  {availableFilters.degrees.find(d => d.value === deg)?.label || deg}
                  <button
                    onClick={() => updateFilter('degree', deg, false)}
                    disabled={isPending}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Filter */}
      {availableFilters.locations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search locations..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {availableFilters.locations
                .filter(loc => loc.label && loc.label.toLowerCase().includes(locationSearch.toLowerCase()))
                .map((location) => (
                <div key={location.value} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`location-${location.value}`}
                      checked={activeLocations.includes(location.value)}
                      disabled={isPending}
                      onCheckedChange={(checked) => 
                        updateFilter('location', location.value, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`location-${location.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {location.label}
                    </label>
                  </div>
                  <span className="text-xs text-gray-500">({location.count})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Institute Type Filter */}
      {currentType === 'institutes' && availableFilters.types.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Institute Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search types..."
                  value={typeSearch}
                  onChange={(e) => setTypeSearch(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {availableFilters.types
                .filter(t => t.label && t.label.toLowerCase().includes(typeSearch.toLowerCase()))
                .map((type) => (
                <div key={type.value} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type.value}`}
                      checked={activeTypes.includes(type.value)}
                      disabled={isPending}
                      onCheckedChange={(checked) => 
                        updateFilter('instituteType', type.value, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`type-${type.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {type.label}
                    </label>
                  </div>
                  <span className="text-xs text-gray-500">({type.count})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      {availableFilters.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4" />
              Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {availableFilters.categories
                .filter(cat => cat.label && cat.label.toLowerCase().includes(categorySearch.toLowerCase()))
                .map((category) => (
                <div key={category.value} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.value}`}
                      checked={activeCategories.includes(category.value)}
                      disabled={isPending}
                      onCheckedChange={(checked) => 
                        updateFilter('category', category.value, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`category-${category.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category.label}
                    </label>
                  </div>
                  <span className="text-xs text-gray-500">({category.count})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Degree Filter (for courses) */}
      {(currentType === 'courses' || currentType === 'programs') && availableFilters.degrees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4" />
              Degree
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search degrees..."
                  value={degreeSearch}
                  onChange={(e) => setDegreeSearch(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {availableFilters.degrees
                .filter(deg => deg.label && deg.label.toLowerCase().includes(degreeSearch.toLowerCase()))
                .map((degree) => (
                <div key={degree.value} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`degree-${degree.value}`}
                      checked={activeDegrees.includes(degree.value)}
                      disabled={isPending}
                      onCheckedChange={(checked) => 
                        updateFilter('degree', degree.value, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`degree-${degree.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {degree.label}
                    </label>
                  </div>
                  <span className="text-xs text-gray-500">({degree.count})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accreditation Filter */}
      {availableFilters.accreditations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-4 w-4" />
              Accreditation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableFilters.accreditations.map((accreditation) => (
                <div key={accreditation.value} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`accreditation-${accreditation.value}`}
                      checked={activeAccreditations.includes(accreditation.value)}
                      disabled={isPending}
                      onCheckedChange={(checked) => 
                        updateFilter('accreditation', accreditation.value, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`accreditation-${accreditation.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {accreditation.label}
                    </label>
                  </div>
                  <span className="text-xs text-gray-500">({accreditation.count})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
