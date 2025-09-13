import { MongoClient, Db, ObjectId } from 'mongodb'

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
      throw new Error(`
        MONGODB_URI is not set in environment variables.
        
        Please create a .env.local file in your project root with:
        MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
        
        For local MongoDB:
        MONGODB_URI=mongodb://localhost:27017/careerbox
        
        See docs/DATABASE_SETUP.md for detailed setup instructions.
      `)
    }

    // Validate MongoDB URI format
    if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
      throw new Error(`
        Invalid MongoDB URI format. 
        URI must start with 'mongodb://' or 'mongodb+srv://'
        Current URI: ${MONGODB_URI.substring(0, 20)}...
      `)
    }

    console.log('Connecting to MongoDB...')
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 10000, // 10 second timeout
    })
    
    await client.connect()
    
    // Test the connection
    await client.db('admin').command({ ping: 1 })
    
    const db = client.db(MONGODB_DB)

    cachedClient = client
    cachedDb = db

    console.log('✅ Successfully connected to MongoDB')
    return { client, db }
  } catch (error: any) {
    console.error('❌ Failed to connect to MongoDB:', error.message)
    
    if (error.message.includes('ENOTFOUND')) {
      throw new Error(`
        MongoDB connection failed: DNS resolution error
        
        This usually means:
        1. Your MongoDB URI is incorrect
        2. Your internet connection is down
        3. MongoDB Atlas cluster is not accessible
        
        Please check:
        - Your MONGODB_URI in .env.local
        - Your internet connection
        - MongoDB Atlas cluster status
        - Firewall settings (if using local MongoDB)
        
        See docs/DATABASE_SETUP.md for detailed setup instructions.
      `)
    }
    
    if (error.message.includes('authentication failed')) {
      throw new Error(`
        MongoDB authentication failed
        
        Please check:
        - Username and password in your MONGODB_URI
        - Database user permissions
        - IP whitelist in MongoDB Atlas
        
        See docs/DATABASE_SETUP.md for detailed setup instructions.
      `)
    }
    
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
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    )
}

// Enhanced user management functions
export async function updateUserRole (
  userId: string,
  role: string,
  permissions: string[] = []
) {
  const { db } = await connectToDatabase()
  return await db.collection('users').updateOne(
    { _id: new ObjectId(userId) },
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
