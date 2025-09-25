# Socket Connection Architecture

## Overview

The CareerBox socket system now uses a **stable, top-level connection** that persists across page navigation and only disconnects/reconnects on page refresh.

## Architecture

### 🏗️ **Top-Level Connection**
- **SocketProvider** (`lib/socket/SocketProvider.tsx`) - React Context Provider that manages the socket connection at the app level
- **Connection Persistence** - Socket connection remains active during page navigation
- **Automatic Reconnection** - Handles reconnection with exponential backoff and retry logic

### 🔧 **Components**

#### 1. **SocketProvider** (`lib/socket/SocketProvider.tsx`)
- **Purpose**: Manages socket connection at the application level
- **Features**:
  - Initializes socket connection when user session is available
  - Maintains connection across page navigation
  - Handles reconnection logic with retry mechanisms
  - Provides socket context to all child components
  - Automatically disconnects when session ends

#### 2. **useSocket Hook** (`hooks/use-socket.ts`)
- **Purpose**: Provides access to socket functionality from any component
- **Features**:
  - Backward compatible with existing code
  - Re-exports the context hook for seamless integration
  - No component-level connection management

#### 3. **SocketStatus Component** (`components/socket/SocketStatus.tsx`)
- **Purpose**: Visual indicator for socket connection status
- **Features**:
  - Simple connection indicator (green/red dot)
  - Optional detailed status display
  - Lightweight and reusable

#### 4. **Organized Events** (`lib/socket/events/`)
- **Purpose**: Modular event handling system
- **Structure**:
  ```
  events/
  ├── connection/     # Connection, ping/pong, disconnect
  ├── messaging/      # Messages, custom events
  ├── user/          # User status, presence
  ├── notifications/ # Notification handling
  ├── profile/       # Profile validation
  ├── admin/         # Admin monitoring
  └── system/        # System health
  ```

## Connection Lifecycle

### 🚀 **Initialization**
1. **App Starts** → SocketProvider initializes
2. **User Session Available** → Socket connection established
3. **Connection Established** → All event handlers registered
4. **Ready for Use** → Components can use socket via useSocket hook

### 🔄 **Navigation**
1. **User Navigates** → Socket connection **REMAINS ACTIVE**
2. **Component Unmounts** → Socket connection **PERSISTS**
3. **New Component Mounts** → Uses existing socket connection
4. **No Reconnection** → Seamless experience

### 🔃 **Page Refresh**
1. **Page Refreshes** → SocketProvider unmounts
2. **Socket Disconnects** → Clean disconnection
3. **Page Reloads** → SocketProvider reinitializes
4. **Socket Reconnects** → New connection established

### ❌ **Session End**
1. **User Logs Out** → Session becomes null
2. **Socket Disconnects** → Automatic cleanup
3. **Connection Cleared** → No memory leaks

## Benefits

### ✅ **Stable Connection**
- **No Interruptions**: Socket stays connected during navigation
- **Better Performance**: No reconnection overhead on page changes
- **Improved UX**: Real-time features work seamlessly across pages

### ✅ **Automatic Management**
- **Session-Based**: Connects when logged in, disconnects when logged out
- **Error Handling**: Robust reconnection logic with exponential backoff
- **Memory Safe**: Proper cleanup on unmount and session changes

### ✅ **Developer Experience**
- **Simple API**: Same `useSocket()` hook interface
- **Backward Compatible**: Existing code works without changes
- **Type Safe**: Full TypeScript support throughout

## Usage Examples

### Basic Usage
```tsx
import { useSocket } from '@/hooks/use-socket'

function MyComponent() {
  const { isConnected, sendMessage } = useSocket()
  
  const handleSendMessage = () => {
    if (isConnected) {
      sendMessage({ text: 'Hello!' })
    }
  }
  
  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Disconnected'}
      <button onClick={handleSendMessage}>Send Message</button>
    </div>
  )
}
```

### Connection Status Indicator
```tsx
import { SocketStatus } from '@/components/socket/SocketStatus'

function Header() {
  return (
    <div className="header">
      <SocketStatus showDetails={true} />
    </div>
  )
}
```

### Event Listening
```tsx
import { useSocket } from '@/hooks/use-socket'
import { useEffect } from 'react'

function NotificationComponent() {
  const { socket } = useSocket()
  
  useEffect(() => {
    if (socket) {
      const handleNotification = (data) => {
        console.log('Received notification:', data)
      }
      
      socket.on('notification', handleNotification)
      
      return () => {
        socket.off('notification', handleNotification)
      }
    }
  }, [socket])
  
  return <div>Listening for notifications...</div>
}
```

## Migration Guide

### From Component-Level to App-Level

**Before** (Component-level connection):
```tsx
// ❌ Old way - connection per component
function MyComponent() {
  const { socket, isConnected } = useSocket() // Creates new connection
  // Component logic
}
```

**After** (App-level connection):
```tsx
// ✅ New way - shared connection
function MyComponent() {
  const { socket, isConnected } = useSocket() // Uses shared connection
  // Same component logic - no changes needed!
}
```

### No Code Changes Required!
The migration is **completely transparent**. Existing components using `useSocket()` will automatically use the new stable connection without any code changes.

## Configuration

### Environment Variables
- `NEXT_PUBLIC_APP_URL` - Socket server URL (defaults to window.location.origin)

### Socket Configuration
```typescript
// In SocketProvider.tsx
const socket = io(socketUrl, {
  path: '/api/socket',
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  withCredentials: true
})
```

## Troubleshooting

### Connection Issues
1. **Check Session**: Socket only connects when user is logged in
2. **Check Console**: Look for connection logs and error messages
3. **Check Network**: Ensure WebSocket/polling is not blocked
4. **Check Server**: Verify socket server is running

### Debug Tools
- **SocketDebug Component**: Shows connection status and allows testing
- **Browser DevTools**: Network tab shows WebSocket connections
- **Console Logs**: Detailed logging for connection events

## Future Enhancements

- **Authentication Middleware**: Add JWT-based authentication to socket server
- **Room Management**: Implement user rooms and targeted messaging
- **Presence System**: Real-time user presence and status
- **Message Queuing**: Queue messages when offline and send when reconnected
- **Performance Monitoring**: Track connection metrics and performance
