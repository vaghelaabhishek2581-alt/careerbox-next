// import { NextRequest, NextResponse } from 'next/server';
// import { verifyPaymentSignature, getPaymentDetails, calculateRefundAmount } from '@/lib/payment/razorpay';
// import { connectToDatabase } from '@/lib/db/mongodb';
// import { getAuthenticatedUser } from '@/lib/auth/unified-auth';
// import { z } from 'zod';
// import RegistrationIntent from '@/src/models/RegistrationIntent';
// import User from '@/src/models/User';
// import Subscription from '@/src/models/Subscription';
// import Institute from '@/src/models/Institute';
// import Business from '@/src/models/Business';
// import NotificationService from '@/lib/services/notificationService';
// import { ObjectId } from 'mongodb';
// import Profile from '@/src/models/Profile';

// const verifyPaymentSchema = z.object({
//   razorpay_order_id: z.string(),
//   razorpay_payment_id: z.string(),
//   razorpay_signature: z.string(),
//   registrationIntentId: z.string().optional(),
//   subscriptionPlan: z.string().optional()
// });

// /**
//  * Generate a unique publicProfileId for institutes and businesses
//  * @param baseName The organization name to base the ID on
//  * @param type 'institute' or 'business'
//  * @returns A unique publicProfileId
//  */
// async function generateUniquePublicProfileId(baseName: string, type: 'institute' | 'business'): Promise<string> {
//   // Clean the base name: lowercase, replace spaces with hyphens, remove special chars
//   let baseId = baseName
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
//     .replace(/\s+/g, '-') // Replace spaces with hyphens
//     .replace(/-+/g, '-') // Replace multiple hyphens with single
//     .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

//   // Ensure minimum length
//   if (baseId.length < 3) {
//     baseId = `${type}-${baseId}`;
//   }

//   // Truncate if too long
//   if (baseId.length > 20) {
//     baseId = baseId.substring(0, 20);
//   }

//   let publicProfileId = baseId;
//   let counter = 0;
//   let isUnique = false;

//   while (!isUnique && counter < 100) {
//     // Check if this ID exists in any of the three collections
//     const [profileExists, instituteExists, businessExists] = await Promise.all([
//       Profile.findOne({ 'personalDetails.publicProfileId': publicProfileId }).lean(),
//       Institute.findOne({ publicProfileId }).lean(),
//       Business.findOne({ publicProfileId }).lean()
//     ]);

//     if (!profileExists && !instituteExists && !businessExists) {
//       isUnique = true;
//     } else {
//       counter++;
//       // Add type-specific suffix for clarity
//       if (counter === 1) {
//         publicProfileId = `${baseId}-${type}`;
//       } else if (counter === 2) {
//         publicProfileId = `${type}-${baseId}`;
//       } else {
//         // Add number suffix
//         publicProfileId = `${baseId}-${type}-${counter}`;
//       }
//     }
//   }

//   // If still not unique after 100 attempts, add timestamp
//   if (!isUnique) {
//     const timestamp = Date.now().toString(36);
//     publicProfileId = `${baseId}-${type}-${timestamp}`;
//   }

//   return publicProfileId;
// }

// export async function POST(request: NextRequest) {
//   try {
//     const authResult = await getAuthenticatedUser(request);

//     if (!authResult) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     const { userId, user } = authResult;

//     const body = await request.json();
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       registrationIntentId,
//       subscriptionPlan
//     } = verifyPaymentSchema.parse(body);

//     const { db } = await connectToDatabase();

//     // Verify payment signature
//     const isValidSignature = verifyPaymentSignature(
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature
//     );

//     if (!isValidSignature) {
//       return NextResponse.json(
//         { error: 'Invalid payment signature' },
//         { status: 400 }
//       );
//     }

//     // Get payment details from Razorpay
//     const paymentResult = await getPaymentDetails(razorpay_payment_id);

//     if (!paymentResult.success) {
//       return NextResponse.json(
//         { error: 'Failed to verify payment' },
//         { status: 500 }
//       );
//     }

//     const payment = paymentResult.payment;

//     if (!payment) {
//       return NextResponse.json(
//         { error: 'Payment details not found' },
//         { status: 404 }
//       );
//     }

//     // Get order details from database
//     const order = await db.collection('payment_orders').findOne({
//       orderId: razorpay_order_id,
//       userId: userId
//     });

//     if (!order) {
//       return NextResponse.json(
//         { error: 'Order not found' },
//         { status: 404 }
//       );
//     }

//     // Check if payment is already processed
//     if (order.status === 'completed') {
//       return NextResponse.json(
//         { error: 'Payment already processed' },
//         { status: 400 }
//       );
//     }

//     // Handle registration intent payment
//     if (registrationIntentId && subscriptionPlan) {
//       return await handleRegistrationIntentPayment({
//         userId,
//         user,
//         registrationIntentId,
//         subscriptionPlan,
//         order,
//         payment,
//         razorpay_order_id,
//         razorpay_payment_id
//       });
//     }

//     // Handle regular subscription payment (existing logic)
//     return await handleRegularSubscriptionPayment({
//       userId,
//       order,
//       payment,
//       razorpay_order_id,
//       razorpay_payment_id,
//       db
//     });

//   } catch (error) {
//     console.error('Error verifying payment:', error);

//     if (error instanceof z.ZodError) {
//       return NextResponse.json(
//         { error: 'Invalid request data', details: error.errors },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// // Handle registration intent payment and create institute/business
// async function handleRegistrationIntentPayment({
//   userId,
//   user,
//   registrationIntentId,
//   subscriptionPlan,
//   order,
//   payment,
//   razorpay_order_id,
//   razorpay_payment_id
// }: any) {
//   try {
//     await connectToDatabase();

//     // Find and update registration intent
//     const registrationIntent = await RegistrationIntent.findById(registrationIntentId);
//     if (!registrationIntent || registrationIntent.userId.toString() !== userId) {
//       return NextResponse.json(
//         { error: 'Registration intent not found or access denied' },
//         { status: 404 }
//       );
//     }

//     console.log('Registration Intent data:', JSON.stringify({
//       type: registrationIntent.type,
//       organizationName: registrationIntent.organizationName,
//       contactName: registrationIntent.contactName,
//       email: registrationIntent.email,
//       contactPhone: registrationIntent.contactPhone,
//       address: registrationIntent.address,
//       city: registrationIntent.city,
//       state: registrationIntent.state,
//       country: registrationIntent.country,
//       zipCode: registrationIntent.zipCode,
//       description: registrationIntent.description,
//       website: registrationIntent.website,
//       establishmentYear: registrationIntent.establishmentYear
//     }, null, 2));

//     // Define features based on plan type
//     const getFeaturesByPlan = (planType: string, orgType: string) => {
//       const isInstitute = orgType === 'institute';

//       switch (planType) {
//         case 'basic':
//           return {
//             maxStudents: isInstitute ? 100 : 0,
//             maxCourses: isInstitute ? 10 : 0,
//             maxTeamMembers: 5,
//             maxJobPostings: isInstitute ? 0 : 50,
//             analyticsAccess: false,
//             prioritySupport: false,
//             customBranding: false,
//             apiAccess: false,
//             bulkOperations: false
//           };
//         case 'premium':
//           return {
//             maxStudents: isInstitute ? 500 : 0,
//             maxCourses: isInstitute ? 50 : 0,
//             maxTeamMembers: 15,
//             maxJobPostings: isInstitute ? 0 : 0, // Unlimited for business premium
//             analyticsAccess: true,
//             prioritySupport: true,
//             customBranding: true,
//             apiAccess: true,
//             bulkOperations: true
//           };
//         case 'enterprise':
//           return {
//             maxStudents: 0, // Unlimited
//             maxCourses: 0, // Unlimited
//             maxTeamMembers: 0, // Unlimited
//             maxJobPostings: 0, // Unlimited
//             analyticsAccess: true,
//             prioritySupport: true,
//             customBranding: true,
//             apiAccess: true,
//             bulkOperations: true
//           };
//         default:
//           return {
//             maxStudents: isInstitute ? 50 : 0,
//             maxCourses: isInstitute ? 5 : 0,
//             maxTeamMembers: 3,
//             maxJobPostings: isInstitute ? 0 : 10,
//             analyticsAccess: false,
//             prioritySupport: false,
//             customBranding: false,
//             apiAccess: false,
//             bulkOperations: false
//           };
//       }
//     };

//     // Create subscription
//     const subscription = new Subscription({
//       userId: userId,
//       organizationId: registrationIntentId,
//       organizationType: registrationIntent.type,
//       planName: `${subscriptionPlan.charAt(0).toUpperCase() + subscriptionPlan.slice(1)} Plan`,
//       planType: subscriptionPlan,
//       billingCycle: 'yearly', // Default to yearly billing cycle
//       status: 'active',
//       amount: order.amount,
//       currency: order.currency,
//       startDate: new Date(),
//       endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
//       features: getFeaturesByPlan(subscriptionPlan, registrationIntent.type),
//       paymentId: razorpay_payment_id,
//       orderId: razorpay_order_id,
//       createdAt: new Date(),
//     });

//     await subscription.save();

//     // Update user roles, subscription status, and organizations array
//     const roleToAdd = registrationIntent.type === 'institute' ? 'institute' : 'business';
//     await User.findByIdAndUpdate(userId, {
//       $set: {
//         subscriptionActive: true,
//         activeRole: roleToAdd,
//         isOrganizationOwner: true,
//         updatedAt: new Date(),
//       },
//       $addToSet: {
//         roles: roleToAdd,
//       },
//     });

//     // Create institute or business entity
//     let organizationEntity;
//     if (registrationIntent.type === 'institute') {
//       // Check if user already has an institute (business rule: 1 institute per user)
//       const existingInstitute = await Institute.findOne({ userId });
//       if (existingInstitute) {
//         return NextResponse.json(
//           { error: 'You can only register one institute per account' },
//           { status: 400 }
//         );
//       }

//       // Generate unique publicProfileId for institute
//       const institutePublicProfileId = await generateUniquePublicProfileId(
//         registrationIntent.organizationName || 'institute',
//         'institute'
//       );
//       console.log('Generated unique publicProfileId for institute:', institutePublicProfileId);

//       // Prepare institute data with proper validation
//       const instituteData = {
//         userId: new ObjectId(userId),
//         registrationIntentId: new ObjectId(registrationIntentId),
//         name: registrationIntent.organizationName || 'Unnamed Institute',
//         publicProfileId: institutePublicProfileId,
//         email: registrationIntent.email || 'no-email@example.com',
//         contactPerson: registrationIntent.contactName || 'Unknown Contact',
//         phone: registrationIntent.contactPhone || '0000000000',
//         address: {
//           street: registrationIntent.address || 'No address provided',
//           city: registrationIntent.city || 'Unknown City',
//           state: registrationIntent.state || 'Unknown State',
//           country: registrationIntent.country || 'India',
//           zipCode: registrationIntent.zipCode || '000000'
//         },
//         website: registrationIntent.website,
//         establishmentYear: registrationIntent.establishmentYear,
//         description: registrationIntent.description,
//         subscriptionId: subscription._id,
//         status: 'active',
//         accreditation: [],
//         socialMedia: {},
//         studentCount: 0,
//         facultyCount: 0,
//         courseCount: 0,
//         isVerified: false
//       };

//       console.log('Creating Institute with data:', JSON.stringify(instituteData, null, 2));

//       try {
//         organizationEntity = new Institute(instituteData);
//         console.log('Institute model created successfully');
//       } catch (modelError) {
//         console.error('Error creating Institute model:', modelError);
//         console.error('Model validation errors:', (modelError as any).errors);
//         throw modelError;
//       }
//     } else {
//       // Generate unique publicProfileId for business
//       const businessPublicProfileId = await generateUniquePublicProfileId(
//         registrationIntent.organizationName || 'business',
//         'business'
//       );
//       console.log('Generated unique publicProfileId for business:', businessPublicProfileId);

//       // Business - users can have multiple businesses
//       const businessData = {
//         userId: new ObjectId(userId),
//         registrationIntentId: new ObjectId(registrationIntentId),
//         name: registrationIntent.organizationName || 'Unnamed Business',
//         publicProfileId: businessPublicProfileId,
//         email: registrationIntent.email || 'no-email@example.com',
//         contactPerson: registrationIntent.contactName || 'Unknown Contact',
//         phone: registrationIntent.contactPhone || '0000000000',
//         address: {
//           street: registrationIntent.address || 'No address provided',
//           city: registrationIntent.city || 'Unknown City',
//           state: registrationIntent.state || 'Unknown State',
//           country: registrationIntent.country || 'India',
//           zipCode: registrationIntent.zipCode || '000000'
//         },
//         website: registrationIntent.website,
//         establishmentYear: registrationIntent.establishmentYear,
//         description: registrationIntent.description,
//         industry: registrationIntent.businessCategory || 'General',
//         size: registrationIntent.organizationSize || 'Small',
//         subscriptionId: subscription._id,
//         status: 'active',
//         socialMedia: {},
//         employeeCount: 0,
//         jobPostings: 0,
//         isVerified: false
//       };

//       console.log('Creating Business with data:', JSON.stringify(businessData, null, 2));

//       try {
//         organizationEntity = new Business(businessData);
//         console.log('Business model created successfully');
//       } catch (modelError) {
//         console.error('Error creating Business model:', modelError);
//         console.error('Model validation errors:', (modelError as any).errors);
//         throw modelError;
//       }
//     }

//     await organizationEntity.save();

//     // Add organization to user's organizations array
//     await User.findByIdAndUpdate(userId, {
//       $addToSet: {
//         ownedOrganizations: organizationEntity._id
//       },
//       $set: {
//         updatedAt: new Date()
//       }
//     });

//     // Update registration intent status
//     await RegistrationIntent.findByIdAndUpdate(registrationIntentId, {
//       $set: {
//         status: 'completed',
//         organizationId: organizationEntity._id,
//         completedAt: new Date(),
//         updatedAt: new Date()
//       }
//     });

//     // Update payment order status
//     const { db } = await connectToDatabase();
//     await db.collection('payment_orders').updateOne(
//       { orderId: razorpay_order_id },
//       {
//         $set: {
//           status: 'completed',
//           paymentId: razorpay_payment_id,
//           completedAt: new Date(),
//           updatedAt: new Date()
//         }
//       }
//     );

//     // Final assurance: ensure user role and organization ownership is updated after all operations
//     const finalRole = registrationIntent.type === 'institute' ? 'institute' : 'business';
//     await User.findByIdAndUpdate(userId, {
//       $set: {
//         subscriptionActive: true,
//         activeRole: finalRole,
//         isOrganizationOwner: true,
//         updatedAt: new Date()
//       },
//       $addToSet: {
//         roles: finalRole,
//         ownedOrganizations: organizationEntity._id
//       }
//     });

//     // Send success notification to user
//     await NotificationService.createNotification({
//       userId: userId,
//       type: 'payment_received',
//       title: 'Payment Successful! 🎉',
//       message: `Your payment for ${registrationIntent.organizationName} has been processed successfully. Your ${registrationIntent.type} account is now active.`,
//       data: {
//         registrationIntentId: registrationIntentId,
//         actionUrl: registrationIntent.type === 'institute' ? '/dashboard/institute' : '/dashboard/business',
//         metadata: {
//           organizationId: organizationEntity._id.toString(),
//           organizationName: registrationIntent.organizationName,
//           type: registrationIntent.type,
//           subscriptionPlan: subscriptionPlan,
//           amount: order.amount
//         }
//       },
//       priority: 'high',
//       sendEmail: true,
//       sendSocket: true,
//       emailTemplate: 'payment_received',
//       emailVariables: {
//         contactName: registrationIntent.contactName,
//         organizationName: registrationIntent.organizationName,
//         type: registrationIntent.type,
//         subscriptionPlan: subscriptionPlan,
//         amount: order.amount,
//         currency: order.currency
//       }
//     });

//     // Send admin notification about new subscription purchase
//     await NotificationService.sendAdminNotification({
//       type: 'subscription_purchased',
//       title: '💰 New Subscription Purchased',
//       message: `${registrationIntent.organizationName} (${registrationIntent.type}) has purchased a ${subscriptionPlan} plan for ₹${order.amount / 100}.`,
//       data: {
//         registrationIntentId: registrationIntentId,
//         actionUrl: `/admin/subscriptions/${subscription._id}`,
//         metadata: {
//           userId: userId,
//           organizationId: organizationEntity._id.toString(),
//           organizationName: registrationIntent.organizationName,
//           organizationType: registrationIntent.type,
//           subscriptionPlan: subscriptionPlan,
//           subscriptionId: subscription._id.toString(),
//           amount: order.amount,
//           currency: order.currency,
//           contactName: registrationIntent.contactName,
//           contactEmail: registrationIntent.email,
//           contactPhone: registrationIntent.contactPhone,
//           paymentId: razorpay_payment_id,
//           orderId: razorpay_order_id,
//           purchaseDate: new Date().toISOString()
//         }
//       },
//       priority: 'high',
//       sendEmail: true,
//       sendSocket: true,
//       emailTemplate: 'admin_subscription_purchased',
//       emailVariables: {
//         organizationName: registrationIntent.organizationName,
//         organizationType: registrationIntent.type,
//         subscriptionPlan: subscriptionPlan,
//         amount: order.amount,
//         currency: order.currency,
//         contactName: registrationIntent.contactName,
//         contactEmail: registrationIntent.email,
//         contactPhone: registrationIntent.contactPhone,
//         purchaseDate: new Date().toLocaleDateString('en-IN', {
//           year: 'numeric',
//           month: 'long',
//           day: 'numeric',
//           hour: '2-digit',
//           minute: '2-digit'
//         }),
//         dashboardUrl: `${process.env.FRONTEND_ORIGIN || 'http://localhost:3000'}/admin/subscriptions/${subscription._id}`
//       }
//     });

//     return NextResponse.json({
//       success: true,
//       message: 'Payment verified and organization created successfully',
//       data: {
//         organizationType: registrationIntent.type,
//         organizationName: registrationIntent.organizationName,
//         organizationId: organizationEntity._id.toString(),
//         subscriptionPlan: subscriptionPlan,
//         dashboardUrl: registrationIntent.type === 'institute' ? '/dashboard/institute' : '/dashboard/business'
//       }
//     });

//   } catch (error) {
//     console.error('Error handling registration intent payment:', error);
//     return NextResponse.json(
//       { error: 'Failed to process registration payment' },
//       { status: 500 }
//     );
//   }
// }

// // Handle regular subscription payment (existing logic)
// async function handleRegularSubscriptionPayment({
//   userId,
//   order,
//   payment,
//   razorpay_order_id,
//   razorpay_payment_id,
//   db
// }: any) {
//   try {
//     // Calculate subscription end date
//     const startDate = new Date();
//     const endDate = new Date();

//     switch (order.billingCycle) {
//       case 'MONTHLY':
//         endDate.setMonth(endDate.getMonth() + 1);
//         break;
//       case 'QUARTERLY':
//         endDate.setMonth(endDate.getMonth() + 3);
//         break;
//       case 'YEARLY':
//         endDate.setFullYear(endDate.getFullYear() + 1);
//         break;
//     }

//     // Create or update subscription
//     const subscription = {
//       userId: userId,
//       planType: order.planType,
//       billingCycle: order.billingCycle,
//       status: 'active',
//       startDate,
//       endDate,
//       amount: order.amount,
//       currency: order.currency,
//       paymentId: razorpay_payment_id,
//       orderId: razorpay_order_id,
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };

//     await db.collection('subscriptions').updateOne(
//       { userId: userId },
//       { $set: subscription },
//       { upsert: true }
//     );

//     // Update user role based on subscription
//     const userRole = order.planType === 'BUSINESS' ? 'business' :
//       order.planType === 'INSTITUTE' ? 'institute' : 'user';

//     await db.collection('users').updateOne(
//       { _id: new ObjectId(userId) },
//       {
//         $set: {
//           role: userRole,
//           activeRole: userRole,
//           subscriptionActive: true,
//           updatedAt: new Date()
//         },
//         $addToSet: {
//           roles: userRole
//         }
//       }
//     );

//     // Update order status
//     await db.collection('payment_orders').updateOne(
//       { orderId: razorpay_order_id },
//       {
//         $set: {
//           status: 'completed',
//           paymentId: razorpay_payment_id,
//           completedAt: new Date(),
//           updatedAt: new Date()
//         }
//       }
//     );

//     // Create payment record
//     await db.collection('payments').insertOne({
//       userId: userId,
//       orderId: razorpay_order_id,
//       paymentId: razorpay_payment_id,
//       amount: order.amount,
//       currency: order.currency,
//       planType: order.planType,
//       billingCycle: order.billingCycle,
//       status: 'completed',
//       razorpayPaymentId: payment.id,
//       razorpayOrderId: payment.order_id,
//       method: payment.method,
//       bank: payment.bank,
//       wallet: payment.wallet,
//       vpa: payment.vpa,
//       email: payment.email,
//       contact: payment.contact,
//       createdAt: new Date()
//     });

//     return NextResponse.json({
//       success: true,
//       message: 'Payment verified successfully',
//       subscription: {
//         planType: order.planType,
//         billingCycle: order.billingCycle,
//         status: 'active',
//         endDate
//       }
//     });

//   } catch (error) {
//     console.error('Error handling regular subscription payment:', error);
//     return NextResponse.json(
//       { error: 'Failed to process subscription payment' },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server'
import {
  verifyPaymentSignature,
  getPaymentDetails
} from '@/lib/payment/razorpay'
import { connectToDatabase } from '@/lib/db/mongodb'
import { connectToDatabase as connectMongoose } from '@/lib/db/mongoose'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { z } from 'zod'
import RegistrationIntent, {
  LeanRegistrationIntent
} from '@/src/models/RegistrationIntent'
import User from '@/src/models/User'
import Subscription from '@/src/models/Subscription'
import AdminInstitute from '@/src/models/AdminInstitute'
import Business from '@/src/models/Business'
import BillingInfo from '@/src/models/BillingInfo'
import Invoice from '@/src/models/Invoice'
import Payment from '@/src/models/Payment'
import NotificationService from '@/lib/services/notificationService'
import { ObjectId } from 'mongodb'
import { Types } from 'mongoose'
import Profile from '@/src/models/Profile'
import {
  calculateSubtotal,
  calculateTaxBreakup,
  generateInvoiceId,
  getDueDate,
  SELLER_DETAILS
} from '@/lib/billing/invoice'

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
  registrationIntentId: z.string().optional(),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional()
})

// Organization type enum
type OrganizationType = 'institute' | 'business'

// All-inclusive subscription features for single plan
const SUBSCRIPTION_FEATURES = {
  institute: {
    maxStudents: 0, // Unlimited
    maxCourses: 0, // Unlimited
    maxTeamMembers: 0, // Unlimited
    analyticsAccess: true,
    prioritySupport: true,
    customBranding: true,
    apiAccess: true,
    bulkOperations: true
  },
  business: {
    maxJobPostings: 0, // Unlimited
    maxTeamMembers: 0, // Unlimited
    analyticsAccess: true,
    prioritySupport: true,
    customBranding: true,
    apiAccess: true,
    bulkOperations: true
  }
}

/**
 * Generate unique publicProfileId with collision checking
 */
async function generateUniquePublicProfileId (
  baseName: string,
  type: OrganizationType
): Promise<string> {
  const cleanBase =
    baseName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 15) || type

  let profileId = cleanBase
  let counter = 0

  while (counter < 50) {
    // Check all collections in parallel
    const [profileExists, instituteExists, businessExists] = await Promise.all([
      Profile.exists({ 'personalDetails.publicProfileId': profileId }),
      AdminInstitute.exists({ id: profileId }),
      Business.exists({ publicProfileId: profileId })
    ])

    if (!profileExists && !instituteExists && !businessExists) {
      return profileId
    }

    counter++
    profileId =
      counter === 1 ? `${cleanBase}-${type}` : `${cleanBase}-${type}-${counter}`
  }

  // Fallback with timestamp
  return `${cleanBase}-${type}-${Date.now().toString(36)}`
}

/**
 * Create organization entity (AdminInstitute or Business)
 */
async function createOrganization (
  intent: any,
  userId: string,
  subscriptionId: ObjectId,
  publicProfileId: string
) {
  const baseData = {
    userId: new ObjectId(userId),
    registrationIntentId: new ObjectId(intent._id),
    name: intent.organizationName,
    // publicProfileId - handled specifically per type
    email: intent.email,
    contactPerson: intent.contactName,
    phone: intent.contactPhone,
    address: {
      street: intent.address,
      city: intent.city,
      state: intent.state,
      country: intent.country || 'India',
      zipCode: intent.zipCode
    },
    website: intent.website,
    establishmentYear: intent.establishmentYear,
    description: intent.description,
    subscriptionId,
    status: 'active',
    socialMedia: {},
    isVerified: false
  }

  if (intent.type === 'institute') {
    // Check if intent links to existing AdminInstitute
    if (intent.instituteId) {
      const existingInstitute = await AdminInstitute.findById(
        intent.instituteId
      )
      if (existingInstitute) {
        // Initialize userIds if it doesn't exist (for old documents)
        if (!existingInstitute.userIds) {
          existingInstitute.userIds = []
        }
        if (
          !existingInstitute.userIds.some((id: any) => id.toString() === userId)
        ) {
          existingInstitute.userIds.push(new ObjectId(userId))
          await existingInstitute.save()
        }
        return existingInstitute
      }
    }

    // Create new AdminInstitute
    return new AdminInstitute({
      id: publicProfileId,
      slug: publicProfileId,
      name: intent.organizationName,
      type: intent.instituteType || 'University',
      status: 'active',
      userIds: [new ObjectId(userId)],
      contact: {
        email: intent.email,
        phone: [intent.contactPhone],
        website: intent.website
      },
      location: {
        address: intent.address,
        city: intent.city,
        state: intent.state,
        pincode: intent.zipCode,
        country: intent.country
      },
      overview: [
        {
          key: 'Description',
          value: intent.description || 'No description provided'
        }
      ],
      establishedYear: intent.establishmentYear,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  } else {
    return new Business({
      ...baseData,
      publicProfileId,
      industry: intent.businessCategory || 'General',
      size: intent.organizationSize || 'Small',
      employeeCount: 0,
      jobPostings: 0
    })
  }
}

/**
 * Update user with new role and organization
 */
async function updateUserAfterPayment (
  userId: string,
  organizationType: OrganizationType,
  organizationId: ObjectId
) {
  const role = organizationType === 'institute' ? 'institute' : 'business'

  await User.findByIdAndUpdate(userId, {
    $set: {
      subscriptionActive: true,
      activeRole: role,
      isOrganizationOwner: true,
      updatedAt: new Date()
    },
    $addToSet: {
      roles: role,
      ownedOrganizations: organizationId
    }
  })
}

/**
 * Send notifications in parallel
 */
async function sendNotifications (
  intent: any,
  userId: string,
  organizationId: ObjectId,
  orderAmount: number,
  orderCurrency: string,
  paymentIds: { orderId: string; paymentId: string }
) {
  const dashboardUrl = intent.type === 'institute' ? '/institute' : '/business'
  const amount = orderAmount / 100 // Convert paise to rupees

  const userNotificationPromise = NotificationService.createNotification({
    userId,
    type: 'payment_received',
    title: 'Payment Successful! 🎉',
    message: `Your payment for ${intent.organizationName} has been processed successfully. Your ${intent.type} account is now active.`,
    data: {
      registrationIntentId: intent._id.toString(),
      actionUrl: dashboardUrl,
      metadata: {
        organizationId: organizationId.toString(),
        organizationName: intent.organizationName,
        type: intent.type,
        amount: orderAmount
      }
    },
    priority: 'high',
    sendEmail: true,
    sendSocket: true,
    emailTemplate: 'payment_received',
    emailVariables: {
      contactName: intent.contactName,
      organizationName: intent.organizationName,
      type: intent.type,
      amount,
      currency: orderCurrency
    }
  })

  const adminNotificationPromise = NotificationService.sendAdminNotification({
    type: 'subscription_purchased',
    title: '💰 New Subscription Purchased',
    message: `${intent.organizationName} (${intent.type}) has purchased a subscription for ₹${amount}.`,
    data: {
      registrationIntentId: intent._id.toString(),
      actionUrl: `/admin/organizations/${organizationId}`,
      metadata: {
        userId,
        organizationId: organizationId.toString(),
        organizationName: intent.organizationName,
        organizationType: intent.type,
        amount: orderAmount,
        currency: orderCurrency,
        contactName: intent.contactName,
        contactEmail: intent.email,
        contactPhone: intent.contactPhone,
        paymentId: paymentIds.paymentId,
        orderId: paymentIds.orderId,
        purchaseDate: new Date().toISOString()
      }
    },
    priority: 'high',
    sendEmail: true,
    sendSocket: true,
    emailTemplate: 'admin_subscription_purchased',
    emailVariables: {
      organizationName: intent.organizationName,
      organizationType: intent.type,
      amount,
      currency: orderCurrency,
      contactName: intent.contactName,
      contactEmail: intent.email,
      contactPhone: intent.contactPhone,
      purchaseDate: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      dashboardUrl: `${
        process.env.FRONTEND_ORIGIN || 'http://localhost:3000'
      }/admin/organizations/${organizationId}`
    }
  })

  await Promise.all([userNotificationPromise, adminNotificationPromise])
}

const getPlanDurationMonths = (cycle: string) => {
  const normalized = cycle.toLowerCase()
  if (normalized === 'monthly') return 1
  if (normalized === 'quarterly') return 3
  return 12
}

async function sendSubscriptionNotifications ({
  userId,
  organizationName,
  organizationType,
  amount,
  currency,
  contactName,
  contactEmail,
  contactPhone,
  orderId,
  paymentId
}: {
  userId: string
  organizationName: string
  organizationType: OrganizationType
  amount: number
  currency: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  orderId: string
  paymentId: string
}) {
  const amountInRupees = amount / 100
  const userNotificationPromise = NotificationService.createNotification({
    userId,
    type: 'payment_received',
    title: 'Payment Successful! 🎉',
    message: `Your payment for ${organizationName} has been processed successfully.`,
    data: {
      actionUrl: organizationType === 'institute' ? '/institute' : '/business',
      metadata: {
        organizationName,
        organizationType,
        amount
      }
    },
    priority: 'high',
    sendEmail: true,
    sendSocket: true,
    emailTemplate: 'payment_received',
    emailVariables: {
      contactName: contactName || 'Customer',
      organizationName,
      type: organizationType,
      amount: amountInRupees,
      currency
    }
  })

  const adminNotificationPromise = NotificationService.sendAdminNotification({
    type: 'subscription_purchased',
    title: '💰 New Subscription Purchased',
    message: `${organizationName} (${organizationType}) has purchased a subscription for ₹${amountInRupees}.`,
    data: {
      actionUrl: '/admin/payments',
      metadata: {
        organizationName,
        organizationType,
        amount,
        currency,
        contactName: contactName || 'Customer',
        contactEmail: contactEmail || '—',
        contactPhone: contactPhone || '—',
        paymentId,
        orderId,
        purchaseDate: new Date().toISOString()
      }
    },
    priority: 'high',
    sendEmail: true,
    sendSocket: true,
    emailTemplate: 'admin_subscription_purchased',
    emailVariables: {
      organizationName,
      organizationType,
      amount: amountInRupees,
      currency,
      contactName: contactName || 'Customer',
      contactEmail: contactEmail || '—',
      contactPhone: contactPhone || '—',
      purchaseDate: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      dashboardUrl: `${
        process.env.FRONTEND_ORIGIN || 'http://localhost:3000'
      }/admin/payments`
    }
  })

  await Promise.all([userNotificationPromise, adminNotificationPromise])
}

export async function POST (request: NextRequest) {
  try {
    // Parallel authentication and database connection
    const [authResult] = await Promise.all([
      getAuthenticatedUser(request),
      connectToDatabase(),
      connectMongoose()
    ])

    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, user } = authResult
    const body = await request.json()
    const parsed = verifyPaymentSchema.parse(body)
    const registrationIntentId = parsed.registrationIntentId || undefined
    const razorpay_order_id =
      parsed.razorpay_order_id || parsed.razorpayOrderId || ''
    const razorpay_payment_id =
      parsed.razorpay_payment_id || parsed.razorpayPaymentId || ''
    const razorpay_signature =
      parsed.razorpay_signature || parsed.razorpaySignature || ''

    // Verify payment signature
    if (
      !verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const [paymentResult, registrationIntent, order] = await Promise.all([
      getPaymentDetails(razorpay_payment_id),
      registrationIntentId
        ? RegistrationIntent.findById(registrationIntentId).lean().exec()
        : Promise.resolve(null),
      db
        .collection('payment_orders')
        .findOne({ orderId: razorpay_order_id, userId })
    ])

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === 'completed') {
      return NextResponse.json(
        { error: 'Payment already processed' },
        { status: 400 }
      )
    }

    if (!registrationIntentId) {
      await connectMongoose()
      const cycle = String(order.billingCycle || 'YEARLY').toLowerCase()
      const planType = String(order.planType || 'INSTITUTE')
      const now = new Date()
      const monthsToAdd =
        cycle === 'monthly' ? 1 : cycle === 'quarterly' ? 3 : 12
      const cycleLabel = cycle === 'yearly' ? 'yearly' : 'monthly'

      const organizationType =
        planType === 'BUSINESS' ? 'business' : 'institute'
      let organizationId: any = null
      if (organizationType === 'institute') {
        const inst = await AdminInstitute.findOne({
          userIds: { $in: [new ObjectId(userId)] }
        })
          .select('_id name location')
          .lean<{ _id: Types.ObjectId; name?: string; location?: any } | null>()
          .exec()
        organizationId = inst?._id || new ObjectId(userId)
      } else {
        const biz = await Business.findOne({ userId: new ObjectId(userId) })
          .select('_id name')
          .lean<{ _id: Types.ObjectId; name?: string } | null>()
          .exec()
        organizationId = biz?._id || new ObjectId(userId)
      }

      const existingSub = await Subscription.findOne({
        userId: new ObjectId(userId),
        status: 'active'
      })
        .sort({ createdAt: -1 })
        .lean<{
          _id: Types.ObjectId
          endDate?: Date
          startDate?: Date
          createdAt?: Date
        } | null>()

      const baseDate =
        existingSub?.endDate && existingSub.endDate > now
          ? new Date(existingSub.endDate)
          : now
      const endDate = new Date(baseDate)
      endDate.setMonth(endDate.getMonth() + monthsToAdd)

      const planName =
        planType === 'BUSINESS'
          ? 'Business Premium'
          : planType === 'INSTITUTE'
          ? 'Institute Premium'
          : 'Premium Plan'

      const subscriptionData = {
        userId: new ObjectId(userId),
        organizationId: organizationId,
        organizationType,
        instituteId:
          organizationType === 'institute' ? organizationId : undefined,
        planId: planType,
        planName,
        planType: 'premium',
        billingCycle: cycleLabel as any,
        status: 'active',
        autoInvoiceEnabled: true,
        amount: order.amount,
        currency: order.currency,
        startDate: existingSub?.startDate || now,
        endDate,
        features:
          organizationType === 'institute'
            ? SUBSCRIPTION_FEATURES.institute
            : SUBSCRIPTION_FEATURES.business,
        lastPaymentDate: now,
        lastPaymentAmount: order.amount,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        createdAt: existingSub?.createdAt || now,
        updatedAt: now
      }

      let subscription = null
      if (existingSub?._id) {
        subscription = await Subscription.findByIdAndUpdate(
          existingSub._id,
          { $set: subscriptionData },
          { new: true }
        )
      } else {
        subscription = await Subscription.create(subscriptionData)
      }

      await User.findByIdAndUpdate(new ObjectId(userId), {
        $set: {
          subscriptionActive: true,
          activeRole: organizationType
        }
      })

      await db.collection('payment_orders').updateOne(
        { orderId: razorpay_order_id },
        {
          $set: {
            status: 'completed',
            paymentId: razorpay_payment_id,
            completedAt: now,
            updatedAt: now
          }
        }
      )

      const billingInfo = await BillingInfo.findOne({
        $or: [
          { userId: new ObjectId(userId) },
          ...(organizationType === 'institute'
            ? [{ instituteId: organizationId }]
            : [])
        ]
      })
        .lean<{
          organizationName?: string
          gstin?: string
          addressLine1?: string
          addressLine2?: string
          city?: string
          state?: string
          postalCode?: string
          country?: string
          email?: string
        } | null>()
        .exec()

      const institute =
        organizationType === 'institute'
          ? await AdminInstitute.findById(organizationId)
              .select('name location')
              .lean<{ name?: string; location?: any } | null>()
          : null
      const business =
        organizationType === 'business'
          ? await Business.findById(organizationId)
              .select('name')
              .lean<{ name?: string } | null>()
          : null

      const location = (institute as any)?.location || {}
      const billingSnapshot = {
        organizationName:
          billingInfo?.organizationName ||
          (institute as any)?.name ||
          (business as any)?.name ||
          'Institute',
        gstin: billingInfo?.gstin,
        addressLine1: billingInfo?.addressLine1 || location.address || 'NA',
        addressLine2: billingInfo?.addressLine2 || '',
        city: billingInfo?.city || location.city || 'NA',
        state: billingInfo?.state || location.state || 'NA',
        postalCode: billingInfo?.postalCode || location.pincode || '000000',
        country: billingInfo?.country || location.country || 'India',
        email: billingInfo?.email || user?.email || undefined
      }

      const lineItems = [
        {
          description: `${planName} (${cycleLabel})`,
          qty: 1,
          unitPrice: order.amount,
          sac: '9983'
        }
      ]
      const subtotal = calculateSubtotal(lineItems)
      const taxBreakup = calculateTaxBreakup(
        subtotal,
        SELLER_DETAILS.state,
        billingSnapshot.state
      )
      const totalAmount =
        subtotal + taxBreakup.cgst + taxBreakup.sgst + taxBreakup.igst
      const invoiceDate = now
      const dueDate = getDueDate(invoiceDate, 7)

      const payment = (paymentResult as any)?.payment || {}
      const paymentMethod =
        payment?.method === 'upi' ? 'UPI' : payment?.method ? 'Card' : undefined

      await Invoice.create({
        invoiceId: generateInvoiceId(invoiceDate),
        orderId: razorpay_order_id,
        transactionId: razorpay_payment_id,
        userId: new ObjectId(userId),
        instituteId:
          organizationType === 'institute' ? organizationId : undefined,
        subscriptionId: subscription?._id,
        planSnapshot: {
          name: planName,
          price: order.amount,
          duration: cycleLabel
        },
        billingSnapshot,
        lineItems,
        subtotal,
        taxBreakup,
        totalAmount,
        currency: order.currency || 'INR',
        paymentMethod,
        upiHandle: payment?.vpa,
        cardBrand: payment?.card?.network,
        cardLast4: payment?.card?.last4,
        paymentStatus: 'paid',
        invoiceDate,
        dueDate
      })

      const planDuration = getPlanDurationMonths(cycle)
      const organizationName =
        billingSnapshot.organizationName ||
        (institute as any)?.name ||
        (business as any)?.name ||
        'Organization'
      const paymentMethodLabel =
        payment?.method === 'upi' ? 'UPI' : payment?.method ? 'Card' : undefined

      const existingPayment = await Payment.findOne({
        orderId: razorpay_order_id
      })
        .select('_id')
        .lean()
        .exec()

      if (!existingPayment) {
        await Payment.create({
          userId: new ObjectId(userId),
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          amount: order.amount,
          currency: order.currency || 'INR',
          status: 'paid',
          method: 'razorpay',
          paymentMethod: paymentMethodLabel,
          organizationName,
          organizationType,
          planType: 'premium',
          planDuration,
          subscriptionId: subscription?._id?.toString(),
          gatewayResponse: payment,
          paidAt: now
        })
      }

      sendSubscriptionNotifications({
        userId,
        organizationName,
        organizationType,
        amount: order.amount,
        currency: order.currency || 'INR',
        contactName: user?.name || user?.email,
        contactEmail: user?.email,
        contactPhone: (user as any)?.phone,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      }).catch(error => console.error('Notification error:', error))

      return NextResponse.json({
        success: true,
        message: 'Subscription activated',
        data: {
          planType: 'premium',
          billingCycle: cycleLabel,
          status: 'active'
        }
      })
    }

    const registrationIntentTyped =
      registrationIntent as unknown as LeanRegistrationIntent
    if (
      !registrationIntentTyped ||
      registrationIntentTyped.userId.toString() !== userId
    ) {
      return NextResponse.json(
        { error: 'Registration intent not found or access denied' },
        { status: 404 }
      )
    }

    const orgType = registrationIntentTyped.type as OrganizationType

    // Generate unique profile ID and create subscription in parallel
    const [publicProfileId] = await Promise.all([
      generateUniquePublicProfileId(
        registrationIntentTyped.organizationName || orgType,
        orgType
      )
    ])

    // Create subscription
    const subscription = new Subscription({
      userId,
      organizationId: registrationIntentId,
      organizationType: orgType,
      planId: order.planType || 'INSTITUTE',
      planName: 'Professional Plan',
      planType: 'enterprise',
      billingCycle: 'yearly',
      status: 'active',
      autoInvoiceEnabled: true,
      amount: order.amount,
      currency: order.currency,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      features: SUBSCRIPTION_FEATURES[orgType],
      lastPaymentDate: new Date(),
      lastPaymentAmount: order.amount,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      createdAt: new Date()
    })

    await subscription.save()

    // Create organization
    const organization = await createOrganization(
      registrationIntentTyped,
      userId,
      subscription._id,
      publicProfileId
    )

    await organization.save()

    await Subscription.findByIdAndUpdate(subscription._id, {
      $set: {
        organizationId: organization._id,
        instituteId: orgType === 'institute' ? organization._id : undefined
      }
    })

    const billingInfo = await BillingInfo.findOne({
      $or: [
        { userId: new ObjectId(userId) },
        ...(orgType === 'institute' ? [{ instituteId: organization._id }] : [])
      ]
    })
      .lean<{
        organizationName?: string
        gstin?: string
        addressLine1?: string
        addressLine2?: string
        city?: string
        state?: string
        postalCode?: string
        country?: string
        email?: string
      } | null>()
      .exec()

    const billingSnapshot = {
      organizationName:
        billingInfo?.organizationName ||
        registrationIntentTyped.organizationName,
      gstin: billingInfo?.gstin,
      addressLine1:
        billingInfo?.addressLine1 || registrationIntentTyped.address || 'NA',
      addressLine2: billingInfo?.addressLine2 || '',
      city: billingInfo?.city || registrationIntentTyped.city || 'NA',
      state: billingInfo?.state || registrationIntentTyped.state || 'NA',
      postalCode:
        billingInfo?.postalCode || registrationIntentTyped.zipCode || '000000',
      country:
        billingInfo?.country || registrationIntentTyped.country || 'India',
      email: billingInfo?.email || registrationIntentTyped.email
    }

    const lineItems = [
      {
        description: `${subscription.planName} (${subscription.billingCycle})`,
        qty: 1,
        unitPrice: order.amount,
        sac: '9983'
      }
    ]
    const subtotal = calculateSubtotal(lineItems)
    const taxBreakup = calculateTaxBreakup(
      subtotal,
      SELLER_DETAILS.state,
      billingSnapshot.state
    )
    const totalAmount =
      subtotal + taxBreakup.cgst + taxBreakup.sgst + taxBreakup.igst
    const invoiceDate = new Date()
    const dueDate = getDueDate(invoiceDate, 7)
    const payment = (paymentResult as any)?.payment || {}
    const paymentMethod =
      payment?.method === 'upi' ? 'UPI' : payment?.method ? 'Card' : undefined

    await Invoice.create({
      invoiceId: generateInvoiceId(invoiceDate),
      orderId: razorpay_order_id,
      transactionId: razorpay_payment_id,
      userId: new ObjectId(userId),
      instituteId: orgType === 'institute' ? organization._id : undefined,
      subscriptionId: subscription._id,
      planSnapshot: {
        name: subscription.planName,
        price: order.amount,
        duration: subscription.billingCycle
      },
      billingSnapshot,
      lineItems,
      subtotal,
      taxBreakup,
      totalAmount,
      currency: order.currency || 'INR',
      paymentMethod,
      upiHandle: payment?.vpa,
      cardBrand: payment?.card?.network,
      cardLast4: payment?.card?.last4,
      paymentStatus: 'paid',
      invoiceDate,
      dueDate
    })

    const planDuration = getPlanDurationMonths(subscription.billingCycle)
    const paymentMethodLabel =
      payment?.method === 'upi' ? 'UPI' : payment?.method ? 'Card' : undefined
    const existingPayment = await Payment.findOne({
      orderId: razorpay_order_id
    })
      .select('_id')
      .lean()
      .exec()

    if (!existingPayment) {
      await Payment.create({
        userId: new ObjectId(userId),
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: order.amount,
        currency: order.currency || 'INR',
        status: 'paid',
        method: 'razorpay',
        paymentMethod: paymentMethodLabel,
        organizationName: billingSnapshot.organizationName,
        organizationType: orgType,
        planType: subscription.planType,
        planDuration,
        subscriptionId: subscription._id.toString(),
        gatewayResponse: payment,
        paidAt: new Date()
      })
    }

    // Parallel updates
    await Promise.all([
      // Update user
      updateUserAfterPayment(userId, orgType, organization._id),
      // Update registration intent
      RegistrationIntent.findByIdAndUpdate(registrationIntentId, {
        $set: {
          status: 'completed',
          organizationId: organization._id,
          completedAt: new Date(),
          updatedAt: new Date()
        }
      }),
      // Update payment order
      db.collection('payment_orders').updateOne(
        { orderId: razorpay_order_id },
        {
          $set: {
            status: 'completed',
            paymentId: razorpay_payment_id,
            completedAt: new Date(),
            updatedAt: new Date()
          }
        }
      )
    ])

    // Send notifications (fire and forget)
    sendNotifications(
      registrationIntentTyped,
      userId,
      organization._id,
      order.amount,
      order.currency,
      { orderId: razorpay_order_id, paymentId: razorpay_payment_id }
    ).catch(error => console.error('Notification error:', error))

    return NextResponse.json({
      success: true,
      message: 'Payment verified and organization created successfully',
      data: {
        organizationType: orgType,
        organizationName: registrationIntentTyped.organizationName,
        organizationId: organization._id.toString(),
        publicProfileId,
        planType: 'premium',
        dashboardUrl:
          orgType === 'institute'
            ? '/dashboard/institute'
            : '/dashboard/business'
      }
    })
  } catch (error) {
    console.error('Payment verification error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    if (
      error instanceof Error &&
      error.message === 'User already has an institute registered'
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
