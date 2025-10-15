'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { InstituteFilterOptions } from '@/types/institute'
import { sortByOptions } from '@/lib/filter-data'
import { MapPin, Building2, Award, X, ListCollapse } from 'lucide-react'

interface InstituteFiltersProps {
  currentLocation?: string;
  currentType?: string;
  currentCategory?: string;
  currentAccreditation?: string;
  sortBy?: string;
  availableFilters: InstituteFilterOptions;
  filterOptions: {
    locations: { label: string; value: string }[];
    types: { label: string; value: string }[];
    categories: { label: string; value: string }[];
    accreditations: { label: string; value: string }[];
  };
}

export function InstituteFilters({
  currentLocation,
  currentType,
  currentCategory,
  currentAccreditation,
  sortBy = 'popularity',
  availableFilters,
  filterOptions
}: InstituteFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    
    if (checked) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Reset to first page when filters change
    params.delete('page')
    
    router.push(`/recommendation-collections?${params.toString()}`)
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.delete('location')
    params.delete('type')
    params.delete('category')
    params.delete('accreditation')
    params.delete('page')
    
    router.push(`/recommendation-collections?${params.toString()}`)
  }

  const hasActiveFilters = currentLocation || currentType || currentCategory || currentAccreditation

  const updateSortBy = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('sortBy', value)
    router.push(`/recommendation-collections?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Sort By */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ListCollapse className="h-4 w-4" />
            Sort by
          </CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="w-full p-2 border rounded-md bg-white"
            value={sortBy}
            onChange={(e) => updateSortBy(e.target.value)}
          >
            {sortByOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

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
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {currentLocation && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {availableFilters.locations.find(l => l.value === currentLocation)?.label}
                  <button
                    onClick={() => updateFilter('location', currentLocation, false)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {currentType && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {availableFilters.types.find(t => t.value === currentType)?.label}
                  <button
                    onClick={() => updateFilter('type', currentType, false)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {currentCategory && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {availableFilters.categories.find(c => c.value === currentCategory)?.label}
                  <button
                    onClick={() => updateFilter('category', currentCategory, false)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {currentAccreditation && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {availableFilters.accreditations.find(a => a.value === currentAccreditation)?.label}
                  <button
                    onClick={() => updateFilter('accreditation', currentAccreditation, false)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filterOptions.locations.map((location) => (
              <div key={location.value} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`location-${location.value}`}
                    checked={currentLocation === location.value}
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
                <span className="text-xs text-gray-500">({availableFilters.locations.find(l => l.value === location.value)?.count || 0})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Institute Type Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            Institute Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filterOptions.types.map((type) => (
              <div key={type.value} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type.value}`}
                    checked={currentType === type.value}
                    onCheckedChange={(checked) => 
                      updateFilter('type', type.value, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`type-${type.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {type.label}
                  </label>
                </div>
                <span className="text-xs text-gray-500">({availableFilters.types.find(t => t.value === type.value)?.count || 0})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filterOptions.categories.map((category) => (
              <div key={category.value} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.value}`}
                    checked={currentCategory === category.value}
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
                <span className="text-xs text-gray-500">({availableFilters.categories.find(c => c.value === category.value)?.count || 0})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accreditation Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-4 w-4" />
            Accreditation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filterOptions.accreditations.map((accreditation) => (
              <div key={accreditation.value} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`accreditation-${accreditation.value}`}
                    checked={currentAccreditation === accreditation.value}
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
                <span className="text-xs text-gray-500">({availableFilters.accreditations.find(a => a.value === accreditation.value)?.count || 0})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
