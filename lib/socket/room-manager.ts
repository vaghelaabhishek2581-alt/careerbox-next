import { Socket } from 'socket.io'
import { SocketData, RoomType, UserRole } from './types'

export class RoomManager {
  private socket: Socket
  private socketData: SocketData

  constructor(socket: Socket) {
    this.socket = socket
    this.socketData = socket.data
  }

  /**
   * Join user to all necessary rooms based on their role and status
   */
  public async joinInitialRooms(): Promise<void> {
    const { userId, userRole } = this.socketData

    try {
      // Join user-specific rooms
      await this.joinUserRooms(userId)
      
      // Join role-based rooms
      await this.joinRoleRooms(userRole)
      
      // Join special rooms based on role
      await this.joinSpecialRooms(userRole, userId)

      console.log(`User ${userId} joined all initial rooms`)
    } catch (error) {
      console.error('Error joining initial rooms:', error)
      throw error
    }
  }

  /**
   * Join user-specific rooms
   */
  private async joinUserRooms(userId: string): Promise<void> {
    const userRooms: RoomType[] = [
      `user:${userId}`,
      `status:${userId}`
    ]

    for (const room of userRooms) {
      await this.socket.join(room)
    }
  }

  /**
   * Join role-based rooms
   */
  private async joinRoleRooms(userRole: UserRole): Promise<void> {
    const roleRoom: RoomType = `role:${userRole}`
    await this.socket.join(roleRoom)
  }

  /**
   * Join special rooms based on user role
   */
  private async joinSpecialRooms(userRole: UserRole, userId: string): Promise<void> {
    switch (userRole) {
      case 'admin':
        await this.socket.join('admin')
        await this.socket.join('admin:monitoring')
        break
      
      case 'business':
      case 'institute':
        await this.socket.join(`${userRole}:${userId}`)
        break
      
      default:
        // No special rooms for regular users
        break
    }
  }

  /**
   * Join a specific room
   */
  public async joinRoom(room: string): Promise<void> {
    try {
      // Validate room name
      if (!this.isValidRoomName(room)) {
        throw new Error('Invalid room name')
      }

      await this.socket.join(room)
      console.log(`User ${this.socketData.userId} joined room: ${room}`)
    } catch (error) {
      console.error('Error joining room:', error)
      throw error
    }
  }

  /**
   * Leave a specific room
   */
  public async leaveRoom(room: string): Promise<void> {
    try {
      await this.socket.leave(room)
      console.log(`User ${this.socketData.userId} left room: ${room}`)
    } catch (error) {
      console.error('Error leaving room:', error)
      throw error
    }
  }

  /**
   * Leave all rooms when disconnecting
   */
  public async leaveAllRooms(): Promise<void> {
    const { userId, userRole } = this.socketData

    try {
      const roomsToLeave: RoomType[] = [
        `user:${userId}`,
        `status:${userId}`,
        `role:${userRole}`
      ]

      // Add special rooms based on role
      if (userRole === 'admin') {
        roomsToLeave.push('admin', 'admin:monitoring')
      } else if (userRole === 'business' || userRole === 'institute') {
        roomsToLeave.push(`${userRole}:${userId}`)
      }

      for (const room of roomsToLeave) {
        await this.socket.leave(room)
      }

      console.log(`User ${userId} left all rooms`)
    } catch (error) {
      console.error('Error leaving all rooms:', error)
      throw error
    }
  }

  /**
   * Validate room name
   */
  private isValidRoomName(room: string): boolean {
    // Basic validation - room names should be alphanumeric with allowed separators
    const validRoomPattern = /^[a-zA-Z0-9:_-]+$/
    return validRoomPattern.test(room) && room.length <= 100
  }

  /**
   * Get all rooms the user is currently in
   */
  public getCurrentRooms(): string[] {
    return Array.from(this.socket.rooms)
  }

  /**
   * Check if user is in a specific room
   */
  public isInRoom(room: string): boolean {
    return this.socket.rooms.has(room)
  }
}
