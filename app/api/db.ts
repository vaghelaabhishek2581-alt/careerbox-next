import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local')
}

const uri = process.env.MONGODB_URI
const options = {}

let clientPromise: Promise<MongoClient>
const client = new MongoClient(uri, options)
clientPromise = client.connect()

export default clientPromise
