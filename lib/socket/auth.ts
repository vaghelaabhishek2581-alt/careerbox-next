import { Socket } from 'socket.io'
import { getServerSession } from 'next-auth'
import { SocketData } from './types'

export interface AuthResult {
  success: boolean
  session?: any
  error?: string
}

export async function authenticateSocket(socket: Socket): Promise<AuthResult> {
  try {
    // Add timeout to prevent hanging
    const sessionPromise = getServerSession()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Authentication timeout')), 5000)
    )
    
    const session = await Promise.race([sessionPromise, timeoutPromise]) as any
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'No valid session found'
      }
    }

    // Validate session structure
    if (!session.user.id || typeof session.user.id !== 'string') {
      return {
        success: false,
        error: 'Invalid session structure'
      }
    }

    return {
      success: true,
      session
    }
  } catch (error) {
    console.error('Socket authentication error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed'
    }
  }
}

export function setupSocketData(socket: Socket, session: any): void {
  const socketData: SocketData = {
    session,
    userId: session.user.id,
    userRole: session.user.role || 'user',
    lastActivity: new Date(),
    status: 'online'
  }

  // Set socket data
  Object.assign(socket.data, socketData)
}

export function validateUserRole(role: string): boolean {
  const validRoles = ['user', 'business', 'institute', 'admin']
  return validRoles.includes(role)
}

export function getRequiredPermissions(role: string): string[] {
  const permissions: Record<string, string[]> = {
    user: ['read:profile', 'read:jobs', 'read:courses'],
    business: ['read:profile', 'write:jobs', 'read:applications', 'write:exams'],
    institute: ['read:profile', 'write:courses', 'read:enrollments', 'write:exams'],
    admin: ['*'] // Admin has all permissions
  }

  return permissions[role] || []
}

export function hasPermission(userRole: string, requiredPermission: string): boolean {
  const userPermissions = getRequiredPermissions(userRole)
  
  // Admin has all permissions
  if (userPermissions.includes('*')) {
    return true
  }

  return userPermissions.includes(requiredPermission)
}
