import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import clientPromise from '../../db'
import { ObjectId } from 'mongodb'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = '1d'

/**
 * @swagger
 * /api/auth/service:
 *   post:
 *     summary: Handle authentication operations
 *     description: Handles login, registration, and other auth operations
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               operation:
 *                 type: string
 *                 enum: [login, register]
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Operation successful
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Conflict (user exists)
 *       500:
 *         description: Internal server error
 */
export async function POST (request: NextRequest) {
  try {
    const { operation, data } = await request.json()
    const client = await clientPromise
    const db = client.db()

    switch (operation) {
      case 'login': {
        const { email, password, userType, provider } = data

        const user = await db
          .collection('users')
          .findOne({ email: email.toLowerCase() })
        if (!user) {
          return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          )
        }

        if ((provider ?? 'credentials') === 'credentials') {
          if (!password) {
            return NextResponse.json(
              { error: 'Email and password are required' },
              { status: 400 }
            )
          }
          const isPasswordValid = await bcrypt.compare(password, user.password)
          if (!isPasswordValid) {
            return NextResponse.json(
              { error: 'Invalid credentials' },
              { status: 401 }
            )
          }
        }

        if (
          user.role === 'user' &&
          userType &&
          ['student', 'professional'].includes(userType)
        ) {
          await db
            .collection('users')
            .updateOne(
              { _id: user._id },
              { $set: { userType, lastLogin: new Date() } }
            )
          user.userType = userType
        }

        const token = jwt.sign(
          {
            userId: user._id,
            email: user.email,
            role: user.role,
            userType: user.userType,
            organizationId: user.organizationId
          },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        )

        await db
          .collection('users')
          .updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } })

        const { password: _, ...userWithoutPassword } = user

        return NextResponse.json({
          user: userWithoutPassword,
          token
        })
      }

      case 'register': {
        const {
          name,
          email,
          password,
          role,
          userType,
          organizationCode,
          provider = 'credentials',
          image
        } = data

        const existingUser = await db.collection('users').findOne({
          email: email.toLowerCase()
        })

        if (existingUser) {
          return NextResponse.json(
            { error: 'User already exists with this email' },
            { status: 409 }
          )
        }

        let organizationId = null
        if (role === 'organization' && organizationCode) {
          const organization = await db.collection('organizations').findOne({
            code: organizationCode
          })
          if (!organization) {
            return NextResponse.json(
              { error: 'Invalid organization code' },
              { status: 400 }
            )
          }
          organizationId = organization._id
        }

        let hashedPassword: string | null = null
        if (provider === 'credentials' && password) {
          hashedPassword = await bcrypt.hash(password, 12)
        }

        const userData = {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          provider,
          role,
          userType: role === 'user' ? userType : null,
          organizationId,
          status: role === 'admin' ? 'pending' : 'active',
          profile: {
            avatar: image || null,
            bio: '',
            skills: [],
            interests: []
          },
          settings: {
            notifications: { email: true, push: true, marketing: false },
            privacy: { profileVisible: true, showEmail: false }
          },
          needsOnboarding:
            provider === 'google' || (role === 'user' && !userType),
          needsRoleSelection: false,
          roles: [role],
          activeRole: role,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        const result = await db.collection('users').insertOne(userData)

        if (userData.status === 'pending') {
          return NextResponse.json({ requiresApproval: true })
        }

        const token = jwt.sign(
          {
            userId: result.insertedId,
            email,
            role,
            userType,
            organizationId,
            provider
          },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        )

        const { password: _, ...userWithoutPassword } = userData

        return NextResponse.json({
          user: { ...userWithoutPassword, id: result.insertedId },
          token
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Auth service error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
