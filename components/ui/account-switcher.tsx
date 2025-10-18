"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/redux/store";
import { setUser } from "@/lib/redux/slices/authSlice";
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
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  ChevronDown, 
  User, 
  Building2, 
  GraduationCap, 
  Briefcase,
  Shield,
  Plus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { API } from "@/lib/api/services";

// Role configuration with icons and labels
const ROLE_CONFIG = {
  student: {
    icon: GraduationCap,
    label: "Student Account",
    description: "Access courses, exams, and applications",
    color: "bg-blue-500",
    dashboardPath: "/user"
  },
  professional: {
    icon: User,
    label: "Professional Account", 
    description: "Manage your career and job applications",
    color: "bg-green-500",
    dashboardPath: "/user"
  },
  business: {
    icon: Briefcase,
    label: "Business Account",
    description: "Post jobs and manage candidates",
    color: "bg-purple-500",
    dashboardPath: "/business"
  },
  institute: {
    icon: Building2,
    label: "Institute Account",
    description: "Manage courses and students",
    color: "bg-orange-500",
    dashboardPath: "/institute"
  },
  admin: {
    icon: Shield,
    label: "Admin Account",
    description: "System administration and management",
    color: "bg-red-500",
    dashboardPath: "/admin"
  }
};

interface AccountSwitcherProps {
  profile?: any;
  compact?: boolean;
}

export default function AccountSwitcher({ profile, compact = false }: AccountSwitcherProps) {
  const { data: session, update } = useSession();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (!session?.user) return null;

  const currentRole = session.user.activeRole || session.user.roles?.[0] || 'student';
  const availableRoles = session.user.roles || [currentRole];
  const currentRoleConfig = ROLE_CONFIG[currentRole as keyof typeof ROLE_CONFIG];

  const handleRoleSwitch = async (newRole: string) => {
    if (newRole === currentRole || isLoading) return;

    // Check if user has permission for this role
    if (!session?.user?.roles?.includes(newRole)) {
      console.error(`User does not have access to role: ${newRole}`);
      return;
    }

    setIsLoading(true);
    try {
      // Update Redux state first (for immediate UI feedback)
      dispatch(setUser({
        ...session.user,
        activeRole: newRole
      } as any));

      // Navigate to appropriate dashboard immediately
      const roleConfig = ROLE_CONFIG[newRole as keyof typeof ROLE_CONFIG];
      if (roleConfig?.dashboardPath) {
        router.push(roleConfig.dashboardPath);
      }

      // Call API to update role in database (async, don't wait)
      API.user.switchRole(newRole).then(response => {
        if (response.success) {
          console.log(`Account switched to: ${newRole} (persisted to database)`);
          // Update NextAuth session quietly in background
          update({
            ...session,
            user: {
              ...session.user,
              activeRole: newRole
            }
          });
        } else {
          console.error('Failed to persist role switch:', response.error);
          // Revert Redux state if API call failed
          dispatch(setUser({
            ...session.user,
            activeRole: currentRole
          } as any));
        }
      }).catch(error => {
        console.error('Failed to switch account:', error);
        // Revert Redux state if API call failed
        dispatch(setUser({
          ...session.user,
          activeRole: currentRole
        } as any));
      });

    } catch (error) {
      console.error('Failed to switch account:', error);
      // Revert Redux state if immediate switch failed
      dispatch(setUser({
        ...session.user,
        activeRole: currentRole
      } as any));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAccount = () => {
    // Navigate to role selection or account linking page
    router.push('/settings/accounts');
  };

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${currentRoleConfig?.color || 'bg-gray-500'}`} />
            <span className="text-sm">{currentRoleConfig?.label || 'Account'}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <AccountSwitcherContent 
            availableRoles={availableRoles}
            currentRole={currentRole}
            profile={profile}
            session={session}
            onRoleSwitch={handleRoleSwitch}
            onAddAccount={handleAddAccount}
            isLoading={isLoading}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-3 p-2 h-auto">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={profile?.profileImage}
              alt={session.user?.name || "User"}
            />
            <AvatarFallback className={`${currentRoleConfig?.color || 'bg-gradient-to-r from-blue-600 to-purple-600'} text-white text-sm`}>
              {session.user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium line-clamp-1">
                {session.user?.name}
              </p>
              <Badge variant="secondary" className="text-xs">
                {currentRoleConfig?.label || 'Account'}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 line-clamp-1">
              {session.user?.email}
            </p>
            {profile?.personalDetails && (
              <p className="text-xs text-gray-400 line-clamp-1">
                {profile.personalDetails.firstName} {profile.personalDetails.lastName}
              </p>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <AccountSwitcherContent 
          availableRoles={availableRoles}
          currentRole={currentRole}
          profile={profile}
          session={session}
          onRoleSwitch={handleRoleSwitch}
          onAddAccount={handleAddAccount}
          isLoading={isLoading}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface AccountSwitcherContentProps {
  availableRoles: string[];
  currentRole: string;
  profile?: any;
  session: any;
  onRoleSwitch: (role: string) => void;
  onAddAccount: () => void;
  isLoading: boolean;
}

function AccountSwitcherContent({
  availableRoles,
  currentRole,
  profile,
  session,
  onRoleSwitch,
  onAddAccount,
  isLoading
}: AccountSwitcherContentProps) {
  return (
    <>
      <DropdownMenuLabel className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={profile?.profileImage}
            alt={session.user?.name || "User"}
          />
          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            {session.user?.name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{session.user?.name}</p>
          <p className="text-xs text-gray-500">{session.user?.email}</p>
          {profile?.personalDetails && (
            <p className="text-xs text-gray-400">
              {profile.personalDetails.firstName} {profile.personalDetails.lastName}
            </p>
          )}
        </div>
      </DropdownMenuLabel>
      
      <DropdownMenuSeparator />
      
      <div className="px-2 py-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Switch Account
        </p>
        {availableRoles.map((role) => {
          const roleConfig = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG];
          const IconComponent = roleConfig?.icon || User;
          const isActive = role === currentRole;
          
          return (
            <DropdownMenuItem
              key={role}
              onClick={() => onRoleSwitch(role)}
              disabled={isLoading}
              className={`cursor-pointer flex items-center gap-3 p-3 rounded-md ${
                isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${roleConfig?.color || 'bg-gray-500'} flex items-center justify-center`}>
                <IconComponent className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{roleConfig?.label || role}</p>
                <p className="text-xs text-gray-500">{roleConfig?.description}</p>
              </div>
              {isActive && <Check className="h-4 w-4 text-blue-600" />}
            </DropdownMenuItem>
          );
        })}
      </div>

      <DropdownMenuSeparator />
      
      <DropdownMenuItem
        onClick={onAddAccount}
        className="cursor-pointer flex items-center gap-3 p-3"
      >
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <Plus className="h-4 w-4 text-gray-600" />
        </div>
        <div>
          <p className="text-sm font-medium">Add another account</p>
          <p className="text-xs text-gray-500">Link additional roles or organizations</p>
        </div>
      </DropdownMenuItem>
    </>
  );
}
