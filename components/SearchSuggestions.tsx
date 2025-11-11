"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Building2, MapPin, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUnifiedRecommendations } from "@/lib/actions/unified-recommendations";

interface SearchSuggestionsProps {
  placeholder?: string;
  variant?: 'header' | 'page';
  className?: string;
  inputClassName?: string;
  currentType?: 'institutes' | 'programs' | 'courses';
  onSearch?: (query: string) => void;
  showSearchButton?: boolean;
}

export default function SearchSuggestions({
  placeholder = "Search institutes, programs, courses...",
  variant = 'header',
  className = "",
  inputClassName = "",
  currentType = 'institutes',
  onSearch,
  showSearchButton = false,
}: SearchSuggestionsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

        if (variant === 'page') {
          // Page variant: Only search current type for better performance
          const result = await getUnifiedRecommendations({ 
            type: currentType, 
            query: searchQuery, 
            page: 1 
          });
          
          if (currentType === 'institutes') {
            suggestions = (result.institutes || []).slice(0, 5).map((item: any) => ({ ...item, resultType: 'institute' }));
          } else if (currentType === 'programs') {
            suggestions = (result.programs || []).slice(0, 5).map((item: any) => ({ ...item, resultType: 'program' }));
          } else {
            suggestions = (result.courses || []).slice(0, 5).map((item: any) => ({ ...item, resultType: 'course' }));
          }
        } else {
          // Header variant: Search all types (multi-type search)
          const [instituteResult, programResult, courseResult] = await Promise.all([
            getUnifiedRecommendations({ type: 'institutes', query: searchQuery, page: 1 }),
            getUnifiedRecommendations({ type: 'programs', query: searchQuery, page: 1 }),
            getUnifiedRecommendations({ type: 'courses', query: searchQuery, page: 1 }),
          ]);

          // Combine and limit results (3 institutes, 2 programs, 2 courses)
          suggestions = [
            ...(instituteResult.institutes || []).slice(0, 3).map((item: any) => ({ ...item, resultType: 'institute' })),
            ...(programResult.programs || []).slice(0, 2).map((item: any) => ({ ...item, resultType: 'program' })),
            ...(courseResult.courses || []).slice(0, 2).map((item: any) => ({ ...item, resultType: 'course' })),
          ];
        }

        setSearchSuggestions(suggestions);
        if (suggestions.length > 0) {
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
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
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else {
        router.push(`/recommendation-collections?q=${encodeURIComponent(searchQuery.trim())}`);
      }
      setShowSuggestions(false);
      if (variant === 'header') {
        setSearchQuery("");
      }
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    const query = suggestion.name || suggestion.degree || suggestion.title;
    let url = `/recommendation-collections?q=${encodeURIComponent(query)}`;

    // Add type filter based on result type
    if (suggestion.resultType === 'program') {
      url += '&type=programs';
    } else if (suggestion.resultType === 'course') {
      url += '&type=courses';
    } else {
      url += '&type=institutes';
    }

    // Always navigate to switch tabs properly (both header and page variants)
    router.push(url);
    setShowSuggestions(false);
    setSearchQuery("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
      <Search className={cn(
        "absolute top-1/2 transform -translate-y-1/2 text-gray-400",
        variant === 'header' ? "left-3 h-5 w-5" : "left-5 h-6 w-6"
      )} />
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
          variant === 'header' ? "pl-10 pr-24" : "pl-14"
        )}
      />

      {/* Clear button */}
      {searchQuery && !isSearching && (
        <button
          onClick={handleClear}
          className={cn(
            "absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors",
            variant === 'header' ? "right-24" : "right-5"
          )}
          type="button"
        >
          <X className={cn(
            variant === 'header' ? "h-5 w-5" : "h-5 w-5"
          )} />
        </button>
      )}

      {/* Loading indicator */}
      {isSearching && searchQuery.length >= 2 && (
        <div className={cn(
          "absolute top-1/2 transform -translate-y-1/2",
          variant === 'header' ? "right-24" : "right-5"
        )}>
          <Loader2 className={cn(
            "animate-spin text-gray-400",
            variant === 'header' ? "h-5 w-5" : "h-6 w-6"
          )} />
        </div>
      )}

      {/* Autocomplete Suggestions */}
      {showSuggestions && searchSuggestions.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto z-[999]"
        >
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
                {/* Logo or placeholder */}
                <div className="w-12 h-12 rounded-lg flex-shrink-0 border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
                  {item.logo ? (
                    <img src={item.logo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">
                    {item.name || item.degree}
                  </div>
                  {item.institute && (
                    <div className="text-sm text-gray-600 truncate mt-0.5">
                      {item.institute.name}
                    </div>
                  )}
                  {item.location && (
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.location.city}, {item.location.state}
                    </div>
                  )}
                </div>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0",
                  item.resultType === 'institute' ? 'bg-blue-100 text-blue-700' :
                  item.resultType === 'program' ? 'bg-purple-100 text-purple-700' :
                  'bg-green-100 text-green-700'
                )}>
                  {item.resultType === 'institute' ? 'Institute' :
                   item.resultType === 'program' ? 'Program' : 'Course'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {!isSearching && searchQuery.length >= 2 && searchSuggestions.length === 0 && showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-center text-gray-500 text-sm z-[999]">
          No suggestions found. Press Enter to search.
        </div>
      )}
    </div>
  );
}
