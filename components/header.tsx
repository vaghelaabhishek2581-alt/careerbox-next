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
import { VisuallyHidden } from "@/components/ui/visually-hidden";

const navigation = [
  { name: "Explore", href: "/services", mobile: true },
  { name: "For Institutes", href: "/institutes-service", mobile: true },
  { name: "Expert Advisor", href: "/services", mobile: true },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Rotating search placeholder terms
  const searchTerms = [
    "University",
    "college",
    "course",
    "specialization",
    "placement partners",
    "exam",
    "job",
    "internship",
    "people",
    "group",
    "company",
    "service",
    "product",
    "event",
  ];
  const [termIndex, setTermIndex] = useState(0);
  const rotatingPlaceholder = `search "${searchTerms[termIndex]}"`;

  useEffect(() => {
    const interval = setInterval(() => {
      setTermIndex((i) => (i + 1) % searchTerms.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
          "fixed top-0 left-0 right-0 z-[990] transition-all duration-300 bg-black",
          isScrolled
            ? "bg-white backdrop-blur-lg shadow-xl border-b border-gray-100/80 "
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
                  <span>+91 99096 75185</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-3 w-3" />
                  <span>info@careerbox.in</span>
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
            <Link href="/" className="flex md:hidden items-center space-x-2 group flex-shrink-0">
              <Logo showText={false} />
            </Link>
            <Link href="/" className="hidden md:flex items-center space-x-2 group flex-shrink-0">
              <Logo />
            </Link>

            {/* Mobile Search Bar */}
            <div className="flex md:hidden flex-1 min-w-0 relative">
              <SearchSuggestions
                variant="header"
                placeholder={rotatingPlaceholder}
                className="w-full"
                inputClassName={cn(
                  "h-9 w-full rounded-full border border-gray-300 pl-4 pr-[72px] bg-white shadow-sm",
                  "focus:border-blue-600"
                )}
              />
              <Button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-8 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs pointer-events-none">
                Search
              </Button>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg relative">
              <SearchSuggestions
                variant="header"
                placeholder={rotatingPlaceholder}
                className="w-full"
                inputClassName={cn(
                  "h-10 md:h-12 w-full rounded-full border border-gray-300 pl-5 pr-[92px] shadow-sm transition-all",
                  isScrolled ? "bg-white focus:border-blue-600" : "bg-white/90 backdrop-blur-sm focus:bg-white focus:border-blue-600"
                )}
              />
              <Button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-9 md:h-10 px-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm shadow-sm pointer-events-none">
                Search
              </Button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 flex-shrink-0">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center text-sm font-medium",
                      isActive
                        ? "text-blue-600"
                        : isScrolled
                          ? "text-gray-700 hover:text-blue-600"
                          : "text-gray-800 hover:text-blue-600"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

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
                          : "text-gray-800 bg-white/90 hover:bg-white border-gray-300/50 backdrop-blur-sm"
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

            {/* Mobile User/Profile or Menu */}
            {status === "authenticated" && session?.user ? (
              <div className="lg:hidden">
                {/* Show user avatar; clicking opens the dropdown menu */}
                <UserProfileMenu />
              </div>
            ) : (
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden p-2 text-gray-700"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[320px] sm:w-[360px] bg-white">
                  <VisuallyHidden>
                    <SheetTitle>Mobile Menu</SheetTitle>
                  </VisuallyHidden>
                  <div className="flex flex-col space-y-4 mt-8">
                    <div className="pb-4 border-b border-gray-200">
                      <Logo showText={false} />
                    </div>

                    {/* Mobile Navigation */}
                    <nav className="flex flex-col space-y-2">
                      {navigation.filter((n) => n.mobile).map((item) => {
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
                            {item.name}
                          </Link>
                        );
                      })}
                    </nav>

                    <div className="pt-4 border-t border-gray-200 space-y-3">
                      {/* Increased spacing between Login and Get Started buttons */}
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
                      ) : (
                        <>
                          <Link
                            href="/auth/signup?mode=signin"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Button variant="outline" className="w-full mb-4">
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
            )}
            </div>
        </div>
      </header>


    </>
  );
}
