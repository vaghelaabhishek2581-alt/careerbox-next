'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import apiClient from '@/lib/api/client'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)

  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else {
      setStatus('error')
      setMessage('No verification token provided')
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await apiClient.post('/api/auth/verify-email', { token: verificationToken })

      if (response.success) {
        setStatus('success')
        setMessage('Your email has been verified successfully!')
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(response.error || 'Failed to verify email')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('error')
      setMessage('An error occurred while verifying your email')
    }
  }

  const resendVerification = async () => {
    setIsResending(true)
    try {
      const response = await apiClient.post('/api/auth/resend-verification')

      if (response.success) {
        setMessage('Verification email sent! Please check your inbox.')
      } else {
        setMessage(response.error || 'Failed to resend verification email')
      }
    } catch (error) {
      console.error('Resend error:', error)
      setMessage('An error occurred while resending the verification email')
    } finally {
      setIsResending(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />
      case 'error':
      case 'expired':
        return <XCircle className="h-12 w-12 text-red-500" />
      default:
        return <Mail className="h-12 w-12 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
      case 'expired':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className={`w-full max-w-md ${getStatusColor()}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
            {status === 'expired' && 'Link Expired'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we verify your email address'}
            {status === 'success' && 'Your email has been successfully verified'}
            {status === 'error' && 'There was a problem verifying your email'}
            {status === 'expired' && 'This verification link has expired'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                You will be redirected to your dashboard shortly...
              </p>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                The verification link may be invalid or expired.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={resendVerification}
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/auth/signup')}
                  className="w-full"
                >
                  Back to Sign Up
                </Button>
              </div>
            </div>
          )}

          {status === 'expired' && (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Verification links expire after 24 hours for security reasons.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={resendVerification}
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Request New Verification Email'
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/auth/signup')}
                  className="w-full"
                >
                  Back to Sign Up
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
