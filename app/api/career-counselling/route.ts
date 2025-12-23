import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

interface CounsellingRequest {
  name: string;
  email: string;
  phone: string;
  state: string;
  city: string;
  courseLevel: string;
  courseInterest: string;
  agreeToTerms: boolean;
}

/**
 * @swagger
 * /api/career-counselling:
 *   post:
 *     summary: Submit career counselling request
 *     description: Submit a form for free career counselling services
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - courseLevel
 *               - courseInterest
 *               - agreeToTerms
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the applicant
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the applicant
 *                 example: "john.doe@example.com"
 *               phone:
 *                 type: string
 *                 description: Phone number (without country code)
 *                 example: "9876543210"
 *               courseLevel:
 *                 type: string
 *                 enum: [undergraduate, postgraduate, professional, medical, diploma, certification, other]
 *                 description: Level of course interested in
 *                 example: "postgraduate"
 *               courseInterest:
 *                 type: string
 *                 description: Specific course or field of interest
 *                 example: "MBA in Marketing"
 *               agreeToTerms:
 *                 type: boolean
 *                 description: Agreement to privacy policy and terms
 *                 example: true
 *     responses:
 *       200:
 *         description: Counselling request submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Counselling request submitted successfully"
 *                 requestId:
 *                   type: string
 *                   description: Unique identifier for the request
 *       400:
 *         description: Bad request or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid request data"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
export async function POST(request: NextRequest) {
  try {
    const body: CounsellingRequest = await request.json();
    
    // Validate required fields
    const { name, email, phone, state, city, courseLevel, courseInterest, agreeToTerms } = body;
    
    if (!name || !email || !phone || !state || !city || !courseLevel || !courseInterest || !agreeToTerms) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'All fields are required and you must agree to terms and conditions' 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone number (should be 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, message: 'Phone number must be 10 digits' },
        { status: 400 }
      );
    }

    // Validate course level
    const validCourseLevels = ['undergraduate', 'postgraduate', 'professional', 'medical', 'diploma', 'certification', 'other'];
    if (!validCourseLevels.includes(courseLevel)) {
      return NextResponse.json(
        { success: false, message: 'Invalid course level' },
        { status: 400 }
      );
    }

    // Connect to database and save the counselling request
    const { db } = await connectToDatabase();
    
    const counsellingRequest = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      state,
      city,
      courseLevel,
      courseInterest: courseInterest.trim(),
      agreeToTerms,
      submittedAt: new Date(),
      status: 'pending', // pending, contacted, completed
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      source: 'career-counselling-form'
    };

    const result = await db.collection('counselling_requests').insertOne(counsellingRequest);

    // Log the successful submission (for monitoring purposes)
    console.log(`New counselling request: ${name} (${email}) - ${courseInterest}`);

    return NextResponse.json({
      success: true,
      message: 'Counselling request submitted successfully! We will contact you within 24 hours.',
      requestId: result.insertedId.toString()
    });

  } catch (error) {
    console.error('Career counselling API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error. Please try again later.' 
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/career-counselling:
 *   get:
 *     summary: Get career counselling statistics (Admin only)
 *     description: Retrieve statistics about career counselling requests
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalRequests:
 *                       type: number
 *                       example: 150
 *                     pendingRequests:
 *                       type: number
 *                       example: 25
 *                     completedRequests:
 *                       type: number
 *                       example: 125
 *                     requestsThisMonth:
 *                       type: number
 *                       example: 45
 */
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const totalRequests = await db.collection('counselling_requests').countDocuments();
    const pendingRequests = await db.collection('counselling_requests').countDocuments({ status: 'pending' });
    const completedRequests = await db.collection('counselling_requests').countDocuments({ status: 'completed' });
    
    // Requests this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const requestsThisMonth = await db.collection('counselling_requests').countDocuments({
      submittedAt: { $gte: startOfMonth }
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalRequests,
        pendingRequests,
        completedRequests,
        requestsThisMonth
      }
    });

  } catch (error) {
    console.error('Career counselling stats API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Unable to retrieve statistics' 
      },
      { status: 500 }
    );
  }
}