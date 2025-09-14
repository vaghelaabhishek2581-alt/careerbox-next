import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || 'careerbox'

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
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    }

    console.log('Connecting to MongoDB with Mongoose...')
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('✅ Successfully connected to MongoDB with Mongoose')
      console.log('🔧 Registered mongoose models:', Object.keys(mongoose.models))
      return mongoose
    }).catch((error) => {
      console.error('❌ Failed to connect to MongoDB with Mongoose:', error.message)
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

// Graceful shutdown
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
