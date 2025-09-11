import { connectToDatabase } from '@/lib/db/mongodb'
import { ProfileValidationResult } from './types'

export class ProfileValidator {
  private db: any

  constructor() {
    this.db = null
  }

  private async getDatabase() {
    if (!this.db) {
      const { db } = await connectToDatabase()
      this.db = db
    }
    return this.db
  }

  /**
   * Validate if a profile ID is available
   */
  public async validateProfileId(
    profileId: string, 
    currentUserId: string
  ): Promise<ProfileValidationResult> {
    try {
      // Validate input
      if (!profileId || typeof profileId !== 'string') {
        return {
          isValid: false,
          message: 'Invalid profile ID format',
          suggestions: []
        }
      }

      // Check profile ID format
      if (!this.isValidProfileIdFormat(profileId)) {
        return {
          isValid: false,
          message: 'Profile ID must be 3-30 characters, alphanumeric with hyphens/underscores',
          suggestions: this.generateProfileIdSuggestions(profileId)
        }
      }

      const db = await this.getDatabase()

      // Check if profile ID is already taken across all collections
      const [existingUser, existingBusiness, existingInstitute] = await Promise.all([
        this.checkUserProfileId(db, profileId, currentUserId),
        this.checkBusinessProfileId(db, profileId, currentUserId),
        this.checkInstituteProfileId(db, profileId, currentUserId)
      ])

      const isTaken = existingUser || existingBusiness || existingInstitute

      return {
        isValid: !isTaken,
        message: isTaken 
          ? 'This profile ID is already taken' 
          : 'Profile ID is available',
        suggestions: isTaken ? this.generateProfileIdSuggestions(profileId) : []
      }
    } catch (error) {
      console.error('Profile ID validation error:', error)
      return {
        isValid: false,
        message: 'Error validating profile ID. Please try again.',
        suggestions: []
      }
    }
  }

  /**
   * Check if profile ID exists in users collection
   */
  private async checkUserProfileId(
    db: any, 
    profileId: string, 
    currentUserId: string
  ): Promise<boolean> {
    try {
      const user = await db.collection('users').findOne({
        'personalDetails.publicProfileId': profileId,
        _id: { $ne: currentUserId }
      })
      return !!user
    } catch (error) {
      console.error('Error checking user profile ID:', error)
      return false
    }
  }

  /**
   * Check if profile ID exists in businesses collection
   */
  private async checkBusinessProfileId(
    db: any, 
    profileId: string, 
    currentUserId: string
  ): Promise<boolean> {
    try {
      const business = await db.collection('businesses').findOne({
        publicProfileId: profileId,
        userId: { $ne: currentUserId }
      })
      return !!business
    } catch (error) {
      console.error('Error checking business profile ID:', error)
      return false
    }
  }

  /**
   * Check if profile ID exists in institutes collection
   */
  private async checkInstituteProfileId(
    db: any, 
    profileId: string, 
    currentUserId: string
  ): Promise<boolean> {
    try {
      const institute = await db.collection('institutes').findOne({
        publicProfileId: profileId,
        userId: { $ne: currentUserId }
      })
      return !!institute
    } catch (error) {
      console.error('Error checking institute profile ID:', error)
      return false
    }
  }

  /**
   * Validate profile ID format
   */
  private isValidProfileIdFormat(profileId: string): boolean {
    // Profile ID should be 3-30 characters, alphanumeric with hyphens and underscores
    const validPattern = /^[a-zA-Z0-9_-]{3,30}$/
    return validPattern.test(profileId)
  }

  /**
   * Generate alternative profile ID suggestions
   */
  private generateProfileIdSuggestions(profileId: string): string[] {
    const suggestions: string[] = []
    const base = profileId.toLowerCase().replace(/[^a-z0-9]/g, '')
    
    if (base.length === 0) {
      return ['user123', 'profile456', 'user789', 'profile101', 'user202']
    }

    // Add numbers
    for (let i = 1; i <= 5; i++) {
      suggestions.push(`${base}${i}`)
    }

    // Add random suffix
    const randomSuffix = Math.random().toString(36).substring(2, 6)
    suggestions.push(`${base}${randomSuffix}`)

    // Add underscore variations
    if (base.length > 3) {
      suggestions.push(`${base}_user`)
      suggestions.push(`${base}_profile`)
    }

    // Remove duplicates and limit to 5 suggestions
    return [...new Set(suggestions)].slice(0, 5)
  }

  /**
   * Sanitize profile ID input
   */
  public sanitizeProfileId(profileId: string): string {
    return profileId
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '')
      .substring(0, 30)
  }

  /**
   * Check if profile ID is reserved
   */
  private isReservedProfileId(profileId: string): boolean {
    const reservedIds = [
      'admin', 'administrator', 'root', 'system', 'api', 'www', 'mail',
      'support', 'help', 'contact', 'about', 'privacy', 'terms', 'legal',
      'careerbox', 'career', 'jobs', 'courses', 'institutes', 'businesses'
    ]
    
    return reservedIds.includes(profileId.toLowerCase())
  }
}
