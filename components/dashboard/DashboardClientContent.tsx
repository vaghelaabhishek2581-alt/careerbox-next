"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  GraduationCap,
  BookOpen,
  Grid3x3,
  List,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";
import { UnifiedFilters } from "@/components/publicCollections/UnifiedFilters";
import { InstituteCard } from "@/components/publicCollections/InstituteCard";
import { ProgramCard } from "@/components/publicCollections/ProgramCard";
import { CourseCard } from "@/components/publicCollections/CourseCard";
import { getUnifiedRecommendations } from "@/lib/actions/unified-recommendations";

interface DashboardClientContentProps {
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

export function DashboardClientContent({ 
  initialData, 
  initialType,
  initialParams 
}: DashboardClientContentProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [allData, setAllData] = useState<any[]>(initialData[initialType] || []);
  const [data, setData] = useState<any>(initialData);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialData.currentPage < initialData.totalPages);

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
    setAllData(initialData[initialType] || []);
    setData(initialData);
    setHasMore(initialData.currentPage < initialData.totalPages);
  }, [type, location, category, instituteType, degree, query, sortBy, accreditation]);

  const handleTabChange = (newType: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('type', newType);
    router.push(`/dashboard?${params.toString()}`);
  };

  const handleLoadMore = async () => {
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
      setAllData(prev => [...prev, ...(result[type] || [])]);
      setCurrentPage(nextPage);
      setHasMore(nextPage < result.totalPages);
    } catch (error) {
      console.error('Error loading more:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

          {/* Main Content Layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar - Desktop */}
            <aside className={`lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="sticky top-6">
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
                      instituteTypes: [],
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

                    {/* View Mode and Filter Toggle */}
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
                      <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
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
                      </div>
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

                {/* Content Grid/List */}
                {allData.length > 0 && (
                  <>
                    {type === 'institutes' && (
                      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                        {allData.map((institute: any) => (
                          <InstituteCard 
                            key={institute.id} 
                            institute={institute} 
                            variant={viewMode === 'list' ? 'detailed' : 'default'}
                            showCourses={true}
                          />
                        ))}
                      </div>
                    )}

                    {type === 'programs' && (
                      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                        {allData.map((program: any) => (
                          <ProgramCard 
                            key={program.id} 
                            program={program} 
                            variant={viewMode === 'list' ? 'compact' : 'default'}
                          />
                        ))}
                      </div>
                    )}

                    {type === 'courses' && (
                      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                        {allData.map((course: any) => (
                          <CourseCard 
                            key={course.id} 
                            course={course} 
                            variant={viewMode === 'list' ? 'compact' : 'default'}
                          />
                        ))}
                      </div>
                    )}

                    {/* Show More Button */}
                    {hasMore && (
                      <div className="flex justify-center mt-8">
                        <Button
                          onClick={handleLoadMore}
                          disabled={isLoadingMore}
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                        >
                          {isLoadingMore ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Loading More...
                            </>
                          ) : (
                            <>
                              Show More {type}
                              <ChevronRight className="h-5 w-5 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Results Summary */}
                    {data && (
                      <div className="text-center text-sm text-gray-600 mt-6">
                        Showing {allData.length} of {data.total} {type}
                      </div>
                    )}
                  </>
                )}

                {/* Empty State */}
                {allData.length === 0 && (
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
                        onClick={() => router.push(`/dashboard?type=${type}`)}
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
  );
}
