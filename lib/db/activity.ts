import { db } from './client'
import { UserActivity, ActivityType } from '@/lib/types/activity'

export async function logUserActivity (
  activity: Omit<UserActivity, '_id' | 'timestamp'>
) {
  const activityDoc = {
    ...activity,
    timestamp: new Date(),
    read: false,
    notified: false
  }

  return db.insertOne('user_activities', activityDoc)
}

export async function getUserActivities (
  userId: string,
  options: {
    page?: number
    limit?: number
    type?: ActivityType[]
    startDate?: Date
    endDate?: Date
    read?: boolean
  } = {}
) {
  const { page = 1, limit = 10, type, startDate, endDate, read } = options

  const query: any = { userId }

  if (type?.length) {
    query.type = { $in: type }
  }

  if (startDate || endDate) {
    query.timestamp = {}
    if (startDate) query.timestamp.$gte = startDate
    if (endDate) query.timestamp.$lte = endDate
  }

  if (typeof read === 'boolean') {
    query.read = read
  }

  const [activities, countResult] = await Promise.all([
    db.find('user_activities', {
      ...query,
      $skip: (page - 1) * limit,
      $limit: limit,
      $sort: { timestamp: -1 }
    }),
    db.find('user_activities', { ...query, $count: true })
  ])

  const total = Array.isArray(countResult) ? countResult.length : 0

  return {
    activities,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export async function getAllUserActivities (
  options: {
    page?: number
    limit?: number
    type?: ActivityType[]
    startDate?: Date
    endDate?: Date
    userId?: string
    search?: string
  } = {}
) {
  const {
    page = 1,
    limit = 10,
    type,
    startDate,
    endDate,
    userId,
    search
  } = options

  const query: any = {}

  if (type?.length) {
    query.type = { $in: type }
  }

  if (startDate || endDate) {
    query.timestamp = {}
    if (startDate) query.timestamp.$gte = startDate
    if (endDate) query.timestamp.$lte = endDate
  }

  if (userId) {
    query.userId = userId
  }

  if (search) {
    query.$or = [
      { description: { $regex: search, $options: 'i' } },
      { 'metadata.details': { $regex: search, $options: 'i' } }
    ]
  }

  const [activities, countResult] = await Promise.all([
    db.find('user_activities', {
      ...query,
      $skip: (page - 1) * limit,
      $limit: limit,
      $sort: { timestamp: -1 }
    }),
    db.find('user_activities', { ...query, $count: true })
  ])

  const total = Array.isArray(countResult) ? countResult.length : 0

  return {
    activities,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export async function markActivitiesAsRead (
  userId: string,
  activityIds?: string[]
) {
  const query: any = { userId, read: false }
  if (activityIds?.length) {
    query._id = { $in: activityIds }
  }

  const result = await db.updateOne('user_activities', query, { read: true })
  return result.modifiedCount
}

export async function getUnreadCount (userId: string) {
  const result = await db.find('user_activities', {
    userId,
    read: false,
    $count: true
  })
  return Array.isArray(result) ? result.length : 0
}
