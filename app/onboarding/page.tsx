'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AnimatedLogo from '@/components/animated-logo';
import { 
  User, 
  Building2, 
  Briefcase, 
  GraduationCap, 
  Users, 
  Target,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

interface RoleOption {
  id: string;
  title: string;
  description: string;
  icon: any;
  features: string[];
  color: string;
}

const roleOptions: RoleOption[] = [
  {
    id: 'student',
    title: 'Student',
    description: 'Currently pursuing education and planning career path',
    icon: GraduationCap,
    features: ['Career guidance', 'Skill assessments', 'Internship opportunities', 'Academic support'],
    color: 'blue'
  },
  {
    id: 'professional',
    title: 'Professional',
    description: 'Working professional looking to advance career',
    icon: User,
    features: ['Career advancement', 'Skill development', 'Leadership training', 'Network building'],
    color: 'green'
  },
  {
    id: 'business_owner',
    title: 'Business Owner',
    description: 'Running or managing a business, need talent solutions',
    icon: Briefcase,
    features: ['Talent acquisition', 'Employee training', 'Business analytics', 'Team management'],
    color: 'purple'
  },
  {
    id: 'hr_manager',
    title: 'HR Manager',
    description: 'Managing human resources and talent development',
    icon: Users,
    features: ['Recruitment tools', 'Employee development', 'Performance tracking', 'Analytics'],
    color: 'orange'
  },
  {
    id: 'educator',
    title: 'Educator',
    description: 'Teaching or training others in professional skills',
    icon: Building2,
    features: ['Curriculum development', 'Student placement', 'Industry partnerships', 'Training programs'],
    color: 'teal'
  },
  {
    id: 'career_counselor',
    title: 'Career Counselor',
    description: 'Helping others navigate their career paths',
    icon: Target,
    features: ['Client management', 'Assessment tools', 'Resource library', 'Progress tracking'],
    color: 'pink'
  }
];

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
    } else if (session.user && !session.user.needsOnboarding) {
      router.push('/dashboard');
    }
  }, [session, router]);

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleCompleteOnboarding = async () => {
    if (selectedRoles.length === 0) {
      setError('Please select at least one role that describes you');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: session?.user?.id,
          roles: selectedRoles 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete onboarding');
      }

      // Update the session
      await update();
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelectionComplete = async (selectedRoles: string[]) => {
    if (selectedRoles.length === 0) {
      setError('Please select at least one role that describes you');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: session?.user?.id,
          roles: selectedRoles 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete onboarding');
      }

      // Update the session
      await update();
      
      // If user has multiple roles, they'll need to select active role
      if (selectedRoles.length > 1) {
        router.push('/dashboard?selectRole=true');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mb-6">
              <AnimatedLogo />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome, {session.user?.name}! 👋
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              To personalize your CareerBox experience, please select all roles that describe you. 
              You can choose multiple roles to unlock relevant features and content.
            </p>
          </div>

          {error && (
            <div className="mb-8">
              <Alert variant="destructive" className="max-w-2xl mx-auto">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Role Selection Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {roleOptions.map((role) => {
              const IconComponent = role.icon;
              const isSelected = selectedRoles.includes(role.id);
              
              return (
                <Card
                  key={role.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    isSelected 
                      ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => handleRoleToggle(role.id)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                      isSelected 
                        ? 'bg-blue-600 text-white' 
                        : `bg-${role.color}-100 text-${role.color}-600`
                    }`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CardTitle className="text-xl">{role.title}</CardTitle>
                      {isSelected && <CheckCircle className="h-5 w-5 text-blue-600" />}
                    </div>
                    <CardDescription className="text-center">
                      {role.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {role.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-blue-600' : `bg-${role.color}-400`
                          }`}></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Selected Roles Summary */}
          {selectedRoles.length > 0 && (
            <div className="mb-8 p-6 bg-white rounded-xl shadow-lg max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Selected Roles:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedRoles.map(roleId => {
                  const role = roleOptions.find(r => r.id === roleId);
                  return (
                    <Badge key={roleId} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {role?.title}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Continue Button */}
          <div className="text-center">
            <Button
              onClick={() => handleRoleSelectionComplete(selectedRoles)}
              disabled={selectedRoles.length === 0 || isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                'Setting up your account...'
              ) : (
                <>
                  Continue to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            
            <p className="text-sm text-gray-500 mt-4">
              Don't worry, you can update your roles anytime from your profile settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}