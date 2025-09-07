"use client";

import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "./dashboard-layout";
import {
  Home,
  Users,
  FileText,
  BarChart2,
  Mail,
  Calendar,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/dashboard/business", icon: Home },
  {
    name: "Recruitment",
    href: "/dashboard/business/recruitment",
    icon: Users,
  },
  {
    name: "Applications",
    href: "/dashboard/business/applications",
    icon: FileText,
  },
  {
    name: "Analytics",
    href: "/dashboard/business/analytics",
    icon: BarChart2,
  },
  {
    name: "Messages",
    href: "/dashboard/business/messages",
    icon: Mail,
  },
  {
    name: "Calendar",
    href: "/dashboard/business/calendar",
    icon: Calendar,
  },
  {
    name: "Settings",
    href: "/dashboard/business/settings",
    icon: Settings,
  },
];

interface BusinessLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function BusinessLayout({
  children,
  title,
  subtitle,
}: BusinessLayoutProps) {
  const { isLoading } = useAuth({
    requiredRole: "business",
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
