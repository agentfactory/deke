import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import { calculateOptimalSplit, type SplitInput, type SplitOutput } from '@/lib/calculations/split-calculator'
import { z } from 'zod'

/**
 * Request schema for split calculation
 */
const calculateSplitRequestSchema = z.object({
  method: z.enum(['EQUAL', 'BY_SIZE', 'AUTO_OPTIMAL']),
  preview: z.boolean().default(false),
})

type CalculateSplitRequest = z.infer<typeof calculateSplitRequestSchema>

/**
 * POST /api/bookings/[id]/calculate-split
 *
 * Calculate cost splits for group booking participants
 *
 * Supports three methods:
 * - EQUAL: Split evenly among all participants
 * - BY_SIZE: Weight by group size (larger groups pay more)
 * - AUTO_OPTIMAL: Smart algorithm balancing size and fairness
 *
 * If preview=false: Updates all participant records with calculated splits
 * If preview=true: Returns calculation without saving to database
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    const body = await request.json()

    // Validate request
    const { method, preview }: CalculateSplitRequest = calculateSplitRequestSchema.parse(body)

    // Fetch booking with participants and travel expenses
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        participants: {
          select: {
            id: true,
            organizationName: true,
            groupSize: true,
          }
        },
        travelExpenses: {
          select: {
            flightCost: true,
            hotelCost: true,
            groundTransportCost: true,
          }
        }
      }
    })

    if (!booking) {
      throw new ApiError(404, 'Booking not found', 'BOOKING_NOT_FOUND')
    }

    // Validate group booking requirements
    if (booking.participants.length === 0) {
      throw new ApiError(
        400,
        'Cannot calculate split: booking has no participants',
        'NO_PARTICIPANTS'
      )
    }

    // Calculate total travel cost from travel expenses
    const totalTravelCost = booking.travelExpenses.reduce((sum, expense) => {
      return sum +
        (expense.flightCost ?? 0) +
        (expense.hotelCost ?? 0) +
        (expense.groundTransportCost ?? 0)
    }, 0)

    // Prepare input for split calculator
    const splitInput: SplitInput = {
      totalServiceFee: booking.totalServiceFee ?? booking.amount ?? 0,
      totalTravelCost: booking.travelBudget ?? totalTravelCost,
      participants: booking.participants.map(p => ({
        id: p.id,
        organizationName: p.organizationName,
        groupSize: p.groupSize ?? undefined,
        // distanceFromVenue: Could be calculated from lat/lng if needed
      })),
      splitMethod: method
    }

    // Calculate splits
    const splitResult: SplitOutput = calculateOptimalSplit(splitInput)

    // If not preview mode, update participant records in database
    if (!preview) {
      // Update all participants in a transaction
      await prisma.$transaction(
        splitResult.participants.map((result) =>
          prisma.bookingParticipant.update({
            where: { id: result.id },
            data: {
              splitPercent: result.splitPercent,
              amountDue: result.serviceFeeShare,
              travelShareDue: result.travelShare,
            }
          })
        )
      )

      // Update booking splitMethod
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          splitMethod: method,
          splitNotes: splitResult.rationale,
        }
      })
    }

    // Return split calculation with metadata
    return NextResponse.json({
      success: true,
      preview,
      method,
      booking: {
        id: booking.id,
        isGroupBooking: booking.isGroupBooking,
        totalServiceFee: splitInput.totalServiceFee,
        totalTravelCost: splitInput.totalTravelCost,
      },
      ...splitResult,
      metadata: {
        participantCount: booking.participants.length,
        updated: !preview,
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
