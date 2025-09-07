import { NextResponse } from 'next/server'
import { AppError } from '@/src/utils/types/errors'
import { HTTP_STATUS } from '@/src/utils/constants/http'

export function ok<T> (data: T) {
  return NextResponse.json(
    { success: true, ...((data as any) ?? {}) },
    { status: HTTP_STATUS.OK }
  )
}

export function created<T> (data: T) {
  return NextResponse.json(
    { success: true, ...((data as any) ?? {}) },
    { status: HTTP_STATUS.CREATED }
  )
}

export function error (err: unknown) {
  if (err instanceof AppError) {
    return NextResponse.json(
      { success: false, message: err.message, details: err.details },
      { status: err.statusCode }
    )
  }
  return NextResponse.json(
    { success: false, message: 'Internal server error' },
    { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
  )
}
