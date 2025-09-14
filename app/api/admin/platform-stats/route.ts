import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User, Business, Institute, Job, Course, Application, Payment } from '@/src/models';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    // Get current date for today's calculations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Active in last 30 days
    });
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today }
    });
    const newUsersLastMonth = await User.countDocuments({
      createdAt: { $gte: lastMonth, $lt: today }
    });
    const userGrowth = newUsersLastMonth > 0 ? ((newUsersToday * 30) / newUsersLastMonth - 1) * 100 : 0;

    // Get business statistics
    const totalBusinesses = await Business.countDocuments();
    const activeBusinesses = await Business.countDocuments({ 
      status: 'active' 
    });
    const newBusinessesToday = await Business.countDocuments({
      createdAt: { $gte: today }
    });
    const newBusinessesLastMonth = await Business.countDocuments({
      createdAt: { $gte: lastMonth, $lt: today }
    });
    const businessGrowth = newBusinessesLastMonth > 0 ? ((newBusinessesToday * 30) / newBusinessesLastMonth - 1) * 100 : 0;

    // Get institute statistics
    const totalInstitutes = await Institute.countDocuments();
    const activeInstitutes = await Institute.countDocuments({ 
      status: 'active' 
    });
    const newInstitutesToday = await Institute.countDocuments({
      createdAt: { $gte: today }
    });
    const newInstitutesLastMonth = await Institute.countDocuments({
      createdAt: { $gte: lastMonth, $lt: today }
    });
    const instituteGrowth = newInstitutesLastMonth > 0 ? ((newInstitutesToday * 30) / newInstitutesLastMonth - 1) * 100 : 0;

    // Get job statistics
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ 
      status: 'active',
      applicationDeadline: { $gte: new Date() }
    });
    const jobsPostedToday = await Job.countDocuments({
      createdAt: { $gte: today }
    });
    const jobsPostedLastMonth = await Job.countDocuments({
      createdAt: { $gte: lastMonth, $lt: today }
    });
    const jobGrowth = jobsPostedLastMonth > 0 ? ((jobsPostedToday * 30) / jobsPostedLastMonth - 1) * 100 : 0;

    // Get course statistics
    const totalCourses = await Course.countDocuments();
    const activeCourses = await Course.countDocuments({ 
      status: 'active' 
    });
    const coursesCreatedToday = await Course.countDocuments({
      createdAt: { $gte: today }
    });
    const coursesCreatedLastMonth = await Course.countDocuments({
      createdAt: { $gte: lastMonth, $lt: today }
    });
    const courseGrowth = coursesCreatedLastMonth > 0 ? ((coursesCreatedToday * 30) / coursesCreatedLastMonth - 1) * 100 : 0;

    // Get revenue statistics
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const monthlyRevenue = await Payment.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: lastMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const dailyRevenue = await Payment.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: today }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const lastMonthRevenue = await Payment.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000), $lt: lastMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
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
