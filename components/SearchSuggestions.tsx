"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Building2, MapPin, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchSuggestionsProps {
  placeholder?: string;
  variant?: "header" | "page";
  className?: string;
  inputClassName?: string;
  currentType?: "institutes" | "programs" | "courses";
  onSearch?: (query: string) => void;
  showSearchButton?: boolean;
}

export default function SearchSuggestions({
  placeholder = "Search institutes, programs, courses...",
  variant = "header",
  className = "",
  inputClassName = "",
  currentType = "institutes",
  onSearch,
  showSearchButton = false,
}: SearchSuggestionsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
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
    let type: "institutes" | "programs" | "courses" | undefined;
    if (/(course|courses|degree)\b/.test(lower)) type = "courses";
    else if (/(program|programme|programs|programmes)\b/.test(lower))
      type = "programs";
    else if (
      /(institute|institutes|college|colleges|university|universities)\b/.test(
        lower,
      )
    )
      type = "institutes";
    const cities = extractCities(normalized);
    let query = normalized
      .replace(/\b(in|at|near)\s+.+$/i, "")
      .replace(/\b(best|top|good|top-rated)\b/gi, "")
      .replace(
        /\b(institute|institutes|college|colleges|university|universities|program|programme|programs|programmes|course|courses|degree)\b/gi,
        "",
      )
      .trim();
    return { type, cities, query };
  };
  const buildSearchUrl = (
    rawQuery: string,
    preferredType?: string,
    overrideCities?: string[],
  ) => {
    const parsed = parseQuery(rawQuery);
    const params = new URLSearchParams();
    const finalType = parsed.type || (preferredType as string | undefined);
    if (parsed.query) params.set("q", parsed.query);
    const cities = overrideCities?.length ? overrideCities : parsed.cities;
    if (cities?.length) params.set("city", cities.join(","));
    if (finalType) params.set("type", finalType);
    const suffix = params.toString();
    return suffix
      ? `/recommendation-collections?${suffix}`
      : "/recommendation-collections";
  };
  const buildFallbackSuggestions = (rawQuery: string) => {
    const parsed = parseQuery(rawQuery);
    const fallbacks: any[] = [];
    const baseLabel = parsed.query || rawQuery;
    fallbacks.push({
      resultType: "fallback",
      label: `Search "${baseLabel}"`,
      targetUrl: buildSearchUrl(rawQuery, parsed.type),
    });
    if (parsed.cities?.length) {
      const labelType =
        parsed.type === "programs"
          ? "programs"
          : parsed.type === "courses"
            ? "courses"
            : "institutes";
      const cityLabel = parsed.cities.join(" & ");
      fallbacks.push({
        resultType: "fallback",
        label: `Top ${labelType} in ${cityLabel}`,
        targetUrl: buildSearchUrl(
          `top ${labelType} in ${cityLabel}`,
          parsed.type || "institutes",
          parsed.cities,
        ),
      });
    }
    return fallbacks;
  };

  // Search suggestions with debounce - start after 2 characters
  useEffect(() => {
    // Only fetch if query is at least 2 characters
    if (searchQuery.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsSearching(true);
      try {
        let suggestions: any[] = [];

        if (variant === "page") {
          const typeMap: Record<string, string> = {
            institutes: "institute",
            programs: "programme",
            courses: "course",
          };
          const apiType = typeMap[currentType] || "institute";
          const response = await fetch(
            `/api/search?q=${encodeURIComponent(searchQuery)}&type=${apiType}&limit=5`,
          );
          if (!response.ok) throw new Error("Network response was not ok");
          const result = await response.json();

          if (currentType === "institutes") {
            suggestions = (result.institutes || [])
              .slice(0, 5)
              .map((item: any) => ({
                ...item,
                resultType: "institute",
                location: [item.city, item.state].filter(Boolean).join(", "),
              }));
          } else if (currentType === "programs") {
            suggestions = (result.programmes || [])
              .slice(0, 5)
              .map((item: any) => ({
                ...item,
                resultType: "program",
                location: [item.city, item.state].filter(Boolean).join(", "),
              }));
          } else {
            suggestions = (result.courses || [])
              .slice(0, 5)
              .map((item: any) => ({
                ...item,
                resultType: "course",
                location: [item.city, item.state].filter(Boolean).join(", "),
              }));
          }
        } else {
          const response = await fetch(
            `/api/suggest?q=${encodeURIComponent(searchQuery)}`,
          );
          if (!response.ok) throw new Error("Network response was not ok");
          const result = await response.json();

          const locationSuggestions = (result.locations || [])
            .slice(0, 4)
            .map((loc: any) => ({
              resultType: "location",
              label: `${loc.city}${loc.state ? `, ${loc.state}` : ""}`,
              city: loc.city,
              state: loc.state,
            }));
          const courseSuggestions = (result.courses || [])
            .slice(0, 4)
            .map((item: any) => ({ ...item, resultType: "course" }));
          const programSuggestions = (result.programmes || [])
            .slice(0, 3)
            .map((item: any) => ({ ...item, resultType: "program" }));
          const instituteSuggestions = (result.institutes || [])
            .slice(0, 4)
            .map((item: any) => ({ ...item, resultType: "institute" }));
          suggestions = [
            ...locationSuggestions,
            ...courseSuggestions,
            ...programSuggestions,
            ...instituteSuggestions,
          ];
        }

        const normQ = searchQuery.trim().toLowerCase();
        const score = (item: any) => {
          const text = (
            item.name ||
            item.degree ||
            item.title ||
            item.label ||
            ""
          )
            .toString()
            .toLowerCase();
          if (!text) return 0;
          if (text === normQ) return 1000;
          if (text.startsWith(normQ)) return 800;
          if (text.includes(normQ)) return 600;
          // token overlap
          const qt = normQ.split(/\s+/).filter(Boolean);
          const tt = text.split(/\s+/).filter(Boolean);
          const overlap = qt.filter((t) => tt.includes(t)).length;
          return overlap * 100;
        };
        const sorted = [...suggestions].sort((a, b) => score(b) - score(a));

        const fallbackSuggestions = buildFallbackSuggestions(searchQuery);
        const combined = sorted.length
          ? [...fallbackSuggestions, ...sorted]
          : fallbackSuggestions;
        setSearchSuggestions(combined);
        if (combined.length > 0) {
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSearchSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce 500ms for better performance
    const timer = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, variant, currentType]);

  // Click outside handler to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSuggestions]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const targetUrl = buildSearchUrl(searchQuery, currentType);
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else {
        router.push(targetUrl);
      }
      setShowSuggestions(false);
      if (variant === "header") {
        setSearchQuery("");
      }
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.resultType === "fallback" && suggestion.targetUrl) {
      router.push(suggestion.targetUrl);
      setShowSuggestions(false);
      setSearchQuery("");
      return;
    }
    if (suggestion.resultType === "location" && suggestion.city) {
      const targetUrl = buildSearchUrl(searchQuery, currentType, [
        suggestion.city,
      ]);
      router.push(targetUrl);
      setShowSuggestions(false);
      setSearchQuery("");
      return;
    }

    const query = suggestion.name || suggestion.degree || suggestion.title;
    let url = buildSearchUrl(query, currentType);
    if (suggestion.resultType === "institute" && suggestion.slug) {
      url = `/recommendation-collections/${suggestion.slug}`;
    } else if (
      suggestion.resultType === "program" &&
      suggestion.slug &&
      suggestion.pSlug
    ) {
      url = `/recommendation-collections/${suggestion.slug}?programme=${suggestion.pSlug}`;
    } else if (
      suggestion.resultType === "course" &&
      suggestion.slug &&
      suggestion.pSlug &&
      suggestion.cSlug
    ) {
      url = `/recommendation-collections/${suggestion.slug}?programme=${suggestion.pSlug}&course=${suggestion.cSlug}`;
    }

    router.push(url);
    setShowSuggestions(false);
    setSearchQuery("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setSearchSuggestions([]);
    setShowSuggestions(false);
    if (onSearch) {
      // For page variant, trigger search with empty query to show all results
      onSearch("");
    }
  };

  return (
    <div className={cn("relative", className)} ref={searchContainerRef}>
      <Search
        className={cn(
          "absolute top-1/2 transform -translate-y-1/2 text-gray-400 z-10 pointer-events-none",
          variant === "header" ? "left-3 h-5 w-5" : "left-5 h-6 w-6",
        )}
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        onFocus={() => {
          if (searchQuery.length >= 2 && searchSuggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        className={cn(
          inputClassName,
          variant === "header" ? "pl-10 pr-24" : "pl-14",
        )}
      />

      {/* Clear button */}
      {searchQuery && !isSearching && (
        <button
          onClick={handleClear}
          className={cn(
            "absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors",
            variant === "header" ? "right-24" : "right-5",
          )}
          type="button"
        >
          <X className={cn(variant === "header" ? "h-5 w-5" : "h-5 w-5")} />
        </button>
      )}

      {/* Loading indicator */}
      {isSearching && searchQuery.length >= 2 && (
        <div
          className={cn(
            "absolute top-1/2 transform -translate-y-1/2",
            variant === "header" ? "right-24" : "right-5",
          )}
        >
          <Loader2
            className={cn(
              "animate-spin text-gray-400",
              variant === "header" ? "h-5 w-5" : "h-6 w-6",
            )}
          />
        </div>
      )}

      {/* Autocomplete Suggestions */}
      {showSuggestions && searchSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto z-[999]">
          {searchSuggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSuggestionClick(item);
              }}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-0 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg flex-shrink-0 border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
                  {item.resultType === "fallback" ? (
                    <Search className="h-6 w-6 text-blue-600" />
                  ) : item.resultType === "location" ? (
                    <MapPin className="h-6 w-6 text-teal-600" />
                  ) : item.logo ? (
                    <img
                      src={item.logo}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">
                    {item.resultType === "fallback"
                      ? item.label
                      : item.resultType === "location"
                        ? item.label
                        : item.name || item.degree}
                  </div>
                  {item.resultType !== "fallback" &&
                    item.resultType !== "location" &&
                    item.institute && (
                      <div className="text-sm text-gray-600 truncate mt-0.5">
                        {typeof item.institute === "string"
                          ? item.institute
                          : item.institute.name}
                      </div>
                    )}
                  {item.resultType !== "fallback" &&
                    item.resultType !== "location" &&
                    item.location && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {typeof item.location === "string"
                          ? item.location
                          : `${item.location.city}, ${item.location.state}`}
                      </div>
                    )}
                </div>
                <span
                  className={cn(
                    "text-xs px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0",
                    item.resultType === "fallback"
                      ? "bg-gray-100 text-gray-700"
                      : item.resultType === "location"
                        ? "bg-teal-100 text-teal-700"
                        : item.resultType === "institute"
                          ? "bg-blue-100 text-blue-700"
                          : item.resultType === "program"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700",
                  )}
                >
                  {item.resultType === "fallback"
                    ? "Search"
                    : item.resultType === "location"
                      ? "Location"
                      : item.resultType === "institute"
                        ? "Institute"
                        : item.resultType === "program"
                          ? "Program"
                          : "Course"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {!isSearching &&
        searchQuery.length >= 2 &&
        searchSuggestions.length === 0 &&
        showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-center text-gray-500 text-sm z-[999]">
            No suggestions found. Press Enter to search.
          </div>
        )}
    </div>
  );
}
