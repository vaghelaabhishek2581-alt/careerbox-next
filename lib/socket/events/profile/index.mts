import type { Socket, Server } from 'socket.io'

/**
 * Generate alternative profile ID suggestions
 */
function generateSuggestions(profileId: string): string[] {
  const suggestions: string[] = []
  const currentYear = new Date().getFullYear()
  
  try {
    // Add numbers to the end
    for (let i = 1; i <= 3; i++) {
      suggestions.push(`${profileId}${i}`)
    }
    
    // Add current year
    suggestions.push(`${profileId}${currentYear}`)
    
    // Add underscore variations
    suggestions.push(`${profileId}_1`)
    
    // Add random numbers
    const randomNum = Math.floor(Math.random() * 99) + 10
    suggestions.push(`${profileId}${randomNum}`)
    
    // Remove duplicates and return max 5 suggestions
    return [...new Set(suggestions)].slice(0, 5)
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return []
  }
}

/**
 * Profile Events Handler
 * Handles profile validation
 */
export function registerProfileEvents(socket: Socket, io: Server) {
  // Profile ID validation
  socket.on('validate:profileId', async (data: { profileId: string }) => {
    console.log('🔍 Profile ID validation request:', data.profileId)
    
    try {
      // For now, we'll simulate validation logic
      // In a real implementation, this would check the database
      const profileId = data.profileId.toLowerCase().trim()
      
      // Basic validation rules
      if (profileId.length < 3) {
        socket.emit('profileId:validation', {
          profileId: data.profileId,
          isValid: false,
          message: 'Profile ID must be at least 3 characters',
          suggestions: [],
          isOwnProfile: false
        })
        return
      }
      
      if (profileId.length > 30) {
        socket.emit('profileId:validation', {
          profileId: data.profileId,
          isValid: false,
          message: 'Profile ID must be less than 30 characters',
          suggestions: [],
          isOwnProfile: false
        })
        return
      }
      
      if (!/^[a-zA-Z0-9_-]+$/.test(profileId)) {
        socket.emit('profileId:validation', {
          profileId: data.profileId,
          isValid: false,
          message: 'Profile ID can only contain letters, numbers, underscores, and hyphens',
          suggestions: [],
          isOwnProfile: false
        })
        return
      }
      
      // Simulate some common taken profile IDs for demo purposes
      const commonTakenIds = ['admin', 'user', 'test', 'demo', 'api', 'www', 'mail', 'support']
      const isTaken = commonTakenIds.includes(profileId)
      
      if (isTaken) {
        const suggestions = generateSuggestions(data.profileId)
        socket.emit('profileId:validation', {
          profileId: data.profileId,
          isValid: false,
          message: 'This profile ID is already taken',
          suggestions,
          isOwnProfile: false
        })
      } else {
        socket.emit('profileId:validation', {
          profileId: data.profileId,
          isValid: true,
          message: 'Profile ID is available',
          suggestions: [],
          isOwnProfile: false
        })
      }
      
    } catch (error) {
      console.error('❌ Error in profile validation:', error)
      socket.emit('profileId:validation', {
        profileId: data.profileId,
        isValid: false,
        message: 'Validation error occurred',
        suggestions: [],
        isOwnProfile: false
      })
    }
  })
}
