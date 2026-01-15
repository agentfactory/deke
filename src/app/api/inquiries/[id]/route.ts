import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import { updateInquirySchema, type UpdateInquiryInput } from '@/lib/validations/inquiry'

// GET /api/inquiries/[id] - Fetch single inquiry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
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
            startDate: true,
            endDate: true,
            location: true,
            amount: true,
          }
        }
      }
    })

    if (!inquiry) {
      throw new ApiError(404, 'Inquiry not found', 'INQUIRY_NOT_FOUND')
    }

    return NextResponse.json(inquiry)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/inquiries/[id] - Update inquiry
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate input
    const validatedData: UpdateInquiryInput = updateInquirySchema.parse(body)

    // Check if inquiry exists
    const existingInquiry = await prisma.inquiry.findUnique({
      where: { id }
    })

    if (!existingInquiry) {
      throw new ApiError(404, 'Inquiry not found', 'INQUIRY_NOT_FOUND')
    }

    // Update inquiry
    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: {
        status: validatedData.status,
        quotedAmount: validatedData.quotedAmount,
        quotedAt: validatedData.quotedAt ? new Date(validatedData.quotedAt) : undefined,
        quoteExpiry: validatedData.quoteExpiry ? new Date(validatedData.quoteExpiry) : undefined,
        details: validatedData.details,
      },
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json(inquiry)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/inquiries/[id] - Delete inquiry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if inquiry exists
    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        booking: {
          select: {
            id: true,
          }
        }
      }
    })

    if (!inquiry) {
      throw new ApiError(404, 'Inquiry not found', 'INQUIRY_NOT_FOUND')
    }

    // Check if booking exists - prevent deletion if a booking references this inquiry
    if (inquiry.booking) {
      throw new ApiError(
        409,
        `Cannot delete inquiry because it has an associated booking (ID: ${inquiry.booking.id}). Please delete the booking first.`,
        'INQUIRY_HAS_BOOKING'
      )
    }

    // Delete inquiry
    await prisma.inquiry.delete({
      where: { id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
}
