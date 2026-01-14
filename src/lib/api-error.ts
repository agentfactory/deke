import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }

  // Utility methods for common error responses
  static badRequest(message: string, code?: string) {
    return NextResponse.json(
      { error: message, code },
      { status: 400 }
    )
  }

  static unauthorized(message = 'Unauthorized', code?: string) {
    return NextResponse.json(
      { error: message, code },
      { status: 401 }
    )
  }

  static forbidden(message = 'Forbidden', code?: string) {
    return NextResponse.json(
      { error: message, code },
      { status: 403 }
    )
  }

  static notFound(message = 'Not found', code?: string) {
    return NextResponse.json(
      { error: message, code },
      { status: 404 }
    )
  }

  static conflict(message: string, code?: string) {
    return NextResponse.json(
      { error: message, code },
      { status: 409 }
    )
  }

  static internal(message = 'Internal server error', code?: string) {
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    )
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', issues: error.issues },
      { status: 400 }
    )
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
