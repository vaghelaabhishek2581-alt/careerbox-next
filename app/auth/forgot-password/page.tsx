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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-[100px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100/40 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-100/40 blur-[100px]" />
      </div>

      <div className="w-full max-w-[440px] p-4 relative z-10">
        {/* Back to login */}
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

        <Card className="shadow-[0_20px_50px_rgb(0,0,0,0.2)] border-0 bg-white backdrop-blur-xl rounded-3xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500" />
          
          <CardHeader className="text-center pb-2 pt-8 px-8">
            <div className="flex justify-center mb-6">
              <Link href="/" className="hidden md:flex items-center space-x-2 group flex-shrink-0">
                <Logo className="text-white" />
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
              Forgot Password?
            </CardTitle>
            <CardDescription className="text-slate-500 text-base mt-2">
              Enter your email address and we'll send you a link to reset your password
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
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 pl-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl"
                      disabled={isLoading}
                    />
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
                      <span>Sending Link...</span>
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            )}

            {isSuccess && (
              <div className="text-center space-y-6">
                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-blue-900 font-semibold mb-2">
                    Check Your Email
                  </div>
                  <p className="text-sm text-blue-700 mb-4 leading-relaxed">
                    We've sent password reset instructions to your email address.
                    Please check your inbox and follow the link.
                  </p>
                  <button 
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-800 transition-all"
                    onClick={() => {
                      setIsSuccess(false)
                      setMessage('')
                    }}
                  >
                    Didn't receive it? Try again
                  </button>
                </div>
                
                <Button 
                  variant="outline"
                  onClick={() => router.push('/auth/signup?mode=signin')}
                  className="w-full h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Back to Sign In
                </Button>
              </div>
            )}

            <div className="text-center">
              <p className="text-slate-600">
                Remember your password?{" "}
                <Link
                  href="/auth/signup?mode=signin"
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} CareerBox. All rights reserved.
        </div>
      </div>
    </div>
  )
}
