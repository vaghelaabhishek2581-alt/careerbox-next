import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).optional(),
  userType: z.enum(['student', 'professional']).optional(),
  provider: z.enum(['credentials', 'google']).optional()
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: z.enum(['user', 'business', 'organization', 'admin']),
  userType: z.enum(['student', 'professional']).optional(),
  organizationCode: z.string().optional(),
  provider: z.enum(['credentials', 'google']).default('credentials'),
  image: z.string().url().optional()
})

export type RegisterInput = z.infer<typeof registerSchema>
