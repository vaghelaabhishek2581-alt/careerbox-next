"use client";

import {
  useEffect,
  useState,
  useTransition,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  GraduationCap,
  BookOpen,
  SlidersHorizontal,
  Search,
  MapPin,
  Loader2,
  X,
  Award,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UnifiedFilters } from "@/components/publicCollections/UnifiedFilters";
import { InstituteCard } from "@/components/publicCollections/InstituteCard";
import { ProgramCard } from "@/components/publicCollections/ProgramCard";
import { CourseCard } from "@/components/publicCollections/CourseCard";
import SearchSuggestions from "@/components/SearchSuggestions";

interface RecommendationCollectionsClientProps {
  initialData: any;
  initialType: "institutes" | "programs" | "courses";
  initialParams: {
    city?: string;
    state?: string;
    level?: string;
    programme?: string;
    exam?: string;
    course?: string;
    instituteType?: string;
    query?: string;
    sortBy?: string;
    sortOrder?: string;
    accreditation?: string;
    page?: number;
    limit?: number;
  };
}

export default function RecommendationCollectionsClient({
  initialData,
  initialType,
  initialParams,
}: RecommendationCollectionsClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showFilters, setShowFilters] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Get the correct data array based on type
  const getDataArray = (data: any, type: string) => {
    if (type === "institutes") return data?.institutes || [];
    if (type === "programs") return data?.programmes || [];
    if (type === "courses") return data?.courses || [];
    return [];
  };

  const getItemKey = (item: any, itemType: string, index?: number) => {
    // Use _k if available (from search API)
    if (item?._k) return item._k;

    const base = item?.id || item?._id || item?.slug;
    if (base) {
      return index === undefined
        ? `${itemType}-${base}`
        : `${itemType}-${base}-${index}`;
    }
    const name = item?.name || item?.title || item?.degree;
    const city = item?.city || item?.location?.city;
    const state = item?.state || item?.location?.state;
    if (name || city || state) {
      const fallback = `${itemType}-${name || "item"}-${city || ""}-${state || ""}`;
      return index === undefined ? fallback : `${fallback}-${index}`;
    }
    return `${itemType}-idx-${index ?? 0}`;
  };

  const mergeUniqueByKey = (prev: any[], next: any[], itemType: string) => {
    const seen = new Set<string>();
    const merged: any[] = [];
    const add = (item: any, index?: number) => {
      const key = getItemKey(item, itemType, index);
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    };
    prev.forEach((item, index) => add(item, index));
    next.forEach((item, index) => add(item, prev.length + index));
    return merged;
  };

  const [allData, setAllData] = useState<any[]>(() =>
    getDataArray(initialData, initialType),
  );
  const [data, setData] = useState<any>(initialData);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    () => initialData?.pagination?.page || 1,
  );
  const [hasMore, setHasMore] = useState(() => {
    const hm = initialData?.pagination?.hasMore;
    if (typeof hm === "boolean") return hm;
    if (hm && typeof hm === "object") {
      if (initialType === "institutes") return hm.institutes;
      if (initialType === "programs") return hm.programmes;
      return hm.courses;
    }
    return false;
  });

  const type =
    (searchParams?.get("type") as "institutes" | "programs" | "courses") ||
    initialType;

  const availableFilters = useMemo(() => {
    // Use facets from search API if available
    const facets = data?.facets || {};
    const filterCounts = data?.filterCounts || {};

    const facetToOptions = (facet: any) => {
      if (!facet?.buckets) return [];
      return facet.buckets
        .filter((b: any) => b.count > 0)
        .map((b: any) => ({
          value: b.value,
          label: b.value.charAt(0).toUpperCase() + b.value.slice(1),
          count: b.count,
          selected: b.selected,
        }));
    };

    const toOptions = (counts?: Record<string, number>) =>
      Object.entries(counts || {})
        .sort((a, b) => b[1] - a[1])
        .map(([value, count]) => ({ value, label: value, count }));

    // Derive from facets (search API) or filterCounts (explore API)
    return {
      locations:
        facetToOptions(facets.cities) || toOptions(filterCounts.cities),
      states: facetToOptions(facets.states),
      levels: facetToOptions(facets.levels),
      programmes:
        facetToOptions(facets.programmes) || toOptions(filterCounts.programmes),
      exams: facetToOptions(facets.exams),
      accreditations:
        facetToOptions(facets.accreditations) ||
        toOptions(filterCounts.accreditations),
      facilities: facetToOptions(facets.facilities),
      recruiters: facetToOptions(facets.recruiters),
      types: toOptions(filterCounts.types),
      categories: toOptions(filterCounts.programmes),
      degrees: toOptions(filterCounts.courses),
    };
  }, [data]);

  const city =
    searchParams?.get("city") ||
    searchParams?.get("location") ||
    initialParams.city;
  const state = searchParams?.get("state") || initialParams.state;
  const level = searchParams?.get("level") || initialParams.level;
  const programme =
    searchParams?.get("programme") ||
    searchParams?.get("category") ||
    initialParams.programme;
  const exam = searchParams?.get("exam") || initialParams.exam;
  const course =
    searchParams?.get("course") ||
    searchParams?.get("degree") ||
    initialParams.course;
  const instituteType =
    searchParams?.get("instituteType") || initialParams.instituteType;
  const query = searchParams?.get("q") || initialParams.query;
  const sortBy =
    searchParams?.get("sortBy") || initialParams.sortBy || "relevance";
  const sortOrder =
    searchParams?.get("sortOrder") || initialParams.sortOrder || "desc";
  const accreditation =
    searchParams?.get("accreditation") || initialParams.accreditation;

  const filtersKey = useMemo(
    () =>
      JSON.stringify({
        city: city ?? null,
        state: state ?? null,
        level: level ?? null,
        programme: programme ?? null,
        exam: exam ?? null,
        course: course ?? null,
        instituteType: instituteType ?? null,
        query: query ?? null,
        sortBy,
        sortOrder,
        accreditation: accreditation ?? null,
      }),
    [
      city,
      state,
      level,
      programme,
      exam,
      course,
      instituteType,
      query,
      sortBy,
      sortOrder,
      accreditation,
    ],
  );

  const totalForType = useMemo(() => {
    if (data?.totals) {
      if (type === "institutes") return data.totals.institutes;
      if (type === "programs") return data.totals.programmes;
      return data.totals.courses;
    }
    if (data?.pagination?.total !== undefined) return data.pagination.total;
    return allData.length;
  }, [data, type, allData.length]);

  // Reset when filters change
  useEffect(() => {
    setCurrentPage(initialData?.pagination?.page || 1);
    setAllData(getDataArray(initialData, type));
    setData(initialData);
    const hm = initialData?.pagination?.hasMore;
    if (typeof hm === "boolean") {
      setHasMore(hm);
    } else if (hm && typeof hm === "object") {
      if (type === "institutes") setHasMore(hm.institutes);
      else if (type === "programs") setHasMore(hm.programmes);
      else setHasMore(hm.courses);
    } else {
      setHasMore(false);
    }
  }, [type, filtersKey, initialData]);

  const handleTabChange = (newType: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.set("type", newType);
      router.push(`/recommendation-collections?${params.toString()}`);
    });
  };

  const normalizeQuery = (value: string) => value.trim().replace(/\s+/g, " ");
  const extractCities = (value: string) => {
    const match = value.match(/\b(in|at|near)\s+(.+)$/i);
    if (!match) return [];
    const cityPart = match[2];
    return cityPart
      .split(/,|\band\b|&/i)
      .map((city) => city.trim())
      .filter(Boolean);
  };
  const parseQuery = (value: string) => {
    const normalized = normalizeQuery(value);
    const lower = normalized.toLowerCase();
    let parsedType: "institutes" | "programs" | "courses" | undefined;
    if (/(course|courses|degree)\b/.test(lower)) parsedType = "courses";
    else if (/(program|programme|programs|programmes)\b/.test(lower))
      parsedType = "programs";
    else if (
      /(institute|institutes|college|colleges|university|universities)\b/.test(
        lower,
      )
    )
      parsedType = "institutes";
    const parsedCities = extractCities(normalized);
    let cleanedQuery = normalized
      .replace(/\b(in|at|near)\s+.+$/i, "")
      .replace(/\b(best|top|good|top-rated)\b/gi, "")
      .replace(
        /\b(institute|institutes|college|colleges|university|universities|program|programme|programs|programmes|course|courses|degree)\b/gi,
        "",
      )
      .trim();
    return { parsedType, parsedCities, cleanedQuery };
  };

  const handleSearch = (searchQuery?: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      if (searchQuery) {
        const { parsedType, parsedCities, cleanedQuery } =
          parseQuery(searchQuery);
        if (cleanedQuery) params.set("q", cleanedQuery);
        else params.delete("q");
        if (parsedType) params.set("type", parsedType);
        if (parsedCities?.length) params.set("city", parsedCities.join(","));
      } else {
        params.delete("q");
      }
      params.delete("page");
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
      { threshold: 0.1, rootMargin: "100px" },
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
  }, [hasMore, isLoadingMore, isPending, currentPage]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const typeMap: Record<string, string> = {
        institutes: "institute",
        programs: "programme",
        courses: "course",
      };

      const apiParams = new URLSearchParams();
      if (query) apiParams.set("q", query);
      if (city) apiParams.set("city", city);
      if (state) apiParams.set("state", state);
      if (level) apiParams.set("level", level);
      if (programme) apiParams.set("programme", programme);
      if (exam) apiParams.set("exam", exam);
      if (course) apiParams.set("course", course);
      apiParams.set("page", nextPage.toString());
      apiParams.set("limit", (initialParams.limit || 20).toString());

      let endpoint = "/api/search";
      if (type === "institutes" && !query) {
        endpoint = "/api/explore";
        if (instituteType) apiParams.set("type", instituteType);
        if (accreditation) apiParams.set("accreditation", accreditation);
        if (sortBy) apiParams.set("sortBy", sortBy);
        if (sortOrder) apiParams.set("sortOrder", sortOrder);
      } else {
        apiParams.set("type", typeMap[type] || "institute");
      }

      const response = await fetch(`${endpoint}?${apiParams.toString()}`);
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();

      setData(result);
      const newData = getDataArray(result, type);
      setAllData((prev) => mergeUniqueByKey(prev, newData, type));
      setCurrentPage(nextPage);
      const hm = result.pagination?.hasMore;
      if (typeof hm === "boolean") setHasMore(hm);
      else if (hm && typeof hm === "object") {
        if (type === "institutes") setHasMore(hm.institutes);
        else if (type === "programs") setHasMore(hm.programmes);
        else setHasMore(hm.courses);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoadingMore,
    hasMore,
    currentPage,
    type,
    city,
    state,
    level,
    programme,
    exam,
    instituteType,
    course,
    query,
    sortBy,
    sortOrder,
    accreditation,
    initialParams.limit,
  ]);

  // Get active filter count
  const activeFilterCount = [
    query,
    city,
    instituteType,
    programme,
    accreditation,
    course,
    level,
    exam,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 pt-20">
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Hero Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                Education Discovery Platform
              </span>
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {session
                ? `Welcome back, ${session.user?.name?.split(" ")[0]}!`
                : "Find Your Perfect Path"}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover top institutes, programs, and courses tailored to your
              aspirations
            </p>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <SearchSuggestions
                variant="page"
                placeholder="Search for colleges, courses, programs..."
                className="flex-[2]"
                inputClassName="h-14 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500"
                currentType={type}
                onSearch={handleSearch}
              />
              <Button
                onClick={() => handleSearch()}
                disabled={isPending}
                className="whitespace-nowrap h-14 px-10 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
              >
                {isPending ? (
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                ) : (
                  <Search className="h-6 w-6 mr-2" />
                )}
                Search
              </Button>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-700">
                      Active Filters
                    </h3>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 text-xs"
                    >
                      {activeFilterCount}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      router.push("/recommendation-collections");
                    }}
                    className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 h-7"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {query && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200 rounded-full"
                    >
                      <Search className="h-3.5 w-3.5" />"{query}"
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(
                            searchParams?.toString() || "",
                          );
                          params.delete("q");
                          router.push(
                            `/recommendation-collections?${params.toString()}`,
                          );
                        }}
                        className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  )}
                  {level && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200 rounded-full"
                    >
                      <GraduationCap className="h-3.5 w-3.5" />
                      {level}
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(
                            searchParams?.toString() || "",
                          );
                          params.delete("level");
                          router.push(
                            `/recommendation-collections?${params.toString()}`,
                          );
                        }}
                        className="ml-1 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  )}
                  {city?.split(",").map((loc) => (
                    <Badge
                      key={loc}
                      variant="secondary"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200 rounded-full"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      {loc}
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(
                            searchParams?.toString() || "",
                          );
                          const locs = city.split(",").filter((l) => l !== loc);
                          if (locs.length > 0)
                            params.set("city", locs.join(","));
                          else params.delete("city");
                          router.push(
                            `/recommendation-collections?${params.toString()}`,
                          );
                        }}
                        className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  ))}
                  {instituteType?.split(",").map((typ) => (
                    <Badge
                      key={typ}
                      variant="secondary"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200 rounded-full"
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      {typ}
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(
                            searchParams?.toString() || "",
                          );
                          const types = instituteType
                            .split(",")
                            .filter((t) => t !== typ);
                          if (types.length > 0)
                            params.set("instituteType", types.join(","));
                          else params.delete("instituteType");
                          router.push(
                            `/recommendation-collections?${params.toString()}`,
                          );
                        }}
                        className="ml-1 hover:bg-orange-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  ))}
                  {programme?.split(",").map((cat) => (
                    <Badge
                      key={cat}
                      variant="secondary"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 border border-teal-200 rounded-full"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      {cat}
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(
                            searchParams?.toString() || "",
                          );
                          const cats = programme
                            .split(",")
                            .filter((c) => c !== cat);
                          if (cats.length > 0)
                            params.set("programme", cats.join(","));
                          else params.delete("programme");
                          router.push(
                            `/recommendation-collections?${params.toString()}`,
                          );
                        }}
                        className="ml-1 hover:bg-teal-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  ))}
                  {accreditation?.split(",").map((acc) => (
                    <Badge
                      key={acc}
                      variant="secondary"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200 rounded-full"
                    >
                      <Award className="h-3.5 w-3.5" />
                      NAAC {acc}
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(
                            searchParams?.toString() || "",
                          );
                          const accs = accreditation
                            .split(",")
                            .filter((a) => a !== acc);
                          if (accs.length > 0)
                            params.set("accreditation", accs.join(","));
                          else params.delete("accreditation");
                          router.push(
                            `/recommendation-collections?${params.toString()}`,
                          );
                        }}
                        className="ml-1 hover:bg-yellow-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {data?.totals && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {data.totals.institutes?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-500">Institutes</div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {data.totals.programmes?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-500">Programs</div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {data.totals.courses?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-500">Courses</div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            <aside
              className={`lg:w-80 flex-shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}
            >
              <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
                {data && (
                  <UnifiedFilters
                    currentType={type}
                    currentLocation={city}
                    currentInstituteType={instituteType}
                    currentCategory={programme}
                    currentDegree={course}
                    currentAccreditation={accreditation}
                    sortBy={sortBy}
                    availableFilters={availableFilters}
                  />
                )}
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <div className="space-y-6">
                {/* Tabs Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <Tabs
                      value={type}
                      onValueChange={handleTabChange}
                      className="w-full sm:w-auto"
                    >
                      <TabsList className="grid w-full sm:w-auto grid-cols-3 gap-1 bg-gray-100 p-1 rounded-lg">
                        <TabsTrigger
                          value="institutes"
                          className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2"
                        >
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium">Institutes</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="programs"
                          className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2"
                        >
                          <GraduationCap className="h-4 w-4" />
                          <span className="font-medium">Programs</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="courses"
                          className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2"
                        >
                          <BookOpen className="h-4 w-4" />
                          <span className="font-medium">Courses</span>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="lg:hidden"
                      >
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                        {activeFilterCount > 0 && (
                          <Badge
                            variant="secondary"
                            className="ml-2 bg-blue-100 text-blue-700"
                          >
                            {activeFilterCount}
                          </Badge>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Results Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">
                      {query ? `Results for "${query}"` : "Discover Your Path"}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                    <span className="font-semibold text-gray-900">
                      {totalForType?.toLocaleString() || 0}
                    </span>{" "}
                    {type} found
                  </p>
                </div>

                {/* Loading Skeleton */}
                {isPending && (
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <Skeleton className="h-16 w-16 rounded-xl" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        </div>
                        <div className="flex gap-2 mb-3">
                          <Skeleton className="h-6 w-20 rounded-full" />
                          <Skeleton className="h-6 w-24 rounded-full" />
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Content List */}
                {!isPending && allData.length > 0 && (
                  <>
                    <div className="space-y-4">
                      {type === "institutes" &&
                        allData.map((institute: any, index: number) => (
                          <InstituteCard
                            key={getItemKey(institute, "institutes", index)}
                            institute={institute}
                            variant="detailed"
                            showCourses={true}
                          />
                        ))}

                      {type === "programs" &&
                        allData.map((program: any, index: number) => (
                          <ProgramCard
                            key={getItemKey(program, "programs", index)}
                            program={program}
                            variant="compact"
                          />
                        ))}

                      {type === "courses" &&
                        allData.map((course: any, index: number) => (
                          <CourseCard
                            key={getItemKey(course, "courses", index)}
                            course={course}
                            variant="compact"
                          />
                        ))}
                    </div>

                    {/* Infinite Scroll Trigger */}
                    <div
                      ref={loadMoreRef}
                      className="h-20 flex items-center justify-center"
                    >
                      {isLoadingMore && (
                        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-100">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                          <span className="text-gray-600 font-medium">
                            Loading more {type}...
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Results Summary */}
                    <div className="text-center py-6">
                      <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100">
                        <span className="text-gray-600">
                          Showing{" "}
                          <span className="font-bold text-gray-900">
                            {allData.length.toLocaleString()}
                          </span>{" "}
                          of{" "}
                          <span className="font-bold text-gray-900">
                            {totalForType?.toLocaleString() || 0}
                          </span>{" "}
                          {type}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Empty State */}
                {!isPending && allData.length === 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        {type === "institutes" && (
                          <Building2 className="h-10 w-10 text-gray-400" />
                        )}
                        {type === "programs" && (
                          <GraduationCap className="h-10 w-10 text-gray-400" />
                        )}
                        {type === "courses" && (
                          <BookOpen className="h-10 w-10 text-gray-400" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        No {type} found
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Try adjusting your filters or search criteria to find
                        what you're looking for.
                      </p>
                      <Button
                        onClick={() =>
                          router.push(
                            `/recommendation-collections?type=${type}`,
                          )
                        }
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
