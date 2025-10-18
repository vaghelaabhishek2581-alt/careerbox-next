"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "./logo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const popularLocations = [
  "All Locations",
  "Ahmedabad",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Jaipur",
  "Vadodara",
];

export default function PublicExploreHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const [selectedLocation, setSelectedLocation] = useState(
    searchParams?.get('location') || 'All Locations'
  );

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams(searchParams?.toString() || '');
    
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    } else {
      params.delete('q');
    }
    
    if (selectedLocation && selectedLocation !== 'All Locations') {
      params.set('location', selectedLocation);
    } else {
      params.delete('location');
    }
    
    router.push(`/dashboard?${params.toString()}`);
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
    const params = new URLSearchParams(searchParams?.toString() || '');
    
    if (value && value !== 'All Locations') {
      params.set('location', value);
    } else {
      params.delete('location');
    }
    
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
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

      {/* Main Header with Logo and Auth Buttons */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <Logo />
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/services"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Services
              </Link>
              <Link
                href="/business"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                For Businesses
              </Link>
              <Link
                href="/institutes"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                For Institutes
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Contact
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              {!session ? (
                <>
                  <Link href="/auth/signup?mode=signin">
                    <Button
                      variant="ghost"
                      className="font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium">
                      Get Started Free
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/dashboard">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Go to Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compact Search Bar in Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Search Form - Compact */}
          <form onSubmit={handleSearch} className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search institutes, programs, courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Location Filter */}
              <div className="w-48">
                <Select value={selectedLocation} onValueChange={handleLocationChange}>
                  <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {popularLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <Button
                type="submit"
                className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                <Search className="h-4 w-4 mr-1" />
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}
