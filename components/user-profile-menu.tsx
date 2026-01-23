"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { RootState, AppDispatch } from "@/lib/redux/store";
import { fetchProfile } from "@/lib/redux/slices/profileSlice";
import { switchRole } from "@/lib/redux/slices/authSlice";
import {
  fetchUserInstitutes,
  setSelectedInstitute,
} from "@/lib/redux/slices/instituteSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Users,
  GraduationCap,
  User,
  Building2,
  Briefcase,
  Settings,
  LogOut,
  FileText,
  Activity,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  RefreshCw,
  LayoutGrid,
  Plus,
  BookOpen,
  LucideIcon,
} from "lucide-react";
import { handleUserSignOut } from "@/src/services/auth/auth.service";
import { API } from "@/lib/api/services";
import { Institute } from "@/lib/types/institute.types";

// ============================================
// Types
// ============================================

type RoleType =
  | "student"
  | "professional"
  | "user"
  | "business"
  | "institute"
  | "admin";
type MenuView = "main" | "profiles";

interface RoleConfig {
  icon: LucideIcon;
  label: string;
  color: string;
}

// interface Institute {
//   _id: string;
//   name: string;
//   [key: string]: unknown;
// }

interface ProfileItem {
  id: string;
  type: "role" | "institute";
  data: string | Institute;
  name: string;
  label: string;
  icon: LucideIcon;
  color: string;
  isActive: boolean;
}

interface MenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
  hasSubmenu?: boolean;
}

interface RoleTool {
  icon: LucideIcon;
  label: string;
  href: string;
}

// ============================================
// Constants
// ============================================

const ROLE_CONFIGS: Record<RoleType, RoleConfig> = {
  student: {
    icon: GraduationCap,
    label: "Student Account",
    color: "bg-blue-100 text-blue-600",
  },
  professional: {
    icon: User,
    label: "Professional Account",
    color: "bg-green-100 text-green-600",
  },
  user: {
    icon: User,
    label: "User",
    color: "bg-gray-100 text-gray-600",
  },
  business: {
    icon: Briefcase,
    label: "Business Account",
    color: "bg-purple-100 text-purple-600",
  },
  institute: {
    icon: Building2,
    label: "Institute Account",
    color: "bg-orange-100 text-orange-600",
  },
  admin: {
    icon: Settings,
    label: "Admin Account",
    color: "bg-red-100 text-red-600",
  },
};

const DASHBOARD_ROUTES: Record<string, string> = {
  admin: "/admin",
  institute: "/institute/dashboard",
  business: "/business/dashboard",
  user: "/user/dashboard",
  student: "/user/dashboard",
  professional: "/user/dashboard",
};

const ROLE_TOOLS: Partial<Record<RoleType, RoleTool>> = {
  institute: {
    icon: Building2,
    label: "My Institute Dashboard",
    href: "/institute/dashboard",
  },
  admin: {
    icon: Activity,
    label: "Admin Panel",
    href: "/admin",
  },
  student: {
    icon: Briefcase,
    label: "My Applications",
    href: "/user/applications",
  },
  business: {
    icon: Briefcase,
    label: "Business Dashboard",
    href: "/business",
  },
};

const REGISTRATION_ITEMS: MenuItem[] = [
  {
    name: "Registration Status",
    href: "/user/registration-status",
    icon: FileText,
  },
];

const SETTINGS_ITEMS: MenuItem[] = [
  {
    icon: Settings,
    name: "Settings & privacy",
    href: "/settings/accounts",
    hasSubmenu: true,
  },
  {
    icon: HelpCircle,
    name: "Help & support",
    href: "/contact",
    hasSubmenu: true,
  },
  {
    icon: MessageSquare,
    name: "Give feedback",
    href: "/contact",
    hasSubmenu: false,
  },
];

const FOOTER_LINKS = [
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
  { name: "Advertising", href: "/business-service" },
  { name: "Cookies", href: "/cookie-policy" },
] as const;

// ============================================
// Utility Functions
// ============================================

function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

function getManageItems(role: string): MenuItem[] {
  const roleMenus: Record<string, MenuItem[]> = {
    institute: [
      {
        name: "Institute Profile",
        href: "/institute/profile",
        icon: Building2,
      },
      { name: "Courses", href: "/institute/courses", icon: BookOpen },
      { name: "Students", href: "/institute/students", icon: Users },
    ],
    business: [
      { name: "Recruitment", href: "/business", icon: Briefcase },
      { name: "Preferences", href: "/settings/preferences", icon: Settings },
    ],
    admin: [
      { name: "Admin Panel", href: "/admin", icon: Activity },
      {
        name: "Settings & privacy",
        href: "/settings/accounts",
        icon: Settings,
      },
    ],
  };

  return (
    roleMenus[role] || [
      {
        name: "Applied Courses",
        href: "/user/applied-courses",
        icon: GraduationCap,
      },
      { name: "Preferences", href: "/settings/preferences", icon: Settings },
      { name: "Create New Page", href: "/user/create-page", icon: Plus },
    ]
  );
}

// ============================================
// Custom Hook
// ============================================

function useUserProfileMenu() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { profile } = useSelector((state: RootState) => state.profile) as {
    profile: any;
  };
  const { userInstitutes, selectedInstitute } = useSelector(
    (state: RootState) => state.institute,
  );
  const { currentBusiness } = useSelector((state: RootState) => state.business);

  const [isSwitching, setIsSwitching] = useState(false);
  const [view, setView] = useState<MenuView>("main");

  // Fetch profile and institutes on mount
  useEffect(() => {
    if (session?.user?.id && !profile) {
      dispatch(fetchProfile());
    }
    if (session?.user?.roles?.includes("institute")) {
      dispatch(fetchUserInstitutes());
    }
  }, [session?.user?.id, profile, dispatch, session?.user?.roles]);

  // Derived values
  const userRole = useMemo(
    () =>
      (session?.user?.activeRole ||
        session?.user?.roles?.[0] ||
        "student") as RoleType,
    [session?.user?.activeRole, session?.user?.roles],
  );

  const roleConfig = useMemo(
    () => ROLE_CONFIGS[userRole] || ROLE_CONFIGS.user,
    [userRole],
  );

  const userName = useMemo(() => {
    if (profile?.personalDetails?.firstName) {
      const firstName = profile.personalDetails.firstName;
      const lastName = profile.personalDetails.lastName || "";
      return `${firstName} ${lastName}`.trim();
    }
    return session?.user?.name || "User";
  }, [profile, session?.user?.name]);

  const getDisplayName = useCallback(
    (role: string): string => {
      if (role === "institute" && selectedInstitute)
        return selectedInstitute.name;
      if (role === "business" && currentBusiness) return currentBusiness.name;
      return userName;
    },
    [selectedInstitute, currentBusiness, userName],
  );

  const activeDisplayName = useMemo(
    () => getDisplayName(userRole),
    [getDisplayName, userRole],
  );

  // Build all profiles list
  const allProfiles = useMemo((): ProfileItem[] => {
    const roles = session?.user?.roles || [];

    const roleProfiles: ProfileItem[] = roles
      .filter((r) => r !== "institute")
      .map((role) => {
        const config = ROLE_CONFIGS[role as RoleType];
        return {
          id: role,
          type: "role" as const,
          data: role,
          name: userName,
          label: config?.label || role,
          icon: config?.icon || User,
          color: config?.color || "bg-gray-100 text-gray-600",
          isActive: userRole === role,
        };
      });

    const instituteProfiles: ProfileItem[] =
      roles.includes("institute") && Array.isArray(userInstitutes)
        ? userInstitutes.map((inst: any) => ({
            id: inst._id,
            type: "institute" as const,
            data: inst,
            name: inst.name,
            label: "Institute Account",
            icon: Building2,
            color: "bg-orange-100 text-orange-600",
            isActive:
              userRole === "institute" && selectedInstitute?._id === inst._id,
          }))
        : [];

    return [...roleProfiles, ...instituteProfiles];
  }, [
    session?.user?.roles,
    userName,
    userRole,
    userInstitutes,
    selectedInstitute,
  ]);

  const sortedProfiles = useMemo(() => {
    const active = allProfiles.filter((p) => p.isActive);
    const inactive = allProfiles.filter((p) => !p.isActive);
    return [...active, ...inactive];
  }, [allProfiles]);

  const otherProfiles = useMemo(
    () => allProfiles.filter((p) => !p.isActive).slice(0, 2),
    [allProfiles],
  );

  // Navigation handlers
  const navigateTo = useCallback((path: string) => router.push(path), [router]);

  const handleActiveProfileClick = useCallback(() => {
    const route =
      userRole === "institute"
        ? "/institute/dashboard"
        : DASHBOARD_ROUTES[userRole] || "/user/dashboard";
    navigateTo(route);
  }, [userRole, navigateTo]);

  const handleRoleSwitch = useCallback(
    async (targetRole: string) => {
      if (targetRole === userRole || !session) return;

      setIsSwitching(true);
      try {
        dispatch(switchRole(targetRole));
        const response = await API.user.switchRole(targetRole);

        if (response.success) {
          await update({
            ...session,
            user: { ...session.user, activeRole: targetRole },
          });
          navigateTo(DASHBOARD_ROUTES[targetRole] || "/user");
        } else {
          dispatch(switchRole(userRole));
        }
      } catch (error) {
        console.error("Failed to switch role:", error);
        dispatch(switchRole(userRole));
      } finally {
        setIsSwitching(false);
      }
    },
    [userRole, session, dispatch, update, navigateTo],
  );

  const handleInstituteSwitch = useCallback(
    async (institute: any) => {
      if (institute._id === selectedInstitute?._id && userRole === "institute")
        return;

      setIsSwitching(true);
      try {
        if (userRole !== "institute" && session) {
          dispatch(switchRole("institute"));
          const response = await API.user.switchRole("institute");
          if (!response.success) throw new Error("Failed to switch role");
          await update({
            ...session,
            user: { ...session.user, activeRole: "institute" },
          });
        }

        dispatch(setSelectedInstitute(institute));
        navigateTo("/institute/dashboard");
      } catch (error) {
        console.error("Failed to switch institute:", error);
      } finally {
        setIsSwitching(false);
      }
    },
    [userRole, selectedInstitute, session, dispatch, update, navigateTo],
  );

  const handleProfileClick = useCallback(
    (item: ProfileItem) => {
      if (item.type === "role") {
        handleRoleSwitch(item.data as string);
      } else {
        handleInstituteSwitch(item.data as Institute);
      }
    },
    [handleRoleSwitch, handleInstituteSwitch],
  );

  const handleSignOut = useCallback(() => handleUserSignOut(), []);

  return {
    session,
    status,
    isLoading: status === "loading" || !session,
    userName,
    userRole,
    roleConfig,
    activeDisplayName,
    allProfiles,
    sortedProfiles,
    otherProfiles,
    view,
    setView,
    isSwitching,
    navigateTo,
    handleActiveProfileClick,
    handleProfileClick,
    handleSignOut,
  };
}

// ============================================
// Sub-Components
// ============================================

const GradientAvatar = memo(function GradientAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = { sm: "h-10 w-10", md: "h-12 w-12", lg: "h-14 w-14" };
  const textSizes = { sm: "text-base", md: "text-lg", lg: "text-xl" };

  return (
    <div className="rounded-full bg-gradient-to-br from-blue-600 to-purple-600 p-[2px]">
      <div className="rounded-full bg-white p-[2px]">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={undefined} alt={name} />
          <AvatarFallback
            className={`bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold ${textSizes[size]}`}
          >
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
});

const ActiveProfileCard = memo(function ActiveProfileCard({
  displayName,
  roleConfig,
  userRole,
  onClick,
}: {
  displayName: string;
  roleConfig: RoleConfig;
  userRole: string;
  onClick: () => void;
}) {
  const roleLabelText =
    userRole === "institute" ? "Institute" : roleConfig?.label;
  const dotColor = roleConfig?.color.split(" ")[1].replace("text-", "bg-");

  return (
    <div
      className="p-3 mx-1 mt-1 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <GradientAvatar name={displayName} />
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {displayName}
          </p>
          <p className="text-[13px] text-gray-500 truncate flex items-center gap-1.5">
            <span className={`inline-block w-2 h-2 rounded-full ${dotColor}`} />
            {roleLabelText}
          </p>
        </div>
      </div>
    </div>
  );
});

const ProfileListItem = memo(function ProfileListItem({
  item,
  onClick,
  showCheckbox = false,
}: {
  item: ProfileItem;
  onClick: () => void;
  showCheckbox?: boolean;
}) {
  const Icon = item.icon;
  const isInstitute = item.type === "institute";
  const bgColor = isInstitute ? "bg-orange-50" : "bg-gray-100";
  const textColor = isInstitute ? "text-orange-600" : "text-blue-600";

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all group"
    >
      <div className="relative">
        <div
          className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-200`}
        >
          {item.isActive ? (
            <Avatar className="h-10 w-10">
              <AvatarImage src={undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
                {getInitials(item.name)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <span className={`font-bold text-lg ${textColor}`}>
              {getInitials(item.name)}
            </span>
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm">
          {showCheckbox ? (
            <div
              className={`w-full h-full rounded-full flex items-center justify-center ${item.color.split(" ")[0]}`}
            >
              <Icon className={`h-3 w-3 ${item.color.split(" ")[1]}`} />
            </div>
          ) : (
            <Icon className="h-3 w-3 text-gray-500" />
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-gray-900 group-hover:text-gray-900 truncate">
          {item.name}
        </p>
        <p className="text-[13px] text-gray-500">{item.label}</p>
      </div>
      {showCheckbox && (
        <div className="flex items-center justify-center w-6 h-6">
          {item.isActive ? (
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center border-2 border-white shadow-sm">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
          )}
        </div>
      )}
    </div>
  );
});

const MenuItemRow = memo(function MenuItemRow({
  item,
  onClick,
  variant = "default",
}: {
  item: MenuItem;
  onClick: () => void;
  variant?: "default" | "danger";
}) {
  const Icon = item.icon;
  const isDanger = variant === "danger";

  return (
    <div
      onClick={onClick}
      className="flex items-center p-2 rounded-lg hover:bg-gray-200/50 cursor-pointer transition-colors group"
    >
      <div
        className={`w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center mr-3 transition-colors ${
          isDanger ? "group-hover:bg-red-100" : "group-hover:bg-gray-300"
        }`}
      >
        <Icon
          className={`h-5 w-5 ${
            isDanger
              ? "text-gray-700 group-hover:text-red-600"
              : "text-gray-700"
          }`}
        />
      </div>
      <span
        className={`flex-1 font-medium text-[15px] ${
          isDanger ? "text-gray-900 group-hover:text-red-600" : "text-gray-900"
        }`}
      >
        {item.name}
      </span>
      {item.hasSubmenu && <ChevronRight className="h-5 w-5 text-gray-400" />}
    </div>
  );
});

const SectionHeader = memo(function SectionHeader({
  title,
}: {
  title: string;
}) {
  return (
    <p className="px-2 text-xs font-semibold text-gray-500 uppercase mb-1">
      {title}
    </p>
  );
});

const MenuDivider = memo(function MenuDivider() {
  return <div className="my-2 h-px bg-gray-200/50 mx-2" />;
});

const SeeAllProfilesButton = memo(function SeeAllProfilesButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <div className="px-4 pb-2">
      <Button
        variant="ghost"
        className="w-full mt-1 bg-white hover:bg-gray-50 text-gray-600 font-medium h-9 rounded-lg text-sm transition-colors border-0 justify-center px-2"
        onClick={onClick}
      >
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
          <RefreshCw className="h-4 w-4 text-gray-600" />
        </div>
        See all profiles
      </Button>
    </div>
  );
});

const BackButton = memo(function BackButton({
  onClick,
  title,
}: {
  onClick: () => void;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4 px-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full hover:bg-gray-200"
        onClick={onClick}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-gray-600"
        >
          <path
            d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z"
            fill="currentColor"
          />
        </svg>
      </Button>
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    </div>
  );
});

const CreatePageLink = memo(function CreatePageLink({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-all group mt-2"
    >
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
        <div className="h-5 w-5 text-gray-600 font-light flex items-center justify-center text-xl">
          +
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-gray-900">
          Create New Page
        </p>
      </div>
    </div>
  );
});

const FooterLinks = memo(function FooterLinks({
  links,
}: {
  links: readonly { name: string; href: string }[];
}) {
  return (
    <div className="mt-4 px-2 text-[13px] text-gray-500 leading-relaxed">
      <div className="flex flex-wrap gap-x-1">
        {links.map((link) => (
          <span key={link.name}>
            <Link href={link.href} className="hover:underline">
              {link.name}
            </Link>
            {" · "}
          </span>
        ))}
        <span className="cursor-pointer hover:underline">More</span>
        {" · "}
        <span>CareerBox © 2024</span>
      </div>
    </div>
  );
});

const LogoutButton = memo(function LogoutButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center p-2 rounded-lg hover:bg-gray-200/50 cursor-pointer transition-colors group"
    >
      <div className="w-9 h-9 rounded-full bg-gray-200 group-hover:bg-red-100 flex items-center justify-center mr-3 transition-colors">
        <LogOut className="h-5 w-5 text-gray-700 group-hover:text-red-600" />
      </div>
      <span className="flex-1 font-medium text-[15px] text-gray-900 group-hover:text-red-600">
        Log out
      </span>
    </div>
  );
});

// ============================================
// View Components
// ============================================

const MainView = memo(function MainView({
  activeDisplayName,
  roleConfig,
  userRole,
  otherProfiles,
  manageItems,
  onActiveProfileClick,
  onProfileClick,
  onSeeAllClick,
  onNavigate,
  onSignOut,
}: {
  activeDisplayName: string;
  roleConfig: RoleConfig;
  userRole: string;
  otherProfiles: ProfileItem[];
  manageItems: MenuItem[];
  onActiveProfileClick: () => void;
  onProfileClick: (item: ProfileItem) => void;
  onSeeAllClick: () => void;
  onNavigate: (path: string) => void;
  onSignOut: () => void;
}) {
  const currentRoleTool = ROLE_TOOLS[userRole as RoleType];

  return (
    <>
      {/* Profile Switching Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        <ActiveProfileCard
          displayName={activeDisplayName}
          roleConfig={roleConfig}
          userRole={userRole}
          onClick={onActiveProfileClick}
        />

        <div className="h-px bg-gray-100 mx-4 my-1" />

        {otherProfiles.length > 0 && (
          <div className="px-2 pt-1">
            {otherProfiles.map((item) => (
              <ProfileListItem
                key={`recent-${item.type}-${item.id}`}
                item={item}
                onClick={() => onProfileClick(item)}
              />
            ))}
          </div>
        )}

        <SeeAllProfilesButton onClick={onSeeAllClick} />
      </div>

      {/* Menu Items */}
      <div className="space-y-1">
        {currentRoleTool && (
          <div
            onClick={() => onNavigate(currentRoleTool.href)}
            className="flex items-center p-2 rounded-lg hover:bg-gray-200/50 cursor-pointer transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-gray-200 group-hover:bg-blue-100 flex items-center justify-center mr-3 transition-colors">
              <LayoutGrid className="h-5 w-5 text-gray-700 group-hover:text-blue-600" />
            </div>
            <span className="flex-1 font-medium text-[15px] text-gray-900">
              {currentRoleTool.label}
            </span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        )}

        <div className="pt-2 pb-1">
          <SectionHeader title="Manage" />
          {manageItems.map((item) => (
            <MenuItemRow
              key={item.name}
              item={item}
              onClick={() => onNavigate(item.href)}
            />
          ))}
        </div>

        {userRole === "user" && (
          <>
            <MenuDivider />
            <SectionHeader title="Registration" />
            {REGISTRATION_ITEMS.map((item) => (
              <MenuItemRow
                key={item.name}
                item={item}
                onClick={() => onNavigate(item.href)}
              />
            ))}
          </>
        )}

        <MenuDivider />

        {SETTINGS_ITEMS.map((item) => (
          <MenuItemRow
            key={item.name}
            item={item}
            onClick={() => onNavigate(item.href)}
          />
        ))}

        <LogoutButton onClick={onSignOut} />
      </div>

      <FooterLinks links={FOOTER_LINKS} />
    </>
  );
});

const ProfilesView = memo(function ProfilesView({
  sortedProfiles,
  onBack,
  onProfileClick,
  onCreatePage,
}: {
  sortedProfiles: ProfileItem[];
  onBack: () => void;
  onProfileClick: (item: ProfileItem) => void;
  onCreatePage: () => void;
}) {
  return (
    <div className="animate-in slide-in-from-right-5 duration-200">
      <BackButton onClick={onBack} title="Select profile" />

      <div className="space-y-1">
        {sortedProfiles.map((item) => (
          <ProfileListItem
            key={`${item.type}-${item.id}`}
            item={item}
            onClick={() => onProfileClick(item)}
            showCheckbox
          />
        ))}

        <MenuDivider />
        <CreatePageLink onClick={onCreatePage} />
      </div>
    </div>
  );
});

// ============================================
// Main Component
// ============================================

function UserProfileMenu() {
  const {
    isLoading,
    userRole,
    roleConfig,
    activeDisplayName,
    sortedProfiles,
    otherProfiles,
    view,
    setView,
    navigateTo,
    handleActiveProfileClick,
    handleProfileClick,
    handleSignOut,
  } = useUserProfileMenu();

  const manageItems = useMemo(() => getManageItems(userRole), [userRole]);

  if (isLoading) {
    return null;
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-12 w-12 rounded-full hover:bg-transparent focus:ring-0"
        >
          <div className="rounded-full bg-gradient-to-br from-blue-600 to-purple-600 p-[2px] shadow-sm transition-transform hover:scale-105">
            <GradientAvatar name={activeDisplayName} />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[320px] mt-2 p-0 rounded-xl shadow-2xl border-gray-200 bg-white overflow-hidden"
        align="end"
        forceMount
      >
        <div className="p-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
          {view === "main" ? (
            <MainView
              activeDisplayName={activeDisplayName}
              roleConfig={roleConfig}
              userRole={userRole}
              otherProfiles={otherProfiles}
              manageItems={manageItems}
              onActiveProfileClick={handleActiveProfileClick}
              onProfileClick={handleProfileClick}
              onSeeAllClick={() => setView("profiles")}
              onNavigate={navigateTo}
              onSignOut={handleSignOut}
            />
          ) : (
            <ProfilesView
              sortedProfiles={sortedProfiles}
              onBack={() => setView("main")}
              onProfileClick={handleProfileClick}
              onCreatePage={() => navigateTo("/user/create-page")}
            />
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default memo(UserProfileMenu);
