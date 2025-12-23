"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/redux/store";
import { fetchProfile } from "@/lib/redux/slices/profileSlice";
import { switchRole } from "@/lib/redux/slices/authSlice";
import { fetchUserInstitutes, setSelectedInstitute } from "@/lib/redux/slices/instituteSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  ChevronRight,
  HelpCircle,
  MessageSquare,
  Moon,
  RefreshCw,
  LayoutGrid
} from "lucide-react";
import InstituteSelector from "@/components/institute-selector";
import { handleUserSignOut } from "@/src/services/auth/auth.service";
import { API } from "@/lib/api/services";
import Link from "next/link";

// Define role configurations
const ROLE_CONFIGS = {
  student: { icon: GraduationCap, label: "Student Account", color: "bg-blue-100 text-blue-600" },
  professional: { icon: User, label: "Professional Account", color: "bg-green-100 text-green-600" },
  user: { icon: User, label: "User", color: "bg-gray-100 text-gray-600" },
  business: { icon: Briefcase, label: "Business Account", color: "bg-purple-100 text-purple-600" },
  institute: { icon: Building2, label: "Institute Account", color: "bg-orange-100 text-orange-600" },
  admin: { icon: Settings, label: "Admin Account", color: "bg-red-100 text-red-600" },
} as const;

type RoleType = keyof typeof ROLE_CONFIGS;

export default function UserProfileMenu() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.profile) as { profile: any };
  const { userInstitutes, selectedInstitute } = useSelector((state: RootState) => state.institute);
  const { currentBusiness } = useSelector((state: RootState) => state.business);
  const [isSwitching, setIsSwitching] = useState(false);
  const [view, setView] = useState<'main' | 'profiles'>('main');

  // Fetch profile data when component mounts
  useEffect(() => {
    if (session?.user?.id && !profile) {
      dispatch(fetchProfile());
    }
    
    // Fetch institutes if user has institute role
    if (session?.user?.roles?.includes('institute')) {
      dispatch(fetchUserInstitutes());
    }
  }, [session?.user?.id, profile, dispatch, session?.user?.roles]);

  if (status === "loading" || !session) {
    return null;
  }

  // Derive user name from profile (database) or session (auth provider)
  const userName = profile?.personalDetails?.firstName 
    ? `${profile.personalDetails.firstName} ${profile.personalDetails.lastName || ''}`.trim()
    : session.user?.name || "User";

  // Helper to get initials from name
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const userRole = session.user?.activeRole || session.user?.roles?.[0] || "student";
  const RoleIcon = ROLE_CONFIGS[userRole as RoleType]?.icon || User;
  const RoleConfig = ROLE_CONFIGS[userRole as RoleType];

  // Helper to get display name based on role
  const getDisplayName = (role: string) => {
    if (role === 'institute' && selectedInstitute) return selectedInstitute.name;
    if (role === 'business' && currentBusiness) return currentBusiness.name;
    return userName;
  };
  
  // Get active profile initials
  const activeDisplayName = getDisplayName(userRole);
  const activeInitials = getInitials(activeDisplayName);

  // Compile all available profiles
  const allProfiles = [
    // Generic Roles (excluding institute as they are handled separately)
    ...(session.user?.roles || [])
      .filter(r => r !== 'institute')
      .map(role => {
        const config = ROLE_CONFIGS[role as RoleType];
        return {
          id: role,
          type: 'role',
          data: role,
          name: userName,
          label: config?.label || role,
          icon: config?.icon || User,
          color: config?.color || "bg-gray-100 text-gray-600",
          isActive: userRole === role
        };
      }),
    
    // Institutes
    ...(session.user?.roles?.includes('institute') && Array.isArray(userInstitutes) ? userInstitutes : []).map((inst: any) => ({
      id: inst._id,
      type: 'institute',
      data: inst,
      name: inst.name,
      label: 'Institute Account',
      icon: Building2,
      color: "bg-orange-100 text-orange-600",
      isActive: userRole === 'institute' && selectedInstitute?._id === inst._id
    }))
  ];

  // Sort: Active first, then others
  const sortedProfiles = [
    ...allProfiles.filter(p => p.isActive),
    ...allProfiles.filter(p => !p.isActive)
  ];

  // Recent profiles for the main view (excluding the active one)
  const otherProfiles = allProfiles.filter(p => !p.isActive).slice(0, 2);

  const handleRoleSwitch = async (targetRole: string) => {
    if (targetRole === userRole) return;
    
    setIsSwitching(true);
    try {
      dispatch(switchRole(targetRole));
      
      const response = await API.user.switchRole(targetRole);
      
      if (response.success) {
        await update({ ...session, user: { ...session.user, activeRole: targetRole } });
        
        const dashboardRoutes: Record<string, string> = {
          admin: '/admin',
          institute: '/institute/dashboard',
          business: '/business',
          user: '/user',
          student: '/user',
          professional: '/user',
        };
        
        router.push(dashboardRoutes[targetRole] || '/user');
      } else {
        dispatch(switchRole(userRole));
      }
    } catch (error) {
      console.error("Failed to switch role:", error);
      dispatch(switchRole(userRole));
    } finally {
      setIsSwitching(false);
    }
  };

  const handleInstituteSwitch = async (institute: any) => {
    if (institute._id === selectedInstitute?._id && userRole === 'institute') return;
    
    setIsSwitching(true);
    try {
      // 1. Switch to institute role if needed
      if (userRole !== 'institute') {
        dispatch(switchRole('institute'));
        const response = await API.user.switchRole('institute');
        if (!response.success) throw new Error("Failed to switch role");
        await update({ ...session, user: { ...session.user, activeRole: 'institute' } });
      }

      // 2. Select the institute
      dispatch(setSelectedInstitute(institute));
      
      // 3. Navigate
      router.push('/institute/dashboard');
    } catch (error) {
      console.error("Failed to switch institute:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  const menuItems = [
    { name: "Explore", href: "/recommendation-collections", icon: Home },
    { name: "Profile", href: "/user", icon: Users },
    { name: "Applied Courses", href: "/user/applied-courses", icon: GraduationCap },
  ];

  const registrationItems = [
    { name: "Registration Status", href: "/user/registration-status", icon: FileText },
    { name: "Register Institute", href: "/user/register-institute", icon: Building2 },
    { name: "Register Business", href: "/user/register-business", icon: Briefcase },
  ];

  const settingsItems = [
    {
      icon: Settings,
      name: "Settings & privacy",
      href: "/settings/accounts",
      hasSubmenu: true
    },
    {
      icon: HelpCircle,
      name: "Help & support",
      href: "/contact",
      hasSubmenu: true
    },
    {
      icon: MessageSquare,
      name: "Give feedback",
      href: "/contact",
      hasSubmenu: false
    }
  ];


  // Combine role-specific tools into the main menu
  const roleTools = {
    institute: { icon: Building2, label: "My Institute Dashboard", href: "/institute/dashboard" },
    admin: { icon: Activity, label: "Admin Panel", href: "/admin" },
    student: { icon: Briefcase, label: "My Applications", href: "/user/applications" },
    business: { icon: Briefcase, label: "Business Dashboard", href: "/business" },
  };

  const currentRoleTool = roleTools[userRole as keyof typeof roleTools];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-12 w-12 rounded-full hover:bg-transparent focus:ring-0">
          <div className="rounded-full bg-gradient-to-br from-blue-600 to-purple-600 p-[2px] shadow-sm transition-transform hover:scale-105">
            <div className="rounded-full bg-white p-[2px]">
              <Avatar className="h-12 w-12">
                <AvatarImage src={undefined} alt={activeDisplayName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold text-lg">
                  {activeInitials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          {/* <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-white flex items-center justify-center border-2 border-white shadow-sm z-10">
            <div className={`h-full w-full rounded-full flex items-center justify-center ${RoleConfig?.color.split(' ')[0]}`}>
              <RoleIcon className={`h-3 w-3 ${RoleConfig?.color.split(' ')[1]}`} />
            </div>
          </div> */}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[320px] mt-2 p-0 rounded-xl shadow-2xl border-gray-200 bg-white overflow-hidden" align="end" forceMount>
        <div className="p-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
        {view === 'main' ? (
          <>
            {/* Profile Switching Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
              {/* Active Profile */}
              <div className="p-3 mx-1 mt-1 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group" onClick={() => router.push('/user')}>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-gradient-to-br from-blue-600 to-purple-600 p-[2px]">
                    <div className="rounded-full bg-white p-[2px]">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold text-lg">
                          {activeInitials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {getDisplayName(userRole)}
                </p>
                <p className="text-[13px] text-gray-500 truncate flex items-center gap-1.5">
                  <span className={`inline-block w-2 h-2 rounded-full ${RoleConfig?.color.split(' ')[1].replace('text-', 'bg-')}`}></span>
                  {userRole === 'institute' ? 'Institute' : RoleConfig?.label}
                </p>
              </div>
                </div>
              </div>

              <div className="h-px bg-gray-100 mx-4 my-1" />

              {/* Recent Profiles (Max 2) */}
              {otherProfiles.length > 0 && (
                <div className="px-2 pt-1">
                  {otherProfiles.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={`recent-${item.type}-${item.id}`}
                        onClick={() => item.type === 'role' ? handleRoleSwitch(item.data as string) : handleInstituteSwitch(item.data)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all group"
                      >
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-full ${item.type === 'institute' ? 'bg-orange-50' : 'bg-gray-100'} flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-200`}>
                           <span className={`font-bold text-lg ${item.type === 'institute' ? 'text-orange-600' : 'text-blue-600'}`}>
                             {getInitials(item.name)}
                           </span>
                        </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                            <Icon className={`h-3 w-3 ${item.type === 'institute' ? 'text-gray-500' : 'text-gray-500'}`} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-[15px] font-semibold text-gray-900 group-hover:text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-[13px] text-gray-500">{item.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* See all profiles button */}
              <div className="px-2 pb-2">
                <Button 
                  variant="ghost" 
                  className="w-full mt-1 bg-white hover:bg-gray-50 text-gray-600 font-medium h-9 rounded-lg text-sm transition-colors border-0 justify-start px-2"
                  onClick={() => setView('profiles')}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    <RefreshCw className="h-4 w-4 text-gray-600" />
                  </div>
                  See all profiles
                </Button>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-1">
              {/* Current Role Dashboard Link (Dynamic) */}
              {currentRoleTool && (
                <div 
                  onClick={() => router.push(currentRoleTool.href)}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-200/50 cursor-pointer transition-colors group"
                >
                  <div className="w-9 h-9 rounded-full bg-gray-200 group-hover:bg-blue-100 flex items-center justify-center mr-3 transition-colors">
                    <LayoutGrid className="h-5 w-5 text-gray-700 group-hover:text-blue-600" />
                  </div>
                  <span className="flex-1 font-medium text-[15px] text-gray-900">{currentRoleTool.label}</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              )}

              {/* User Navigation (Old items restored) */}
              {menuItems.map((item) => (
                <div
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-200/50 cursor-pointer transition-colors group"
                >
                  <div className="w-9 h-9 rounded-full bg-gray-200 group-hover:bg-gray-300 flex items-center justify-center mr-3 transition-colors">
                    <item.icon className="h-5 w-5 text-gray-700" />
                  </div>
                  <span className="flex-1 font-medium text-[15px] text-gray-900">{item.name}</span>
                </div>
              ))}

              {/* Registration Items (User role only) */}
              {userRole === "user" && (
                <>
                  <div className="my-2 h-px bg-gray-200/50 mx-2" />
                  <p className="px-2 text-xs font-semibold text-gray-500 uppercase mb-1">Registration</p>
                  {registrationItems.map((item) => (
                    <div
                      key={item.name}
                      onClick={() => router.push(item.href)}
                      className="flex items-center p-2 rounded-lg hover:bg-gray-200/50 cursor-pointer transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-full bg-gray-200 group-hover:bg-gray-300 flex items-center justify-center mr-3 transition-colors">
                        <item.icon className="h-5 w-5 text-gray-700" />
                      </div>
                      <span className="flex-1 font-medium text-[15px] text-gray-900">{item.name}</span>
                    </div>
                  ))}
                </>
              )}

              <div className="my-2 h-px bg-gray-200/50 mx-2" />

              {/* Settings & Support */}
              {/* {settingsItems.map((item) => (
                <div
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-200/50 cursor-pointer transition-colors group"
                >
                  <div className="w-9 h-9 rounded-full bg-gray-200 group-hover:bg-gray-300 flex items-center justify-center mr-3 transition-colors">
                    <item.icon className="h-5 w-5 text-gray-700" />
                  </div>
                  <span className="flex-1 font-medium text-[15px] text-gray-900">{item.name}</span>
                  {item.hasSubmenu && <ChevronRight className="h-5 w-5 text-gray-400" />}
                </div>
              ))} */}

              {/* Log Out */}
              <div
                onClick={() => handleUserSignOut()}
                className="flex items-center p-2 rounded-lg hover:bg-gray-200/50 cursor-pointer transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-gray-200 group-hover:bg-red-100 flex items-center justify-center mr-3 transition-colors">
                  <LogOut className="h-5 w-5 text-gray-700 group-hover:text-red-600" />
                </div>
                <span className="flex-1 font-medium text-[15px] text-gray-900 group-hover:text-red-600">Log out</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 px-2 text-[13px] text-gray-500 leading-relaxed">
              <div className="flex flex-wrap gap-x-1">
                <Link href="/privacy" className="hover:underline">Privacy</Link> · 
                <Link href="/terms" className="hover:underline">Terms</Link> · 
                <Link href="/business-service" className="hover:underline">Advertising</Link> · 
                <Link href="/cookie-policy" className="hover:underline">Cookies</Link> · 
                <span className="cursor-pointer hover:underline">More</span> · 
                <span>CareerBox © 2024</span>
              </div>
            </div>
          </>
        ) : (
          /* Profiles View */
          <div className="animate-in slide-in-from-right-5 duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 px-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-gray-200"
                onClick={() => setView('main')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600">
                  <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" fill="currentColor"/>
                </svg>
              </Button>
              <h2 className="text-lg font-bold text-gray-900">Select profile</h2>
            </div>

            <div className="space-y-1">
              {/* Sorted Profiles List */}
              {sortedProfiles.map((item) => {
                const Icon = item.icon;
                
                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => item.type === 'role' ? handleRoleSwitch(item.data as string) : handleInstituteSwitch(item.data)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-all group"
                  >
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full ${item.type === 'institute' ? 'bg-orange-50' : 'bg-gray-100'} flex items-center justify-center border border-gray-200`}>
                        {item.isActive ? (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
                              {activeInitials}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <span className={`font-bold text-lg ${item.type === 'institute' ? 'text-orange-600' : 'text-gray-600'}`}>
                             {getInitials(item.name)}
                          </span>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                        <div className={`w-full h-full rounded-full flex items-center justify-center ${item.color.split(' ')[0]}`}>
                           <Icon className={`h-3 w-3 ${item.color.split(' ')[1]}`} />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-gray-900 truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2">
                         <p className="text-[13px] text-gray-500">{item.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-6 h-6">
                      {item.isActive ? (
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center border-2 border-white shadow-sm">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="my-2 h-px bg-gray-200/50 mx-2" />
              
              {/* Create Page Link */}
              <div
                onClick={() => router.push('/user/register-institute')}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-all group mt-2"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                  <div className="h-5 w-5 text-gray-600 font-light flex items-center justify-center text-xl">+</div>
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-[15px] font-semibold text-gray-900">Create New Profile</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
