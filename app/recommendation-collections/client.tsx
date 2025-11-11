"use client";

import { useEffect, useState, useTransition, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  GraduationCap,
  BookOpen,
  Grid3x3,
  List,
  SlidersHorizontal,
  ChevronRight,
  Search,
  MapPin,
  Loader2,
  X,
  Award
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UnifiedFilters } from "@/components/publicCollections/UnifiedFilters";
import { InstituteCard } from "@/components/publicCollections/InstituteCard";
import { ProgramCard } from "@/components/publicCollections/ProgramCard";
import { CourseCard } from "@/components/publicCollections/CourseCard";
import { getUnifiedRecommendations } from "@/lib/actions/unified-recommendations";
import SearchSuggestions from "@/components/SearchSuggestions";

interface RecommendationCollectionsClientProps {
  initialData: any;
  initialType: 'institutes' | 'programs' | 'courses';
  initialParams: {
    location?: string;
    category?: string;
    instituteType?: string;
    degree?: string;
    query?: string;
    sortBy?: string;
    accreditation?: string;
  };
}

export default function RecommendationCollectionsClient({
  initialData,
  initialType,
  initialParams
}: RecommendationCollectionsClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [locationQuery, setLocationQuery] = useState(initialParams.location || '');
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Get the correct data array based on type
  const getDataArray = (data: any, type: string) => {
    if (type === 'institutes') return data.institutes || [];
    if (type === 'programs') return data.programs || [];
    if (type === 'courses') return data.courses || [];
    return [];
  };

  const [allData, setAllData] = useState<any[]>(() => getDataArray(initialData, initialType));
  const [data, setData] = useState<any>(initialData);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(() => initialData.currentPage < initialData.totalPages);

  // Extract search parameters
  const type = (searchParams?.get('type') as 'institutes' | 'programs' | 'courses') || initialType;
  const location = searchParams?.get('location') || initialParams.location;
  const category = searchParams?.get('category') || initialParams.category;
  const instituteType = searchParams?.get('instituteType') || initialParams.instituteType;
  const degree = searchParams?.get('degree') || initialParams.degree;
  const query = searchParams?.get('q') || initialParams.query;
  const sortBy = searchParams?.get('sortBy') || initialParams.sortBy || 'popularity';
  const accreditation = searchParams?.get('accreditation') || initialParams.accreditation;

  // Reset when filters change
  useEffect(() => {
    setCurrentPage(1);
    setAllData(getDataArray(initialData, initialType));
    setData(initialData);
    setHasMore(initialData.currentPage < initialData.totalPages);
  }, [type, location, category, instituteType, degree, query, sortBy, accreditation, initialData, initialType]);

  const handleTabChange = (newType: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.set('type', newType);
      router.push(`/recommendation-collections?${params.toString()}`);
    });
  };

  const handleSearch = (searchQuery?: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      if (searchQuery) params.set('q', searchQuery);
      else params.delete('q');
      if (locationQuery) params.set('location', locationQuery);
      else params.delete('location');
      router.push(`/recommendation-collections?${params.toString()}`);
    });
  };

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || isLoadingMore || isPending) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoadingMore, isPending, currentPage]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const result = await getUnifiedRecommendations({
        type,
        location,
        category,
        instituteType,
        degree,
        query,
        page: nextPage,
        sortBy,
        accreditation,
      });
      setData(result);
      const newData = getDataArray(result, type);
      setAllData(prev => [...prev, ...newData]);
      setCurrentPage(nextPage);
      setHasMore(nextPage < result.totalPages);
    } catch (error) {
      console.error('Error loading more:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, currentPage, type, location, category, instituteType, degree, query, sortBy, accreditation]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Welcome Header - Only for logged-in users */}
          {session && (
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">
                Welcome back, {session.user?.name}!
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover institutes, programs, and courses tailored for you
              </p>
            </div>
          )}

          {/* Search Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <SearchSuggestions
                variant="page"
                placeholder="Search institutes, programs, courses..."
                className="flex-[2]"
                inputClassName="h-14 text-lg"
                currentType={type}
                onSearch={handleSearch}
              />
              <Button onClick={() => handleSearch()} disabled={isPending} className="whitespace-nowrap h-14 px-10 text-lg font-semibold">
                {isPending ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <Search className="h-6 w-6 mr-2" />}
                Search
              </Button>
            </div>

            {/* Active Filters */}
            {(query || location || instituteType || category || accreditation || degree) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Active Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      router.push('/recommendation-collections');
                    }}
                    className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 h-7"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear All Filters
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {query && (
                    <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 border-blue-200">
                      <Search className="h-3 w-3" />
                      Search: {query}
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(searchParams?.toString() || '');
                          params.delete('q');
                          router.push(`/recommendation-collections?${params.toString()}`);
                        }}
                        className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {location?.split(',').map((loc) => (
                    <Badge key={loc} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      <MapPin className="h-3 w-3" />
                      {loc}
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(searchParams?.toString() || '');
                          const locs = location.split(',').filter(l => l !== loc);
                          if (locs.length > 0) params.set('location', locs.join(','));
                          else params.delete('location');
                          router.push(`/recommendation-collections?${params.toString()}`);
                        }}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {instituteType?.split(',').map((typ) => (
                    <Badge key={typ} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      <Building2 className="h-3 w-3" />
                      {typ}
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(searchParams?.toString() || '');
                          const types = instituteType.split(',').filter(t => t !== typ);
                          if (types.length > 0) params.set('instituteType', types.join(','));
                          else params.delete('instituteType');
                          router.push(`/recommendation-collections?${params.toString()}`);
                        }}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {category?.split(',').map((cat) => (
                    <Badge key={cat} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      <BookOpen className="h-3 w-3" />
                      {cat}
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(searchParams?.toString() || '');
                          const cats = category.split(',').filter(c => c !== cat);
                          if (cats.length > 0) params.set('category', cats.join(','));
                          else params.delete('category');
                          router.push(`/recommendation-collections?${params.toString()}`);
                        }}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {degree?.split(',').map((deg) => (
                    <Badge key={deg} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      <GraduationCap className="h-3 w-3" />
                      {deg}
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(searchParams?.toString() || '');
                          const degs = degree.split(',').filter(d => d !== deg);
                          if (degs.length > 0) params.set('degree', degs.join(','));
                          else params.delete('degree');
                          router.push(`/recommendation-collections?${params.toString()}`);
                        }}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {accreditation?.split(',').map((acc) => (
                    <Badge key={acc} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      <Award className="h-3 w-3" />
                      {acc}
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(searchParams?.toString() || '');
                          const accs = accreditation.split(',').filter(a => a !== acc);
                          if (accs.length > 0) params.set('accreditation', accs.join(','));
                          else params.delete('accreditation');
                          router.push(`/recommendation-collections?${params.toString()}`);
                        }}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content Layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar - Desktop with Scrollbar */}
            <aside className={`lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="sticky top-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
                {data && (
                  <UnifiedFilters
                    currentType={type}
                    currentLocation={location}
                    currentInstituteType={instituteType}
                    currentCategory={category}
                    currentDegree={degree}
                    currentAccreditation={accreditation}
                    sortBy={sortBy}
                    availableFilters={data.filters || {
                      locations: [],
                      types: [],
                      categories: [],
                      accreditations: [],
                      degrees: []
                    }}
                  />
                )}
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <div className="space-y-6">
                {/* Header with Tabs and View Controls */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Tabs */}
                    <Tabs value={type} onValueChange={handleTabChange} className="w-full sm:w-auto">
                      <TabsList className="grid w-full sm:w-auto grid-cols-3 gap-2">
                        <TabsTrigger value="institutes" className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>Institutes</span>
                        </TabsTrigger>
                        <TabsTrigger value="programs" className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          <span>Programs</span>
                        </TabsTrigger>
                        <TabsTrigger value="courses" className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          <span>Courses</span>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    {/* Filter Toggle */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="lg:hidden"
                      >
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                      {/* Grid view temporarily disabled */}
                      {/* <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
                        <Button
                          variant={viewMode === 'grid' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('grid')}
                          className="h-8 w-8 p-0"
                        >
                          <Grid3x3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={viewMode === 'list' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('list')}
                          className="h-8 w-8 p-0"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </div> */}
                    </div>
                  </div>
                </div>

                {/* Results Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Discover Your Path
                  </h2>
                  <p className="text-sm text-gray-600">
                    {data.total} {type} found
                  </p>
                </div>

                {/* Loading Skeleton */}
                {isPending && (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <Skeleton className="h-16 w-16 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-5/6 mb-4" />
                        <div className="flex justify-between pt-4 border-t">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Content Grid/List */}
                {!isPending && allData.length > 0 && (
                  <>
                    {type === 'institutes' && (
                      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr' : 'space-y-4'}>
                        {allData.map((institute: any) => (
                          <div key={institute.id} className="h-full">
                            <InstituteCard
                              institute={institute}
                              variant={viewMode === 'list' ? 'detailed' : 'default'}
                              showCourses={true}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {type === 'programs' && (
                      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr' : 'space-y-4'}>
                        {allData.map((program: any) => (
                          <div key={program.id} className="h-full">
                            <ProgramCard
                              program={program}
                              variant={viewMode === 'list' ? 'compact' : 'default'}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {type === 'courses' && (
                      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr' : 'space-y-4'}>
                        {allData.map((course: any) => (
                          <div key={course.id} className="h-full">
                            <CourseCard
                              course={course}
                              variant={viewMode === 'list' ? 'compact' : 'default'}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Infinite Scroll Trigger */}
                    <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                      {isLoadingMore && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Loading more {type}...</span>
                        </div>
                      )}
                    </div>

                    {/* Results Summary */}
                    {data && (
                      <div className="text-center text-sm text-gray-600 mt-6">
                        Showing {allData.length} of {data.total} {type}
                      </div>
                    )}
                  </>
                )}

                {/* Empty State */}
                {!isPending && allData.length === 0 && (
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
                        onClick={() => router.push(`/recommendation-collections?type=${type}`)}
                        variant="outline"
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
