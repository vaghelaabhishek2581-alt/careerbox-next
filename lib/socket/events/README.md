# Essential Socket Events

This directory contains only the essential socket event handlers for the CareerBox Socket.IO server. The structure has been simplified to include only ping/pong, health, and validate events.

## Directory Structure

```
events/
├── README.md                 # This documentation
├── index.ts                  # Essential events registry (server-side)
├── client/
│   └── index.ts             # Essential client-side event listeners
├── connection/
│   └── index.ts             # Ping/pong events only
├── profile/
│   └── index.ts             # Profile validation events only
└── system/
    └── index.ts             # System health events only
```

## Essential Event Categories

### 🔌 Connection Events (`connection/`)
- **`ping/pong`** - Connection testing and heartbeat only

### 👨‍💼 Profile Events (`profile/`)
- **`validate:profileId`** - Real-time profile ID validation only

### 🏥 System Events (`system/`)
- **`systemHealth`** - System health checks only

### 💻 Client Events (`client/`)
- **Essential client-side listeners** - Handles only pong, validation, and health responses
- **Automatic registration** - Used by SocketProvider for client-side listening
- **Event logging** - Logs essential events for debugging

## Architecture

### Server-Side vs Client-Side Events

This events system supports both **server-side event handlers** and **client-side event listeners**:

#### 🖥️ **Server-Side Events** (`connection/`, `messaging/`, etc.)
- **Purpose**: Handle incoming events from clients on the server
- **Usage**: Used by `server.mts` via `registerAllEvents(socket, io)`
- **Functionality**: Process client requests, emit responses, manage rooms

#### 💻 **Client-Side Events** (`client/`)
- **Purpose**: Listen to events sent from the server to clients
- **Usage**: Used by `SocketProvider.tsx` via `registerClientEventListeners(socket)`
- **Functionality**: Handle server responses, log events, update UI state

### Event Flow Example
```
Client → Server: socket.emit('ping')
Server Handler: Processes ping, sends pong
Server → Client: socket.emit('pong', data)
Client Listener: Logs pong received
```

## Usage

### Adding New Events

1. **Choose the appropriate category** or create a new one if needed
2. **Add the event handler** to the category's `index.ts` file
3. **Export the handler** from the category module
4. **Import and register** in the main `events/index.ts` file

### Example: Adding a new messaging event

```typescript
// In messaging/index.ts
export function registerMessagingEvents(socket: Socket, io: Server) {
  // Existing events...
  
  // New event
  socket.on('privateMessage', (data) => {
    console.log('💌 Private message:', data)
    socket.to(data.recipientId).emit('privateMessage', data)
  })
}
```

### Creating New Event Categories

1. **Create a new folder** under `events/`
2. **Create an `index.ts`** file with the event handlers
3. **Export the register function** following the naming pattern
4. **Import and register** in the main `events/index.ts` file

```typescript
// In events/newCategory/index.ts
import type { Socket, Server } from 'socket.io'

export function registerNewCategoryEvents(socket: Socket, io: Server) {
  // Event handlers here
}

// In events/index.ts
import { registerNewCategoryEvents } from './newCategory'

export function registerAllEvents(socket: Socket, io: Server) {
  // Existing registrations...
  registerNewCategoryEvents(socket, io)
}
```

## Benefits

- **🎯 Organized**: Events are logically grouped by functionality
- **📈 Scalable**: Easy to add new events and categories
- **🔧 Maintainable**: Each category can be developed independently
- **🧪 Testable**: Individual event handlers can be unit tested
- **📚 Discoverable**: Clear structure makes it easy to find events
- **🔄 Reusable**: Event handlers can be selectively imported

## Integration

The organized events are automatically registered when a client connects to the socket server. The main server file (`server.mts`) imports and uses the `registerAllEvents` function to set up all event handlers.

```typescript
// In server.mts
import { registerAllEvents } from './events'

io.on('connection', (socket) => {
  registerAllEvents(socket, io)
})
```
