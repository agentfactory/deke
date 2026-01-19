import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { handleApiError, ApiError } from "@/lib/api-error"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            lead: {
              select: {
                firstName: true,
                lastName: true,
                organization: true,
              },
            },
          },
        },
      },
    })

    if (!trip) {
      return ApiError.notFound("Trip not found")
    }

    return NextResponse.json(trip)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if trip exists
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { bookings: true },
    })

    if (!trip) {
      return ApiError.notFound("Trip not found")
    }

    // Check if trip has bookings
    if (trip.bookings.length > 0) {
      return ApiError.badRequest(
        "Cannot delete trip with existing bookings. Remove bookings first."
      )
    }

    // Delete the trip
    await prisma.trip.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: "Trip deleted" })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const trip = await prisma.trip.findUnique({
      where: { id },
    })

    if (!trip) {
      return ApiError.notFound("Trip not found")
    }

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        name: body.name ?? trip.name,
        location: body.location ?? trip.location,
        startDate: body.startDate ? new Date(body.startDate) : trip.startDate,
        endDate: body.endDate ? new Date(body.endDate) : trip.endDate,
        status: body.status ?? trip.status,
        notes: body.notes !== undefined ? body.notes : trip.notes,
      },
    })

    return NextResponse.json(updatedTrip)
  } catch (error) {
    return handleApiError(error)
  }
}
