'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import Logo from '@/components/logo'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [tokenValid, setTokenValid] = useState(false)
  const [email, setEmail] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      verifyToken(token)
    } else {
      setError('No reset token provided')
      setIsVerifying(false)
    }
  }, [token])

  const verifyToken = async (resetToken: string) => {
    try {
      const response = await fetch(`/api/auth/reset-password?token=${resetToken}`)
      const data = await response.json()

      if (data.success) {
        setTokenValid(true)
        setEmail(data.email)
      } else {
        setError(data.message || 'Invalid or expired reset token')
      }
    } catch (error) {
      setError('An error occurred while verifying the reset token')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        setMessage(data.message)
        setPassword('')
        setConfirmPassword('')
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/signup?mode=signin')
        }, 3000)
      } else {
        setError(data.message || 'Failed to reset password')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-blue-200 bg-blue-50">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p className="text-blue-700">Verifying reset token...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link
            href="/auth/forgot-password"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Request New Reset Link
          </Link>

          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm border-red-200 bg-red-50">
            <CardHeader className="text-center pb-4">
              <div className="mb-4 flex justify-center">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-900">
                Invalid Reset Link
              </CardTitle>
              <CardDescription className="text-red-700">
                This password reset link is invalid or has expired
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/auth/forgot-password')}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Request New Reset Link
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/auth/signup?mode=signin')}
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
              Reset Password
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your new password for {email}
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
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password (min. 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-10 pr-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-10 pr-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </Button>
              </form>
            )}

            {isSuccess && (
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-green-800 font-medium mb-2">
                    ✅ Password Reset Successfully
                  </div>
                  <p className="text-sm text-green-700 mb-3">
                    Your password has been reset successfully. You can now sign in with your new password.
                  </p>
                  <p className="text-xs text-green-600">
                    You will be redirected to the sign in page shortly...
                  </p>
                </div>
                
                <Button 
                  onClick={() => router.push('/auth/signup?mode=signin')}
                  className="w-full"
                >
                  Go to Sign In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
