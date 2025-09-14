'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { completeOnboarding } from '@/lib/redux/slices/authSlice'
import { useSessionRefresh } from '@/hooks/use-session-refresh'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  GraduationCap, 
  Briefcase, 
  Building2, 
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

import { useToast } from '@/components/ui/use-toast'    
type OnboardingRole = 'student' | 'professional' | 'institute_admin' | 'business_owner'

const roleOptions = [
  {
    id: 'student' as OnboardingRole,
    title: 'Student',
    description: 'I am a student looking for courses, internships, and career guidance',
    icon: GraduationCap,
    features: [
      'Access to courses and certifications',
      'Job and internship opportunities',
      'Career guidance and mentorship',
      'Skill development programs'
    ],
    color: 'bg-blue-500',
    badge: 'Most Popular'
  },
  {
    id: 'professional' as OnboardingRole,
    title: 'Professional',
    description: 'I am a working professional looking to advance my career',
    icon: Briefcase,
    features: [
      'Advanced career opportunities',
      'Professional networking',
      'Skill enhancement courses',
      'Industry insights and trends'
    ],
    color: 'bg-green-500',
    badge: null
  },
  {
    id: 'institute_admin' as OnboardingRole,
    title: 'Institute Administrator',
    description: 'I manage an educational institute and want to offer courses',
    icon: Building2,
    features: [
      'Course creation and management',
      'Student enrollment tracking',
      'Exam and assessment tools',
      'Analytics and reporting'
    ],
    color: 'bg-purple-500',
    badge: 'Premium'
  },
  {
    id: 'business_owner' as OnboardingRole,
    title: 'Business Owner',
    description: 'I own a business and want to hire talent or offer services',
    icon: Users,
    features: [
      'Job posting and recruitment',
      'Candidate screening tools',
      'Employee training programs',
      'Business networking'
    ],
    color: 'bg-orange-500',
    badge: 'Premium'
  }
]

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const { refreshSession } = useSessionRefresh()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.auth)
  const [selectedRole, setSelectedRole] = useState<OnboardingRole | null>(null)
  const { toast } = useToast()
  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signup')
    }
  }, [status, router])

  const handleRoleSelection = async (role: OnboardingRole) => {
    if (!session?.user?.id) return

    try {
      // Dispatch Redux action to complete onboarding
      const result = await dispatch(completeOnboarding({
        userId: session.user.id,
        role: role,
        userType: role === 'student' ? 'student' : 'professional'
      })).unwrap()

      if (result) {
        // Refresh session to get latest user data
        await refreshSession()

        // Show success message
        toast({
          title: 'Onboarding completed!',
          description: 'Welcome to CareerBox! Redirecting to your dashboard...',
        })

        // Redirect to appropriate dashboard
        router.push('/dashboard')
      }
    } catch (error) {
      toast({
        title: 'Error completing onboarding',
        description: error as string,
        variant: 'destructive'
      })
      // console.error('Error completing onboarding:', error)
    }
  }

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (redirect will happen in useEffect)
  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to CareerBox, {session?.user?.name}!
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Let's get you started by choosing your primary role
            </p>
            <p className="text-sm text-gray-500">
              Don't worry, you can always change this later in your settings
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {roleOptions.map((role) => {
              const IconComponent = role.icon
              const isSelected = selectedRole === role.id
              
              return (
                <Card 
                  key={role.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg ${role.color} text-white`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{role.title}</CardTitle>
                          {role.badge && (
                            <Badge variant="secondary" className="mt-1">
                              {role.badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-6 w-6 text-blue-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-4">
                      {role.description}
                    </CardDescription>
                    <ul className="space-y-2">
                      {role.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => selectedRole && handleRoleSelection(selectedRole)}
              disabled={!selectedRole || isLoading}
              className="px-8 py-3 text-lg"
            >
              {isLoading ? (
                'Setting up your account...'
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Need help choosing? You can always change your role later in your profile settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}