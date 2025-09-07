import type { NextRequest } from 'next/server'
import { AuthController } from '@/src/controllers/auth/auth.controller'

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: User registration
 *     description: Register new user with role-based access (supports OAuth providers)
 */
export async function POST (request: NextRequest) {
  return AuthController.register(request)
}
