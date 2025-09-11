import { Suspense } from 'react'
import SocketDebugger from '@/components/debug/SocketDebugger'

export default function SocketDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Socket Debug Page</h1>
          <p className="text-muted-foreground">
            Debug and test socket connections, profile validation, and real-time features.
          </p>
        </div>
        
        <Suspense fallback={<div>Loading debugger...</div>}>
          <SocketDebugger />
        </Suspense>
      </div>
    </div>
  )
}
