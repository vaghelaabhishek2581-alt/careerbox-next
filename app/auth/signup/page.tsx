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
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Video Background - Desktop Only */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-purple-600 to-blue-700">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/signup.mp4" type="video/mp4" />
        </video>

        {/* Video Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white max-w-lg">
          <div className="mb-8">
            <Logo />
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
            {mode === "signup" ? (
              <>
                Start Your Journey to
                <br />
                <span className="text-purple-300">Professional Excellence</span>
              </>
            ) : (
              <>
                Welcome Back to
                <br />
                <span className="text-blue-300">Your Career Journey</span>
              </>
            )}
          </h1>
          <p className="text-lg xl:text-xl text-purple-100 mb-8 leading-relaxed">
            {mode === "signup"
              ? "Join thousands of professionals who have transformed their careers with our personalized guidance platform."
              : "Continue your path to professional excellence with personalized guidance and opportunities."}
          </p>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-2xl xl:text-3xl font-bold text-purple-300">
                {mode === "signup" ? "10K+" : "50K+"}
              </div>
              <div className="text-xs xl:text-sm text-purple-200">
                {mode === "signup" ? "New Users Monthly" : "Active Users"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl xl:text-3xl font-bold text-blue-300">
                {mode === "signup" ? "500+" : "1,200+"}
              </div>
              <div className="text-xs xl:text-sm text-blue-200">
                {mode === "signup" ? "Career Paths" : "Partner Companies"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl xl:text-3xl font-bold text-green-300">
                {mode === "signup" ? "95%" : "96%"}
              </div>
              <div className="text-xs xl:text-sm text-green-200">
                {mode === "signup" ? "Satisfaction Rate" : "Success Rate"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Form */}
      <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-slate-50 to-purple-50 lg:bg-white overflow-auto">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Back to home - Mobile Only */}
            <Link
              href="/"
              className="lg:hidden inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>

            {/* Desktop Header */}
            <div className="hidden lg:block mb-6">
              <Link
                href="/"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
              <div className="mb-4">
                <Logo />
              </div>
            </div>

            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {mode === "signup" ? "Create Your Account" : "Welcome Back"}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {mode === "signup"
                    ? "Start your journey to professional excellence"
                    : "Sign in to continue your professional journey"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert
                    variant="destructive"
                    className="border-red-200 bg-red-50"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {successMessage && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      {successMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {isVerificationSent && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-blue-800 font-medium mb-2">
                      📧 Verification Email Sent
                    </div>
                    <p className="text-sm text-blue-700 mb-3">
                      We've sent a verification link to <strong>{email}</strong>.
                      Please check your email and click the link to verify your account.
                    </p>
                    <p className="text-xs text-blue-600">
                      Didn't receive the email? Check your spam folder or{" "}
                      <button
                        className="underline hover:no-underline font-medium"
                        onClick={handleResendVerification}
                        disabled={isLoading}
                      >
                        resend verification email
                      </button>
                    </p>
                  </div>
                )}

                {/* Google Auth */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-gray-700 border-2 hover:bg-gray-50 font-medium"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
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
                  {isLoading ? "Connecting..." : "Continue with Google"}
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">
                      Or continue with email
                    </span>
                  </div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-gray-700 font-medium"
                      >
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="pl-10 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-gray-700 font-medium"
                    >
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-gray-700 font-medium"
                      >
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          className="pl-10 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-gray-700 font-medium"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={
                          mode === "signup"
                            ? "Create a password (min. 6 characters)"
                            : "Enter your password"
                        }
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={mode === "signup" ? 6 : undefined}
                        className="pl-10 pr-12 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
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

                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-gray-700 font-medium"
                      >
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="pl-10 pr-12 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
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
                  )}

                  <Button
                    type="submit"
                    className={`w-full h-12 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${mode === "signup"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      }`}
                    disabled={isLoading}
                  >
                    {isLoading
                      ? mode === "signup"
                        ? "Creating Account..."
                        : "Signing In..."
                      : mode === "signup"
                        ? "Create Account"
                        : "Sign In"}
                  </Button>
                </form>

                <div className="text-center space-y-2">
                  <p className="text-gray-600">
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
                      {mode === "signup" ? "Sign in here" : "Sign up here"}
                    </button>
                  </p>

                  {mode === "signin" && (
                    <p className="text-gray-600">
                      <Link
                        href="/auth/forgot-password"
                        className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                      >
                        Forgot your password?
                      </Link>
                    </p>
                  )}
                </div>

                {mode === "signup" && (
                  <div className="text-xs text-gray-500 text-center">
                    By creating an account, you agree to our{" "}
                    <Link
                      href="/terms"
                      className="text-blue-600 hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-blue-600 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
