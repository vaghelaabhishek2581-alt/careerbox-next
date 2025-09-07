"use client";

import Image from "next/image";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="text-center">
              <div className="relative mx-auto h-24 w-24 mb-4">
                <Image
                  src="/cboxLogo.png"
                  alt="CareerBox Logo"
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                Oops!
              </h1>
              <p className="mt-4 text-xl text-gray-500">
                Something went wrong.
              </p>
              <p className="mt-2 text-gray-500">
                {error.message || "An unexpected error occurred."}
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <button
                onClick={reset}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Return Home
              </Link>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
              <p>Need help? Contact our support team at</p>
              <a
                href="mailto:support@careerbox.com"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                support@careerbox.com
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
