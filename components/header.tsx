"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Menu,
  Phone,
  Mail,
  Home,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "./logo";
import UserProfileMenu from "./user-profile-menu";
import Breadcrumb from "./breadcrumb";
import SearchSuggestions from "./SearchSuggestions";

const navigation = [
  // { name: "Home", href: "/", icon: Home },
  // { name: "Contact", href: "/contact", icon: MessageCircle },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const shouldHideHeader =
    pathname?.startsWith("/auth/") ||
    pathname?.startsWith("/dashboard/") ||
    pathname?.startsWith("/admin/");

  if (shouldHideHeader) {
    return null; // Don't show header on auth and dashboard pages
  }

  return (
    <>
      {/* Main Header */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[990] transition-all duration-300 bg-white",
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
            <div className="hidden md:flex flex-1 max-w-xl relative">
              <SearchSuggestions
                variant="header"
                placeholder="Search institutes, programs, courses..."
                className="w-full"
                inputClassName={cn(
                  "py-2 w-full rounded-full border-2 transition-all",
                  isScrolled
                    ? "border-gray-200 focus:border-blue-500"
                    : "border-white/30 bg-white/90 backdrop-blur-sm focus:bg-white focus:border-blue-500"
                )}
              />
              <Button
                className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm pointer-events-none"
              >
                Search
              </Button>
            </div>

            {/* Desktop Navigation */}
            {/* <nav className="hidden lg:flex items-center gap-6 flex-shrink-0">
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
            </nav> */}

            {/* Desktop CTA Buttons or User Profile */}
            <div className="hidden lg:flex items-center space-x-4">
              {status === "loading" ? (
                <div className="flex items-center gap-3">
                  <div className="text-right space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              ) : status === "authenticated" && session?.user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={cn(
                      "text-sm font-medium",
                      isScrolled ? "text-gray-900" : "text-gray-800"
                    )}>
                      {session.user.name || session.user.email?.split('@')[0] || 'User'}
                    </p>
                    <p className={cn(
                      "text-xs",
                      isScrolled ? "text-gray-500" : "text-gray-600"
                    )}>
                      {session.user.email}
                    </p>
                    {session.user.activeRole && (
                      <p className={cn(
                        "text-xs font-medium capitalize",
                        isScrolled ? "text-blue-600" : "text-blue-700"
                      )}>
                        {session.user.activeRole}
                      </p>
                    )}
                  </div>
                  <UserProfileMenu />
                </div>
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
                  {/* <nav className="flex flex-col space-y-2">
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
                  </nav> */}

                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    {status === "loading" ? (
                      <div className="px-4 space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-40" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </div>
                    ) : status === "authenticated" && session?.user ? (
                      <div className="px-4 space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                              {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {session.user.name || session.user.email?.split('@')[0] || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {session.user.email}
                            </p>
                            {session.user.activeRole && (
                              <p className="text-xs font-medium text-blue-600 capitalize mt-1">
                                {session.user.activeRole}
                              </p>
                            )}
                          </div>
                        </div>
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


    </>
  );
}
