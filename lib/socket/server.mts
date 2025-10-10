import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { registerAllEvents } from "./events/index.mts";
import jwt from "jsonwebtoken";

// Extend Socket interface to include user properties
declare module "socket.io" {
  interface Socket {
    userId?: string;
    userEmail?: string;
    authenticated?: boolean;
  }
}

/**
 * Initialize Socket.IO server with comprehensive event handling
 * This is a clean implementation without circular dependencies
 */
export function initializeSocketServer(
  httpServer: HttpServer,
  dev: boolean
): Server {
  console.log("🔌 Initializing Socket.IO server...");

  const io = new Server(httpServer, {
    path: "/api/socket",
    cors: {
      origin: dev
        ? ["http://localhost:3000", "http://127.0.0.1:3000"]
        : process.env.NEXT_PUBLIC_APP_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    addTrailingSlash: false,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      console.log("🔐 Authenticating socket connection:", socket.id);

      // Get token from multiple sources: handshake auth, query, or cookies
      const token =
        socket.handshake.auth.token ||
        socket.handshake.query.token ||
        socket.handshake.headers.cookie
          ?.split(";")
          .find((c) => c.trim().startsWith("auth-token="))
          ?.split("=")[1];

      console.log("🔍 Token sources checked:", {
        authToken: !!socket.handshake.auth.token,
        queryToken: !!socket.handshake.query.token,
        cookieToken: !!socket.handshake.headers.cookie?.includes("auth-token="),
        foundToken: !!token,
      });
      console.log("token", token);
      if (!token) {
        console.log("❌ No token provided for socket:", socket.id);
        console.log("Available headers:", socket.handshake.headers);
        return next(new Error("Authentication token required"));
      }

      // Verify JWT token
      const jwtSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error("❌ JWT secret not configured");
        return next(new Error("Server configuration error"));
      }

      try {
        const decoded = jwt.verify(token, jwtSecret) as any;
        console.log(
          "✅ Socket authenticated for user:",
          decoded.userId || decoded.sub
        );

        // Attach user info to socket
        socket.userId = decoded.userId || decoded.sub;
        socket.userEmail = decoded.email;
        socket.authenticated = true;

        next();
      } catch (jwtError) {
        const errorMessage =
          jwtError instanceof Error ? jwtError.message : "Unknown JWT error";
        console.log(
          "❌ Invalid JWT token for socket:",
          socket.id,
          errorMessage
        );
        return next(new Error("Invalid authentication token"));
      }
    } catch (error) {
      console.error("❌ Socket authentication error:", error);
      return next(new Error("Authentication failed"));
    }
  });

  // Connection handling
  io.on("connection", (socket) => {
    console.log("✅ Authenticated client connected:", {
      socketId: socket.id,
      userId: socket.userId,
      userEmail: socket.userEmail,
    });

    // Register all organized events
    registerAllEvents(socket, io);
  });

  // Socket.IO server error handling
  io.engine.on("connection_error", (err) => {
    console.error("❌ Socket.IO connection error:", {
      message: err.message,
      description: err.description,
      context: err.context,
      type: err.type,
    });
  });

  console.log("✅ Socket.IO server initialized successfully");
  return io;
}

/**
 * Get socket server status for monitoring
 */
export function getSocketServerStatus(io: Server) {
  return {
    connected: io.engine.clientsCount,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  };
}
