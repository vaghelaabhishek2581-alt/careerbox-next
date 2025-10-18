"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
    Building2,
    Users,
    BookOpen,
    GraduationCap,
    BarChart3,
    Settings,
    FileText,
    MapPin,
    Award,
    Star,
    Calendar,
    MessageSquare,
    Bell,
    CreditCard,
    Shield,
    ChevronDown,
    ChevronRight,
    Menu,
    X,
    Briefcase,
    TrendingUp,
    Database,
    Globe
} from "lucide-react";

interface SidebarProps {
    className?: string;
    isCollapsed?: boolean;
    onToggle?: () => void;
}

const navigationItems = [
    {
        title: "Overview",
        href: "/institute",
        icon: Home,
        badge: null,
    },
    {
        title: "Institute Profile",
        href: "/institute/profile",
        icon: Building2,
        badge: null,
    },
    {
        title: "Management",
        icon: Database,
        items: [
            {
                title: "Students",
                href: "/institute/students",
                icon: Users,
                badge: "1,234",
            },
            {
                title: "Courses",
                href: "/institute/courses",
                icon: BookOpen,
                badge: "45",
            },
            {
                title: "Faculty",
                href: "/institute/faculty",
                icon: GraduationCap,
                badge: "89",
            },
            {
                title: "Applications",
                href: "/institute/applications",
                icon: FileText,
                badge: "156",
            },
        ],
    },
    {
        title: "Institute Setup",
        icon: Settings,
        items: [
            {
                title: "Registration Details",
                href: "/institute/registration",
                icon: FileText,
                badge: null,
            },
            {
                title: "Documents",
                href: "/institute/documents",
                icon: Shield,
                badge: "12/21",
            },
            {
                title: "Locations",
                href: "/institute/locations",
                icon: MapPin,
                badge: null,
            },
            {
                title: "Facilities",
                href: "/institute/facilities",
                icon: Building2,
                badge: null,
            },
            {
                title: "Highlights",
                href: "/institute/highlights",
                icon: Star,
                badge: null,
            },
        ],
    },
    {
        title: "Recognition",
        icon: Award,
        items: [
            {
                title: "Rankings",
                href: "/institute/rankings",
                icon: TrendingUp,
                badge: null,
            },
            {
                title: "Awards",
                href: "/institute/awards",
                icon: Award,
                badge: null,
            },
            {
                title: "Scholarships",
                href: "/institute/scholarships",
                icon: Star,
                badge: null,
            },
        ],
    },
    {
        title: "Analytics",
        href: "/institute/analytics",
        icon: BarChart3,
        badge: null,
    },
    {
        title: "Placement",
        href: "/institute/placement",
        icon: Briefcase,
        badge: null,
    },
    {
        title: "Communication",
        icon: MessageSquare,
        items: [
            {
                title: "Messages",
                href: "/institute/messages",
                icon: MessageSquare,
                badge: "12",
            },
            {
                title: "Notifications",
                href: "/institute/notifications",
                icon: Bell,
                badge: "5",
            },
            {
                title: "Announcements",
                href: "/institute/announcements",
                icon: Globe,
                badge: null,
            },
        ],
    },
    {
        title: "Events",
        href: "/institute/events",
        icon: Calendar,
        badge: null,
    },
    {
        title: "Billing",
        href: "/institute/billing",
        icon: CreditCard,
        badge: null,
    },
    {
        title: "Settings",
        href: "/institute/settings",
        icon: Settings,
        badge: null,
    },
];

export default function InstituteSidebar({ className, isCollapsed = false, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [expandedItems, setExpandedItems] = useState<string[]>([
        "Management",
        "Institute Setup"
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
        if (href === "/institute") {
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
                                hasActive && "bg-orange-50 text-orange-700 border-r-2 border-orange-600",
                                isCollapsed && "justify-center px-2"
                            )}
                        >
                            <Icon className={cn("h-4 w-4 flex-shrink-0", hasActive && "text-orange-600")} />
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
                    active && "bg-orange-50 text-orange-700 border-r-2 border-orange-600",
                    isChild && "h-9 text-sm",
                    isCollapsed && "justify-center px-2"
                )}
            >
                <Icon className={cn("h-4 w-4 flex-shrink-0", active && "text-orange-600")} />
                {!isCollapsed && (
                    <>
                        <span className="flex-1 text-left">{item.title}</span>
                        {item.badge && (
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "text-xs h-5 px-1.5",
                                    active ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"
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
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Building2 className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900">Institute</h2>
                            <p className="text-xs text-gray-500">Management Portal</p>
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


        </div>
    );
}
