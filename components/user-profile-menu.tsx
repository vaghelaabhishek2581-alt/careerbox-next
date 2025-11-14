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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  Users,
  GraduationCap,
  User,
  Building2,
  Briefcase,
  Settings,
  LogOut,
  FileText,
  Activity,
} from "lucide-react";
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
  admin: { icon: Settings, label: "Admin Account", color: "bg-red-500" },
} as const;

type RoleType = keyof typeof ROLE_CONFIGS;

export default function UserProfileMenu() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.profile) as { profile: any };

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
    { name: "Explore", href: "/recommendation-collections", icon: Home },
    { name: "Profile", href: "/user", icon: Users },
    { name: "Applied Courses", href: "/applied-courses", icon: GraduationCap },
  ];

  const registrationNavigation = [
    { name: "Registration Status", href: "/user/registration-status", icon: FileText },
    { name: "Register Institute", href: "/user/register-institute", icon: Building2 },
    { name: "Register Business", href: "/user/register-business", icon: Briefcase },
  ];

  const roleBasedNavigation = {
    student: [{ name: "My Applications", href: "/dashboard/user/applications", icon: Briefcase }],
    institute: [{ name: "My Institute", href: "/institute", icon: Building2 }],
    admin: [{ name: "Admin Panel", href: "/admin", icon: Activity }],
  };

  const userRole = session.user?.activeRole || session.user?.roles?.[0] || "student";
  const roleNavigation = roleBasedNavigation[userRole as keyof typeof roleBasedNavigation] || [];

  const handleNavigation = async (href: string, targetRole?: string) => {
    // Switch role if specified and different from current role
    if (targetRole && targetRole !== userRole && session?.user?.roles?.includes(targetRole)) {
      try {
        // Update Redux state first (for immediate UI feedback)
        dispatch(switchRole(targetRole));

        // Call API to update role in database (async, don't wait)
        API.user
          .switchRole(targetRole)
          .then((response) => {
            if (response.success) {
              console.log(`Role switched to: ${targetRole} (persisted to database)`);
              // Update NextAuth session quietly in background
              update({
                ...session,
                user: { ...session.user, activeRole: targetRole },
              });
            } else {
              console.error("Failed to persist role switch:", response.error);
              // Revert Redux state if API call failed
              dispatch(switchRole(userRole));
            }
          })
          .catch((error) => {
            console.error("Failed to switch role:", error);
            // Revert Redux state if API call failed
            dispatch(switchRole(userRole));
          });
      } catch (error) {
        console.error("Failed to switch role:", error);
        return; // Don't navigate if role switch failed
      }
    }
    router.push(href);
  };

  const isActive = (href: string) => pathname === href;

  // Get role icon using the same configuration
  const RoleIcon = ROLE_CONFIGS[userRole as RoleType]?.icon || User;

  // Get user initials for avatar fallback
  const userInitials = session.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={undefined} alt={session.user?.name || "User"} />
            <AvatarFallback className="bg-purple-600 text-white font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          {/* Role indicator badge */}
          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white flex items-center justify-center border border-gray-200">
            <RoleIcon className="h-2.5 w-2.5 text-gray-600" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 max-h-[80vh]" align="end" forceMount>
        <ScrollArea className="max-h-[calc(80vh-2rem)]">
          {/* User Profile Header */}
          <div className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={undefined} alt={session.user?.name || "User"} />
                <AvatarFallback className="bg-purple-600 text-white font-semibold text-lg">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1">
                <p className="text-base font-semibold leading-none">{session.user?.name || "User"}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-muted-foreground capitalize">
                    {userRole}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{session.user?.email}</p>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Role Switcher - Show when user has multiple roles */}
          {session.user?.roles && session.user.roles.length > 1 && (
            <>
              <div className="px-2 py-2">
                <p className="px-2 text-sm font-bold text-gray-900 mb-2">Switch Role</p>
                <div className="space-y-1">
                  {session.user.roles.map((role) => {
                    const RoleConfig = ROLE_CONFIGS[role as RoleType];
                    const isCurrentRole = role === userRole;

                    if (!RoleConfig) return null;

                    const RoleIconComponent = RoleConfig.icon;

                    return (
                      <DropdownMenuItem
                        key={role}
                        onClick={async () => {
                          if (role !== userRole) {
                            try {
                              // Call API to switch role
                              const response = await fetch('/api/user/switch-role', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ activeRole: role }),
                              });

                              if (!response.ok) {
                                throw new Error('Failed to switch role');
                              }

                              // Update Redux state
                              dispatch(switchRole(role));

                              // Update NextAuth session
                              await update({ activeRole: role });

                              // Navigate to appropriate dashboard
                              const dashboardRoutes: Record<string, string> = {
                                admin: '/admin',
                                institute: '/dashboard/institute',
                                business: '/dashboard/business',
                                user: '/user',
                                student: '/user',
                                professional: '/user',
                              };

                              router.push(dashboardRoutes[role] || '/user');
                            } catch (error) {
                              console.error('Failed to switch role:', error);
                              alert('Failed to switch role. Please try again.');
                            }
                          }
                        }}
                        className={`cursor-pointer ${isCurrentRole
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
                            : 'hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className={`p-2 rounded-lg ${RoleConfig.color} bg-opacity-10`}>
                            <RoleIconComponent className={`h-4 w-4 ${RoleConfig.color.replace('bg-', 'text-')}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium capitalize">{role}</p>
                            <p className="text-xs text-muted-foreground">{RoleConfig.label}</p>
                          </div>
                          {isCurrentRole && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium text-blue-600">Active</span>
                              <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                            </div>
                          )}
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </div>
              <DropdownMenuSeparator />
            </>
          )}

          {/* User Name Link */}
          <DropdownMenuItem onClick={() => handleNavigation("/user", "user")} className="cursor-pointer">
            <span className="text-blue-600 font-medium">{session.user?.name}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Sign Out Button */}
          <DropdownMenuItem onClick={() => handleUserSignOut()} className="cursor-pointer text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Institute Selector - Show when user has institute role */}
          {userRole === "institute" && (
            <>
              <div className="p-2">
                <InstituteSelector />
              </div>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Quick Navigation */}
          <div className="px-2 py-2">
            <p className="px-2 text-sm font-bold text-gray-900 mb-2">Quick Navigation</p>
            {userNavigation.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.href);
              return (
                <DropdownMenuItem
                  key={item.name}
                  onClick={() => {
                    // Switch to 'user' role when clicking on Profile navigation
                    const targetRole = item.name === "Profile" ? "user" : undefined;
                    handleNavigation(item.href, targetRole);
                  }}
                  className={`cursor-pointer ${active ? "bg-blue-50 text-blue-700" : ""}`}
                >
                  <IconComponent className="mr-2 h-4 w-4" />
                  <span>{item.name}</span>
                  {active && <span className="ml-auto text-blue-600">●</span>}
                </DropdownMenuItem>
              );
            })}
          </div>

          <DropdownMenuSeparator />

          {/* Registration Navigation - Only show for user role */}
          {userRole === "user" && (
            <>
              <div className="px-2 py-2">
                <p className="px-2 text-sm font-bold text-gray-900 mb-2">Registration</p>
                {registrationNavigation.map((item) => {
                  const IconComponent = item.icon;
                  const active = isActive(item.href);
                  return (
                    <DropdownMenuItem
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      className={`cursor-pointer ${active ? "bg-blue-50 text-blue-700" : ""}`}
                    >
                      <IconComponent className="mr-2 h-4 w-4" />
                      <span>{item.name}</span>
                      {active && <span className="ml-auto text-blue-600">●</span>}
                    </DropdownMenuItem>
                  );
                })}
              </div>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Role-based Navigation */}
          {roleNavigation.length > 0 && (
            <div className="px-2 py-2">
              <p className="px-2 text-sm font-bold text-gray-900 mb-2">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Tools
              </p>
              {roleNavigation.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.href);
                return (
                  <DropdownMenuItem
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`cursor-pointer ${active ? "bg-blue-50 text-blue-700" : ""}`}
                  >
                    <IconComponent className="mr-2 h-4 w-4" />
                    <span>{item.name}</span>
                    {active && <span className="ml-auto text-blue-600">●</span>}
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}