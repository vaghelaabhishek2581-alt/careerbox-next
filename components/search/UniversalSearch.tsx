import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Clock, TrendingUp, Users, Building2, GraduationCap, Briefcase, BookOpen, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { SearchSuggestion, SearchCategory, SEARCH_CATEGORIES } from '@/lib/types/search.types'
import { useSocket } from '@/hooks/use-socket'
import { debounce } from 'lodash'
import apiClient from '@/lib/api/client'

interface UniversalSearchProps {
  placeholder?: string
  className?: string
  showFilters?: boolean
  onSearch?: (query: string, filters: any) => void
}

export default function UniversalSearch({ 
  placeholder = "Search institutes, jobs, courses, exams, or people...",
  className,
  showFilters = true,
  onSearch
}: UniversalSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { socket, isConnected } = useSocket()
  
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [trendingSearches, setTrendingSearches] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all')
  const [isLoading, setIsLoading] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Debounced search suggestions
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      
      if (socket && isConnected) {
        socket.emit('searchSuggestions', searchQuery, (suggestions: SearchSuggestion[]) => {
          setSuggestions(suggestions)
          setIsLoading(false)
        })
      } else {
        // Fallback to API call if socket is not available
        try {
          const response = await apiClient.get(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
          if (response.success) {
            setSuggestions((response.data as any).suggestions || [])
          } else {
            setSuggestions([])
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error)
          setSuggestions([])
        }
        setIsLoading(false)
      }
    }, 300),
    [socket, isConnected]
  )

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value)
    debouncedSearch(value)
  }

  // Handle search
  const handleSearch = (searchQuery: string = query, category: SearchCategory = selectedCategory) => {
    if (!searchQuery.trim()) return

    // Save to recent searches
    const newRecentSearches = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(newRecentSearches)
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches))

    // Close suggestions
    setIsOpen(false)

    // Navigate to search results
    const searchUrl = `/search?q=${encodeURIComponent(searchQuery)}&category=${category}`
    router.push(searchUrl)

    // Call onSearch callback if provided
    if (onSearch) {
      onSearch(searchQuery, { category })
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    handleSearch(suggestion.text, suggestion.category as SearchCategory)
  }

  // Handle category change
  const handleCategoryChange = (category: SearchCategory) => {
    setSelectedCategory(category)
    if (query.trim()) {
      handleSearch(query, category)
    }
  }

  // Clear search
  const clearSearch = () => {
    setQuery('')
    setSuggestions([])
    inputRef.current?.focus()
  }

  // Get suggestion icon
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4" />
      case 'business': return <Building2 className="h-4 w-4" />
      case 'institute': return <GraduationCap className="h-4 w-4" />
      case 'job': return <Briefcase className="h-4 w-4" />
      case 'course': return <BookOpen className="h-4 w-4" />
      case 'exam': return <FileText className="h-4 w-4" />
      case 'skill': return <TrendingUp className="h-4 w-4" />
      default: return <Search className="h-4 w-4" />
    }
  }

  // Get category icon
  const getCategoryIcon = (category: SearchCategory) => {
    const categoryData = SEARCH_CATEGORIES.find(c => c.value === category)
    return categoryData?.icon || 'search'
  }

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch()
            } else if (e.key === 'Escape') {
              setIsOpen(false)
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 h-12 text-base"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Suggestions */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
          <CardContent className="p-0">
            <Command>
              <CommandList>
                {/* Recent Searches */}
                {!query && recentSearches.length > 0 && (
                  <CommandGroup heading="Recent Searches">
                    {recentSearches.map((search, index) => (
                      <CommandItem
                        key={index}
                        onSelect={() => handleSearch(search)}
                        className="flex items-center gap-2"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{search}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Trending Searches */}
                {!query && trendingSearches.length > 0 && (
                  <CommandGroup heading="Trending">
                    {trendingSearches.map((search, index) => (
                      <CommandItem
                        key={index}
                        onSelect={() => handleSearch(search)}
                        className="flex items-center gap-2"
                      >
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>{search}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Search Suggestions */}
                {query && (
                  <>
                    {isLoading ? (
                      <CommandEmpty>Searching...</CommandEmpty>
                    ) : suggestions.length > 0 ? (
                      <CommandGroup heading="Suggestions">
                        {suggestions.map((suggestion) => (
                          <CommandItem
                            key={suggestion.id}
                            onSelect={() => handleSuggestionClick(suggestion)}
                            className="flex items-center gap-2"
                          >
                            {getSuggestionIcon(suggestion.type)}
                            <div className="flex-1">
                              <div className="font-medium">{suggestion.text}</div>
                              {suggestion.category && (
                                <div className="text-sm text-muted-foreground capitalize">
                                  {suggestion.category}
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {suggestion.type}
                            </Badge>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ) : (
                      <CommandEmpty>No suggestions found</CommandEmpty>
                    )}

                    {/* Search All */}
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => handleSearch(query)}
                        className="flex items-center gap-2 font-medium"
                      >
                        <Search className="h-4 w-4" />
                        <span>Search for "{query}"</span>
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}

                {/* Category Filters */}
                {showFilters && (
                  <CommandGroup heading="Search Categories">
                    {SEARCH_CATEGORIES.map((category) => (
                      <CommandItem
                        key={category.value}
                        onSelect={() => handleCategoryChange(category.value as SearchCategory)}
                        className={cn(
                          "flex items-center gap-2",
                          selectedCategory === category.value && "bg-accent"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{category.label}</span>
                          {selectedCategory === category.value && (
                            <Badge variant="default" className="text-xs">Selected</Badge>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </CardContent>
        </Card>
      )}

      {/* Category Pills */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {SEARCH_CATEGORIES.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(category.value as SearchCategory)}
              className="text-xs"
            >
              {category.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
