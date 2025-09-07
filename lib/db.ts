import { MongoClient, Db } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI as string
const MONGODB_DB = (process.env.MONGODB_DB as string) || 'career-box-001'

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase (): Promise<{
  client: MongoClient
  db: Db
}> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not set')
    }
    const client = new MongoClient(MONGODB_URI)
    await client.connect()

    const db = client.db(MONGODB_DB)

    cachedClient = client
    cachedDb = db

    console.log('Connected to MongoDB Atlas')
    return { client, db }
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

export async function getUserByEmail (email: string) {
  const { db } = await connectToDatabase()
  return await db.collection('users').findOne({ email })
}

export async function createUser (userData: {
  email: string
  password?: string | null
  name: string
  role?: string
  [key: string]: any
}) {
  const { db } = await connectToDatabase()
  const userWithDefaults = {
    ...userData,
    role: userData.role || 'user',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const result = await db.collection('users').insertOne(userWithDefaults)
  return result
}

export async function createCounsellingRequest (requestData: {
  name: string
  email: string
  phone: string
  courseLevel: string
  courseInterest: string
  agreeToTerms: boolean
}) {
  const { db } = await connectToDatabase()
  const requestWithDefaults = {
    ...requestData,
    submittedAt: new Date(),
    status: 'pending',
    source: 'website'
  }

  const result = await db
    .collection('counselling_requests')
    .insertOne(requestWithDefaults)
  return result
}

export async function getCounsellingRequests (filter: any = {}) {
  const { db } = await connectToDatabase()
  return await db.collection('counselling_requests').find(filter).toArray()
}

export async function updateCounsellingRequest (id: string, updateData: any) {
  const { db } = await connectToDatabase()
  return await db
    .collection('counselling_requests')
    .updateOne({ _id: id }, { $set: { ...updateData, updatedAt: new Date() } })
}

// Enhanced user management functions
export async function updateUserRole (
  userId: string,
  role: string,
  permissions: string[] = []
) {
  const { db } = await connectToDatabase()
  return await db.collection('users').updateOne(
    { _id: userId },
    {
      $set: {
        role,
        permissions,
        updatedAt: new Date()
      }
    }
  )
}

export async function getUsersByRole (
  role: string,
  page: number = 1,
  limit: number = 10
) {
  const { db } = await connectToDatabase()
  const skip = (page - 1) * limit

  const users = await db
    .collection('users')
    .find({ role })
    .skip(skip)
    .limit(limit)
    .toArray()

  const total = await db.collection('users').countDocuments({ role })

  return { users, total }
}

export async function getUserStats () {
  const { db } = await connectToDatabase()

  const totalUsers = await db.collection('users').countDocuments()
  const activeUsers = await db.collection('users').countDocuments({
    lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  })

  const usersByRole = await db
    .collection('users')
    .aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }])
    .toArray()

  return {
    totalUsers,
    activeUsers,
    usersByRole: usersByRole.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {} as Record<string, number>)
  }
}

// Organization management functions
export async function createOrganization (organizationData: {
  name: string
  code: string
  type: string
  adminEmail: string
}) {
  const { db } = await connectToDatabase()
  const organizationWithDefaults = {
    ...organizationData,
    status: 'active',
    memberCount: 0,
    settings: {
      allowSelfRegistration: true,
      requireApproval: false,
      customBranding: false
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const result = await db
    .collection('organizations')
    .insertOne(organizationWithDefaults)
  return result
}

export async function getOrganizations (page: number = 1, limit: number = 10) {
  const { db } = await connectToDatabase()
  const skip = (page - 1) * limit

  const organizations = await db
    .collection('organizations')
    .find({})
    .skip(skip)
    .limit(limit)
    .toArray()

  const total = await db.collection('organizations').countDocuments()

  return { organizations, total }
}

// Business management functions
export async function createBusiness (businessData: {
  name: string
  industry: string
  size: string
  ownerEmail: string
}) {
  const { db } = await connectToDatabase()
  const businessWithDefaults = {
    ...businessData,
    status: 'trial',
    employees: 0,
    subscription: {
      plan: 'basic',
      status: 'trial',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const result = await db
    .collection('businesses')
    .insertOne(businessWithDefaults)
  return result
}

export async function getBusinesses (
  page: number = 1,
  limit: number = 10,
  filters: any = {}
) {
  const { db } = await connectToDatabase()
  const skip = (page - 1) * limit

  const businesses = await db
    .collection('businesses')
    .find(filters)
    .skip(skip)
    .limit(limit)
    .toArray()

  const total = await db.collection('businesses').countDocuments(filters)

  return { businesses, total }
}

export async function getBusinessStats () {
  const { db } = await connectToDatabase()

  const totalBusinesses = await db.collection('businesses').countDocuments()
  const activeSubscriptions = await db.collection('businesses').countDocuments({
    'subscription.status': 'active'
  })
  const trialUsers = await db.collection('businesses').countDocuments({
    'subscription.status': 'trial'
  })

  // Calculate total revenue (mock calculation)
  const businesses = await db.collection('businesses').find({}).toArray()
  const totalRevenue = businesses.reduce((sum, business) => {
    const planPricing = { basic: 299, professional: 599, enterprise: 1299 }
    if (business.subscription.status === 'active') {
      return (
        sum +
        (planPricing[business.subscription.plan as keyof typeof planPricing] ||
          0)
      )
    }
    return sum
  }, 0)

  return {
    totalRevenue,
    activeSubscriptions,
    trialUsers,
    churnRate: 3.2 // Mock value
  }
}
