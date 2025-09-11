import { connectToDatabase } from '@/lib/db/mongodb'
import { SearchSuggestion } from './types'

export class SearchHandler {
  private db: any
  private readonly MIN_QUERY_LENGTH = 2
  private readonly MAX_SUGGESTIONS = 10
  private readonly RESULTS_PER_TYPE = 5

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
   * Get search suggestions based on query
   */
  public async getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
    try {
      // Validate input
      if (!query || typeof query !== 'string') {
        return []
      }

      const trimmedQuery = query.trim()
      if (trimmedQuery.length < this.MIN_QUERY_LENGTH) {
        return []
      }

      const db = await this.getDatabase()
      const suggestions: SearchSuggestion[] = []

      // Search across different collections in parallel
      const [users, businesses, institutes, skills, jobs, courses] = await Promise.all([
        this.searchUsers(db, trimmedQuery),
        this.searchBusinesses(db, trimmedQuery),
        this.searchInstitutes(db, trimmedQuery),
        this.searchSkills(db, trimmedQuery),
        this.searchJobs(db, trimmedQuery),
        this.searchCourses(db, trimmedQuery)
      ])

      // Combine all suggestions
      suggestions.push(...users, ...businesses, ...institutes, ...skills, ...jobs, ...courses)

      // Sort by relevance and limit results
      return this.sortAndLimitSuggestions(suggestions, trimmedQuery)
    } catch (error) {
      console.error('Search suggestions error:', error)
      return []
    }
  }

  /**
   * Search users
   */
  private async searchUsers(db: any, query: string): Promise<SearchSuggestion[]> {
    try {
      const users = await db.collection('users').find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { 'personalDetails.publicProfileId': { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      }).limit(this.RESULTS_PER_TYPE).toArray()

      return users.map((user: any) => ({
        id: user._id.toString(),
        text: user.name || user.email,
        type: 'user' as const,
        category: 'users',
        metadata: {
          profileId: user.personalDetails?.publicProfileId,
          email: user.email,
          role: user.role
        }
      }))
    } catch (error) {
      console.error('Error searching users:', error)
      return []
    }
  }

  /**
   * Search businesses
   */
  private async searchBusinesses(db: any, query: string): Promise<SearchSuggestion[]> {
    try {
      const businesses = await db.collection('businesses').find({
        $or: [
          { companyName: { $regex: query, $options: 'i' } },
          { industry: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      }).limit(this.RESULTS_PER_TYPE).toArray()

      return businesses.map((business: any) => ({
        id: business._id.toString(),
        text: business.companyName,
        type: 'business' as const,
        category: 'businesses',
        metadata: {
          industry: business.industry,
          location: business.address?.city,
          size: business.size
        }
      }))
    } catch (error) {
      console.error('Error searching businesses:', error)
      return []
    }
  }

  /**
   * Search institutes
   */
  private async searchInstitutes(db: any, query: string): Promise<SearchSuggestion[]> {
    try {
      const institutes = await db.collection('institutes').find({
        $or: [
          { instituteName: { $regex: query, $options: 'i' } },
          { type: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      }).limit(this.RESULTS_PER_TYPE).toArray()

      return institutes.map((institute: any) => ({
        id: institute._id.toString(),
        text: institute.instituteName,
        type: 'institute' as const,
        category: 'institutes',
        metadata: {
          type: institute.type,
          location: institute.address?.city,
          accreditation: institute.accreditation
        }
      }))
    } catch (error) {
      console.error('Error searching institutes:', error)
      return []
    }
  }

  /**
   * Search skills
   */
  private async searchSkills(db: any, query: string): Promise<SearchSuggestion[]> {
    try {
      const skills = await db.collection('skills').find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ]
      }).limit(this.RESULTS_PER_TYPE).toArray()

      return skills.map((skill: any) => ({
        id: skill._id.toString(),
        text: skill.name,
        type: 'skill' as const,
        category: 'skills',
        metadata: {
          category: skill.category,
          description: skill.description
        }
      }))
    } catch (error) {
      console.error('Error searching skills:', error)
      return []
    }
  }

  /**
   * Search jobs
   */
  private async searchJobs(db: any, query: string): Promise<SearchSuggestion[]> {
    try {
      const jobs = await db.collection('jobs').find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { company: { $regex: query, $options: 'i' } },
          { location: { $regex: query, $options: 'i' } },
          { skills: { $in: [new RegExp(query, 'i')] } }
        ],
        status: 'active',
        deadline: { $gte: new Date() }
      }).limit(this.RESULTS_PER_TYPE).toArray()

      return jobs.map((job: any) => ({
        id: job._id.toString(),
        text: job.title,
        type: 'job' as const,
        category: 'jobs',
        metadata: {
          company: job.company,
          location: job.location,
          type: job.type,
          salary: job.salary
        }
      }))
    } catch (error) {
      console.error('Error searching jobs:', error)
      return []
    }
  }

  /**
   * Search courses
   */
  private async searchCourses(db: any, query: string): Promise<SearchSuggestion[]> {
    try {
      const courses = await db.collection('courses').find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ],
        status: 'active'
      }).limit(this.RESULTS_PER_TYPE).toArray()

      return courses.map((course: any) => ({
        id: course._id.toString(),
        text: course.title,
        type: 'course' as const,
        category: 'courses',
        metadata: {
          institute: course.instituteName,
          category: course.category,
          duration: course.duration,
          price: course.price
        }
      }))
    } catch (error) {
      console.error('Error searching courses:', error)
      return []
    }
  }

  /**
   * Sort suggestions by relevance and limit results
   */
  private sortAndLimitSuggestions(suggestions: SearchSuggestion[], query: string): SearchSuggestion[] {
    // Sort by relevance (exact matches first, then partial matches)
    const sorted = suggestions.sort((a, b) => {
      const aExact = a.text.toLowerCase() === query.toLowerCase()
      const bExact = b.text.toLowerCase() === query.toLowerCase()
      
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      
      const aStartsWith = a.text.toLowerCase().startsWith(query.toLowerCase())
      const bStartsWith = b.text.toLowerCase().startsWith(query.toLowerCase())
      
      if (aStartsWith && !bStartsWith) return -1
      if (!aStartsWith && bStartsWith) return 1
      
      return a.text.localeCompare(b.text)
    })

    return sorted.slice(0, this.MAX_SUGGESTIONS)
  }

  /**
   * Get trending searches
   */
  public async getTrendingSearches(limit: number = 10): Promise<string[]> {
    try {
      const db = await this.getDatabase()
      
      // Get most searched terms from search logs
      const trending = await db.collection('search_logs').aggregate([
        {
          $match: {
            timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
          }
        },
        {
          $group: {
            _id: '$query',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: limit
        }
      ]).toArray()

      return trending.map((item: any) => item._id)
    } catch (error) {
      console.error('Error getting trending searches:', error)
      return []
    }
  }

  /**
   * Log search query for analytics
   */
  public async logSearchQuery(query: string, userId?: string): Promise<void> {
    try {
      const db = await this.getDatabase()
      
      await db.collection('search_logs').insertOne({
        query: query.trim(),
        userId,
        timestamp: new Date(),
        resultsCount: 0 // Will be updated after search
      })
    } catch (error) {
      console.error('Error logging search query:', error)
    }
  }
}
