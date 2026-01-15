import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import {
  updateTravelExpenseSchema,
  type UpdateTravelExpenseInput
} from '@/lib/validations/travel'

/**
 * GET /api/bookings/[id]/travel/[travelId]
 *
 * Fetch a single travel expense
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; travelId: string }> }
) {
  try {
    const { id: bookingId, travelId } = await params

    const travelExpense = await prisma.travelExpense.findFirst({
      where: {
        id: travelId,
        bookingId
      }
    })

    if (!travelExpense) {
      throw new ApiError(404, 'Travel expense not found', 'TRAVEL_EXPENSE_NOT_FOUND')
    }

    return NextResponse.json(travelExpense)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/bookings/[id]/travel/[travelId]
 *
 * Update a travel expense
 * Validates payment responsibility percentages if SPLIT
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; travelId: string }> }
) {
  try {
    const { id: bookingId, travelId } = await params
    const body = await request.json()

    // Verify travel expense exists and belongs to this booking
    const existingExpense = await prisma.travelExpense.findFirst({
      where: {
        id: travelId,
        bookingId
      }
    })

    if (!existingExpense) {
      throw new ApiError(404, 'Travel expense not found', 'TRAVEL_EXPENSE_NOT_FOUND')
    }

    // Validate input
    const validatedData: UpdateTravelExpenseInput = updateTravelExpenseSchema.parse(body)

    // Update travel expense
    const travelExpense = await prisma.travelExpense.update({
      where: { id: travelId },
      data: {
        // Flight details
        flightCarrier: validatedData.flightCarrier !== undefined
          ? validatedData.flightCarrier ?? undefined
          : undefined,
        flightNumber: validatedData.flightNumber !== undefined
          ? validatedData.flightNumber ?? undefined
          : undefined,
        departureAirport: validatedData.departureAirport !== undefined
          ? validatedData.departureAirport ?? undefined
          : undefined,
        arrivalAirport: validatedData.arrivalAirport !== undefined
          ? validatedData.arrivalAirport ?? undefined
          : undefined,
        departureTime: validatedData.departureTime !== undefined
          ? (validatedData.departureTime ? new Date(validatedData.departureTime) : undefined)
          : undefined,
        arrivalTime: validatedData.arrivalTime !== undefined
          ? (validatedData.arrivalTime ? new Date(validatedData.arrivalTime) : undefined)
          : undefined,
        flightCost: validatedData.flightCost !== undefined
          ? validatedData.flightCost ?? undefined
          : undefined,

        // Hotel details
        hotelName: validatedData.hotelName !== undefined
          ? validatedData.hotelName ?? undefined
          : undefined,
        hotelAddress: validatedData.hotelAddress !== undefined
          ? validatedData.hotelAddress ?? undefined
          : undefined,
        checkInDate: validatedData.checkInDate !== undefined
          ? (validatedData.checkInDate ? new Date(validatedData.checkInDate) : undefined)
          : undefined,
        checkOutDate: validatedData.checkOutDate !== undefined
          ? (validatedData.checkOutDate ? new Date(validatedData.checkOutDate) : undefined)
          : undefined,
        confirmationNumber: validatedData.confirmationNumber !== undefined
          ? validatedData.confirmationNumber ?? undefined
          : undefined,
        hotelCost: validatedData.hotelCost !== undefined
          ? validatedData.hotelCost ?? undefined
          : undefined,

        // Ground transportation
        groundTransport: validatedData.groundTransport !== undefined
          ? validatedData.groundTransport ?? undefined
          : undefined,
        groundTransportDetails: validatedData.groundTransportDetails !== undefined
          ? validatedData.groundTransportDetails ?? undefined
          : undefined,
        groundTransportCost: validatedData.groundTransportCost !== undefined
          ? validatedData.groundTransportCost ?? undefined
          : undefined,

        // Payment responsibility
        paymentResponsibility: validatedData.paymentResponsibility,
        clientPayPercent: validatedData.clientPayPercent !== undefined
          ? validatedData.clientPayPercent ?? undefined
          : undefined,
        dekePayPercent: validatedData.dekePayPercent !== undefined
          ? validatedData.dekePayPercent ?? undefined
          : undefined,
      }
    })

    return NextResponse.json(travelExpense)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/bookings/[id]/travel/[travelId]
 *
 * Delete a travel expense
 * Optionally updates booking travelBudget if needed
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; travelId: string }> }
) {
  try {
    const { id: bookingId, travelId } = await params

    // Verify travel expense exists and belongs to this booking
    const travelExpense = await prisma.travelExpense.findFirst({
      where: {
        id: travelId,
        bookingId
      }
    })

    if (!travelExpense) {
      throw new ApiError(404, 'Travel expense not found', 'TRAVEL_EXPENSE_NOT_FOUND')
    }

    // Delete travel expense (no cascade effects)
    await prisma.travelExpense.delete({
      where: { id: travelId }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
}
