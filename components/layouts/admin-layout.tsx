"use client";

import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "./dashboard-layout";
import {
  Home,
  Users,
  Building2,
  Briefcase,
  BarChart2,
  Settings,
  Shield,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/admin", icon: Home },
  { name: "Users", href: "/admin/users", icon: Users },
  {
    name: "Organizations",
    href: "/admin/organizations",
    icon: Building2,
  },
  {
    name: "Businesses",
    href: "/admin/businesses",
    icon: Briefcase,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart2,
  },
  {
    name: "Roles & Permissions",
    href: "/admin/roles",
    icon: Shield,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AdminLayout({
  children,
  title,
  subtitle,
}: AdminLayoutProps) {
  const { isLoading } = useAuth({
    requiredRole: "admin",
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
