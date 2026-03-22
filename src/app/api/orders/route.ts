import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import {
  createOrderSchema,
  orderFiltersSchema,
  type CreateOrderInput,
} from '@/lib/validations/order'

// Generate unique order number
function generateOrderNumber(): string {
  const prefix = 'ORD'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData: CreateOrderInput = createOrderSchema.parse(body)

    // Check if lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: validatedData.leadId },
    })

    if (!lead) {
      throw new ApiError(404, 'Lead not found', 'LEAD_NOT_FOUND')
    }

    const order = await prisma.order.create({
      data: {
        leadId: validatedData.leadId,
        orderNumber: generateOrderNumber(),
        songTitle: validatedData.songTitle ?? null,
        songArtist: validatedData.songArtist ?? null,
        voiceParts: validatedData.voiceParts ?? null,
        packageTier: validatedData.packageTier ?? null,
        basePrice: validatedData.basePrice ?? null,
        rushFee: validatedData.rushFee ?? null,
        totalAmount: validatedData.totalAmount ?? null,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        status: 'PENDING',
      },
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

// GET /api/orders - List orders with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters = orderFiltersSchema.parse({
      status: searchParams.get('status') || undefined,
      leadId: searchParams.get('leadId') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    })

    const where: Record<string, unknown> = {}
    if (filters.status) where.status = filters.status
    if (filters.leadId) where.leadId = filters.leadId

    const limit = filters.limit ?? 50
    const offset = filters.offset ?? 0

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + orders.length < total,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
