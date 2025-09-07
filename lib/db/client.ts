type DbOperation = 'find' | 'findOne' | 'insertOne' | 'updateOne' | 'deleteOne'

export async function executeDbOperation (
  operation: DbOperation,
  collection: string,
  query?: any,
  data?: any
) {
  try {
    const response = await fetch('/api/db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        operation,
        collection,
        query,
        data
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Database operation failed')
    }

    const result = await response.json()
    return result.result
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
