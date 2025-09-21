'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react'
import Logo from '@/components/logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    if (!email) {
      setError('Please enter your email address')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        setMessage(data.message)
        setEmail('') // Clear email field
      } else {
        setError(data.message || 'Failed to send password reset email')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to login */}
        <Link
          href="/auth/signup?mode=signin"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign In
        </Link>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mb-4 flex justify-center">
              <Logo />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Forgot Password?
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {message && isSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {!isSuccess && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            )}

            {isSuccess && (
              <div className="text-center space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-blue-800 font-medium mb-2">
                    📧 Check Your Email
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    We've sent password reset instructions to your email address.
                    Please check your inbox and follow the link to reset your password.
                  </p>
                  <p className="text-xs text-blue-600">
                    Didn't receive the email? Check your spam folder or{" "}
                    <button 
                      className="underline hover:no-underline font-medium"
                      onClick={() => {
                        setIsSuccess(false)
                        setMessage('')
                      }}
                    >
                      try again
                    </button>
                  </p>
                </div>
                
                <Button 
                  variant="outline"
                  onClick={() => router.push('/auth/signup?mode=signin')}
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            )}

            <div className="text-center">
              <p className="text-gray-600">
                Remember your password?{" "}
                <Link
                  href="/auth/signup?mode=signin"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
