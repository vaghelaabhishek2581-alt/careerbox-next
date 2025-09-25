"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Building2, 
  GraduationCap, 
  Briefcase,
  Shield,
  Plus,
  Settings,
  Check,
  ExternalLink
} from "lucide-react";
import { useRouter } from "next/navigation";

// Role configuration
const ROLE_CONFIG = {
  student: {
    icon: GraduationCap,
    label: "Student Account",
    description: "Access courses, exams, and applications",
    color: "bg-blue-500",
    features: ["Course enrollment", "Exam registration", "Job applications", "Skill tracking"]
  },
  professional: {
    icon: User,
    label: "Professional Account", 
    description: "Manage your career and job applications",
    color: "bg-green-500",
    features: ["Job search", "Career tracking", "Professional networking", "Resume builder"]
  },
  business: {
    icon: Briefcase,
    label: "Business Account",
    description: "Post jobs and manage candidates",
    color: "bg-purple-500",
    features: ["Job posting", "Candidate management", "Company profile", "Hiring analytics"]
  },
  institute: {
    icon: Building2,
    label: "Institute Account",
    description: "Manage courses and students",
    color: "bg-orange-500",
    features: ["Course management", "Student enrollment", "Academic analytics", "Certification"]
  },
  admin: {
    icon: Shield,
    label: "Admin Account",
    description: "System administration and management",
    color: "bg-red-500",
    features: ["User management", "System monitoring", "Analytics", "Configuration"]
  }
};

export default function AccountsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please sign in to manage your accounts.</p>
      </div>
    );
  }

  const currentRole = session.user.activeRole || session.user.roles?.[0] || 'student';
  const availableRoles = session.user.roles || [currentRole];
  const allRoles = Object.keys(ROLE_CONFIG);
  const unavailableRoles = allRoles.filter(role => !availableRoles.includes(role));

  const handleRequestRole = async (role: string) => {
    setIsLoading(true);
    try {
      // Here you would implement the role request logic
      // This could involve:
      // 1. Sending a request to admin for approval
      // 2. Redirecting to a role-specific onboarding flow
      // 3. Verifying eligibility (e.g., organization codes for institute/business)
      
      console.log(`Requesting ${role} role...`);
      
      // For now, just show a message
      alert(`Role request for ${ROLE_CONFIG[role as keyof typeof ROLE_CONFIG]?.label} has been submitted for review.`);
      
    } catch (error) {
      console.error('Failed to request role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Account Management</h1>
        <p className="text-muted-foreground">
          Manage your different account types and switch between roles
        </p>
      </div>

      {/* Current Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Your Active Accounts
          </CardTitle>
          <CardDescription>
            These are the account types you currently have access to
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableRoles.map((role) => {
            const roleConfig = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG];
            const IconComponent = roleConfig?.icon || User;
            const isActive = role === currentRole;
            
            return (
              <div
                key={role}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-full ${roleConfig?.color || 'bg-gray-500'} flex items-center justify-center`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{roleConfig?.label || role}</h3>
                    {isActive && (
                      <Badge variant="default" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{roleConfig?.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {roleConfig?.features.slice(0, 3).map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {roleConfig?.features && roleConfig.features.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{roleConfig.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/${role === 'student' || role === 'professional' ? 'user' : role}`)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open Dashboard
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Available Account Types */}
      {unavailableRoles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Account Type
            </CardTitle>
            <CardDescription>
              Request access to additional account types based on your needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {unavailableRoles.map((role) => {
              const roleConfig = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG];
              const IconComponent = roleConfig?.icon || User;
              
              return (
                <div
                  key={role}
                  className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-full ${roleConfig?.color || 'bg-gray-500'} flex items-center justify-center opacity-70`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{roleConfig?.label || role}</h3>
                    <p className="text-sm text-gray-600">{roleConfig?.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {roleConfig?.features.slice(0, 4).map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRequestRole(role)}
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Request Access
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Learn more about different account types and how to use them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Account Types Guide</h4>
              <p className="text-sm text-gray-600">
                Learn about the different account types and their features
              </p>
              <Button variant="outline" size="sm">
                View Guide
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Contact Support</h4>
              <p className="text-sm text-gray-600">
                Need help with account access or have questions?
              </p>
              <Button variant="outline" size="sm">
                Contact Us
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
