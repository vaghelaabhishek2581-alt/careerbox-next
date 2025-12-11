"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/logo";
import UserProfileMenu from "@/components/user-profile-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

interface DashboardLayoutProps {
  children: React.ReactNode;
  navigation: {
    name: string;
    href: string;
    icon: any;
  }[];
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({
  children,
  navigation,
  title,
  subtitle,
}: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50/90">
      {/* Mobile Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
+         <VisuallyHidden>
+           <SheetTitle>Navigation</SheetTitle>
+         </VisuallyHidden>
          <div className="p-6 border-b">
            <Logo />
          </div>
          <ScrollArea className="h-[calc(100vh-5rem)] py-6">
            <nav className="space-y-1 px-4">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className="w-full justify-start gap-4"
                    onClick={() => {
                      router.push(item.href);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <IconComponent className="h-5 w-5" />
                    {item.name}
                  </Button>
                );
              })}
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r">
          <div className="p-6 border-b">
            <Logo />
          </div>
          <ScrollArea className="flex-1">
            <nav className="flex-1 space-y-1 p-4">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className="w-full justify-start gap-4"
                    onClick={() => router.push(item.href)}
                  >
                    <IconComponent className="h-5 w-5" />
                    {item.name}
                  </Button>
                );
              })}
            </nav>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div>
                {title && (
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-500">{subtitle}</p>
                )}
              </div>
            </div>
            <UserProfileMenu />
          </div>
        </header>

        {/* Main Content */}
        <main className="py-8 px-4 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
