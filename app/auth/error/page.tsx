"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Home, HelpCircle } from 'lucide-react';
import Logo from '@/components/logo';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error") || null;

  // Debug logging
  console.log('🚨 Auth Error Page - Error details:', {
    error,
    allParams: searchParams ? Object.fromEntries(searchParams.entries()) : {}
  });

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "AccessDenied":
        return "Access was denied. This might be because you cancelled the sign-in process or the account is not authorized.";
      case "Configuration":
        return "There is a problem with the server configuration. Please contact support.";
      case "Verification":
        return "The verification token has expired or has already been used. Please try signing in again.";
      case "OAuthAccountNotLinked":
        return "To confirm your identity, please sign in with the same account you used originally.";
      case "OAuthSignin":
        return "Error in constructing an authorization URL. Please try again.";
      case "OAuthCallback":
        return "Error in handling the response from the identity provider. Please try again.";
      case "Default":
      default:
        return "An unexpected authentication error occurred. Please try again.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-red-100/40 blur-[100px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-100/40 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-rose-100/40 blur-[100px]" />
      </div>

      <div className="w-full max-w-[480px] p-4 relative z-10">
        <Card className="shadow-[0_20px_50px_rgb(0,0,0,0.2)] border-0 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
          <div className="h-1.5 w-full bg-red-500" />
          
          <CardHeader className="text-center pb-2 pt-8 px-8">
            <div className="flex justify-center mb-6">
              <Link href="/" className="hidden md:flex items-center space-x-2 group flex-shrink-0">
                <Logo className="text-white" />
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
              Authentication Error
            </CardTitle>
            <CardDescription className="text-slate-500 text-base mt-2">
              We encountered an issue while trying to sign you in
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 pt-6 space-y-8">
            <div className="text-center space-y-6">
              <div className="p-8 bg-red-50/50 rounded-3xl border border-red-100">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <AlertCircle className="h-10 w-10 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-red-900 mb-2">
                  {error || 'Sign-in Failed'}
                </h3>
                <p className="text-red-700 leading-relaxed">
                  {getErrorMessage(error)}
                </p>
                {error && (
                  <p className="text-xs text-red-500 mt-4 font-mono bg-red-100/50 py-1 px-3 rounded-full inline-block">
                    Error Code: {error}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Link href="/auth/signup?mode=signin" className="w-full">
                  <Button 
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-lg"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Try Again
                  </Button>
                </Link>
                
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/" className="w-full">
                    <Button 
                      variant="outline"
                      className="w-full h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <Home className="mr-2 h-4 w-4" /> Go Home
                    </Button>
                  </Link>
                  <Link href="/contact" className="w-full">
                    <Button 
                      variant="outline"
                      className="w-full h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <HelpCircle className="mr-2 h-4 w-4" /> Support
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} CareerBox. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
