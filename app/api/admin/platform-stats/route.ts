import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db/mongodb';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Get current date for today's calculations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Get user statistics
    const totalUsers = await db.collection('users').countDocuments();
    const activeUsers = await db.collection('users').countDocuments({ 
      lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Active in last 30 days
    });
    const newUsersToday = await db.collection('users').countDocuments({
      createdAt: { $gte: today }
    });
    const newUsersLastMonth = await db.collection('users').countDocuments({
      createdAt: { $gte: lastMonth, $lt: today }
    });
    const userGrowth = newUsersLastMonth > 0 ? ((newUsersToday * 30) / newUsersLastMonth - 1) * 100 : 0;

    // Get business statistics
    const totalBusinesses = await db.collection('businesses').countDocuments();
    const activeBusinesses = await db.collection('businesses').countDocuments({ 
      status: 'active' 
    });
    const newBusinessesToday = await db.collection('businesses').countDocuments({
      createdAt: { $gte: today }
    });
    const newBusinessesLastMonth = await db.collection('businesses').countDocuments({
      createdAt: { $gte: lastMonth, $lt: today }
    });
    const businessGrowth = newBusinessesLastMonth > 0 ? ((newBusinessesToday * 30) / newBusinessesLastMonth - 1) * 100 : 0;

    // Get institute statistics
    const totalInstitutes = await db.collection('institutes').countDocuments();
    const activeInstitutes = await db.collection('institutes').countDocuments({ 
      status: 'active' 
    });
    const newInstitutesToday = await db.collection('institutes').countDocuments({
      createdAt: { $gte: today }
    });
    const newInstitutesLastMonth = await db.collection('institutes').countDocuments({
      createdAt: { $gte: lastMonth, $lt: today }
    });
    const instituteGrowth = newInstitutesLastMonth > 0 ? ((newInstitutesToday * 30) / newInstitutesLastMonth - 1) * 100 : 0;

    // Get job statistics
    const totalJobs = await db.collection('jobs').countDocuments();
    const activeJobs = await db.collection('jobs').countDocuments({ 
      status: 'active',
      deadline: { $gte: new Date() }
    });
    const jobsPostedToday = await db.collection('jobs').countDocuments({
      createdAt: { $gte: today }
    });
    const jobsPostedLastMonth = await db.collection('jobs').countDocuments({
      createdAt: { $gte: lastMonth, $lt: today }
    });
    const jobGrowth = jobsPostedLastMonth > 0 ? ((jobsPostedToday * 30) / jobsPostedLastMonth - 1) * 100 : 0;

    // Get course statistics
    const totalCourses = await db.collection('courses').countDocuments();
    const activeCourses = await db.collection('courses').countDocuments({ 
      status: 'active' 
    });
    const coursesCreatedToday = await db.collection('courses').countDocuments({
      createdAt: { $gte: today }
    });
    const coursesCreatedLastMonth = await db.collection('courses').countDocuments({
      createdAt: { $gte: lastMonth, $lt: today }
    });
    const courseGrowth = coursesCreatedLastMonth > 0 ? ((coursesCreatedToday * 30) / coursesCreatedLastMonth - 1) * 100 : 0;

    // Get revenue statistics
    const totalRevenue = await db.collection('payments').aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    
    const monthlyRevenue = await db.collection('payments').aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: lastMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    
    const dailyRevenue = await db.collection('payments').aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: today }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    
    const lastMonthRevenue = await db.collection('payments').aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000), $lt: lastMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    
    const totalRevenueAmount = totalRevenue[0]?.total || 0;
    const monthlyRevenueAmount = monthlyRevenue[0]?.total || 0;
    const dailyRevenueAmount = dailyRevenue[0]?.total || 0;
    const lastMonthRevenueAmount = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastMonthRevenueAmount > 0 ? ((monthlyRevenueAmount / lastMonthRevenueAmount - 1) * 100) : 0;

    return NextResponse.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        newToday: newUsersToday,
        growth: Math.round(userGrowth * 100) / 100
      },
      businesses: {
        total: totalBusinesses,
        active: activeBusinesses,
        newToday: newBusinessesToday,
        growth: Math.round(businessGrowth * 100) / 100
      },
      institutes: {
        total: totalInstitutes,
        active: activeInstitutes,
        newToday: newInstitutesToday,
        growth: Math.round(instituteGrowth * 100) / 100
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        postedToday: jobsPostedToday,
        growth: Math.round(jobGrowth * 100) / 100
      },
      courses: {
        total: totalCourses,
        active: activeCourses,
        createdToday: coursesCreatedToday,
        growth: Math.round(courseGrowth * 100) / 100
      },
      revenue: {
        total: totalRevenueAmount,
        monthly: monthlyRevenueAmount,
        daily: dailyRevenueAmount,
        growth: Math.round(revenueGrowth * 100) / 100
      }
    });

  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
