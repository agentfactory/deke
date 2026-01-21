import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'
import {
  createGroupRequestSchema,
  groupRequestFiltersSchema,
  type CreateGroupRequestInput
} from '@/lib/validations/group-request'

// POST /api/group-requests - Create a new group request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData: CreateGroupRequestInput = createGroupRequestSchema.parse(body)

    // Create new group request
    const groupRequest = await prisma.groupRequest.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        location: validatedData.location,
        age: validatedData.age ?? null,
        experience: validatedData.experience,
        commitment: validatedData.commitment,
        genres: validatedData.genres,
        performanceInterest: validatedData.performanceInterest,
        message: validatedData.message ?? null,
        status: 'PENDING',
      }
    })

    return NextResponse.json(groupRequest, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

// GET /api/group-requests - List group requests with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters = groupRequestFiltersSchema.parse({
      status: searchParams.get('status') || undefined,
      location: searchParams.get('location') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    })

    const where: Record<string, unknown> = {}
    if (filters.status) where.status = filters.status
    if (filters.location) where.location = { contains: filters.location, mode: 'insensitive' }

    const limit = filters.limit ?? 50
    const offset = filters.offset ?? 0

    const [requests, total] = await Promise.all([
      prisma.groupRequest.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.groupRequest.count({ where })
    ])

    return NextResponse.json({
      requests,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + requests.length < total
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
