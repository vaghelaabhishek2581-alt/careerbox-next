import { createMocks } from 'node-mocks-http'
import { GET as getStats } from '@/app/api/user/stats/route'
import { GET as getActivities } from '@/app/api/user/activities/route'
import { GET as getProgress } from '@/app/api/user/progress/route'
import { getServerSession } from 'next-auth'

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

// Mock MongoDB client
jest.mock('@/app/api/db', () => ({
  __esModule: true,
  default: Promise.resolve({
    db: () => ({
      collection: (name: string) => ({
        countDocuments: jest.fn().mockResolvedValue(5),
        find: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          toArray: jest.fn().mockResolvedValue([
            {
              id: '1',
              type: 'course',
              title: 'Completed React Course',
              timestamp: new Date().toISOString()
            }
          ])
        })
      })
    })
  })
}))

describe('User API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/user/stats', () => {
    it('should return 401 if not authenticated', async () => {
      const { req, res } = createMocks({
        method: 'GET'
      })

      ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)

      const response = await getStats(req)
      expect(response.status).toBe(401)
    })

    it('should return user stats when authenticated', async () => {
      const { req, res } = createMocks({
        method: 'GET'
      })

      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { id: '123' }
      })

      const response = await getStats(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        completedCourses: 5,
        skillsAssessed: 5,
        careerGoals: 5,
        networkSize: 5
      })
    })
  })

  describe('GET /api/user/activities', () => {
    it('should return 401 if not authenticated', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { limit: '10', page: '1' }
      })

      ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)

      const response = await getActivities(req)
      expect(response.status).toBe(401)
    })

    it('should return activities with pagination', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { limit: '10', page: '1' }
      })

      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { id: '123' }
      })

      const response = await getActivities(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data[0]).toHaveProperty('type')
      expect(data[0]).toHaveProperty('title')
      expect(data[0]).toHaveProperty('timestamp')
    })
  })

  describe('GET /api/user/progress', () => {
    it('should return 401 if not authenticated', async () => {
      const { req, res } = createMocks({
        method: 'GET'
      })

      ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)

      const response = await getProgress(req)
      expect(response.status).toBe(401)
    })

    it('should return progress percentages', async () => {
      const { req, res } = createMocks({
        method: 'GET'
      })

      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { id: '123' }
      })

      const response = await getProgress(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('overall')
      expect(data).toHaveProperty('skills')
      expect(data).toHaveProperty('goals')
      expect(typeof data.overall).toBe('number')
      expect(typeof data.skills).toBe('number')
      expect(typeof data.goals).toBe('number')
    })
  })
})
