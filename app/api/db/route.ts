import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import { getServerSession } from 'next-auth'

/**
 * @swagger
 * /api/db:
 *   post:
 *     summary: Execute database operations
 *     description: Secure endpoint for executing database operations
 *     tags:
 *       - Database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               operation:
 *                 type: string
 *                 enum: [find, findOne, insertOne, updateOne, deleteOne]
 *               collection:
 *                 type: string
 *               query:
 *                 type: object
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Operation successful
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST (request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { operation, collection, query, data } = await request.json()

    const { db } = await connectToDatabase()

    let result

    switch (operation) {
      case 'find':
        result = await db.collection(collection).find(query).toArray()
        break
      case 'findOne':
        result = await db.collection(collection).findOne(query)
        break
      case 'insertOne':
        result = await db.collection(collection).insertOne(data)
        break
      case 'updateOne':
        result = await db
          .collection(collection)
          .updateOne(query, { $set: data })
        break
      case 'deleteOne':
        result = await db.collection(collection).deleteOne(query)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        )
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error('Database operation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
