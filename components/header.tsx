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
  ChevronRight,
  Compass,
  Building2,
  UserCheck,
  Search,
  Bell,
  Briefcase,
  Users,
  Calendar,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "./logo";
import UserProfileMenu from "./user-profile-menu";
import Breadcrumb from "./breadcrumb";
import SearchSuggestions from "./SearchSuggestions";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { SidebarManager } from "@/components/institute/SidebarManager";

const publicNavigation = [
  { name: "Get Free Counselling", href: "/career-counselling" }
];

const privateNavigation = [
  { name: "Home", href: "/recommendation-collections", icon: Home },
  { name: "Discover", href: "/explore", icon: Compass },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  // { name: "Connections", href: "/connections", icon: Users },
  { name: "Messages", href: "/messages", icon: MessageCircle },
  { name: "Notifications", href: "/notifications", icon: Bell },
  // { name: "Events", href: "/events", icon: Calendar },
  // { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Determine navigation items
  const isLoggedIn = status === "authenticated" && !!session?.user;
  const navigation = isLoggedIn ? [] : publicNavigation;

  // Rotating search placeholder terms
  const searchTerms = [
    "University",
    "college",
    "course",
    "specialization",
    // "placement partners",
    // "exam",
    // "job",
    // "internship",
    // "people",
    // "group",
    // "company",
    // "service",
    // "product",
    // "event",
  ];
  const [termIndex, setTermIndex] = useState(0);
  const rotatingPlaceholder = `Search "${searchTerms[termIndex]}"`;

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
          "fixed top-0 left-0 right-0 z-[990] transition-all duration-300 bg-white/90 backdrop-blur-md border-b",
          isScrolled
            ? "shadow-sm border-gray-100"
            : "border-gray-200"
        )}
      >
        {/* Top Contact Bar */}
        {/* <div className="bg-gray-900 text-white py-2 text-sm">
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
        </div> */}
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
                  "h-10 w-full rounded-full border border-gray-300 pl-4 bg-white shadow-sm",
                  "focus:border-blue-600"
                )}
              />
              <Button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-8 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs pointer-events-none">
                Search
              </Button>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg relative">
              <SearchSuggestions
                variant="header"
                placeholder={rotatingPlaceholder}
                className="w-full"
                inputClassName={cn(
                  "h-10 md:h-12 w-full rounded-full border border-gray-300 pl-5 shadow-sm transition-all",
                  isScrolled ? "bg-white focus:border-blue-600" : "bg-white/90 backdrop-blur-sm focus:bg-white focus:border-blue-600"
                )}
              />
              <Button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-9 md:h-10 px-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm shadow-sm pointer-events-none">
                Search
              </Button>
            </div>

            {/* Desktop Navigation (Public Only) */}
            {!isLoggedIn && (
              <nav className="hidden lg:flex items-center gap-6 flex-shrink-0">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "text-sm font-medium transition-colors",
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
            )}

            {/* Desktop CTA Buttons or User Profile */}
            <div className="hidden lg:flex items-center space-x-4">
              {status === "loading" ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              ) : isLoggedIn ? (
                <div className="flex items-center gap-1">
                  {/* Private Navigation Icons */}
                  <div className="flex items-center gap-1 mr-4">
                    {privateNavigation.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          title={item.name}
                          className={cn(
                            "p-2.5 rounded-xl transition-all duration-200 group relative",
                            isActive
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                          )}
                        >
                          <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive && "fill-current")} />
                          {isActive && (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                  <div className="h-8 w-[1px] bg-gray-200 mx-2" />
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
              <div className="flex items-center gap-2 lg:hidden">
                {/* Mobile Notification Icon (Top Right) */}
                <Link href="/notifications" className="p-2 text-gray-600 hover:text-blue-600 relative">
                    <Bell className="h-6 w-6" />
                    {/* Optional: Add notification badge here */}
                </Link>
                {/* User Profile Menu in Top Header for Mobile */}
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
                    <nav className="flex flex-col space-y-1">
                      {navigation.map((item) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const IconComponent = (item as any).icon;
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-4 px-2 py-4 text-[16px] font-medium transition-all duration-200",
                              isActive
                                ? "text-blue-600"
                                : "text-slate-600 hover:text-slate-900"
                            )}
                          >
                            {IconComponent && <IconComponent className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-slate-500")} />}
                            {item.name}
                          </Link>
                        );
                      })}
                    </nav>

                    <div className="pt-6 border-t border-gray-100 space-y-4 px-2">
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

      {/* Mobile Bottom Navigation (Outside Header) */}
      {status === "authenticated" && session?.user && (
        <>
          <div className="fixed bottom-0 left-0 right-0 z-[999] bg-white border-t border-gray-200 lg:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe">
            <div className="flex items-center justify-around">
              {privateNavigation.filter(item => item.name !== "Notifications").map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center py-2 px-1 flex-1 min-w-[60px]",
                      isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                    )}
                  >
                    <Icon className={cn("h-6 w-6 mb-1", isActive && "fill-current")} />
                    <span className="text-[10px] font-medium truncate w-full text-center">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
              {/* Menu Item (Hamburger) in Bottom Nav */}
              <div 
                className="flex flex-col items-center justify-center py-2 px-1 flex-1 min-w-[60px] cursor-pointer text-gray-500 hover:text-gray-900"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6 mb-1" />
                <span className="text-[10px] font-medium truncate w-full text-center mt-1">
                  Menu
                </span>
              </div>
            </div>
          </div>

          {/* Authenticated Mobile Menu Sheet */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetContent side="left" className="w-full sm:w-[360px] bg-white p-0 h-full">
              <VisuallyHidden>
                <SheetTitle>Menu</SheetTitle>
              </VisuallyHidden>
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                  <Logo showText={true} />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <div onClick={() => setIsMobileMenuOpen(false)}>
                    {pathname?.startsWith('/institute') ? (
                      <SidebarManager />
                    ) : (
                    /* Default Mobile Menu for non-institute pages */
                    <nav className="space-y-1">
                      {privateNavigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors",
                              isActive 
                                ? "bg-blue-50 text-blue-600" 
                                : "text-gray-700 hover:bg-gray-100"
                            )}
                          >
                            <Icon className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-gray-500")} />
                            {item.name}
                          </Link>
                        );
                      })}
                    </nav>
                  )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}


    </>
  );
}
