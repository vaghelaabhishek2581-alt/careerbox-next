#!/usr/bin/env node

/**
 * Database Setup Script
 * This script helps you set up MongoDB for the CareerBox application
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 CareerBox Database Setup\n')

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local')
const envExists = fs.existsSync(envPath)

if (!envExists) {
  console.log('📝 Creating .env.local file...')
  
  const envContent = `# MongoDB Configuration
# Replace with your actual MongoDB connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
MONGODB_DB=careerbox

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-nextauth-secret-key-here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth (if using Google sign-in)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
`

  fs.writeFileSync(envPath, envContent)
  console.log('✅ Created .env.local file')
} else {
  console.log('✅ .env.local file already exists')
}

console.log('\n📋 Next Steps:')
console.log('1. Edit .env.local and add your MongoDB connection string')
console.log('2. Set up MongoDB Atlas (recommended) or local MongoDB')
console.log('3. Update the MONGODB_URI in .env.local')
console.log('4. Restart your development server')

console.log('\n📚 For detailed setup instructions, see:')
console.log('   docs/DATABASE_SETUP.md')

console.log('\n🔗 MongoDB Atlas Setup:')
console.log('   1. Go to https://cloud.mongodb.com/')
console.log('   2. Create a free account and cluster')
console.log('   3. Get your connection string')
console.log('   4. Update MONGODB_URI in .env.local')

console.log('\n💡 Example MongoDB URI:')
console.log('   MONGODB_URI=mongodb+srv://username:password@cluster0.abc123.mongodb.net/careerbox?retryWrites=true&w=majority')

console.log('\n✨ Setup complete! Happy coding!')


