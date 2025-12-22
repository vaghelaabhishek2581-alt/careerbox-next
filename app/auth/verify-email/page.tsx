'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, CheckCircle, AlertCircle, Loader2, Mail } from 'lucide-react'
import Logo from '@/components/logo'

function VerifyEmailContent() {
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else {
      setError('No verification token provided')
      setIsVerifying(false)
    }
  }, [token])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`)
      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        if (data.email) setEmail(data.email)
      } else {
        setError(data.message || 'Invalid or expired verification token')
      }
    } catch (error) {
      setError('An error occurred while verifying your email')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendVerification = async () => {
    // Redirect to sign in page with a message or handle resend logic here
    // For now, redirecting to sign in page is safer as we don't have the email in all error cases
    router.push('/auth/signup?mode=signin')
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
            <h3 className="text-xl font-bold text-slate-900 mb-2">Verifying Email</h3>
            <p className="text-slate-500 text-center">Please wait while we verify your email address...</p>
          </CardContent>
        </Card>
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

      <div className="w-full max-w-[480px] p-4 relative z-10">
        <Card className="shadow-[0_20px_50px_rgb(0,0,0,0.2)] border-0 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
          <div className={`h-1.5 w-full ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`} />
          
          <CardHeader className="text-center pb-2 pt-8 px-8">
            <div className="flex justify-center mb-6">
              <Link href="/" className="hidden md:flex items-center space-x-2 group flex-shrink-0">
                <Logo className="text-white" />
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
              {isSuccess ? 'Email Verified' : 'Verification Failed'}
            </CardTitle>
            <CardDescription className="text-slate-500 text-base mt-2">
              {isSuccess 
                ? 'Your email address has been successfully verified' 
                : 'We could not verify your email address'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 pt-6 space-y-8">
            {isSuccess ? (
              <div className="text-center space-y-6">
                <div className="p-8 bg-green-50/50 rounded-3xl border border-green-100">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-green-900 mb-2">
                    Welcome to CareerBox!
                  </h3>
                  <p className="text-green-700 leading-relaxed">
                    Your account is now fully active. You can sign in to access all features.
                  </p>
                </div>
                
                <Button 
                  onClick={() => router.push('/auth/signup?mode=signin')}
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/20 text-lg transition-all hover:scale-[1.02]"
                >
                  Sign In Now
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="p-8 bg-red-50/50 rounded-3xl border border-red-100">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <AlertCircle className="h-10 w-10 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-red-900 mb-2">
                    Something went wrong
                  </h3>
                  <p className="text-red-700 leading-relaxed mb-4">
                    {error}
                  </p>
                  <p className="text-sm text-red-600/80">
                    The link may have expired or has already been used.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleResendVerification}
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-lg"
                  >
                    Go to Sign In
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/contact')}
                    className="w-full h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Contact Support
                  </Button>
                </div>
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
} 
