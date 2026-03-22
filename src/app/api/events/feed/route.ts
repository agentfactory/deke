import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateICalFeed } from '@/lib/utils/ical'

// GET /api/events/feed — subscribable iCal feed of all public upcoming events
export async function GET() {
  try {
    const now = new Date()

    const bookings = await prisma.booking.findMany({
      where: {
        isPublic: true,
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
        startDate: { gte: now },
      },
      select: {
        id: true,
        serviceType: true,
        startDate: true,
        endDate: true,
        location: true,
        publicTitle: true,
        publicDescription: true,
        organization: true,
      },
      orderBy: { startDate: 'asc' },
      take: 100,
    })

    const events = bookings
      .filter(b => b.startDate !== null)
      .map(b => ({
        title: b.publicTitle || `${b.serviceType.replace('_', ' ')}${b.location ? ` in ${b.location}` : ''}`,
        description: b.publicDescription || `Deke Sharon - ${b.serviceType.replace('_', ' ')}${b.organization ? ` with ${b.organization}` : ''}`,
        location: b.location,
        startDate: b.startDate!,
        endDate: b.endDate,
      }))

    const ics = generateICalFeed(events)

    return new NextResponse(ics, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // 1 hour cache
      },
    })
  } catch (error) {
    console.error('Error generating iCal feed:', error)
    return NextResponse.json({ error: 'Failed to generate feed' }, { status: 500 })
  }
}
