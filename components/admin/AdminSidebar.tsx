"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserProfileMenu from "@/components/user-profile-menu";
import {
  Home,
  FileText,
  Shield,
  Menu,
  X,
  UserCheck,
  Building2,
  Briefcase,
  Mail,
  Bell,
  Activity,
  Compass,
} from "lucide-react";

interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const navigationSections = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Overview",
        href: "/admin",
        icon: Home,
      },
      {
        title: "Explore Programs",
        href: "/recommendation-collections",
        icon: Compass,
      },
    ],
  },
  {
    title: "Registration Management",
    items: [
      {
        title: "All Registrations",
        href: "/admin/registrations",
        icon: FileText,
      },
      {
        title: "Counseling Inquiries",
        href: "/admin/counseling",
        icon: UserCheck,
      },
      {
        title: "Business Inquiries",
        href: "/admin/inquiries",
        icon: Briefcase,
      },
    ],
  },
  {
    title: "Institute Management",
    items: [
      {
        title: "All Institutes",
        href: "/admin/institutes",
        icon: Building2,
      },
      {
        title: "Add Institute",
        href: "/admin/institutes/new",
        icon: Building2,
      },
    ],
  },
  {
    title: "Student Leads",
    items: [
      {
        title: "All Student Leads",
        href: "/admin/student-leads",
        icon: UserCheck,
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        title: "Email Templates",
        href: "/admin/email-templates",
        icon: Mail,
      },
      {
        title: "Notifications",
        href: "/admin/notifications",
        icon: Bell,
      },
    ],
  },
];

export default function AdminSidebar({ className, isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const renderSection = (section: any) => {
    if (isCollapsed) return null;

    return (
      <div key={section.title} className="mb-6">
        {/* Section Title */}
        <h3 className="px-3 mb-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
          {section.title}
        </h3>

        {/* Section Links */}
        <div className="space-y-1">
          {section.items.map((item: any) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Button
                key={item.href}
                variant="ghost"
                onClick={() => router.push(item.href)}
                className={cn(
                  "w-full justify-start gap-3 h-9 px-3 text-sm",
                  active && "bg-red-50 text-red-700 font-medium border-r-2 border-red-600"
                )}
              >
                <Icon className={cn("h-4 w-4 flex-shrink-0", active && "text-red-600")} />
                <span className="flex-1 text-left">{item.title}</span>
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col h-full bg-white border-r", className)}>
      {/* User Profile Menu */}
      {!isCollapsed && (
        <div className="p-4 border-b">
          <UserProfileMenu />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Admin Panel</h2>
              <p className="text-xs text-gray-500">System Management</p>
            </div>
          </div>
        )}
        {onToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav>
          {navigationSections.map((section) => renderSection(section))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-3 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-900">Admin Access</span>
            </div>
            <p className="text-xs text-red-700 mb-2">
              Full system administration privileges
            </p>
            <div className="flex items-center gap-2 text-xs text-red-600">
              <Activity className="h-3 w-3" />
              <span>System Status: Online</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
