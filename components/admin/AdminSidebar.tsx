"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Home,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  Shield,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  UserCheck,
  Building2,
  Briefcase,
  AlertTriangle,
  TrendingUp,
  Database,
  Mail,
  Bell,
  Activity,
  Globe,
  UserPlus
} from "lucide-react";

interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const navigationItems = [
  {
    title: "Overview",
    href: "/dashboard/admin",
    icon: Home,
    badge: null,
  },
  {
    title: "User Management",
    icon: Users,
    items: [
      {
        title: "All Users",
        href: "/dashboard/admin/users",
        icon: Users,
        badge: "2,456",
      },
      {
        title: "Role Management",
        href: "/dashboard/admin/users/roles",
        icon: UserCheck,
        badge: null,
      },
      {
        title: "Suspended Users",
        href: "/dashboard/admin/users/suspended",
        icon: AlertTriangle,
        badge: "12",
      },
    ],
  },
  {
    title: "Registration Management",
    icon: FileText,
    items: [
      {
        title: "Pending Reviews",
        href: "/dashboard/admin/registrations/pending",
        icon: FileText,
        badge: "23",
      },
      {
        title: "Institute Applications",
        href: "/dashboard/admin/registrations/institutes",
        icon: Building2,
        badge: "156",
      },
      {
        title: "Business Applications",
        href: "/dashboard/admin/registrations/businesses",
        icon: Briefcase,
        badge: "89",
      },
      {
        title: "All Applications",
        href: "/dashboard/admin/registrations",
        icon: Database,
        badge: null,
      },
    ],
  },
  {
    title: "Subscription Management",
    icon: CreditCard,
    items: [
      {
        title: "Active Subscriptions",
        href: "/dashboard/admin/subscriptions/active",
        icon: CreditCard,
        badge: "1,234",
      },
      {
        title: "Expired Subscriptions",
        href: "/dashboard/admin/subscriptions/expired",
        icon: AlertTriangle,
        badge: "45",
      },
      {
        title: "Grant Free Access",
        href: "/dashboard/admin/subscriptions/grant",
        icon: Shield,
        badge: null,
      },
      {
        title: "Billing Reports",
        href: "/dashboard/admin/subscriptions/reports",
        icon: BarChart3,
        badge: null,
      },
    ],
  },
  {
    title: "Student Leads",
    href: "/dashboard/admin/student-leads",
    icon: UserPlus,
    badge: null,
  },
  {
    title: "Analytics & Reports",
    href: "/dashboard/admin/analytics",
    icon: BarChart3,
    badge: null,
  },
  {
    title: "Admin Institutes",
    icon: CreditCard,
    items: [
      {
        title: "Add Institute",
        href: "/dashboard/admin/institutes/new",
        icon: CreditCard,
        badge: "1,234",
      },
      {
        title: "Get Institutes",
        href: "/dashboard/admin/institutes",
        icon: CreditCard,
        badge: "1,234",
      },
    ],
  },
  {
    title: "System Health",
    href: "/dashboard/admin/health",
    icon: Activity,
    badge: null,
  },
  {
    title: "Communication",
    icon: Mail,
    items: [
      {
        title: "Email Templates",
        href: "/dashboard/admin/email-templates",
        icon: Mail,
        badge: null,
      },
      {
        title: "Notifications",
        href: "/dashboard/admin/notifications",
        icon: Bell,
        badge: "5",
      },
      {
        title: "Announcements",
        href: "/dashboard/admin/announcements",
        icon: Globe,
        badge: null,
      },
    ],
  },
  {
    title: "Platform Settings",
    href: "/dashboard/admin/settings",
    icon: Settings,
    badge: null,
  },
];

export default function AdminSidebar({ className, isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "User Management",
    "Registration Management",
    "Subscription Management"
  ]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/dashboard/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const hasActiveChild = (items: any[]) => {
    return items?.some(item => isActive(item.href));
  };

  const renderNavItem = (item: any, isChild = false) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    
    if (item.items) {
      const isExpanded = expandedItems.includes(item.title);
      const hasActive = hasActiveChild(item.items);
      
      return (
        <Collapsible
          key={item.title}
          open={isExpanded}
          onOpenChange={() => toggleExpanded(item.title)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-10 px-3",
                hasActive && "bg-red-50 text-red-700 border-r-2 border-red-600",
                isCollapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn("h-4 w-4 flex-shrink-0", hasActive && "text-red-600")} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.title}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          {!isCollapsed && (
            <CollapsibleContent className="space-y-1">
              <div className="ml-4 border-l border-gray-200 pl-4 space-y-1">
                {item.items.map((subItem: any) => renderNavItem(subItem, true))}
              </div>
            </CollapsibleContent>
          )}
        </Collapsible>
      );
    }

    const content = (
      <Button
        key={item.href}
        variant="ghost"
        onClick={() => router.push(item.href)}
        className={cn(
          "w-full justify-start gap-3 h-10 px-3",
          active && "bg-red-50 text-red-700 border-r-2 border-red-600",
          isChild && "h-9 text-sm",
          isCollapsed && "justify-center px-2"
        )}
      >
        <Icon className={cn("h-4 w-4 flex-shrink-0", active && "text-red-600")} />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left">{item.title}</span>
            {item.badge && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs h-5 px-1.5",
                  active ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                )}
              >
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Button>
    );

    if (isCollapsed && item.badge) {
      return (
        <TooltipProvider key={item.href}>
          <Tooltip>
            <TooltipTrigger asChild>
              {content}
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.title}</p>
              {item.badge && <p className="text-xs opacity-75">{item.badge}</p>}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  };

  return (
    <div className={cn("flex flex-col h-full bg-white border-r", className)}>
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
        <nav className="space-y-2">
          {navigationItems.map((item) => renderNavItem(item))}
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
