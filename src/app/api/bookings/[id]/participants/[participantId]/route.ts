import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import {
  updateParticipantSchema,
  type UpdateParticipantInput
} from '@/lib/validations/participant'

/**
 * GET /api/bookings/[id]/participants/[participantId]
 *
 * Fetch a single participant
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const { id: bookingId, participantId } = await params

    const participant = await prisma.bookingParticipant.findFirst({
      where: {
        id: participantId,
        bookingId
      }
    })

    if (!participant) {
      throw new ApiError(404, 'Participant not found', 'PARTICIPANT_NOT_FOUND')
    }

    return NextResponse.json(participant)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/bookings/[id]/participants/[participantId]
 *
 * Update a participant
 * Commonly used to update payment status or split allocations
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const { id: bookingId, participantId } = await params
    const body = await request.json()

    // Verify participant exists and belongs to this booking
    const existingParticipant = await prisma.bookingParticipant.findFirst({
      where: {
        id: participantId,
        bookingId
      }
    })

    if (!existingParticipant) {
      throw new ApiError(404, 'Participant not found', 'PARTICIPANT_NOT_FOUND')
    }

    // Validate input
    const validatedData: UpdateParticipantInput = updateParticipantSchema.parse(body)

    // Update participant
    const participant = await prisma.bookingParticipant.update({
      where: { id: participantId },
      data: {
        organizationName: validatedData.organizationName,
        contactName: validatedData.contactName !== undefined
          ? validatedData.contactName ?? undefined
          : undefined,
        contactEmail: validatedData.contactEmail !== undefined
          ? validatedData.contactEmail ?? undefined
          : undefined,
        contactPhone: validatedData.contactPhone !== undefined
          ? validatedData.contactPhone ?? undefined
          : undefined,
        groupSize: validatedData.groupSize !== undefined
          ? validatedData.groupSize ?? undefined
          : undefined,
        splitPercent: validatedData.splitPercent,
        amountDue: validatedData.amountDue,
        travelShareDue: validatedData.travelShareDue,
        paymentStatus: validatedData.paymentStatus,
      }
    })

    return NextResponse.json(participant)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/bookings/[id]/participants/[participantId]
 *
 * Delete a participant
 * Optionally triggers split recalculation if auto-split is enabled
 *
 * TODO: In future, could auto-recalculate splits for remaining participants
 * if booking.splitMethod === 'AUTO_OPTIMAL'
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const { id: bookingId, participantId } = await params

    // Verify participant exists and belongs to this booking
    const participant = await prisma.bookingParticipant.findFirst({
      where: {
        id: participantId,
        bookingId
      }
    })

    if (!participant) {
      throw new ApiError(404, 'Participant not found', 'PARTICIPANT_NOT_FOUND')
    }

    // Check if this is the last participant
    const participantCount = await prisma.bookingParticipant.count({
      where: { bookingId }
    })

    // Delete participant
    await prisma.bookingParticipant.delete({
      where: { id: participantId }
    })

    // If this was the last participant, set isGroupBooking = false
    if (participantCount === 1) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          isGroupBooking: false,
          splitMethod: null
        }
      })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
}
