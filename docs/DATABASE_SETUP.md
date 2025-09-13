# Database Setup Guide

## MongoDB Configuration

### 1. Create Environment File

Create a `.env.local` file in your project root with the following variables:

```bash
# MongoDB Configuration
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
```

### 2. MongoDB Atlas Setup (Recommended)

1. **Create MongoDB Atlas Account**
   - Go to [https://cloud.mongodb.com/](https://cloud.mongodb.com/)
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "FREE" tier (M0)
   - Select a cloud provider and region
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password
   - Set privileges to "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Address**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, add your server's IP address

5. **Get Connection String**
   - Go to "Clusters" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<database_name>` with your desired database name

### 3. Local MongoDB Setup (Alternative)

If you prefer to run MongoDB locally:

1. **Install MongoDB**
   ```bash
   # macOS with Homebrew
   brew tap mongodb/brew
   brew install mongodb-community
   
   # Start MongoDB
   brew services start mongodb/brew/mongodb-community
   ```

2. **Update Environment Variables**
   ```bash
   MONGODB_URI=mongodb://localhost:27017/careerbox
   MONGODB_DB=careerbox
   ```

### 4. Connection String Examples

**MongoDB Atlas (Cloud):**
```
mongodb+srv://username:password@cluster0.abc123.mongodb.net/careerbox?retryWrites=true&w=majority
```

**Local MongoDB:**
```
mongodb://localhost:27017/careerbox
```

**MongoDB Atlas with specific options:**
```
mongodb+srv://username:password@cluster0.abc123.mongodb.net/careerbox?retryWrites=true&w=majority&authSource=admin&ssl=true
```

### 5. Troubleshooting

#### Common Issues:

1. **ENOTFOUND Error**
   - Check your internet connection
   - Verify the MongoDB URI is correct
   - Ensure MongoDB Atlas cluster is running

2. **Authentication Failed**
   - Verify username and password
   - Check database user permissions
   - Ensure IP address is whitelisted

3. **Connection Timeout**
   - Check firewall settings
   - Verify network access in MongoDB Atlas
   - Try connecting from a different network

#### Testing Connection:

You can test your MongoDB connection by running:

```bash
# Test with MongoDB Compass (GUI)
# Download from: https://www.mongodb.com/products/compass

# Test with MongoDB Shell
mongosh "your-connection-string-here"
```

### 6. Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local` to version control
   - Use strong, unique passwords
   - Rotate secrets regularly

2. **Database Access**
   - Use least privilege principle
   - Create separate users for different environments
   - Enable IP whitelisting

3. **Production Setup**
   - Use MongoDB Atlas for production
   - Enable encryption at rest
   - Set up monitoring and alerts
   - Regular backups

### 7. Database Collections

The application will automatically create the following collections:

- `users` - User accounts and profiles
- `refresh_tokens` - JWT refresh tokens
- `blacklisted_tokens` - Revoked tokens
- `admin_actions` - Admin activity logs
- `leads` - Business/institute leads
- `businesses` - Business profiles
- `institutes` - Institute profiles
- `jobs` - Job postings
- `courses` - Course listings
- `exams` - Exam records
- `applications` - Job/course applications
- `subscriptions` - Subscription records
- `notifications` - User notifications

### 8. Next Steps

After setting up MongoDB:

1. Restart your development server
2. Try signing up with Google or credentials
3. Check the console for connection success messages
4. Verify data is being created in your MongoDB database

If you encounter any issues, check the console logs for detailed error messages and refer to the troubleshooting section above.
