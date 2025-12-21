"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { registerUser } from "@/lib/redux/slices/authSlice";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  AlertCircle,
} from "lucide-react";
import Logo from "@/components/logo";

type AuthMode = "signup" | "signin";

function AuthPageContent() {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();
  const { isLoading, error: authError } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push("/recommendation-collections");
    }
  }, [session, status, router]);

  useEffect(() => {
    const urlMode = searchParams?.get("mode");
    const authError = searchParams?.get("error");

    if (urlMode === "signin" || urlMode === "signup") {
      setMode(urlMode as AuthMode);
    }

    if (authError) {
      switch (authError) {
        case "OAuthCallback":
          setError(
            "Authentication failed. Please check your Google account settings."
          );
          break;
        case "AccessDenied":
          setError("Access denied. Please try again or contact support.");
          break;
        case "Configuration":
          setError(
            "Authentication service is misconfigured. Please contact support."
          );
          break;
        default:
          setError("Authentication error occurred. Please try again.");
      }
    }
  }, [searchParams]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (mode === "signup") {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }

      try {
        // Use Redux action for registration
        const result = await dispatch(registerUser({
          name,
          email,
          phone,
          password,
          role: 'user'
        })).unwrap();

        if (result) {
          // Show success message and verification sent status
          setSuccessMessage("Account created successfully! Please check your email for verification link.");
          setIsVerificationSent(true);
          // Clear form
          setName("");
          setEmail("");
          setPhone("");
          setPassword("");
          setConfirmPassword("");
        }
      } catch (error: any) {
        setError(error || "An error occurred. Please try again.");
      }
    } else {
      // Sign in - call API directly to get detailed error response
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // If login successful, use NextAuth to create session
          const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });

          if (result?.error) {
            setError("Session creation failed. Please try again.");
          } else if (result?.ok) {
            // Success - redirect will be handled by useEffect
            setError("");
          }
          // Don't redirect here, let useEffect handle it
        } else {
          // Handle specific error cases
          if (data.needsEmailVerification) {
            setError("Please verify your email address before signing in. Check your inbox for the verification link.");
            setIsVerificationSent(true);
          } else {
            setError(data.message || "Invalid credentials. Please try again.");
          }
        }
      } catch (error) {
        setError("An error occurred. Please try again.");
      }
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("Verification email sent! Please check your inbox.");
        setError("");
      } else {
        setError(data.message || "Failed to resend verification email.");
      }
    } catch (error) {
      setError("An error occurred while resending verification email.");
    }
  };

  const handleGoogleAuth = async () => {
    setError("");

    try {
      const result = await signIn("google", {
        redirect: false,
      });

      if ((result as any)?.error) {
        setError("Google authentication failed. Please try again.");
      }
    } catch (error) {
      setError("Google authentication failed. Please try again.");
    }
  };

  const toggleMode = () => {
    setMode(mode === "signup" ? "signin" : "signup");
    setError("");
    setSuccessMessage("");
    setIsVerificationSent(false);
    setName("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");

    // Update URL without full reload
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("mode", mode === "signup" ? "signin" : "signup");
    window.history.replaceState({}, "", newUrl);
  };

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Video Background - Desktop Only */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-900/90">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
          <source src="/signup.mp4" type="video/mp4" />
        </video>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-purple-900 mix-blend-multiply" />

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-center items-start p-16 text-white max-w-2xl h-full">
          <div className="mb-12">
            {/* <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl inline-block border border-white/10"> */}
            <Link href="/" className="hidden md:flex items-center space-x-2 group flex-shrink-0">
              <Logo className="text-white" />
            </Link>  
          </div>
          
          <h1 className="text-5xl xl:text-6xl font-bold mb-8 leading-tight tracking-tight">
            {mode === "signup" ? (
              <>
                Start Your Journey to
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">Professional Excellence</span>
              </>
            ) : (
              <>
                Welcome Back to
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">Your Career Journey</span>
              </>
            )}
          </h1>
          
          <p className="text-xl text-blue-100/80 mb-12 leading-relaxed max-w-lg font-light">
            {mode === "signup"
              ? "Join thousands of professionals who have transformed their careers with our personalized guidance platform."
              : "Continue your path to professional excellence with personalized guidance and opportunities."}
          </p>

          <div className="grid grid-cols-3 gap-12 w-full max-w-lg border-t border-white/10 pt-12">
            <div>
              <div className="text-3xl font-bold text-white mb-1">
                {mode === "signup" ? "10K+" : "50K+"}
              </div>
              <div className="text-sm text-blue-200/60 uppercase tracking-wider font-medium">
                {mode === "signup" ? "New Users" : "Active Users"}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">
                {mode === "signup" ? "500+" : "1.2K+"}
              </div>
              <div className="text-sm text-blue-200/60 uppercase tracking-wider font-medium">
                {mode === "signup" ? "Career Paths" : "Partners"}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">
                {mode === "signup" ? "95%" : "96%"}
              </div>
              <div className="text-sm text-blue-200/60 uppercase tracking-wider font-medium">
                Success Rate
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Form */}
      <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-auto relative">
        {/* Mobile Header */}
        <div className="lg:hidden p-6 flex justify-between items-center bg-white border-b border-slate-100 sticky top-0 z-20">
          <Logo />
          <Link
            href="/"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            Back to Home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-[480px]">
            {/* Desktop Back Link */}
            <div className="hidden lg:block mb-8">
              <Link
                href="/"
                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 shadow-sm group-hover:shadow-md transition-all">
                  <ArrowLeft className="h-4 w-4 text-slate-600 group-hover:text-slate-900" />
                </div>
                Back to Home
              </Link>
            </div>

            <Card className="shadow-[0_20px_50px_rgb(0,0,0,0.05)] border-0 bg-white rounded-3xl overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500" />
              
              <CardHeader className="text-center pb-2 pt-8 px-8">
                <CardTitle className="text-3xl font-bold text-slate-900 tracking-tight">
                  {mode === "signup" ? "Create Account" : "Welcome Back"}
                </CardTitle>
                <CardDescription className="text-slate-500 text-base mt-2">
                  {mode === "signup"
                    ? "Enter your details to get started"
                    : "Enter your credentials to access your account"}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8 pt-6 space-y-6">
                {error && (
                  <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-700 rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {successMessage && (
                  <Alert className="bg-green-50 border-green-100 text-green-700 rounded-xl">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}

                {isVerificationSent && (
                  <div className="text-center p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-blue-900 font-semibold mb-2">Check your inbox</h3>
                    <p className="text-sm text-blue-700 mb-4 leading-relaxed">
                      We've sent a verification link to <strong>{email}</strong>.
                      Click the link to activate your account.
                    </p>
                    <button
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-800 transition-all"
                      onClick={handleResendVerification}
                      disabled={isLoading}
                    >
                      Resend verification email
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium rounded-xl transition-all relative"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-100" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wider">
                      <span className="bg-white px-4 text-slate-400 font-medium">
                        Or continue with email
                      </span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-5">
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-700 font-medium ml-1">Full Name</Label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <User className="h-5 w-5" />
                        </div>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="h-12 pl-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-medium ml-1">Email Address</Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail className="h-5 w-5" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 pl-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-700 font-medium ml-1">Phone Number</Label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <Phone className="h-5 w-5" />
                        </div>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91 xxxxx xxxxx"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          className="h-12 pl-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all rounded-xl"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                      {mode === "signin" && (
                        <Link
                          href="/auth/forgot-password"
                          className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock className="h-5 w-5" />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={mode === "signup" ? "Min. 8 characters" : "Enter your password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={mode === "signup" ? 6 : undefined}
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

                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-slate-700 font-medium ml-1">Confirm Password</Label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <Lock className="h-5 w-5" />
                        </div>
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter your password"
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
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
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
                  )}

                  <Button
                    type="submit"
                    className={`w-full h-12 text-white font-semibold shadow-lg transition-all duration-300 rounded-xl text-base ${mode === "signup"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-purple-500/20 hover:shadow-purple-500/30"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/20 hover:shadow-blue-500/30"
                      }`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{mode === "signup" ? "Creating Account..." : "Signing In..."}</span>
                      </div>
                    ) : (
                      mode === "signup" ? "Create Account" : "Sign In"
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-slate-600 mb-2">
                    {mode === "signup"
                      ? "Already have an account?"
                      : "Don't have an account?"}{" "}
                    <button
                      onClick={toggleMode}
                      className={`font-semibold hover:underline transition-colors ${mode === "signup"
                        ? "text-purple-600 hover:text-purple-700"
                        : "text-blue-600 hover:text-blue-700"
                        }`}
                      disabled={isLoading}
                    >
                      {mode === "signup" ? "Sign in here" : "Create account"}
                    </button>
                  </p>
                </div>

                {mode === "signup" && (
                  <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 text-center leading-relaxed">
                    By creating an account, you agree to our{" "}
                    <Link
                      href="/terms"
                      className="text-slate-700 hover:text-blue-600 hover:underline font-medium"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-slate-700 hover:text-blue-600 hover:underline font-medium"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-8 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} CareerBox. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
