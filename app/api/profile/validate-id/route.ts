import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/unified-auth'
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
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate alternative profile ID suggestions
 */
function generateSuggestions(profileId: string): string[] {
  const suggestions: string[] = []
  const currentYear = new Date().getFullYear()
  
  try {
    // Add numbers to the end
    for (let i = 1; i <= 5; i++) {
      suggestions.push(`${profileId}${i}`)
    }
    
    // Add current year
    suggestions.push(`${profileId}${currentYear}`)
    
    // Add underscore variations
    suggestions.push(`${profileId}_1`)
    suggestions.push(`${profileId}_${currentYear}`)
    
    // Add random numbers
    const randomNum = Math.floor(Math.random() * 999) + 100
    suggestions.push(`${profileId}${randomNum}`)
    
    // Remove duplicates and return max 5 suggestions
    return [...new Set(suggestions)].slice(0, 5)
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return []
  }
}

// ============================================================================
// POST - Validate profile ID availability
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/profile/validate-id - Validating profile ID')

    const authCheck = await requireAuth(request)
    if (authCheck.error) return authCheck.response

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
      console.log('🔍 Profile ID exists, checking ownership:', profileId)

      // Check if the profile ID belongs to the current user
      if (existingProfile.userId.toString() === authCheck.userId) {
        console.log('✅ Profile ID belongs to current user:', profileId)
        return NextResponse.json({
          success: true,
          isValid: true,
          message: 'This is your current profile ID',
          suggestions: [],
          isOwnProfile: true
        })
      }

      console.log('❌ Profile ID belongs to another user:', profileId)

      // Generate suggestions
      const suggestions = generateSuggestions(profileId)

      return NextResponse.json({
        success: false,
        isValid: false,
        message: 'This profile ID is already taken by another user',
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

