import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import {
  createTravelExpenseSchema,
  type CreateTravelExpenseInput
} from '@/lib/validations/travel'

/**
 * GET /api/bookings/[id]/travel
 *
 * Fetch all travel expenses for a booking
 * Returns list of travel expenses with total costs summary
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
      select: { id: true, travelBudget: true }
    })

    if (!booking) {
      throw new ApiError(404, 'Booking not found', 'BOOKING_NOT_FOUND')
    }

    // Fetch all travel expenses
    const travelExpenses = await prisma.travelExpense.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate total costs
    const totalCosts = travelExpenses.reduce((acc, expense) => ({
      totalFlight: acc.totalFlight + (expense.flightCost ?? 0),
      totalHotel: acc.totalHotel + (expense.hotelCost ?? 0),
      totalGroundTransport: acc.totalGroundTransport + (expense.groundTransportCost ?? 0),
      grandTotal: acc.grandTotal +
        (expense.flightCost ?? 0) +
        (expense.hotelCost ?? 0) +
        (expense.groundTransportCost ?? 0)
    }), {
      totalFlight: 0,
      totalHotel: 0,
      totalGroundTransport: 0,
      grandTotal: 0
    })

    return NextResponse.json({
      expenses: travelExpenses,
      summary: {
        count: travelExpenses.length,
        travelBudget: booking.travelBudget,
        ...totalCosts,
        remaining: booking.travelBudget
          ? booking.travelBudget - totalCosts.grandTotal
          : null
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/bookings/[id]/travel
 *
 * Create a new travel expense for a booking
 * Validates payment responsibility percentages sum to 100% if SPLIT
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
      select: { id: true }
    })

    if (!booking) {
      throw new ApiError(404, 'Booking not found', 'BOOKING_NOT_FOUND')
    }

    // Validate input (includes bookingId in body for schema validation)
    const validatedData: CreateTravelExpenseInput = createTravelExpenseSchema.parse({
      ...body,
      bookingId
    })

    // Create travel expense
    const travelExpense = await prisma.travelExpense.create({
      data: {
        bookingId: validatedData.bookingId,

        // Flight details
        flightCarrier: validatedData.flightCarrier ?? undefined,
        flightNumber: validatedData.flightNumber ?? undefined,
        departureAirport: validatedData.departureAirport ?? undefined,
        arrivalAirport: validatedData.arrivalAirport ?? undefined,
        departureTime: validatedData.departureTime
          ? new Date(validatedData.departureTime)
          : undefined,
        arrivalTime: validatedData.arrivalTime
          ? new Date(validatedData.arrivalTime)
          : undefined,
        flightCost: validatedData.flightCost ?? undefined,

        // Hotel details
        hotelName: validatedData.hotelName ?? undefined,
        hotelAddress: validatedData.hotelAddress ?? undefined,
        checkInDate: validatedData.checkInDate
          ? new Date(validatedData.checkInDate)
          : undefined,
        checkOutDate: validatedData.checkOutDate
          ? new Date(validatedData.checkOutDate)
          : undefined,
        confirmationNumber: validatedData.confirmationNumber ?? undefined,
        hotelCost: validatedData.hotelCost ?? undefined,

        // Ground transportation
        groundTransport: validatedData.groundTransport ?? undefined,
        groundTransportDetails: validatedData.groundTransportDetails ?? undefined,
        groundTransportCost: validatedData.groundTransportCost ?? undefined,

        // Payment responsibility
        paymentResponsibility: validatedData.paymentResponsibility,
        clientPayPercent: validatedData.clientPayPercent ?? undefined,
        dekePayPercent: validatedData.dekePayPercent ?? undefined,
      }
    })

    return NextResponse.json(travelExpense, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
