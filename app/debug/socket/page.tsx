'use client'

import dynamic from 'next/dynamic'

const SocketDebugger = dynamic(() => import('@/components/debug/SocketDebugger'), {
  ssr: false,
  loading: () => <div className="p-4">Loading debugger...</div>
})

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
        
        <SocketDebugger />
      </div>
    </div>
  )
}
