"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/redux/store";
import { fetchProfile } from "@/lib/redux/slices/profileSlice";
import { switchRole } from "@/lib/redux/slices/authSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Bell, Settings, Home, Users, BookOpen, Target, BarChart2, MessageSquare, User, Building2, Briefcase, GraduationCap, LogOut, ChevronDown, ChevronRight, UserCog, FileText, Plus, Activity, HeadphonesIcon, HelpCircle, CreditCard, Mail, Shield, Database } from "lucide-react";
import AccountSwitcher from "@/components/ui/account-switcher";
import InstituteSelector from "@/components/institute-selector";

import { handleUserSignOut } from "@/src/services/auth/auth.service";
import { usePathname } from "next/navigation";
import { API } from "@/lib/api/services";

// Define role configurations outside component to avoid recreation on every render
const ROLE_CONFIGS = {
  student: { icon: GraduationCap, label: "Student Account", color: "bg-blue-500" },
  professional: { icon: User, label: "Professional Account", color: "bg-green-500" },
  user: { icon: User, label: "User Account", color: "bg-green-500" },
  business: { icon: Briefcase, label: "Business Account", color: "bg-purple-500" },
  institute: { icon: Building2, label: "Institute Account", color: "bg-orange-500" },
  admin: { icon: Settings, label: "Admin Account", color: "bg-red-500" }
} as const;

type RoleType = keyof typeof ROLE_CONFIGS;

export default function UserProfileMenu() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.profile);
  
  // State for collapsible sections
  const [isNavigationOpen, setIsNavigationOpen] = useState(true);
  const [isAccountOpen, setIsAccountOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Fetch profile data when component mounts
  useEffect(() => {
    if (session?.user?.id && !profile) {
      dispatch(fetchProfile());
    }
  }, [session?.user?.id, profile, dispatch]);

  if (status === "loading") {
    return null;
  }

  if (!session) {
    return null;
  }
  const userNavigation = [
    { name: "Overview", href: "/dashboard", icon: Home },
    { name: "Profile", href: "/dashboard/user", icon: Users },
    { name: "Skills", href: "/dashboard/user/skills", icon: BookOpen },
    { name: "Goals", href: "/dashboard/user/goals", icon: Target },
    { name: "Network", href: "/dashboard/user/network", icon: Users },
    { name: "Analytics", href: "/dashboard/user/analytics", icon: BarChart2 },
    { name: "Messages", href: "/dashboard/user/messages", icon: MessageSquare },
  ];

  const registrationNavigation = [
    { name: "Registration Status", href: "/dashboard/user/registration-status", icon: FileText },
    { name: "Register Institute", href: "/dashboard/user/register-institute", icon: Building2 },
    { name: "Register Business", href: "/dashboard/user/register-business", icon: Briefcase },
  ];

  const profileNavigation = [
    { name: "Personal Info", href: "/dashboard/user/profile", icon: User },
    { name: "Account Settings", href: "/dashboard/user/settings", icon: Settings },
    { name: "Privacy & Security", href: "/dashboard/user/privacy", icon: Users },
    { name: "Notifications", href: "/dashboard/user/notifications", icon: MessageSquare },
    { name: "Preferences", href: "/dashboard/user/preferences", icon: Settings },
  ];

  const roleBasedNavigation = {
    student: [
      { name: "My Courses", href: "/dashboard/user/courses", icon: BookOpen },
      { name: "My Applications", href: "/dashboard/user/applications", icon: Briefcase },
      { name: "My Exams", href: "/dashboard/user/exams", icon: Target },
    ],
    business: [
      { name: "My Company", href: "/dashboard/business/company", icon: Building2 },
      { name: "Job Postings", href: "/dashboard/business/jobs", icon: Briefcase },
      { name: "Candidates", href: "/dashboard/business/candidates", icon: Users },
    ],
    institute: [
      { name: "My Institute", href: "/dashboard/institute/profile", icon: Building2 },
      { name: "Courses", href: "/dashboard/institute/courses", icon: BookOpen },
      { name: "Students", href: "/dashboard/institute/students", icon: GraduationCap },
    ],
    admin: [
      { name: "System Health", href: "/admin/health", icon: Activity },
      { name: "User Management", href: "/admin/users", icon: Users },
      { name: "Career Counseling", href: "/admin/counseling", icon: HeadphonesIcon },
      { name: "Student Inquiries", href: "/admin/inquiries", icon: HelpCircle },
      { name: "Registration Intents", href: "/admin/registrations", icon: FileText },
      { name: "Payment Management", href: "/admin/payments", icon: CreditCard },
      { name: "Email Templates", href: "/admin/emails", icon: Mail },
      { name: "System Analytics", href: "/admin/analytics", icon: BarChart2 },
      { name: "Security & Audit", href: "/admin/security", icon: Shield },
      { name: "Database Management", href: "/admin/database", icon: Database },
    ],
  };


  const userRole = session.user?.activeRole || session.user?.roles?.[0] || 'student';
  const roleNavigation = roleBasedNavigation[userRole as keyof typeof roleBasedNavigation] || [];

  const handleNavigation = async (href: string, targetRole?: string) => {
    // Switch role if specified and different from current role
    if (targetRole && targetRole !== userRole && session?.user?.roles?.includes(targetRole)) {
      try {
        // Update Redux state first (for immediate UI feedback)
        dispatch(switchRole(targetRole));

        // Call API to update role in database (async, don't wait)
        API.user.switchRole(targetRole).then(response => {
          if (response.success) {
            console.log(`Role switched to: ${targetRole} (persisted to database)`);
            // Update NextAuth session quietly in background
            update({
              ...session,
              user: {
                ...session.user,
                activeRole: targetRole
              }
            });
          } else {
            console.error('Failed to persist role switch:', response.error);
            // Revert Redux state if API call failed
            dispatch(switchRole(userRole));
          }
        }).catch(error => {
          console.error('Failed to switch role:', error);
          // Revert Redux state if API call failed
          dispatch(switchRole(userRole));
        });

      } catch (error) {
        console.error('Failed to switch role:', error);
        return; // Don't navigate if role switch failed
      }
    }
    router.push(href);
  };

  const isActive = (href: string) => pathname === href;

  // Get role icon using the same configuration
  const RoleIcon = ROLE_CONFIGS[userRole as RoleType]?.icon || User;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-3 p-2 h-auto hover:bg-gray-50 rounded-lg transition-colors">
          <div className="relative">
            <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
              <AvatarImage
                src={profile?.profileImage}
                alt={session.user?.name || "User"}
              />
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium">
                {session.user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {/* Role indicator badge */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200">
              <RoleIcon className="h-3 w-3 text-gray-600" />
            </div>
          </div>
          <div className="hidden md:block text-left flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {session.user?.name}
              </p>
              <div className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </div>
            </div>
            <p className="text-xs text-gray-500 truncate">
              {session.user?.email}
            </p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80 p-0">
        <ScrollArea className="max-h-[calc(100vh-100px)]">
          <div className="p-1">
        {/* Account Switcher Section */}
        <div className="p-3">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={profile?.profileImage}
                alt={session.user?.name || "User"}
              />
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {session.user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{session.user?.name}</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-gray-500">{session.user?.email}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUserSignOut}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Sign out"
                >
                  <LogOut className="h-3 w-3" />
                </Button>
              </div>
              {profile?.personalDetails && (
                <p className="text-xs text-gray-400">
                  {profile.personalDetails.firstName} {profile.personalDetails.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Role Switching */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Switch Account
            </p>
            {session.user?.roles?.map((role) => {
              // Type-safe role config lookup with fallback
              const roleConfig = ROLE_CONFIGS[role as RoleType] || {
                icon: User,
                label: `${role.charAt(0).toUpperCase() + role.slice(1)} Account`,
                color: "bg-gray-500"
              };

              const IconComponent = roleConfig.icon;
              const isActive = role === userRole;

              return (
                <div
                  key={role}
                  onClick={() => {
                    if (role !== userRole) {
                      // Navigate to the appropriate dashboard based on role
                      const dashboardPath = role === 'user' ? '/dashboard' : `/dashboard/${role}`;
                      handleNavigation(dashboardPath, role);
                    }
                  }}
                  className={`cursor-pointer flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200'
                    : 'hover:bg-gray-50 hover:shadow-sm'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-full ${roleConfig.color} flex items-center justify-center shadow-sm ${isActive ? 'ring-2 ring-blue-200' : ''
                    }`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{roleConfig.label}</p>
                    <p className="text-xs text-gray-500">
                      {role === 'user' && 'Personal dashboard & profile'}
                      {role === 'business' && 'Manage company & job postings'}
                      {role === 'institute' && 'Manage courses & students'}
                      {role === 'admin' && 'System administration'}
                    </p>
                  </div>
                  {isActive && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-blue-600">Active</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Institute Selector - Show when user has institute role */}
        {userRole === 'institute' && (
          <>
            <DropdownMenuSeparator />
            <div className="p-3">
              <InstituteSelector variant="compact" />
            </div>
          </>
        )}
        
        <DropdownMenuSeparator />

        {/* Main Navigation - Collapsible */}
        <div className="px-2 py-1">
          <Collapsible open={isNavigationOpen} onOpenChange={setIsNavigationOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide hover:text-gray-700 transition-colors rounded">
              <span>Quick Navigation</span>
              {isNavigationOpen ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-2">
              {userNavigation.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.href);
                return (
                  <DropdownMenuItem
                    key={item.name}
                    onClick={() => {
                      // Switch to 'user' role when clicking on Profile navigation
                      const targetRole = item.name === 'Profile' ? 'user' : undefined;
                      handleNavigation(item.href, targetRole);
                    }}
                    className={`cursor-pointer ${active ? 'bg-blue-50 text-blue-700' : ''}`}
                  >
                    <IconComponent className="mr-2 h-4 w-4" />
                    {item.name}
                    {active && <span className="ml-auto text-xs">●</span>}
                  </DropdownMenuItem>
                );
              })}
            </CollapsibleContent>
          </Collapsible>

          {/* Dashboard Switching - Collapsible */}
          {session.user?.roles && session.user.roles.length > 1 && (
            <Collapsible open={isAccountOpen} onOpenChange={setIsAccountOpen} className="mt-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide hover:text-gray-700 transition-colors rounded">
                <span>Switch Dashboard</span>
                {isAccountOpen ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-2">
                {session.user.roles.filter(role => role !== userRole).map((role) => {
                  const roleConfig = ROLE_CONFIGS[role as RoleType] || {
                    icon: User,
                    label: `${role.charAt(0).toUpperCase() + role.slice(1)}`,
                    color: "bg-gray-500"
                  };
                  const IconComponent = roleConfig.icon;
                  const dashboardPath = role === 'user' ? '/dashboard' : `/dashboard/${role}`;

                  return (
                    <DropdownMenuItem
                      key={`nav-${role}`}
                      onClick={() => handleNavigation(dashboardPath, role)}
                      className="cursor-pointer"
                    >
                      <IconComponent className="mr-2 h-4 w-4" />
                      {roleConfig.label} Dashboard
                    </DropdownMenuItem>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        {/* Registration Navigation - Only show for user role */}
        {userRole === 'user' && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1">
              <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide hover:text-gray-700 transition-colors rounded">
                  <span>Registration</span>
                  {isSettingsOpen ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-2">
                  {registrationNavigation.map((item) => {
                    const IconComponent = item.icon;
                    const active = isActive(item.href);
                    return (
                      <DropdownMenuItem
                        key={item.name}
                        onClick={() => handleNavigation(item.href)}
                        className={`cursor-pointer ${active ? 'bg-blue-50 text-blue-700' : ''}`}
                      >
                        <IconComponent className="mr-2 h-4 w-4" />
                        {item.name}
                        {active && <span className="ml-auto text-xs">●</span>}
                      </DropdownMenuItem>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </>
        )}

        {/* Role-based Navigation */}
        {roleNavigation.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1">
              <Collapsible open={isHelpOpen} onOpenChange={setIsHelpOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide hover:text-gray-700 transition-colors rounded">
                  <span>{userRole.charAt(0).toUpperCase() + userRole.slice(1)} Tools</span>
                  {isHelpOpen ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-2">
                  {roleNavigation.map((item) => {
                    const IconComponent = item.icon;
                    const active = isActive(item.href);
                    return (
                      <DropdownMenuItem
                        key={item.name}
                        onClick={() => handleNavigation(item.href)}
                        className={`cursor-pointer ${active ? 'bg-blue-50 text-blue-700' : ''}`}
                      >
                        <IconComponent className="mr-2 h-4 w-4" />
                        {item.name}
                        {active && <span className="ml-auto text-xs">●</span>}
                      </DropdownMenuItem>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Profile Navigation - Always visible */}
        <div className="px-2 py-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Profile & Settings
          </p>
          {profileNavigation.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.href);
            return (
              <DropdownMenuItem
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`cursor-pointer ${active ? 'bg-blue-50 text-blue-700' : ''}`}
              >
                <IconComponent className="mr-2 h-4 w-4" />
                {item.name}
                {active && <span className="ml-auto text-xs">●</span>}
              </DropdownMenuItem>
            );
          })}
        </div>
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
