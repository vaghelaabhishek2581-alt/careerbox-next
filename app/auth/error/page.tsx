"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // Debug logging
  console.log('🚨 Auth Error Page - Error details:', {
    error,
    allParams: Object.fromEntries(searchParams.entries())
  });

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "AccessDenied":
        return "Access was denied. This might be because you cancelled the sign-in process or the account is not authorized.";
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      case "Default":
      default:
        return "An error occurred during sign-in. Please try again.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Sign-in Error
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{getErrorMessage(error)}</p>
            {error && (
              <p className="text-sm text-red-500 mt-2">Error code: {error}</p>
            )}
          </div>
          <div className="space-y-4">
            <Link
              href="/auth/signup"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
