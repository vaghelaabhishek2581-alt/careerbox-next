'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { useProfileCompletion } from '@/hooks/use-profile-completion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, User, Phone, MapPin, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface ProfileGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProfileGuard({ children, fallback }: ProfileGuardProps) {
  const { data: session } = useSession()
  const { profile, isLoading, isProfileComplete, incompleteFields } = useProfileCompletion()

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking profile completion...</p>
        </div>
      </div>
    )
  }

  // Allow non-students to pass through
  if (session?.user?.userType !== 'student') {
    return <>{children}</>
  }

  // If profile is complete, render children
  if (isProfileComplete) {
    return <>{children}</>
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>
  }

  // Default incomplete profile UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-red-200 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-800">
            Profile Incomplete
          </CardTitle>
          <CardDescription className="text-lg text-red-600">
            Complete your profile to access your dashboard and apply to institutes seamlessly
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Missing Fields */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Missing Required Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {incompleteFields.map((field) => {
                const getIcon = (fieldName: string) => {
                  switch (fieldName) {
                    case 'Name': return <User className="h-4 w-4" />
                    case 'Email': return <Mail className="h-4 w-4" />
                    case 'Phone': return <Phone className="h-4 w-4" />
                    case 'City': return <MapPin className="h-4 w-4" />
                    default: return <User className="h-4 w-4" />
                  }
                }
                
                return (
                  <Badge key={field} variant="destructive" className="justify-start gap-2 py-2 px-3">
                    {getIcon(field)}
                    {field}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* Why This Matters */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Why is this important?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Seamless Applications:</strong> Apply to institutes without re-entering information</li>
              <li>• <strong>Personalized Recommendations:</strong> Get institute suggestions based on your profile</li>
              <li>• <strong>Better Matching:</strong> Institutes can find you based on your qualifications</li>
              <li>• <strong>Quick Contact:</strong> Institutes can reach you directly for opportunities</li>
            </ul>
          </div>

          {/* Current Profile Status */}
          {profile && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Current Profile</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className={profile.name ? 'text-green-600' : 'text-red-600'}>
                    Name: {profile.name || 'Not provided'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className={profile.email ? 'text-green-600' : 'text-red-600'}>
                    Email: {profile.email || 'Not provided'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className={profile.phone ? 'text-green-600' : 'text-red-600'}>
                    Phone: {profile.phone || 'Not provided'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className={profile.city ? 'text-green-600' : 'text-red-600'}>
                    City: {profile.city || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="text-center pt-4">
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3">
              <Link href="/onboarding">
                Complete Your Profile
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-sm text-gray-600 mt-3">
              This will only take 2 minutes and is essential for the best CareerBox experience
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
