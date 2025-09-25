// Legacy socket hook - now redirects to the new SocketProvider context
// This file is kept for backward compatibility

import { useSocket as useSocketContext } from '@/lib/socket/SocketProvider'

// Re-export the context hook for backward compatibility
export const useSocket = useSocketContext
