import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface StudentProfile {
  name: string
  email: string
  phone: string
  city: string
  eligibilityExams: Array<{ exam: string; score: string }>
  profileComplete: boolean
}

export function useProfileCompletion() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (status === 'loading') return
      
      if (!session?.user) {
        setIsLoading(false)
        return
      }

      // Only check for students
      if (session.user.userType !== 'student') {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('/api/student-profile')
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }

        const data = await response.json()
        setProfile(data.data)

        // Do not auto-redirect; surface completion status only

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    checkProfileCompletion()
  }, [session, status])

  const isProfileComplete = () => {
    if (!profile) return false
    return profile.name && profile.email && profile.phone && profile.city
  }

  const getIncompleteFields = () => {
    if (!profile) return []
    
    const incomplete = []
    if (!profile.name) incomplete.push('Name')
    if (!profile.email) incomplete.push('Email')
    if (!profile.phone) incomplete.push('Phone')
    if (!profile.city) incomplete.push('City')
    
    return incomplete
  }

  return {
    profile,
    isLoading,
    error,
    isProfileComplete: isProfileComplete(),
    incompleteFields: getIncompleteFields(),
    refreshProfile: () => {
      setIsLoading(true)
      // Trigger re-fetch by updating a dependency
    }
  }
}
