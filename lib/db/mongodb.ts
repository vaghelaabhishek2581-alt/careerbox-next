import { MongoClient, Db } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || 'careerbox'

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<{
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
        
        For MongoDB Atlas:
        1. Go to https://cloud.mongodb.com/
        2. Create a cluster
        3. Get your connection string
        4. Replace <username>, <password>, and <database_name> with your actual values
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
      `)
    }
    
    if (error.message.includes('authentication failed')) {
      throw new Error(`
        MongoDB authentication failed
        
        Please check:
        - Username and password in your MONGODB_URI
        - Database user permissions
        - IP whitelist in MongoDB Atlas
      `)
    }
    
    throw error
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close()
    cachedClient = null
    cachedDb = null
    console.log('MongoDB connection closed')
  }
}

declare global {
  var __mongodbShutdownRegistered: boolean | undefined
}

if (!global.__mongodbShutdownRegistered) {
  process.on('SIGINT', async () => {
    await closeDatabaseConnection()
    process.exit(0)
  })
  
  process.on('SIGTERM', async () => {
    await closeDatabaseConnection()
    process.exit(0)
  })
  
  global.__mongodbShutdownRegistered = true
}
