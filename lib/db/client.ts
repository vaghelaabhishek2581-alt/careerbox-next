import apiClient from '@/lib/api/client'

type DbOperation = 'find' | 'findOne' | 'insertOne' | 'updateOne' | 'deleteOne'

export async function executeDbOperation (
  operation: DbOperation,
  collection: string,
  query?: any,
  data?: any
) {
  try {
    const response = await apiClient.post('/api/db', {
      operation,
      collection,
      query,
      data
    })

    if (response.success) {
      return (response.data as any).result
    } else {
      throw new Error(response.error || 'Database operation failed')
    }
  } catch (error) {
    console.error('Database operation error:', error)
    throw error
  }
}

// Helper functions for common operations
export const db = {
  find: (collection: string, query?: any) =>
    executeDbOperation('find', collection, query),

  findOne: (collection: string, query: any) =>
    executeDbOperation('findOne', collection, query),

  insertOne: (collection: string, data: any) =>
    executeDbOperation('insertOne', collection, undefined, data),

  updateOne: (collection: string, query: any, data: any) =>
    executeDbOperation('updateOne', collection, query, data),

  deleteOne: (collection: string, query: any) =>
    executeDbOperation('deleteOne', collection, query)
}
