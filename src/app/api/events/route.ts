import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'

export const dynamic = "force-dynamic";

// GET /api/events - Returns upcoming public events (no auth required)
export async function GET() {
  try {
    const now = new Date()

    const bookings = await prisma.booking.findMany({
      where: {
        isPublic: true,
        status: {
          notIn: ['CANCELLED'],
        },
        OR: [
          { startDate: { gte: now } },
          { endDate: { gte: now } },
          { startDate: null },
        ],
      },
      select: {
        id: true,
        serviceType: true,
        status: true,
        startDate: true,
        endDate: true,
        location: true,
        publicTitle: true,
        publicDescription: true,
        organization: true,
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
      publicTitle: booking.publicTitle ?? null,
      publicDescription: booking.publicDescription ?? null,
      organization: booking.organization ?? null,
    }))

    return NextResponse.json(events)
  } catch (error) {
    return handleApiError(error)
  }
}
