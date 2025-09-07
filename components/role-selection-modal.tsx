'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Users, 
  Target,
  Building2,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRoles: string[];
  currentActiveRole?: string;
  onRoleSelect: (role: string) => void;
}

const roleConfig = {
  student: {
    title: 'Student',
    description: 'Currently pursuing education',
    icon: GraduationCap,
    color: 'blue'
  },
  professional: {
    title: 'Professional',
    description: 'Working professional',
    icon: User,
    color: 'green'
  },
  business_owner: {
    title: 'Business Owner',
    description: 'Running or managing a business',
    icon: Briefcase,
    color: 'purple'
  },
  hr_manager: {
    title: 'HR Manager',
    description: 'Managing human resources',
    icon: Users,
    color: 'orange'
  },
  educator: {
    title: 'Educator',
    description: 'Teaching or training others',
    icon: Building2,
    color: 'teal'
  },
  career_counselor: {
    title: 'Career Counselor',
    description: 'Helping others with career paths',
    icon: Target,
    color: 'pink'
  }
};

export default function RoleSelectionModal({ 
  isOpen, 
  onClose, 
  userRoles, 
  currentActiveRole,
  onRoleSelect 
}: RoleSelectionModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>(currentActiveRole || userRoles[0] || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelection = async () => {
    if (!selectedRole) return;
    
    setIsLoading(true);
    try {
      await onRoleSelect(selectedRole);
      onClose();
    } catch (error) {
      console.error('Role selection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Select Your Active Role</DialogTitle>
          <DialogDescription className="text-center">
            You have multiple roles. Please select which role you'd like to use for this session.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {userRoles.map((roleId) => {
            const role = roleConfig[roleId as keyof typeof roleConfig];
            if (!role) return null;

            const IconComponent = role.icon;
            const isSelected = selectedRole === roleId;

            return (
              <Card
                key={roleId}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
                    : 'hover:border-gray-300'
                }`}
                onClick={() => setSelectedRole(roleId)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                    isSelected 
                      ? 'bg-blue-600 text-white' 
                      : `bg-${role.color}-100 text-${role.color}-600`
                  }`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CardTitle className="text-lg">{role.title}</CardTitle>
                    {isSelected && <CheckCircle className="h-4 w-4 text-blue-600" />}
                  </div>
                  <CardDescription className="text-center">
                    {role.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {selectedRole && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Selected Role:</h4>
            <Badge className="bg-blue-100 text-blue-800">
              {roleConfig[selectedRole as keyof typeof roleConfig]?.title}
            </Badge>
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-500">
            You can change your active role anytime from your profile settings
          </p>
          <Button
            onClick={handleRoleSelection}
            disabled={!selectedRole || isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {isLoading ? 'Setting Role...' : (
              <>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}