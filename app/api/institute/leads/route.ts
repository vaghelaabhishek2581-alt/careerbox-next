import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase as dbConnect } from '@/lib/db/mongodb';
import StudentLead from '@/src/models/StudentLead';
import User from '@/src/models/User';
import { getAuthenticatedUser } from '@/lib/auth/unified-auth';
import Subscription from '@/src/models/Subscription';

async function getUserSubscription(userId: string) {
  return await Subscription.findOne({
    userId: userId,
    status: 'active',
    endDate: { $gt: new Date() }
  }).sort({ createdAt: -1 }).lean();
}

export async function GET(req: NextRequest) {
  const session = await getAuthenticatedUser(req);
  
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id: userId, roles } = session.user;

  if (!roles?.includes('institute')) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  try {
    const user = await User.findById(userId);
    if (!user || !user.ownedOrganizations?.length) {
      return NextResponse.json({ message: 'No institute associated with this user' }, { status: 404 });
    }

    const instituteId = user.ownedOrganizations[0].toString();
    console.log('Fetching leads for institute ID:', instituteId);

    // Check user's subscription
    const subscription = await getUserSubscription(userId);
    const isPaidPlan = subscription?.planType === 'premium' || subscription?.planType === 'enterprise';

    // Get leads count
    const leadsCount = await StudentLead.countDocuments({ instituteId });

    // If free plan, return only the count
    if (!isPaidPlan) {
      return NextResponse.json({
        count: leadsCount,
        message: 'Upgrade to a paid plan to view lead details',
        isPaid: false
      }, { status: 200 });
    }

    // If paid plan, return full lead details
    const leads = await StudentLead.find({ instituteId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      count: leadsCount,
      data: leads,
      isPaid: true
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching student leads:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthenticatedUser(req);
  
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id: userId, roles } = session.user;

  if (!roles?.includes('institute')) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  try {
    const { leadId, status } = await req.json();

    if (!leadId || !status) {
      return NextResponse.json({ message: 'Missing leadId or status' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user?.ownedOrganizations?.length) {
      return NextResponse.json({ message: 'No institute associated with this user' }, { status: 404 });
    }
    
    const instituteId = user.ownedOrganizations[0].toString();
    
    // Check subscription for free plan users
    const subscription = await getUserSubscription(userId);
    const isPaidPlan = subscription?.planType === 'premium' || subscription?.planType === 'enterprise';
    
    if (!isPaidPlan) {
      return NextResponse.json({
        message: 'Upgrade to a paid plan to manage leads',
        isPaid: false
      }, { status: 403 });
    }

    console.log(`Updating lead ID: ${leadId} to status: ${status} for institute ID: ${instituteId}`);

    const lead = await StudentLead.findById(leadId);

    if (!lead) {
      return NextResponse.json({ message: 'Lead not found' }, { status: 404 });
    }

    // Security check: Ensure the lead belongs to the user's institute
    if (lead.instituteId.toString() !== instituteId) {
      return NextResponse.json({ message: 'Access denied to this lead' }, { status: 403 });
    }

    console.log('Found lead:', lead);
    lead.status = status;
    await lead.save();
    console.log('Lead updated successfully.');

    return NextResponse.json({ 
      message: 'Status updated successfully',
      isPaid: true
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating lead status:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
