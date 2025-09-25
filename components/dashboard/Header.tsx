"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Bell, Settings, Home, Users, BookOpen, Target, BarChart2, MessageSquare, User, Building2, Briefcase, GraduationCap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import Logo from "../logo";
import UserProfileMenu from "../user-profile-menu";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";


export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const { profile } = useSelector((state: RootState) => state.profile);

  const [searchQuery, setSearchQuery] = useState("");

  if (!session) {
    return null;
  }

  return (
    <header className="h-16 bg-white border-b px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-40">
      {/* Logo */}
      <div onClick={() => router.push("/dashboard")} className="flex items-center space-x-2 group">
        <Logo />
      </div>
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
        <UserProfileMenu />
      </div>
    </header>
  );
}
