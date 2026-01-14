import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import {
  createBookingSchema,
  bookingFiltersSchema,
  type CreateBookingInput
} from '@/lib/validations/booking'

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData: CreateBookingInput = createBookingSchema.parse(body)

    // Check if lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: validatedData.leadId }
    })

    if (!lead) {
      throw new ApiError(404, 'Lead not found', 'LEAD_NOT_FOUND')
    }

    // Check if inquiry exists (if provided)
    if (validatedData.inquiryId) {
      const inquiry = await prisma.inquiry.findUnique({
        where: { id: validatedData.inquiryId }
      })

      if (!inquiry) {
        throw new ApiError(404, 'Inquiry not found', 'INQUIRY_NOT_FOUND')
      }

      // Check if booking already exists for this inquiry
      const existingBooking = await prisma.booking.findUnique({
        where: { inquiryId: validatedData.inquiryId }
      })

      if (existingBooking) {
        throw new ApiError(400, 'Booking already exists for this inquiry', 'BOOKING_EXISTS')
      }
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        leadId: validatedData.leadId,
        inquiryId: validatedData.inquiryId ?? null,
        serviceType: validatedData.serviceType,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        timezone: validatedData.timezone ?? null,
        location: validatedData.location ?? null,
        latitude: validatedData.latitude ?? null,
        longitude: validatedData.longitude ?? null,
        amount: validatedData.amount ?? null,
        depositPaid: validatedData.depositPaid ?? null,
        balanceDue: validatedData.balanceDue ?? null,
        internalNotes: validatedData.internalNotes ?? null,
        clientNotes: validatedData.clientNotes ?? null,
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
        inquiry: true,
      }
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

// GET /api/bookings - List bookings with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters = bookingFiltersSchema.parse({
      status: searchParams.get('status') || undefined,
      serviceType: searchParams.get('serviceType') || undefined,
      leadId: searchParams.get('leadId') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    })

    const where: any = {}
    if (filters.status) where.status = filters.status
    if (filters.serviceType) where.serviceType = filters.serviceType
    if (filters.leadId) where.leadId = filters.leadId

    const limit = filters.limit ?? 50
    const offset = filters.offset ?? 0

    // Get bookings with related data
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
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
          inquiry: {
            select: {
              id: true,
              serviceType: true,
              status: true,
            }
          },
          campaigns: {
            select: {
              id: true,
              name: true,
              status: true,
            }
          }
        }
      }),
      prisma.booking.count({ where })
    ])

    return NextResponse.json({
      bookings,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + bookings.length < total
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
