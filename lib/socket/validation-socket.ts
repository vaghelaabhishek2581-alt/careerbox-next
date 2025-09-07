import { io, Socket } from 'socket.io-client'

class ValidationSocket {
  private socket: Socket | null = null
  private static instance: ValidationSocket

  private constructor () {}

  static getInstance (): ValidationSocket {
    if (!ValidationSocket.instance) {
      ValidationSocket.instance = new ValidationSocket()
    }
    return ValidationSocket.instance
  }

  connect () {
    if (!this.socket) {
      this.socket = io(
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        {
          path: '/api/socket',
          autoConnect: true
        }
      )

      this.socket.on('connect', () => {
        console.log('Validation socket connected')
      })

      this.socket.on('connect_error', error => {
        console.error('Validation socket error:', error)
      })
    }
    return this.socket
  }

  disconnect () {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Real-time validation methods
  async validatePublicId (publicId: string): Promise<boolean> {
    return new Promise(resolve => {
      if (!this.socket) {
        this.connect()
      }

      this.socket!.emit(
        'validate:publicId',
        publicId,
        (response: { available: boolean }) => {
          resolve(response.available)
        }
      )
    })
  }

  // Add more validation methods as needed
}

export const validationSocket = ValidationSocket.getInstance()
