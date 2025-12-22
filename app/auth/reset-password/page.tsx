'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import Logo from '@/components/logo'

function ResetPasswordContent() {
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
  const token = searchParams?.get('token') || null

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
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-[100px]" />
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100/40 blur-[100px]" />
        </div>
        
        <Card className="w-full max-w-md shadow-[0_20px_50px_rgb(0,0,0,0.2)] border-0 bg-white/80 backdrop-blur-xl rounded-3xl z-10">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Verifying Token</h3>
            <p className="text-slate-500 text-center">Please wait while we verify your password reset link...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-red-100/40 blur-[100px]" />
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-100/40 blur-[100px]" />
        </div>

        <div className="w-full max-w-[440px] p-4 relative z-10">
          <div className="mb-6">
            <Link
              href="/auth/forgot-password"
              className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 shadow-sm group-hover:shadow-md transition-all">
                <ArrowLeft className="h-4 w-4 text-slate-600 group-hover:text-slate-900" />
              </div>
              Back to Forgot Password
            </Link>
          </div>

          <Card className="shadow-[0_20px_50px_rgb(0,0,0,0.2)] border-0 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
            <div className="h-1.5 w-full bg-red-500" />
            
            <CardHeader className="text-center pb-2 pt-8 px-8">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                Invalid Reset Link
              </CardTitle>
              <CardDescription className="text-slate-500 text-base mt-2">
                This password reset link is invalid or has expired
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 pt-6 space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-700 rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/auth/forgot-password')}
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-lg shadow-slate-900/20"
                >
                  Request New Reset Link
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/auth/signup?mode=signin')}
                  className="w-full h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-[100px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100/40 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-100/40 blur-[100px]" />
      </div>

      <div className="w-full max-w-[440px] p-4 relative z-10">
        <div className="mb-6">
          <Link
            href="/auth/signup?mode=signin"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 shadow-sm group-hover:shadow-md transition-all">
              <ArrowLeft className="h-4 w-4 text-slate-600 group-hover:text-slate-900" />
            </div>
            Back to Sign In
          </Link>
        </div>

        <Card className="shadow-[0_20px_50px_rgb(0,0,0,0.2)] border-0 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500" />
          
          <CardHeader className="text-center pb-2 pt-8 px-8">
            <div className="flex justify-center mb-6">
              <Link href="/" className="hidden md:flex items-center space-x-2 group flex-shrink-0">
                <Logo className="text-white" />
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
              Reset Password
            </CardTitle>
            <CardDescription className="text-slate-500 text-base mt-2">
              Enter your new password for <span className="font-medium text-slate-700">{email}</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 pt-6 space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-700 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && isSuccess && (
              <Alert className="bg-green-50 border-green-100 text-green-700 rounded-xl">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {!isSuccess && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">
                    New Password
                  </Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-12 pl-12 pr-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-10 w-10 p-0 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-12 pl-12 pr-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-10 w-10 p-0 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 rounded-xl text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Resetting...</span>
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            )}

            {isSuccess && (
              <div className="text-center space-y-6">
                <div className="p-6 bg-green-50/50 rounded-2xl border border-green-100">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-green-900 font-semibold mb-2">
                    Password Reset Successfully
                  </div>
                  <p className="text-sm text-green-700 mb-4 leading-relaxed">
                    Your password has been reset successfully. You can now sign in with your new password.
                  </p>
                  <p className="text-xs text-green-600 font-medium">
                    Redirecting to sign in page...
                  </p>
                </div>
                
                <Button 
                  onClick={() => router.push('/auth/signup?mode=signin')}
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-lg"
                >
                  Go to Sign In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} CareerBox. All rights reserved.
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
