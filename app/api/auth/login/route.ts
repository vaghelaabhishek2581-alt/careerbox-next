import type { NextRequest } from 'next/server'
import { AuthController } from '@/src/controllers/auth/auth.controller'

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email/password and return JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['email']
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               userType:
 *                 type: string
 *                 enum: [student, professional]
 *                 description: Required for normal users
 *     responses:
 *       200:
 *         description: Login successful
 */
export async function POST (request: NextRequest) {
  return AuthController.login(request)
}
