"use client";

import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "./dashboard-layout";
import {
  Home,
  GraduationCap,
  Users,
  BookOpen,
  BarChart2,
  Calendar,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/dashboard/institute", icon: Home },
  {
    name: "Students",
    href: "/dashboard/institute/students",
    icon: GraduationCap,
  },
  {
    name: "Faculty",
    href: "/dashboard/institute/faculty",
    icon: Users,
  },
  {
    name: "Courses",
    href: "/dashboard/institute/courses",
    icon: BookOpen,
  },
  {
    name: "Analytics",
    href: "/dashboard/institute/analytics",
    icon: BarChart2,
  },
  {
    name: "Events",
    href: "/dashboard/institute/events",
    icon: Calendar,
  },
  {
    name: "Settings",
    href: "/dashboard/institute/settings",
    icon: Settings,
  },
];

interface InstituteLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function InstituteLayout({
  children,
  title,
  subtitle,
}: InstituteLayoutProps) {
  const { isLoading } = useAuth({
    requiredRole: "institute",
    redirectTo: "/dashboard",
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout navigation={navigation} title={title} subtitle={subtitle}>
      {children}
    </DashboardLayout>
  );
}
