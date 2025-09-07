'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AnimatedLogo from '@/components/animated-logo';
import RoleSelectionModal from '@/components/role-selection-modal';
import { 
  User, 
  Settings, 
  LogOut, 
  Crown,
  CheckCircle,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Users,
  Target
} from 'lucide-react';

const roleIcons = {
  student: GraduationCap,
  professional: User,
  business_owner: Briefcase,
  hr_manager: Users,
  educator: Target,
  career_counselor: Target,
};

const roleColors = {
  student: 'bg-blue-100 text-blue-800',
  professional: 'bg-green-100 text-green-800',
  business_owner: 'bg-purple-100 text-purple-800',
  hr_manager: 'bg-orange-100 text-orange-800',
  educator: 'bg-teal-100 text-teal-800',
  career_counselor: 'bg-pink-100 text-pink-800',
};

const roleDashboardPaths = {
  student: '/dashboard/user',
  professional: '/dashboard/user',
  business_owner: '/dashboard/business',
  hr_manager: '/dashboard/business',
  educator: '/dashboard/organization',
  career_counselor: '/dashboard/user',
};

export default function DashboardPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signup');
      return;
    }
    
    if (session.user?.needsOnboarding) {
      router.push('/onboarding');
      return;
    }

    // Check if we need to show role selection modal
    const selectRole = searchParams?.get('selectRole');
    const needsRoleSelection = session.user?.needsRoleSelection || selectRole === 'true';
    const hasMultipleRoles = session.user?.roles && session.user.roles.length > 1;

    if (needsRoleSelection && hasMultipleRoles) {
      setShowRoleModal(true);
    } else if (session.user?.activeRole) {
      // Redirect to role-specific dashboard
      const dashboardPath = roleDashboardPaths[session.user.activeRole as keyof typeof roleDashboardPaths];
      if (dashboardPath && dashboardPath !== '/dashboard') {
        router.push(dashboardPath);
      }
    }
  }, [session, status, router, searchParams]);

  const handleRoleSelect = async (selectedRole: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/user/select-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activeRole: selectedRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      // Update the session
      await update();
      
      // Redirect to role-specific dashboard
      const dashboardPath = roleDashboardPaths[selectedRole as keyof typeof roleDashboardPaths];
      if (dashboardPath) {
        router.push(dashboardPath);
      }
    } catch (error) {
      console.error('Role selection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || session.user?.needsOnboarding) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <AnimatedLogo />
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={session.user?.image || ''} />
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold">
                  {session.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {session.user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-600">Ready to continue your professional journey?</p>
              </div>
            </div>

            {/* User Roles */}
            <div className="flex flex-wrap gap-2 mb-6">
              {session.user?.roles?.map((role: string) => {
                const IconComponent = roleIcons[role as keyof typeof roleIcons] || User;
                const colorClass = roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800';
                const isActive = role === session.user?.activeRole;
                
                return (
                  <Badge key={role} className={`${colorClass} px-3 py-1 ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
                    <IconComponent className="h-4 w-4 mr-1" />
                    {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    {isActive && <Crown className="h-3 w-3 ml-1 text-yellow-600" />}
                  </Badge>
                );
              })}
            </div>

            {/* Active Role */}
            {session.user?.activeRole && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Active Role:</p>
                <Badge className="bg-blue-600 text-white px-4 py-2 text-base">
                  <Crown className="h-4 w-4 mr-2" />
                  {session.user.activeRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>
            )}
          </div>

          {/* Dashboard Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Profile Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Profile Overview
                </CardTitle>
                <CardDescription>Manage your personal information and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Account Type</span>
                    <Badge className="bg-green-100 text-green-800">
                      {session.user?.provider === 'google' ? 'Google Account' : 'Email Account'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Roles</span>
                    <span className="text-sm font-medium">{session.user?.roles?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Profile Status</span>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Complete</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Edit Profile <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Role Management Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Role Management
                </CardTitle>
                <CardDescription>Switch between your roles or manage role settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Roles</span>
                    <span className="text-sm font-medium">{session.user?.roles?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Role</span>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {session.user?.activeRole?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'None'}
                    </Badge>
                  </div>
                </div>
                {(session.user?.roles?.length || 0) > 1 && (
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => setShowRoleModal(true)}
                  >
                    Switch Role <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Subscription Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-600" />
                  Subscription
                </CardTitle>
                <CardDescription>Your current plan and billing information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-purple-600">Free Plan</div>
                  <div className="text-sm text-gray-500">Basic features included</div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Multiple role support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Basic career guidance</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Profile management</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Upgrade to Pro <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Role-Specific Recommendations */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>Based on your active role and interests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {session.user?.activeRole && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      For {session.user.activeRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}s
                    </h4>
                    <p className="text-sm text-blue-700">
                      {session.user.activeRole === 'student' && 'Complete your career assessment to get personalized course recommendations.'}
                      {session.user.activeRole === 'professional' && 'Explore leadership training programs to advance your career.'}
                      {session.user.activeRole === 'business_owner' && 'Discover talent acquisition tools to grow your team.'}
                      {session.user.activeRole === 'hr_manager' && 'Access recruitment analytics and employee development tools.'}
                      {session.user.activeRole === 'educator' && 'Find industry partnerships to enhance your curriculum.'}
                      {session.user.activeRole === 'career_counselor' && 'Expand your toolkit with advanced assessment resources.'}
                    </p>
                  </div>
                )}
                
                {!session.user?.activeRole && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Select Your Active Role</h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      Choose which role you'd like to focus on to get personalized recommendations.
                    </p>
                    <Button 
                      size="sm" 
                      onClick={() => setShowRoleModal(true)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      Select Active Role
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Role Selection Modal */}
      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        userRoles={session.user?.roles || []}
        currentActiveRole={session.user?.activeRole}
        onRoleSelect={handleRoleSelect}
      />
    </div>
  );
}