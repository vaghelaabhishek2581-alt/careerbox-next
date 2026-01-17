"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart2,
  Activity,
  Edit,
  Settings,
  CreditCard,
  Megaphone,
  Plus,
  UserCog,
  GraduationCap,
  Calendar,
  Wallet
} from 'lucide-react';

export function InstituteMenu() {
  const pathname = usePathname();

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/institute/dashboard" },
    { label: "Leads", icon: Users, href: "/institute/leads" },
    // { label: "Courses", icon: BookOpen, href: "/institute/courses" },
    // { label: "Faculty", icon: GraduationCap, href: "/institute/faculty" },
    // { label: "Announcements", icon: Plus, href: "/institute/add-faculty" },
    // { label: "User Roles", icon: UserCog, href: "/institute/roles" },
    // { label: "Events", icon: Calendar, href: "/institute/events" },
    // { label: "Products & Services", icon: Package, href: "/institute/products" },
    // { label: "Analytics", icon: BarChart2, href: "/institute/analytics" },
    { label: "Billing & Payments", icon: Wallet, href: "/institute/billing" },
    // { label: "Activity", icon: Activity, href: "/institute/activity" },
    { label: "Edit Page", icon: Edit, href: "/institute/profile" },
  ];

  const bottomMenuItems = [
    { label: "Subscriptions", icon: CreditCard, href: "/institute/subscription" },
    // { label: "Be Sponsored", icon: Megaphone, href: "/institute/sponsored" },
    { label: "Settings", icon: Settings, href: "/institute/settings" },
  ];

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <div className="py-2">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link key={index} href={item.href}>
              <div className={`flex items-center px-6 py-3.5 text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-blue-50 text-gray-900 border-l-4 border-blue-600" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
              }`}>
                <item.icon className={`h-5 w-5 mr-3 ${isActive ? "text-gray-900" : "text-gray-400"}`} />
                {item.label}
              </div>
            </Link>
          );
        })}
        
        <Separator className="my-2" />
        
        {bottomMenuItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link key={index} href={item.href}>
              <div className={`flex items-center px-6 py-3.5 text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-[#FFF9E6] text-gray-900 border-l-4 border-[#FFD700]" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
              }`}>
                <item.icon className={`h-5 w-5 mr-3 ${isActive ? "text-gray-900" : "text-gray-400"}`} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
