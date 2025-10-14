// localStorage utility for saving and loading user details

export interface SavedUserDetails {
  name: string
  email: string
  phone: string
  city: string
}

const STORAGE_KEY = 'careerbox_user_details'

export const saveUserDetails = (details: SavedUserDetails): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(details))
    } catch (e) {
      console.error('Failed to save user details:', e)
    }
  }
}

export const loadUserDetails = (): SavedUserDetails | null => {
  if (typeof window !== 'undefined') {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (savedData) {
        return JSON.parse(savedData)
      }
    } catch (e) {
      console.error('Failed to load user details:', e)
    }
  }
  return null
}

export const clearUserDetails = (): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.error('Failed to clear user details:', e)
    }
  }
}
