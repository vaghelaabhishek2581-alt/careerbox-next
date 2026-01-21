"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  GraduationCap,
  Bell,
  FileText,
  CreditCard,
  Compass,
  Settings,
  Activity,
} from "lucide-react";

export function UserMenu() {
  const pathname = usePathname();

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/user/dashboard" },
    { label: "Applied Courses", icon: GraduationCap, href: "/user/applied-courses" },
    // { label: "Notifications", icon: Bell, href: "/notifications" },
    { label: "Registration Status", icon: FileText, href: "/user/registration-status" },
    // { label: "Payments", icon: CreditCard, href: "/user/payment" },
    // { label: "Discover", icon: Compass, href: "/recommendation-collections" },
    // { label: "Activity", icon: Activity, href: "/user/activity" },
  ];

  const bottomMenuItems = [
    { label: "Settings", icon: Settings, href: "/settings" },
    // { label: "Upgrade to Premium", icon: CreditCard, href: "/premium" },
  ];

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <div className="py-2">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link key={index} href={item.href}>
              <div
                className={`flex items-center px-6 py-3.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-gray-900 border-l-4 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
                }`}
              >
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
              <div
                className={`flex items-center px-6 py-3.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#FFF9E6] text-gray-900 border-l-4 border-[#FFD700]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
                }`}
              >
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

