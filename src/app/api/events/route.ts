import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'

// GET /api/events - Returns upcoming public events (no auth required)
export async function GET() {
  try {
    const now = new Date()

    const bookings = await prisma.booking.findMany({
      where: {
        isPublic: true,
        status: {
          in: ['CONFIRMED', 'IN_PROGRESS'],
        },
        startDate: {
          gte: now,
        },
      },
      select: {
        id: true,
        serviceType: true,
        status: true,
        startDate: true,
        endDate: true,
        location: true,
        lead: {
          select: {
            organization: true,
            // Do NOT expose email, phone, or name for privacy
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
      take: 50,
    })

    // Map to public-safe shape
    const events = bookings.map((booking) => ({
      id: booking.id,
      serviceType: booking.serviceType,
      status: booking.status,
      startDate: booking.startDate,
      endDate: booking.endDate,
      location: booking.location,
      organization: booking.lead?.organization ?? null,
    }))

    return NextResponse.json(events)
  } catch (error) {
    return handleApiError(error)
  }
}
