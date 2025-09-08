"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const { toast } = useToast();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error:", error);

    // Show error toast
    toast({
      title: "An error occurred",
      description: error.message || "Something went wrong. Please try again.",
      variant: "destructive",
    });
  }, [error, toast]);

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-4">
      <div className="relative h-24 w-24 mb-4">
        <Image
          src="/cboxLogo.png"
          alt="CareerBox Logo"
          fill
          style={{ objectFit: "contain" }}
          priority
        />
      </div>

      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Something went wrong
      </h1>

      <p className="text-gray-600 mb-6 text-center max-w-md">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>

      <div className="flex gap-4">
        <Button onClick={reset} variant="default">
          Try Again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Need help? Contact our support team at{" "}
        <a
          href="mailto:support@careerbox.com"
          className="text-blue-600 hover:text-blue-500"
        >
          support@careerbox.com
        </a>
      </p>
    </div>
  );
}
