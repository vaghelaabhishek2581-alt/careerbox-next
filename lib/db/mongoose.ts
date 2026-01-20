import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

declare global {
  var mongoose: any
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000, // Increased to 30s
      socketTimeoutMS: 45000, // Increased to 45s
      connectTimeoutMS: 30000, // Increased to 30s
      maxIdleTimeMS: 60000, // Increased to 60s
      family: 4,
      retryWrites: true,
      // Add additional connection options for better reliability
      heartbeatFrequencyMS: 10000,
      minPoolSize: 1,
      maxConnecting: 2
    }

    console.log('Connecting to MongoDB with Mongoose...')
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('✅ Successfully connected to MongoDB with Mongoose')
      console.log('🔧 Registered mongoose models:', Object.keys(mongoose.models))
      return mongoose
    }).catch((error) => {
      console.error('❌ Failed to connect to MongoDB with Mongoose:', error.message)
      
      // Provide helpful error messages
      if (error.message.includes('timed out')) {
        console.error(`
🔧 Connection Timeout - Possible Solutions:
1. Check MongoDB Atlas IP Whitelist (Network Access)
2. Verify your internet connection
3. Check if MongoDB cluster is paused
4. Verify connection string in .env.local
5. Try adding 0.0.0.0/0 to IP whitelist (dev only)
        `)
      }
      
      throw error
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

declare global {
  var __mongooseShutdownRegistered: boolean | undefined
}

if (!global.__mongooseShutdownRegistered) {
  process.on('SIGINT', async () => {
    if (cached.conn) {
      await cached.conn.disconnect()
      console.log('Mongoose connection closed')
    }
    process.exit(0)
  })
  
  process.on('SIGTERM', async () => {
    if (cached.conn) {
      await cached.conn.disconnect()
      console.log('Mongoose connection closed')
    }
    process.exit(0)
  })
  
  global.__mongooseShutdownRegistered = true
}
