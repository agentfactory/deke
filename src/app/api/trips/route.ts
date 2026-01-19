import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { handleApiError, ApiError } from "@/lib/api-error"

const CreateTripSchema = z.object({
  name: z.string().min(1, "Trip name is required"),
  location: z.string().min(1, "Location is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  notes: z.string().nullable().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = CreateTripSchema.safeParse(body)
    if (!result.success) {
      return ApiError.badRequest(result.error.issues[0].message)
    }

    const { name, location, startDate, endDate, notes } = result.data

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (end < start) {
      return ApiError.badRequest("End date must be after start date")
    }

    const trip = await prisma.trip.create({
      data: {
        name,
        location,
        startDate: start,
        endDate: end,
        notes: notes || null,
        status: "upcoming",
      },
    })

    return NextResponse.json(trip, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
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
            travelExpenses: true,
            participants: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
    })

    return NextResponse.json(trips)
  } catch (error) {
    return handleApiError(error)
  }
}
