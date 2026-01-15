import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import {
  createParticipantSchema,
  type CreateParticipantInput
} from '@/lib/validations/participant'

/**
 * GET /api/bookings/[id]/participants
 *
 * Fetch all participants for a booking
 * Returns list of participants with totals and split summary
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params

    // Verify booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        totalServiceFee: true,
        travelBudget: true,
        splitMethod: true,
        isGroupBooking: true
      }
    })

    if (!booking) {
      throw new ApiError(404, 'Booking not found', 'BOOKING_NOT_FOUND')
    }

    // Fetch all participants
    const participants = await prisma.bookingParticipant.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate split summary
    const summary = participants.reduce((acc, participant) => ({
      totalParticipants: acc.totalParticipants + 1,
      totalGroupSize: acc.totalGroupSize + (participant.groupSize ?? 0),
      totalSplitPercent: acc.totalSplitPercent + participant.splitPercent,
      totalAmountDue: acc.totalAmountDue + participant.amountDue,
      totalTravelShareDue: acc.totalTravelShareDue + participant.travelShareDue,
      totalCollected: acc.totalCollected + (participant.paymentStatus === 'PAID'
        ? participant.amountDue + participant.travelShareDue
        : participant.paymentStatus === 'PARTIAL'
        ? (participant.amountDue + participant.travelShareDue) / 2 // Assume 50% if partial
        : 0),
      paidCount: acc.paidCount + (participant.paymentStatus === 'PAID' ? 1 : 0),
      partialCount: acc.partialCount + (participant.paymentStatus === 'PARTIAL' ? 1 : 0),
      pendingCount: acc.pendingCount + (participant.paymentStatus === 'PENDING' ? 1 : 0),
      overdueCount: acc.overdueCount + (participant.paymentStatus === 'OVERDUE' ? 1 : 0),
    }), {
      totalParticipants: 0,
      totalGroupSize: 0,
      totalSplitPercent: 0,
      totalAmountDue: 0,
      totalTravelShareDue: 0,
      totalCollected: 0,
      paidCount: 0,
      partialCount: 0,
      pendingCount: 0,
      overdueCount: 0,
    })

    return NextResponse.json({
      participants,
      booking: {
        isGroupBooking: booking.isGroupBooking,
        splitMethod: booking.splitMethod,
        totalServiceFee: booking.totalServiceFee,
        travelBudget: booking.travelBudget,
      },
      summary: {
        ...summary,
        grandTotal: summary.totalAmountDue + summary.totalTravelShareDue,
        balance: (booking.totalServiceFee ?? 0) + (booking.travelBudget ?? 0) - summary.totalCollected,
        splitValid: Math.abs(summary.totalSplitPercent - 100) < 0.01, // Check if splits sum to 100%
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/bookings/[id]/participants
 *
 * Create a new participant for a group booking
 * Auto-sets isGroupBooking = true on the booking
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    const body = await request.json()

    // Verify booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, isGroupBooking: true }
    })

    if (!booking) {
      throw new ApiError(404, 'Booking not found', 'BOOKING_NOT_FOUND')
    }

    // Validate input (includes bookingId in body for schema validation)
    const validatedData: CreateParticipantInput = createParticipantSchema.parse({
      ...body,
      bookingId
    })

    // Create participant in a transaction
    // Also update booking.isGroupBooking = true if not already set
    const [participant, updatedBooking] = await prisma.$transaction([
      // Create participant
      prisma.bookingParticipant.create({
        data: {
          bookingId: validatedData.bookingId,
          organizationName: validatedData.organizationName,
          contactName: validatedData.contactName ?? undefined,
          contactEmail: validatedData.contactEmail ?? undefined,
          contactPhone: validatedData.contactPhone ?? undefined,
          groupSize: validatedData.groupSize ?? undefined,
          splitPercent: validatedData.splitPercent,
          amountDue: validatedData.amountDue,
          travelShareDue: validatedData.travelShareDue,
          paymentStatus: validatedData.paymentStatus,
        }
      }),

      // Update booking to mark as group booking
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          isGroupBooking: true
        },
        select: {
          id: true,
          isGroupBooking: true
        }
      })
    ])

    return NextResponse.json(participant, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
