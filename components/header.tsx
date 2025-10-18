"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SheetTitle } from "@/components/ui/sheet";
import {
  Menu,
  Phone,
  Mail,
  Home,
  Search,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "./logo";
import UserProfileMenu from "./user-profile-menu";
import Breadcrumb from "./breadcrumb";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Contact", href: "/contact", icon: MessageCircle },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Search suggestions effect
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 1) {
        setSearchSuggestions([]);
        setIsLoadingSuggestions(false);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/recommendation-collections?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
      setSearchQuery("");
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    const query = suggestion.name || suggestion.title;
    let url = `/recommendation-collections?q=${encodeURIComponent(query)}`;
    
    // Add type filter based on result type
    if (suggestion.resultType === 'program') {
      url += '&type=programs';
    } else if (suggestion.resultType === 'course') {
      url += '&type=courses';
    } else {
      url += '&type=institutes';
    }
    
    router.push(url);
    setShowSuggestions(false);
    setSearchQuery("");
  };

  const shouldHideHeader =
    pathname?.startsWith("/auth/") ||
    pathname?.startsWith("/dashboard/");

  if (shouldHideHeader) {
    return null; // Don't show header on auth and dashboard pages
  }

  return (
    <>
      {/* Main Header */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white",
          isScrolled
            ? "bg-white backdrop-blur-lg shadow-xl border-b border-gray-100/80"
            : "bg-transparent"
        )}
      >
      {/* Top Contact Bar */}
      <div className="bg-gray-900 text-white py-2 text-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="h-3 w-3" />
                <span>+91 79 1234 5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-3 w-3" />
                <span>info@careerbox.com</span>
              </div>
            </div>
            <div className="hidden md:block text-xs">
              📍 Ahmedabad, Gujarat, India
            </div>
          </div>
        </div>
      </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group flex-shrink-0">
              <Logo />
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl relative" ref={searchRef}>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search institutes, programs, courses..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch(searchQuery);
                    }
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className={cn(
                    "pl-10 pr-24 py-2 w-full rounded-full border-2 transition-all",
                    isScrolled
                      ? "border-gray-200 focus:border-blue-500"
                      : "border-white/30 bg-white/90 backdrop-blur-sm focus:bg-white focus:border-blue-500"
                  )}
                />
                <Button
                  onClick={() => handleSearch(searchQuery)}
                  disabled={!searchQuery.trim()}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                  Search
                </Button>

                {/* Search Suggestions Dropdown */}
                {showSuggestions && (isLoadingSuggestions || searchSuggestions.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                    {isLoadingSuggestions ? (
                      // Skeleton Loading
                      <>
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="px-4 py-3 border-b border-gray-100 last:border-b-0 animate-pulse">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200" />
                              <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                              </div>
                              <div className="h-5 w-16 bg-gray-200 rounded-full" />
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      // Actual Suggestions
                      searchSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {suggestion.logo ? (
                              <img
                                src={suggestion.logo}
                                alt={suggestion.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {suggestion.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{suggestion.name || suggestion.title}</p>
                              {suggestion.instituteName && (
                                <p className="text-xs text-gray-500 truncate">{suggestion.instituteName}</p>
                              )}
                              {suggestion.location && (
                                <p className="text-xs text-gray-500">{suggestion.location.city}, {suggestion.location.state}</p>
                              )}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                              suggestion.category === 'Institute' ? 'bg-blue-100 text-blue-700' :
                              suggestion.category === 'Program' ? 'bg-purple-100 text-purple-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {suggestion.category || suggestion.type}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 flex-shrink-0">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:scale-105",
                      isActive
                        ? "text-blue-600"
                        : isScrolled
                        ? "text-gray-700 hover:text-blue-600"
                        : "text-gray-800 hover:text-blue-600 hover:bg-white/20 hover:backdrop-blur-sm hover:rounded-lg hover:px-3 hover:py-2 hover:border hover:border-white/30"
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop CTA Buttons or User Profile */}
            <div className="hidden lg:flex items-center space-x-4">
              {status === "authenticated" ? (
                <UserProfileMenu />
              ) : (
                <>
                  <Link href="/auth/signup?mode=signin">
                    <Button
                      variant="ghost"
                      className={cn(
                        "font-medium transition-all duration-200 border",
                        isScrolled
                          ? "text-gray-700 hover:text-blue-600 hover:bg-blue-50 border-gray-200"
                          : "text-gray-800 bg-white/90 hover:bg-white border-white/50 backdrop-blur-sm"
                      )}
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      Get Started Free
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "lg:hidden p-2",
                    isScrolled ? "text-gray-700" : "text-white"
                  )}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] ">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="pb-4 border-b border-gray-200">
                    <Logo />
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col space-y-2">
                    {navigation.map((item) => {
                      const IconComponent = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:bg-blue-50 hover:text-blue-600",
                            isActive ? "text-blue-600" : "text-gray-700"
                          )}
                        >
                          <IconComponent className="h-5 w-5" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    {status === "authenticated" ? (
                      <div className="px-4">
                        <UserProfileMenu />
                      </div>
                    ) : (
                      <>
                        <Link
                          href="/auth/signup?mode=signin"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Button variant="outline" className="w-full">
                            Login
                          </Button>
                        </Link>
                        <Link
                          href="/auth/signup"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                            Get Started Free
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      {/* Breadcrumb */}
      <Breadcrumb />
    </>
  );
}
