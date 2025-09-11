# Socket.IO System Documentation

This directory contains a modular, production-ready Socket.IO system for the CareerBox platform. The system is broken down into smaller, focused components for better maintainability and testability.

## 📁 File Structure

```
lib/socket/
├── types.ts                 # TypeScript type definitions
├── auth.ts                  # Authentication utilities
├── room-manager.ts          # Room management logic
├── profile-validator.ts     # Profile ID validation
├── search-handler.ts        # Search suggestions
├── user-manager.ts          # User status and activity management
├── system-monitor.ts        # System health monitoring
├── notification-service.ts  # Notification management
├── error-handler.ts         # Error handling and validation
├── index.ts                 # Main exports
└── README.md               # This documentation
```

## 🏗️ Architecture

### Core Components

1. **Types (`types.ts`)**
   - Comprehensive TypeScript interfaces
   - Event type definitions
   - Data structure definitions

2. **Authentication (`auth.ts`)**
   - Socket authentication middleware
   - Permission validation
   - Role-based access control

3. **Room Manager (`room-manager.ts`)**
   - User room management
   - Role-based room joining
   - Room validation and cleanup

4. **Profile Validator (`profile-validator.ts`)**
   - Real-time profile ID validation
   - Suggestion generation
   - Input sanitization

5. **Search Handler (`search-handler.ts`)**
   - Universal search suggestions
   - Multi-collection search
   - Search analytics

6. **User Manager (`user-manager.ts`)**
   - User status management
   - Activity logging
   - Presence tracking

7. **System Monitor (`system-monitor.ts`)**
   - Health monitoring
   - Performance metrics
   - Alert management

8. **Notification Service (`notification-service.ts`)**
   - Real-time notifications
   - Admin alerts
   - System broadcasts

9. **Error Handler (`error-handler.ts`)**
   - Comprehensive error handling
   - Input validation
   - User-friendly error messages

## 🚀 Usage

### Basic Setup

```typescript
import { initSocketServer } from '@/lib/socket'

// Initialize socket server
const io = initSocketServer(server)
```

### Sending Notifications

```typescript
import { sendNotification, sendAdminAlert } from '@/lib/socket'

// Send notification to user
sendNotification(userId, {
  id: 'unique_id',
  type: 'success',
  category: 'application',
  title: 'Application Submitted',
  message: 'Your application has been submitted successfully.',
  isRead: false
})

// Send admin alert
sendAdminAlert({
  type: 'error',
  data: { action: 'payment_failed', userId },
  severity: 'high'
})
```

### Using Individual Services

```typescript
import { ProfileValidator, SearchHandler, UserManager } from '@/lib/socket'

// Profile validation
const validator = new ProfileValidator()
const result = await validator.validateProfileId('john_doe', userId)

// Search suggestions
const searchHandler = new SearchHandler()
const suggestions = await searchHandler.getSearchSuggestions('react')

// User management
const userManager = new UserManager()
await userManager.updateUserStatus(userId, 'online')
```

## 📡 Socket Events

### Client to Server Events

| Event | Description | Parameters |
|-------|-------------|------------|
| `validateProfileId` | Validate profile ID availability | `profileId: string, callback` |
| `searchSuggestions` | Get search suggestions | `query: string, callback` |
| `joinRoom` | Join a specific room | `room: string` |
| `leaveRoom` | Leave a specific room | `room: string` |
| `updateStatus` | Update user status | `status: UserStatus` |
| `typing` | Send typing indicator | `{ room: string, isTyping: boolean }` |
| `adminMonitor` | Admin monitoring (admin only) | `data: any` |
| `activity` | Log user activity | `activity: UserActivity` |
| `ping` | Heartbeat | - |

### Server to Client Events

| Event | Description | Data |
|-------|-------------|------|
| `notification` | New notification | `NotificationData` |
| `profileUpdate` | Profile update notification | `ProfileUpdateData` |
| `userOnline` | User came online | `userId: string` |
| `userOffline` | User went offline | `userId: string` |
| `searchSuggestion` | Search suggestions | `SearchSuggestion[]` |
| `systemHealth` | System health update | `SystemHealthData` |
| `adminAlert` | Admin alert | `AdminAlertData` |
| `userStatusUpdate` | User status change | `UserStatusUpdate` |
| `userTyping` | Typing indicator | `TypingData` |
| `systemUpdate` | System-wide update | `SystemUpdateData` |
| `pong` | Heartbeat response | - |
| `error` | Error notification | `{ code: string, message: string }` |

## 🔧 Configuration

### Environment Variables

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Socket Configuration

```typescript
const config: SocketConfig = {
  path: '/api/socket',
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL,
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
}
```

## 🛡️ Security Features

### Authentication
- Session-based authentication
- Role-based access control
- Permission validation

### Input Validation
- Comprehensive input validation
- SQL injection prevention
- XSS protection

### Rate Limiting
- Built-in rate limiting
- Per-user request limits
- Admin monitoring

### Error Handling
- User-friendly error messages
- Detailed logging
- Admin alerts for critical errors

## 📊 Monitoring & Analytics

### System Health
- Real-time health monitoring
- Performance metrics
- Database health checks

### User Analytics
- Activity tracking
- Search analytics
- Connection monitoring

### Error Tracking
- Comprehensive error logging
- Admin alerts
- Performance monitoring

## 🧪 Testing

### Unit Tests
```bash
npm test lib/socket/
```

### Integration Tests
```bash
npm run test:integration lib/socket/
```

### Manual Testing
```typescript
// Test socket connection
const socket = io('http://localhost:3000')

socket.on('connect', () => {
  console.log('Connected to socket server')
})

// Test profile validation
socket.emit('validateProfileId', 'test_profile', (result) => {
  console.log('Validation result:', result)
})
```

## 🚀 Performance Optimization

### Connection Management
- Efficient room management
- Automatic cleanup on disconnect
- Connection pooling

### Memory Management
- Proper cleanup of event listeners
- Memory usage monitoring
- Garbage collection optimization

### Database Optimization
- Connection pooling
- Query optimization
- Indexing strategy

## 🔄 Error Recovery

### Automatic Recovery
- Connection retry logic
- Graceful degradation
- Fallback mechanisms

### Manual Recovery
- Admin intervention tools
- System restart procedures
- Data recovery options

## 📈 Scaling Considerations

### Horizontal Scaling
- Redis adapter for multiple instances
- Load balancing
- Session sharing

### Vertical Scaling
- Memory optimization
- CPU optimization
- Database optimization

## 🛠️ Development

### Adding New Events

1. Define types in `types.ts`
2. Add handler in main socket file
3. Add validation schema in `error-handler.ts`
4. Write tests
5. Update documentation

### Adding New Services

1. Create service class
2. Add to exports in `index.ts`
3. Write comprehensive tests
4. Add error handling
5. Update documentation

## 📝 Best Practices

### Code Organization
- Single responsibility principle
- Dependency injection
- Error handling

### Performance
- Async/await for database operations
- Proper error handling
- Memory management

### Security
- Input validation
- Authentication checks
- Permission validation

### Testing
- Unit tests for all functions
- Integration tests for workflows
- Error scenario testing

## 🐛 Troubleshooting

### Common Issues

1. **Connection Issues**
   - Check CORS configuration
   - Verify authentication
   - Check network connectivity

2. **Performance Issues**
   - Monitor memory usage
   - Check database connections
   - Review query performance

3. **Error Handling**
   - Check error logs
   - Verify input validation
   - Review permission settings

### Debug Mode

```typescript
// Enable debug logging
process.env.SOCKET_DEBUG = 'true'
```

## 📚 Additional Resources

- [Socket.IO Documentation](https://socket.io/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contributing

1. Follow the existing code structure
2. Add comprehensive tests
3. Update documentation
4. Follow TypeScript best practices
5. Handle errors properly

## 📄 License

This code is part of the CareerBox project and follows the same license terms.
