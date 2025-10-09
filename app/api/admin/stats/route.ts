import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import User from '@/src/models/User'
import RegistrationIntent from '@/src/models/RegistrationIntent'
import Subscription from '@/src/models/Subscription'
import Payment from '@/src/models/Payment'

export async function GET(request: NextRequest) {
  try {
    // Authentication check with admin role requirement
    const authResult = await getAuthenticatedUser(request)
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult
    if (!user?.roles?.includes('admin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await connectToDatabase()

    // Get current date and first day of current month
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // Parallel queries for better performance
    const [
      totalUsers,
      totalInstitutes,
      totalBusinesses,
      pendingRegistrations,
      activeSubscriptions,
      newUsersThisMonth,
      newUsersLastMonth,
      monthlyRevenue,
      totalRevenue,
      successfulPayments,
      totalPayments
    ] = await Promise.all([
      // Total users
      User.countDocuments(),

      // Total institutes (users with institute role)
      User.countDocuments({ roles: 'institute' }),

      // Total businesses (users with business role)
      User.countDocuments({ roles: 'business' }),

      // Pending registrations
      RegistrationIntent.countDocuments({ status: 'pending' }),

      // Active subscriptions
      Subscription.countDocuments({ status: 'active' }),

      // New users this month
      User.countDocuments({
        createdAt: { $gte: firstDayOfMonth }
      }),

      // New users last month
      User.countDocuments({
        createdAt: {
          $gte: firstDayOfLastMonth,
          $lt: firstDayOfMonth
        }
      }),

      // Monthly revenue (current month)
      Payment.aggregate([
        {
          $match: {
            status: 'paid',
            paidAt: { $gte: firstDayOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),

      // Total revenue (all time)
      Payment.aggregate([
        {
          $match: {
            status: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),

      // Successful payments
      Payment.countDocuments({ status: 'paid' }),

      // Total payments
      Payment.countDocuments()
    ])

    // Calculate conversion rate
    const conversionRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0

    // Calculate user growth rate
    const userGrowthRate = newUsersLastMonth > 0
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
      : newUsersThisMonth > 0 ? 100 : 0

    // Extract revenue values
    const currentMonthRevenue = monthlyRevenue[0]?.total || 0
    const allTimeRevenue = totalRevenue[0]?.total || 0

    // Additional stats
    const stats = {
      totalUsers,
      totalInstitutes,
      totalBusinesses,
      pendingRegistrations,
      activeSubscriptions,
      monthlyRevenue: currentMonthRevenue,
      totalRevenue: allTimeRevenue,
      newUsersThisMonth,
      newUsersLastMonth,
      userGrowthRate: Math.round(userGrowthRate * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      successfulPayments,
      totalPayments,

      // Additional calculated metrics
      averageRevenuePerUser: totalUsers > 0 ? Math.round((allTimeRevenue / totalUsers) * 100) / 100 : 0,
      subscriptionRate: totalUsers > 0 ? Math.round((activeSubscriptions / totalUsers) * 100 * 100) / 100 : 0,

      // Status breakdown
      registrationStatusBreakdown: await RegistrationIntent.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Payment status breakdown
      paymentStatusBreakdown: await Payment.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]),

      // Plan type distribution
      planTypeDistribution: await Subscription.aggregate([
        {
          $match: { status: 'active' }
        },
        {
          $group: {
            _id: '$planType',
            count: { $sum: 1 }
          }
        }
      ]),

      // Organization type distribution
      organizationTypeDistribution: await Subscription.aggregate([
        {
          $match: { status: 'active' }
        },
        {
          $group: {
            _id: '$organizationType',
            count: { $sum: 1 }
          }
        }
      ]),

      // Recent activity counts
      recentActivity: {
        registrationsToday: await RegistrationIntent.countDocuments({
          createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) }
        }),
        paymentsToday: await Payment.countDocuments({
          createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) }
        }),
        newUsersToday: await User.countDocuments({
          createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) }
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Error fetching admin stats:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
