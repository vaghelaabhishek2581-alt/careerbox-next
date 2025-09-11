// lib/types/search.types.ts - Enhanced search and discovery system
import { z } from 'zod'

// ============================================================================
// SEARCH CATEGORIES AND TYPES
// ============================================================================

export type SearchCategory = 'all' | 'users' | 'businesses' | 'institutes' | 'jobs' | 'courses' | 'exams'
export type SearchSortBy = 'relevance' | 'date' | 'rating' | 'salary' | 'distance' | 'popularity'
export type SearchSortOrder = 'asc' | 'desc'

// ============================================================================
// SEARCH FILTER SCHEMAS
// ============================================================================

export const LocationFilterSchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  radius: z.number().min(1).max(1000).optional(), // in kilometers
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number()
  }).optional()
})

export const PriceRangeFilterSchema = z.object({
  min: z.number().min(0).optional(),
  max: z.number().min(0).optional(),
  currency: z.string().default('USD')
})

export const DateRangeFilterSchema = z.object({
  start: z.string().optional(),
  end: z.string().optional()
})

export const ExperienceFilterSchema = z.object({
  min: z.number().min(0).optional(),
  max: z.number().min(0).optional(),
  unit: z.enum(['years', 'months']).default('years')
})

export const RatingFilterSchema = z.object({
  min: z.number().min(0).max(5).optional(),
  max: z.number().min(0).max(5).optional()
})

// ============================================================================
// MAIN SEARCH FILTER SCHEMA
// ============================================================================

export const SearchFiltersSchema = z.object({
  // Basic search
  query: z.string().optional(),
  category: z.enum(['all', 'users', 'businesses', 'institutes', 'jobs', 'courses', 'exams']).default('all'),
  
  // Location filters
  location: LocationFilterSchema.optional(),
  
  // Content filters
  skills: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  jobTypes: z.array(z.string()).optional(),
  courseCategories: z.array(z.string()).optional(),
  examTypes: z.array(z.string()).optional(),
  
  // Experience and salary
  experience: ExperienceFilterSchema.optional(),
  salary: PriceRangeFilterSchema.optional(),
  
  // Date filters
  dateRange: DateRangeFilterSchema.optional(),
  
  // Quality filters
  rating: RatingFilterSchema.optional(),
  verified: z.boolean().optional(),
  
  // Sorting
  sortBy: z.enum(['relevance', 'date', 'rating', 'salary', 'distance', 'popularity']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  
  // Pagination
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
})

// ============================================================================
// SEARCH SUGGESTION SCHEMAS
// ============================================================================

export const SearchSuggestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.enum(['user', 'business', 'institute', 'job', 'course', 'exam', 'skill', 'location', 'industry']),
  category: z.string().optional(),
  popularity: z.number().default(0),
  metadata: z.record(z.any()).optional()
})

export const SearchSuggestionsResponseSchema = z.object({
  suggestions: z.array(SearchSuggestionSchema),
  total: z.number(),
  query: z.string()
})

// ============================================================================
// SEARCH RESULT SCHEMAS
// ============================================================================

export const BaseSearchResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  category: z.string(),
  relevanceScore: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
})

export const UserSearchResultSchema = BaseSearchResultSchema.extend({
  type: z.literal('user'),
  name: z.string(),
  role: z.string(),
  userType: z.string().optional(),
  location: z.string().optional(),
  skills: z.array(z.string()).default([]),
  profileImage: z.string().url().optional(),
  verified: z.boolean().default(false),
  stats: z.object({
    connections: z.number().default(0),
    endorsements: z.number().default(0)
  }).optional()
})

export const BusinessSearchResultSchema = BaseSearchResultSchema.extend({
  type: z.literal('business'),
  companyName: z.string(),
  industry: z.string(),
  location: z.string().optional(),
  size: z.string().optional(),
  logo: z.string().url().optional(),
  verified: z.boolean().default(false),
  stats: z.object({
    jobPostings: z.number().default(0),
    employees: z.number().default(0)
  }).optional()
})

export const InstituteSearchResultSchema = BaseSearchResultSchema.extend({
  type: z.literal('institute'),
  instituteName: z.string(),
  type: z.string(),
  location: z.string().optional(),
  logo: z.string().url().optional(),
  verified: z.boolean().default(false),
  stats: z.object({
    courses: z.number().default(0),
    students: z.number().default(0)
  }).optional()
})

export const JobSearchResultSchema = BaseSearchResultSchema.extend({
  type: z.literal('job'),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  employmentType: z.string(),
  salaryRange: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string()
  }).optional(),
  skills: z.array(z.string()).default([]),
  applicationDeadline: z.date().optional(),
  stats: z.object({
    applications: z.number().default(0)
  }).optional()
})

export const CourseSearchResultSchema = BaseSearchResultSchema.extend({
  type: z.literal('course'),
  title: z.string(),
  institute: z.string(),
  category: z.string(),
  level: z.string(),
  duration: z.number(),
  fee: z.number(),
  currency: z.string(),
  instructor: z.string().optional(),
  stats: z.object({
    enrollments: z.number().default(0),
    rating: z.number().optional()
  }).optional()
})

export const ExamSearchResultSchema = BaseSearchResultSchema.extend({
  type: z.literal('exam'),
  title: z.string(),
  createdBy: z.string(),
  type: z.string(),
  duration: z.number(),
  fee: z.number(),
  examDate: z.date().optional(),
  stats: z.object({
    registrations: z.number().default(0)
  }).optional()
})

export const SearchResultSchema = z.discriminatedUnion('type', [
  UserSearchResultSchema,
  BusinessSearchResultSchema,
  InstituteSearchResultSchema,
  JobSearchResultSchema,
  CourseSearchResultSchema,
  ExamSearchResultSchema
])

// ============================================================================
// SEARCH RESPONSE SCHEMAS
// ============================================================================

export const SearchResponseSchema = z.object({
  results: z.array(SearchResultSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  hasMore: z.boolean(),
  filters: SearchFiltersSchema,
  suggestions: z.array(SearchSuggestionSchema).optional(),
  facets: z.object({
    categories: z.record(z.number()).optional(),
    locations: z.record(z.number()).optional(),
    skills: z.record(z.number()).optional(),
    industries: z.record(z.number()).optional(),
    salaryRanges: z.record(z.number()).optional(),
    experienceRanges: z.record(z.number()).optional()
  }).optional()
})

// ============================================================================
// SEARCH ANALYTICS SCHEMAS
// ============================================================================

export const SearchAnalyticsSchema = z.object({
  query: z.string(),
  category: z.string(),
  resultsCount: z.number(),
  clickThroughRate: z.number().optional(),
  averageTimeOnResults: z.number().optional(),
  filtersUsed: z.array(z.string()).default([]),
  timestamp: z.date()
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SearchFilters = z.infer<typeof SearchFiltersSchema>
export type SearchSuggestion = z.infer<typeof SearchSuggestionSchema>
export type SearchSuggestionsResponse = z.infer<typeof SearchSuggestionsResponseSchema>
export type SearchResult = z.infer<typeof SearchResultSchema>
export type SearchResponse = z.infer<typeof SearchResponseSchema>
export type SearchAnalytics = z.infer<typeof SearchAnalyticsSchema>

export type UserSearchResult = z.infer<typeof UserSearchResultSchema>
export type BusinessSearchResult = z.infer<typeof BusinessSearchResultSchema>
export type InstituteSearchResult = z.infer<typeof InstituteSearchResultSchema>
export type JobSearchResult = z.infer<typeof JobSearchResultSchema>
export type CourseSearchResult = z.infer<typeof CourseSearchResultSchema>
export type ExamSearchResult = z.infer<typeof ExamSearchResultSchema>

// ============================================================================
// SEARCH CONSTANTS
// ============================================================================

export const SEARCH_CATEGORIES = [
  { value: 'all', label: 'All', icon: 'search' },
  { value: 'users', label: 'People', icon: 'users' },
  { value: 'businesses', label: 'Businesses', icon: 'building' },
  { value: 'institutes', label: 'Institutes', icon: 'graduation-cap' },
  { value: 'jobs', label: 'Jobs', icon: 'briefcase' },
  { value: 'courses', label: 'Courses', icon: 'book' },
  { value: 'exams', label: 'Exams', icon: 'file-text' }
] as const

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'date', label: 'Most Recent' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'salary', label: 'Highest Salary' },
  { value: 'distance', label: 'Nearest' },
  { value: 'popularity', label: 'Most Popular' }
] as const

export const SEARCH_DEBOUNCE_MS = 300
export const MIN_SEARCH_LENGTH = 2
export const MAX_SUGGESTIONS = 10
export const DEFAULT_SEARCH_LIMIT = 20
export const MAX_SEARCH_LIMIT = 100

// ============================================================================
// SEARCH UTILITY FUNCTIONS
// ============================================================================

export function buildSearchQuery(filters: SearchFilters): string {
  const params = new URLSearchParams()
  
  if (filters.query) params.set('q', filters.query)
  if (filters.category !== 'all') params.set('category', filters.category)
  if (filters.location?.city) params.set('city', filters.location.city)
  if (filters.location?.state) params.set('state', filters.location.state)
  if (filters.location?.country) params.set('country', filters.location.country)
  if (filters.location?.radius) params.set('radius', filters.location.radius.toString())
  if (filters.skills?.length) params.set('skills', filters.skills.join(','))
  if (filters.industries?.length) params.set('industries', filters.industries.join(','))
  if (filters.experience?.min) params.set('exp_min', filters.experience.min.toString())
  if (filters.experience?.max) params.set('exp_max', filters.experience.max.toString())
  if (filters.salary?.min) params.set('salary_min', filters.salary.min.toString())
  if (filters.salary?.max) params.set('salary_max', filters.salary.max.toString())
  if (filters.rating?.min) params.set('rating_min', filters.rating.min.toString())
  if (filters.verified !== undefined) params.set('verified', filters.verified.toString())
  if (filters.sortBy !== 'relevance') params.set('sort', filters.sortBy)
  if (filters.sortOrder !== 'desc') params.set('order', filters.sortOrder)
  if (filters.page !== 1) params.set('page', filters.page.toString())
  if (filters.limit !== DEFAULT_SEARCH_LIMIT) params.set('limit', filters.limit.toString())
  
  return params.toString()
}

export function parseSearchQuery(searchParams: URLSearchParams): SearchFilters {
  return {
    query: searchParams.get('q') || undefined,
    category: (searchParams.get('category') as SearchCategory) || 'all',
    location: {
      city: searchParams.get('city') || undefined,
      state: searchParams.get('state') || undefined,
      country: searchParams.get('country') || undefined,
      radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : undefined
    },
    skills: searchParams.get('skills')?.split(',').filter(Boolean),
    industries: searchParams.get('industries')?.split(',').filter(Boolean),
    experience: {
      min: searchParams.get('exp_min') ? parseInt(searchParams.get('exp_min')!) : undefined,
      max: searchParams.get('exp_max') ? parseInt(searchParams.get('exp_max')!) : undefined
    },
    salary: {
      min: searchParams.get('salary_min') ? parseInt(searchParams.get('salary_min')!) : undefined,
      max: searchParams.get('salary_max') ? parseInt(searchParams.get('salary_max')!) : undefined
    },
    rating: {
      min: searchParams.get('rating_min') ? parseFloat(searchParams.get('rating_min')!) : undefined
    },
    verified: searchParams.get('verified') === 'true' ? true : searchParams.get('verified') === 'false' ? false : undefined,
    sortBy: (searchParams.get('sort') as SearchSortBy) || 'relevance',
    sortOrder: (searchParams.get('order') as SearchSortOrder) || 'desc',
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : DEFAULT_SEARCH_LIMIT
  }
}
