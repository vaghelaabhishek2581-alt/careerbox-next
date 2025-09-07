export interface UserProfile {
  id: string
  name: string
  title?: string
  company?: string
  location?: string
  isVerified: boolean
  avatarUrl?: string
  coverImageUrl?: string
  followers: number
  following: number
  workStatus: {
    openToWork: boolean
    freelance: boolean
  }
  about: string
  interests: string[]
  badges: ProfessionalBadge[]
  skills: Skill[]
  experience: WorkExperience[]
  education: Education[]
  languages: Language[]
  profileCompletion: number
}

export interface ProfessionalBadge {
  id: string
  name: string
  icon: string
  description: string
  earnedDate: string
}

export interface Skill {
  id: string
  name: string
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  endorsements: number
}

export interface WorkExperience {
  id: string
  companyName: string
  companyLogo?: string
  title: string
  location: string
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance'
  startDate: string
  endDate?: string
  current: boolean
  description: string
  skills: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startYear: number
  endYear?: number
  current: boolean
  description?: string
  activities?: string[]
}

export interface Language {
  id: string
  name: string
  proficiency: 'Native' | 'Fluent' | 'Intermediate' | 'Basic'
}

export interface Connection {
  id: string
  name: string
  avatarUrl?: string
  title: string
  mutualConnections: number
}
