"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SheetTitle } from "@/components/ui/sheet";
import {
  Menu,
  Phone,
  Mail,
  Home,
  Users,
  Briefcase,
  Building2,
  GraduationCap,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "./logo";
import UserProfileMenu from "./user-profile-menu";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "About Us", href: "/about", icon: Users },
  { name: "Services", href: "/services", icon: Briefcase },
  { name: "For Businesses", href: "/business", icon: Building2 },
  { name: "For Institutes", href: "/institutes", icon: GraduationCap },
  {
    name: "Free Counselling",
    href: "/career-counselling",
    icon: MessageCircle,
  },
  { name: "Contact", href: "/contact", icon: MessageCircle },
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
    pathname?.startsWith("/onboarding") ||
    pathname?.startsWith("/dashboard/");

  if (shouldHideHeader) {
    return null; // Don't show header on auth, onboarding, and dashboard pages
  }

  return (
    <>
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

      {/* Main Header */}
      <header
        className={cn(
          "fixed top-8 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white/98 backdrop-blur-lg shadow-xl border-b border-gray-100/80"
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <Logo />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
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
    </>
  );
}
