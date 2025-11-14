'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home, Search, Users } from 'lucide-react'
import Image from 'next/image'
import Header from '@/components/dashboard/Header'

export default function ProfileNotFound() {
  const router = useRouter()

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/recommendation-collections')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Illustration */}
          <div className="flex justify-center">
            <div className="relative w-80 h-80 md:w-96 md:h-96">
              <Image
                src="/7 SCENE.svg"
                alt="Profile not found illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Error Content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                404
              </h1>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-700">
                Profile Not Found
              </h2>
            </div>
            
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              The profile you're looking for doesn't exist, has been made private, or the URL might be incorrect.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleGoBack}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            
            <Button
              onClick={() => router.push('/recommendation-collections')}
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Users className="mr-2 h-4 w-4" />
              Explore Profiles
            </Button>
            
            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </div>

          {/* Additional Help */}
          <div className="pt-8 border-t border-gray-200">
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Looking for someone specific? Try searching for them in our{' '}
                <button
                  onClick={() => router.push('/recommendation-collections')}
                  className="text-blue-600 hover:text-blue-700 underline font-medium"
                >
                  directory
                </button>
                {' '}or check if the profile URL is correct.
              </p>
              
              <p className="text-xs text-gray-400">
                Profile URLs should be in the format: /profile/username
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
