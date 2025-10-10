'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import apiClient from '@/lib/api/client'

export default function DebugSessionPage() {
  const { data: session, status } = useSession()
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchDebugData = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/api/debug/user')
      setDebugData(response.data)
    } catch (error) {
      console.error('Error fetching debug data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchDebugData()
    }
  }, [session])

  if (status === 'loading') {
    return <div>Loading session...</div>
  }

  if (!session) {
    return <div>Not authenticated</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Session Debug</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">Session Data</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Debug API Data</h2>
          <button 
            onClick={fetchDebugData}
            disabled={loading}
            className="mb-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Debug Data'}
          </button>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(debugData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
