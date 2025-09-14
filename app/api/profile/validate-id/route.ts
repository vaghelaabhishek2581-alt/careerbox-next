import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/db/mongoose'
import { Profile } from '@/src/models'
import { z } from 'zod'

// ============================================================================
// SCHEMAS
// ============================================================================

const ValidateProfileIdSchema = z.object({
  profileId: z.string().min(3, 'Profile ID must be at least 3 characters').max(30, 'Profile ID must be less than 30 characters').regex(/^[a-zA-Z0-9_-]+$/, 'Profile ID can only contain letters, numbers, underscores, and hyphens')
})

// ============================================================================
// POST - Validate profile ID availability
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/profile/validate-id - Validating profile ID')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('❌ No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📝 Request body:', body)

    // Validate the request body
    const { profileId } = ValidateProfileIdSchema.parse(body)
    console.log('✅ Validated profile ID:', profileId)

    await connectToDatabase()
    console.log('✅ Connected to database')

    // Check if profile ID is already taken
    const existingProfile = await Profile.findOne({ 
      'personalDetails.publicProfileId': profileId 
    }).lean()

    if (existingProfile) {
      console.log('❌ Profile ID already exists:', profileId)
      
      // Generate suggestions
      const suggestions = generateSuggestions(profileId)
      
      return NextResponse.json({
        success: false,
        isValid: false,
        message: 'This profile ID is already taken',
        suggestions
      })
    }

    console.log('✅ Profile ID is available:', profileId)
    return NextResponse.json({
      success: true,
      isValid: true,
      message: 'Profile ID is available',
      suggestions: []
    })

  } catch (error) {
    console.error('❌ Error validating profile ID:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        isValid: false,
        message: 'Invalid profile ID format',
        suggestions: [],
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      isValid: false,
      message: 'Failed to validate profile ID',
      suggestions: []
    }, { status: 500 })
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateSuggestions(profileId: string): string[] {
  const suggestions: string[] = []
  const base = profileId.toLowerCase()
  
  // Add numbers
  for (let i = 1; i <= 5; i++) {
    suggestions.push(`${base}${i}`)
  }
  
  // Add current year
  const currentYear = new Date().getFullYear()
  suggestions.push(`${base}${currentYear}`)
  
  // Add random suffix
  const randomSuffix = Math.floor(Math.random() * 1000)
  suggestions.push(`${base}${randomSuffix}`)
  
  // Add underscore variations
  suggestions.push(`${base}_pro`)
  suggestions.push(`${base}_official`)
  
  return suggestions.slice(0, 5) // Return max 5 suggestions
}
