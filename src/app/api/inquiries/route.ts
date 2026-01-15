import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import {
  createInquirySchema,
  inquiryFiltersSchema,
  type CreateInquiryInput
} from '@/lib/validations/inquiry'

// POST /api/inquiries - Create new inquiry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData: CreateInquiryInput = createInquirySchema.parse(body)

    // Check if lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: validatedData.leadId }
    })

    if (!lead) {
      throw new ApiError(404, 'Lead not found', 'LEAD_NOT_FOUND')
    }

    // Create inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        leadId: validatedData.leadId,
        serviceType: validatedData.serviceType,
        message: validatedData.message,
        details: validatedData.details ?? null,
        status: 'PENDING',
        quotedAmount: validatedData.quotedAmount ?? null,
        quotedAt: validatedData.quotedAt ? new Date(validatedData.quotedAt) : null,
        quoteExpiry: validatedData.quoteExpiry ? new Date(validatedData.quoteExpiry) : null,
      },
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            organization: true,
          }
        }
      }
    })

    return NextResponse.json(inquiry, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

// GET /api/inquiries - List inquiries with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters = inquiryFiltersSchema.parse({
      status: searchParams.get('status') || undefined,
      leadId: searchParams.get('leadId') || undefined,
      serviceType: searchParams.get('serviceType') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    })

    const where: any = {}
    if (filters.status) where.status = filters.status
    if (filters.leadId) where.leadId = filters.leadId
    if (filters.serviceType) where.serviceType = filters.serviceType

    const limit = filters.limit ?? 50
    const offset = filters.offset ?? 0

    // Get inquiries with related data
    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              organization: true,
            }
          },
          booking: {
            select: {
              id: true,
              serviceType: true,
              status: true,
            }
          }
        }
      }),
      prisma.inquiry.count({ where })
    ])

    return NextResponse.json({
      inquiries,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + inquiries.length < total
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
