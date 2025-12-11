'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Building, ArrowRight, Home, Bell } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import confetti from 'canvas-confetti'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showConfetti, setShowConfetti] = useState(false)

  const organizationType = searchParams?.get('type') || 'organization'
  const organizationName = searchParams?.get('org') || searchParams?.get('organization') || 'Your Organization'

  useEffect(() => {
    // Trigger confetti animation
    const timer = setTimeout(() => {
      setShowConfetti(true)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const getDashboardUrl = () => {
    return organizationType === 'institute' ? '/dashboard/institute' : '/dashboard/business'
  }

  const getWelcomeMessage = () => {
    if (organizationType === 'institute') {
      return {
        title: 'Welcome to CareerBox Institute! 🎓',
        subtitle: 'Your educational institution is now ready to manage courses and students.',
        features: [
          'Create and manage courses',
          'Track student progress',
          'Generate reports and analytics',
          'Communicate with students',
          'Manage faculty and staff'
        ]
      }
    } else {
      return {
        title: 'Welcome to CareerBox Business! 💼',
        subtitle: 'Your business account is now active and ready to connect with talent.',
        features: [
          'Post job opportunities',
          'Search and connect with candidates',
          'Manage recruitment pipeline',
          'Access talent analytics',
          'Build your employer brand'
        ]
      }
    }
  }

  const welcomeData = getWelcomeMessage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="flex justify-center">
            <div className="relative">
              <CheckCircle className="h-20 w-20 text-green-500" />
              {showConfetti && (
                <div className="absolute inset-0 animate-ping">
                  <CheckCircle className="h-20 w-20 text-green-300 opacity-75" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">Payment Successful!</h1>
            <p className="text-xl text-gray-600">
              Your registration has been completed successfully
            </p>
          </div>
        </div>

        {/* Welcome Card */}
        <Card className="max-w-4xl mx-auto border-green-200 bg-gradient-to-r from-green-50 to-orange-50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-800">
              {welcomeData.title}
            </CardTitle>
            <p className="text-green-700 text-lg">
              {welcomeData.subtitle}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Organization Details */}
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center space-x-3 mb-2">
                <Building className="h-5 w-5 text-orange-500" />
                <span className="font-medium text-gray-700">Organization Details</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{organizationName}</p>
                  <Badge variant="outline" className="mt-1">
                    {organizationType.charAt(0).toUpperCase() + organizationType.slice(1)} Account
                  </Badge>
                </div>
                <Badge className="bg-green-500 text-white">
                  ✓ Active
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Features Available */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What you can do now:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {welcomeData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Next Steps */}
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                🚀 Next Steps
              </h3>
              <ul className="space-y-2 text-orange-700">
                <li>• Complete your organization profile</li>
                <li>• Set up your {organizationType === 'institute' ? 'courses and faculty' : 'job postings and team'}</li>
                <li>• Explore the dashboard features</li>
                <li>• Check out our getting started guide</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <Button
            onClick={() => router.push(getDashboardUrl())}
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 flex-1"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>

          <Button
            onClick={() => router.push('/dashboard/notifications')}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            <Bell className="h-4 w-4 mr-2" />
            View Notifications
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <p className="text-gray-600">
            A confirmation email has been sent to your registered email address.
          </p>
          <p className="text-sm text-gray-500">
            If you have any questions, feel free to contact our support team.
          </p>
        </div>

        {/* Quick Navigation */}
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-lg">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push('/recommendation-collections')}
            >
              <Home className="h-4 w-4 mr-2" />
              Main Dashboard
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push(`${getDashboardUrl()}/profile`)}
            >
              <Building className="h-4 w-4 mr-2" />
              Organization Profile
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push('/help')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Getting Started Guide
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
