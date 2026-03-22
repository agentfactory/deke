import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateICalEvent } from '@/lib/utils/ical'

// GET /api/events/[id]/ical — download .ics file for a single public event
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const booking = await prisma.booking.findFirst({
    where: {
      id,
      isPublic: true,
      status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
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
  })

  if (!booking || !booking.startDate) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  const title = booking.publicTitle || `${booking.serviceType.replace('_', ' ')}${booking.location ? ` in ${booking.location}` : ''}`
  const description = booking.publicDescription || `Deke Sharon - ${booking.serviceType.replace('_', ' ')}${booking.organization ? ` with ${booking.organization}` : ''}`

  const ics = generateICalEvent({
    title,
    description,
    location: booking.location,
    startDate: booking.startDate,
    endDate: booking.endDate,
  })

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="deke-sharon-event-${booking.id}.ics"`,
    },
  })
}
