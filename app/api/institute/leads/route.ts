import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase as dbConnect } from '@/lib/db/mongodb'
import StudentLead from '@/src/models/StudentLead'
import User from '@/src/models/User'
import Profile from '@/src/models/Profile'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import Subscription, { ISubscription } from '@/src/models/Subscription'

async function getUserSubscription (
  userId: string
): Promise<ISubscription | null> {
  const subscription = await Subscription.findOne({
    userId: userId,
    status: 'active',
    endDate: { $gt: new Date() }
  })
    .sort({ createdAt: -1 })
    .lean()
  return subscription as ISubscription | null
}

export async function GET (req: NextRequest) {
  const session = await getAuthenticatedUser(req)

  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id: userId, roles } = session.user

  if (!roles?.includes('institute')) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  await dbConnect()

  try {
    const user = await User.findById(userId)
    if (!user || !user.ownedOrganizations?.length) {
      return NextResponse.json(
        { message: 'No institute associated with this user' },
        { status: 404 }
      )
    }

    const instituteId = user.ownedOrganizations[0].toString()

    // Check user's subscription
    const subscription = await getUserSubscription(userId)
    const isPaidPlan = !!(
      subscription &&
      (subscription.planType === 'premium' ||
        subscription.planType === 'enterprise')
    )

    // Get Query Params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const courseLevel = searchParams.get('courseLevel') || 'all'

    // Build Query
    const query: any = { instituteId }

    if (status && status !== 'all') {
      query.status = status
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { courseName: { $regex: search, $options: 'i' } }
      ]
    }

    // Get total count for pagination
    const totalCount = await StudentLead.countDocuments(query)
    const totalPages = Math.ceil(totalCount / limit)
    const skip = (page - 1) * limit

    // Get stats breakdown
    const statsAggregation = await StudentLead.aggregate([
      { $match: { instituteId: instituteId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])

    const stats = statsAggregation.reduce((acc: any, curr: any) => {
      acc[curr._id] = curr.count
      return acc
    }, {})

    let leads = await StudentLead.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Fetch publicProfileId from Profile model (personalDetails.publicProfileId)
    const userIds = leads.map(lead => lead.userId).filter(Boolean)
    const profiles = await Profile.find({ userId: { $in: userIds } })
      .select('userId personalDetails.publicProfileId')
      .lean()
    const userPublicProfiles = new Map(
      profiles.map((p: any) => [
        p.userId.toString(),
        p.personalDetails?.publicProfileId
      ])
    )

    leads = leads.map((lead: any) => {
      const publicProfileId = userPublicProfiles.get(lead.userId?.toString())
      return {
        ...lead,
        publicProfileId: publicProfileId || null
      }
    })

    // If free plan, mask contact details
    if (!isPaidPlan) {
      leads = leads.map((lead: any) => ({
        ...lead,
        fullName: lead.fullName
          ? lead.fullName.replace(/(.{1})(.*)( .*)/, '$1*****$3')
          : 'Student',
        email: lead.email
          ? lead.email.replace(/(.{1})(.*)(@.*)/, '$1***$3')
          : '',
        phone: lead.phone
          ? lead.phone.replace(/(\d{1})\d+(\d{1})/, '$1******$2')
          : '',
        phoneNumber: lead.phoneNumber
          ? lead.phoneNumber.replace(/(\d{2})\d+(\d{2})/, '$1******$2')
          : ''
      }))
    }

    return NextResponse.json(
      {
        count: totalCount,
        totalPages,
        currentPage: page,
        stats,
        data: leads,
        isPaid: isPaidPlan,
        message: !isPaidPlan
          ? 'Upgrade to a paid plan to view full contact details'
          : undefined
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching student leads:', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PATCH (req: NextRequest) {
  const session = await getAuthenticatedUser(req)

  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id: userId, roles } = session.user

  if (!roles?.includes('institute')) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  await dbConnect()

  try {
    const { leadId, status } = await req.json()

    if (!leadId || !status) {
      return NextResponse.json(
        { message: 'Missing leadId or status' },
        { status: 400 }
      )
    }

    const user = await User.findById(userId)
    if (!user?.ownedOrganizations?.length) {
      return NextResponse.json(
        { message: 'No institute associated with this user' },
        { status: 404 }
      )
    }

    const instituteId = user.ownedOrganizations[0].toString()

    // Check subscription for free plan users
    const subscription = await getUserSubscription(userId)
    const isPaidPlan =
      subscription &&
      (subscription.planType === 'premium' ||
        subscription.planType === 'enterprise')

    if (!isPaidPlan) {
      return NextResponse.json(
        {
          message: 'Upgrade to a paid plan to manage leads',
          isPaid: false
        },
        { status: 403 }
      )
    }

    const lead = await StudentLead.findById(leadId)

    if (!lead) {
      return NextResponse.json({ message: 'Lead not found' }, { status: 404 })
    }

    // Security check: Ensure the lead belongs to the user's institute
    if (!lead.instituteId || lead.instituteId.toString() !== instituteId) {
      return NextResponse.json(
        { message: 'Access denied to this lead' },
        { status: 403 }
      )
    }

    lead.status = status
    await lead.save()

    return NextResponse.json(
      {
        message: 'Status updated successfully',
        isPaid: true
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating lead status:', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
