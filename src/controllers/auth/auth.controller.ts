import { NextRequest } from 'next/server'
import { ok, created, error } from '@/src/utils/helpers/response'
import { loginSchema, registerSchema } from '@/src/utils/validators/auth.schema'
import { AuthService } from '@/src/services/auth/auth.service'

export class AuthController {
  static async login (req: NextRequest) {
    try {
      const body = await req.json()
      const parsed = loginSchema.parse(body)
      const result = await AuthService.login(parsed)
      return ok({ message: 'Login successful', ...result })
    } catch (err) {
      return error(err)
    }
  }

  static async register (req: NextRequest) {
    try {
      const body = await req.json()
      const parsed = registerSchema.parse(body)
      const result = await AuthService.register(parsed)

      if ((result as any).requiresApproval) {
        return created({
          message: 'Admin account created successfully. Awaiting approval.',
          ...result
        })
      }

      return created({ message: 'Account created successfully', ...result })
    } catch (err) {
      return error(err)
    }
  }
}
