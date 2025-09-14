"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Bell, Settings, Home, Users, BookOpen, Target, BarChart2, MessageSquare, User, Building2, Briefcase, GraduationCap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { handleUserSignOut } from "@/src/services/auth/auth.service";

const userNavigation = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Profile", href: "/dashboard/user", icon: Users },
  { name: "Skills", href: "/dashboard/user/skills", icon: BookOpen },
  { name: "Goals", href: "/dashboard/user/goals", icon: Target },
  { name: "Network", href: "/dashboard/user/network", icon: Users },
  { name: "Analytics", href: "/dashboard/user/analytics", icon: BarChart2 },
  { name: "Messages", href: "/dashboard/user/messages", icon: MessageSquare },
];

const profileNavigation = [
  { name: "Personal Info", href: "/dashboard/user/profile", icon: User },
  { name: "Account Settings", href: "/dashboard/user/settings", icon: Settings },
  { name: "Privacy & Security", href: "/dashboard/user/privacy", icon: Users },
  { name: "Notifications", href: "/dashboard/user/notifications", icon: MessageSquare },
  { name: "Preferences", href: "/dashboard/user/preferences", icon: Settings },
];

const roleBasedNavigation = {
  student: [
    { name: "My Courses", href: "/dashboard/user/courses", icon: BookOpen },
    { name: "My Applications", href: "/dashboard/user/applications", icon: Briefcase },
    { name: "My Exams", href: "/dashboard/user/exams", icon: Target },
  ],
  business: [
    { name: "My Company", href: "/dashboard/business/company", icon: Building2 },
    { name: "Job Postings", href: "/dashboard/business/jobs", icon: Briefcase },
    { name: "Candidates", href: "/dashboard/business/candidates", icon: Users },
  ],
  institute: [
    { name: "My Institute", href: "/dashboard/institute/profile", icon: Building2 },
    { name: "Courses", href: "/dashboard/institute/courses", icon: BookOpen },
    { name: "Students", href: "/dashboard/institute/students", icon: GraduationCap },
  ],
  admin: [
    { name: "System Health", href: "/dashboard/admin/health", icon: BarChart2 },
    { name: "User Management", href: "/dashboard/admin/users", icon: Users },
    { name: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart2 },
  ],
};

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  if (!session) {
    return null;
  }

  const userRole = session.user?.activeRole || session.user?.roles?.[0] || 'student';
  const roleNavigation = roleBasedNavigation[userRole as keyof typeof roleBasedNavigation] || [];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const isActive = (href: string) => pathname === href;

  return (
    <header className="h-16 bg-white border-b px-4 md:px-6 flex items-center gap-4 sticky top-0 z-40">
      {/* Profile Popover - Far Left */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-3 p-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm">
                {session.user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium line-clamp-1">
                {session.user?.name}
              </p>
              <p className="text-xs text-gray-500 line-clamp-1">
                {session.user?.email}
              </p>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          <DropdownMenuLabel className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {session.user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{session.user?.name}</p>
              <p className="text-xs text-gray-500">{session.user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Main Navigation */}
          <div className="px-2 py-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Navigation
            </p>
            {userNavigation.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.href);
              return (
                <DropdownMenuItem
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`cursor-pointer ${active ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  <IconComponent className="mr-2 h-4 w-4" />
                  {item.name}
                  {active && <span className="ml-auto text-xs">●</span>}
                </DropdownMenuItem>
              );
            })}
          </div>

          {/* Role-based Navigation */}
          {roleNavigation.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Tools
                </p>
                {roleNavigation.map((item) => {
                  const IconComponent = item.icon;
                  const active = isActive(item.href);
                  return (
                    <DropdownMenuItem
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      className={`cursor-pointer ${active ? 'bg-blue-50 text-blue-700' : ''}`}
                    >
                      <IconComponent className="mr-2 h-4 w-4" />
                      {item.name}
                      {active && <span className="ml-auto text-xs">●</span>}
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </>
          )}

          <DropdownMenuSeparator />
          
          {/* Profile Navigation */}
          <div className="px-2 py-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Profile
            </p>
            {profileNavigation.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.href);
              return (
                <DropdownMenuItem
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`cursor-pointer ${active ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  <IconComponent className="mr-2 h-4 w-4" />
                  {item.name}
                  {active && <span className="ml-auto text-xs">●</span>}
                </DropdownMenuItem>
              );
            })}
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600 cursor-pointer"
            onClick={handleUserSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search jobs, courses, skills..."
            className="pl-10 bg-gray-50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            3
          </Badge>
        </Button>
        
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
