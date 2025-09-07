"use client";

import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "./dashboard-layout";
import {
  Home,
  BookOpen,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Courses", href: "/dashboard/courses", icon: BookOpen },
  { name: "Events", href: "/dashboard/events", icon: Calendar },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface PublicLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function PublicLayout({
  children,
  title,
  subtitle,
}: PublicLayoutProps) {
  const { isLoading } = useAuth();

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
