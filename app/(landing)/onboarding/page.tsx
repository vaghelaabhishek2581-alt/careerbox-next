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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select'
import {
  GraduationCap,
  Briefcase,
  Building2,
  Users,
  CheckCircle,
  ArrowRight,
  Phone,
  MapPin,
  BookOpen,
  Plus,
  X
} from 'lucide-react'

import { useToast } from '@/components/ui/use-toast'

type OnboardingRole = 'student' | 'professional' | 'institute_admin' | 'business_owner'

interface StudentProfileData {
  name: string
  email: string
  phone: string
  city: string
  eligibilityExams: Array<{ exam: string; score: string }>
}

interface EligibilityExam {
  exam: string
  score: string
}

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
]

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const { refreshSession } = useSessionRefresh()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.auth)
  const [selectedRole, setSelectedRole] = useState<OnboardingRole | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [studentProfile, setStudentProfile] = useState<StudentProfileData>({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    city: '',
    eligibilityExams: []
  })
  
  // Track which fields are missing and need to be filled
  const [missingFields, setMissingFields] = useState<string[]>([])
  
  // Fetch existing profile data and check what's missing
  useEffect(() => {
    const fetchExistingProfile = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/student-profile')
          if (response.ok) {
            const result = await response.json()
            if (result.success && result.data) {
              // Update student profile with existing data
              console.log('Fetched existing profile data:', result.data)
              console.log('Existing eligibility exams:', result.data.eligibilityExams)
              
              setStudentProfile(prev => {
                const updated = {
                  ...prev,
                  name: result.data.name || session.user?.name || prev.name,
                  email: result.data.email || session.user?.email || prev.email,
                  phone: result.data.phone || prev.phone,
                  city: result.data.city || prev.city,
                  eligibilityExams: result.data.eligibilityExams || prev.eligibilityExams
                }
                console.log('Updated student profile with existing data:', updated)
                return updated
              })
              
              // Check for missing required fields
              const missing: string[] = []
              if (!result.data.name && !session.user?.name) missing.push('name')
              if (!result.data.email && !session.user?.email) missing.push('email')
              if (!result.data.phone) missing.push('phone')
              if (!result.data.city) missing.push('city')
              
              setMissingFields(missing)
            }
          }
        } catch (error) {
          console.error('Error fetching existing profile:', error)
          // Fallback to session data
          setStudentProfile(prev => ({
            ...prev,
            name: session.user?.name || prev.name,
            email: session.user?.email || prev.email
          }))
          
          const missing: string[] = []
          if (!session.user.name) missing.push('name')
          if (!session.user.email) missing.push('email')
          if (!studentProfile.phone) missing.push('phone')
          if (!studentProfile.city) missing.push('city')
          setMissingFields(missing)
        }
      }
    }

    fetchExistingProfile()
  }, [session])
  const [currentExam, setCurrentExam] = useState('')
  const [currentScore, setCurrentScore] = useState('')
  const { toast } = useToast()
  
  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signup')
    }
  }, [status, router])

  // Redirect users who don't need onboarding
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const needsOnboarding = session.user.needsOnboarding
      const needsRoleSelection = session.user.needsRoleSelection
      
      console.log('Onboarding page - checking if redirect needed:', {
        needsOnboarding,
        needsRoleSelection,
        shouldRedirect: !needsOnboarding && !needsRoleSelection
      })

      // If user doesn't need onboarding, redirect to dashboard
      if (!needsOnboarding && !needsRoleSelection) {
        console.log('User does not need onboarding, redirecting to dashboard')
        router.push('/recommendation-collections')
      }
    }
  }, [status, session, router])

  const handleRoleSelection = (role: OnboardingRole) => {
    setSelectedRole(role)
    if (role === 'student') {
      setCurrentStep(2) // Move to student profile step
    } else {
      // For non-students, complete onboarding immediately
      completeOnboardingProcess(role)
    }
  }

  const addEligibilityExam = () => {
    if (currentExam.trim() && currentScore.trim()) {
      const newExam = { exam: currentExam.trim(), score: currentScore.trim() }
      console.log('Adding eligibility exam:', newExam)
      
      setStudentProfile(prev => {
        const updated = {
          ...prev,
          eligibilityExams: [...prev.eligibilityExams, newExam]
        }
        console.log('Updated student profile:', updated)
        return updated
      })
      setCurrentExam('')
      setCurrentScore('')
    }
  }

  const removeEligibilityExam = (index: number) => {
    setStudentProfile(prev => ({
      ...prev,
      eligibilityExams: prev.eligibilityExams.filter((_, i) => i !== index)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addEligibilityExam()
    }
  }

  const isStudentProfileComplete = () => {
    return studentProfile.name.trim() && 
           studentProfile.email.trim() && 
           studentProfile.phone.trim() && 
           studentProfile.city.trim()
  }

  const completeOnboardingProcess = async (role: OnboardingRole) => {
    if (!session?.user?.id) return

    try {
      // For students, save the profile data first
      if (role === 'student') {
        // Debug: Log the student profile data being sent
        console.log('Sending student profile data:', JSON.stringify(studentProfile, null, 2))
        console.log('Eligibility exams being sent:', studentProfile.eligibilityExams)
        
        const response = await fetch('/api/student-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(studentProfile),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save student profile')
        }

        const result = await response.json()
        console.log('Student profile saved:', result)
      }

      // Dispatch Redux action to complete onboarding
      const result = await dispatch(completeOnboarding({
        userId: session.user.id,
        role: role,
        userType: role === 'student' ? 'student' : 'professional'
      })).unwrap()

      if (result) {
        // Show success message
        toast({
          title: 'Onboarding completed!',
          description: 'Welcome to CareerBox! Refreshing your session...',
        })

        // Refresh session to get latest user data
        const refreshed = await refreshSession()
        
        if (refreshed) {
          console.log('Session refreshed, waiting for state to update...')
          // Small delay to ensure session state is updated
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Redirect to appropriate dashboard using redirectTo from API response
          const redirectUrl = result.redirectTo || '/recommendation-collections'
          console.log('Redirecting to:', redirectUrl)
          router.push(redirectUrl)
        } else {
          console.error('Failed to refresh session, redirecting anyway...')
          const redirectUrl = result.redirectTo || '/recommendation-collections'
          router.push(redirectUrl)
        }
      }
    } catch (error) {
      toast({
        title: 'Error completing onboarding',
        description: error as string,
        variant: 'destructive'
      })
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
          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
            </div>
          </div>

          {/* Step 1: Role Selection */}
          {currentStep === 1 && (
            <>
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
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
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
              <div className="text-center mt-8">
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
                      Continue to Next Step
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center mt-6">
                <p className="text-sm text-gray-500">
                  Need help choosing? You can always change your role later in your profile settings.
                </p>
              </div>
            </>
          )}

          {/* Step 2: Student Profile (only for students) */}
          {currentStep === 2 && selectedRole === 'student' && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Complete Your Student Profile
                </h2>
                {missingFields.length > 0 ? (
                  <>
                    <p className="text-lg text-gray-600 mb-2">
                      We just need a few more details to complete your profile
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      ✅ We already have your {session?.user?.name ? 'name' : ''} {session?.user?.name && session?.user?.email ? 'and ' : ''}{session?.user?.email ? 'email' : ''}
                    </p>
                    <p className="text-sm text-orange-600 font-medium mt-1">
                      📝 Please provide: {missingFields.filter(f => f !== 'name' && f !== 'email').map(field => 
                        field === 'phone' ? 'phone number' : field
                      ).join(', ')}
                    </p>
                  </>
                ) : (
                  <p className="text-lg text-gray-600 mb-2">
                    This information is essential for seamless institute applications
                  </p>
                )}
              </div>

              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Student Information
                  </CardTitle>
                  <CardDescription>
                    This information will be used for institute applications and career guidance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="flex items-center gap-2">
                        Full Name *
                        {session?.user?.name && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            ✅ Pre-filled
                          </Badge>
                        )}
                      </Label>
                      <Input
                        id="name"
                        value={studentProfile.name}
                        onChange={(e) => setStudentProfile(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                        className="mt-1"
                        disabled={!!session?.user?.name}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="flex items-center gap-2">
                        Email Address *
                        {session?.user?.email && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            ✅ Pre-filled
                          </Badge>
                        )}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={studentProfile.email}
                        onChange={(e) => setStudentProfile(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                        className="mt-1"
                        disabled={!!session?.user?.email}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        Phone Number *
                        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                          📝 Required
                        </Badge>
                      </Label>
                      <Input
                        id="phone"
                        value={studentProfile.phone}
                        onChange={(e) => setStudentProfile(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter your phone number (e.g., +91 9876543210)"
                        className="mt-1 border-orange-200 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city" className="flex items-center gap-2">
                        City *
                        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                          📝 Required
                        </Badge>
                      </Label>
                      <Input
                        id="city"
                        value={studentProfile.city}
                        onChange={(e) => setStudentProfile(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Enter your city (e.g., Mumbai, Delhi)"
                        className="mt-1 border-orange-200 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Eligibility Exams */}
                  <div>
                    <Label className="text-base font-semibold">Eligibility Exams (Optional)</Label>
                    <p className="text-sm text-gray-600 mb-4">Add your exam scores to improve application matching</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="exam">Exam</Label>
                        <Select value={currentExam} onValueChange={setCurrentExam}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select exam" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Engineering</SelectLabel>
                              <SelectItem value="JEE Main">JEE Main</SelectItem>
                              <SelectItem value="JEE Advanced">JEE Advanced</SelectItem>
                              <SelectItem value="GUJCET">GUJCET</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Medical</SelectLabel>
                              <SelectItem value="NEET">NEET</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Management</SelectLabel>
                              <SelectItem value="CAT">CAT</SelectItem>
                              <SelectItem value="CMAT">CMAT</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>General</SelectLabel>
                              <SelectItem value="CBSE 12th">CBSE 12th</SelectItem>
                              <SelectItem value="GSEB HSC">GSEB HSC</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="score">Score/Rank</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            value={currentScore}
                            onChange={(e) => setCurrentScore(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="e.g., 95 percentile, 1500 rank"
                          />
                          <Button
                            type="button"
                            onClick={addEligibilityExam}
                            disabled={!currentExam.trim() || !currentScore.trim()}
                            size="sm"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Display Added Exams */}
                    {studentProfile.eligibilityExams.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {studentProfile.eligibilityExams.map((exam, index) => (
                          <div key={index} className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            <span>{exam.exam}: {exam.score}</span>
                            <button
                              type="button"
                              onClick={() => removeEligibilityExam(index)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => completeOnboardingProcess('student')}
                      disabled={!isStudentProfileComplete() || isLoading}
                      className="flex-1"
                    >
                      {isLoading ? (
                        'Setting up your account...'
                      ) : missingFields.filter(f => f !== 'name' && f !== 'email').length === 0 ? (
                        <>
                          Complete Setup & Go to Dashboard
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Complete Profile Setup
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>

                  {!isStudentProfileComplete() && (
                    <div className="text-center">
                      <p className="text-sm text-red-600">
                        Please provide your {missingFields.filter(f => f !== 'name' && f !== 'email').map(field => 
                          field === 'phone' ? 'phone number' : field
                        ).join(' and ')} to continue
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}