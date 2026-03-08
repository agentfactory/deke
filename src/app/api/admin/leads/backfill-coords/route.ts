import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'

/**
 * POST /api/admin/leads/backfill-coords
 *
 * Backfill latitude/longitude on Lead records from their bookings.
 * Leads without coordinates are invisible to geographic discovery sources.
 */
export async function POST() {
  try {
    // Find all leads missing coordinates
    const leadsWithoutCoords = await prisma.lead.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null },
        ],
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        bookings: {
          where: {
            latitude: { not: null },
            longitude: { not: null },
          },
          select: {
            latitude: true,
            longitude: true,
            location: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    console.log(`[Backfill] Found ${leadsWithoutCoords.length} leads without coordinates`)

    let updated = 0
    let skipped = 0

    for (const lead of leadsWithoutCoords) {
      const booking = lead.bookings[0]
      if (booking && booking.latitude !== null && booking.longitude !== null) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            latitude: booking.latitude,
            longitude: booking.longitude,
          },
        })
        updated++
        console.log(`[Backfill] Updated ${lead.firstName} ${lead.lastName} (${lead.email}) from booking at ${booking.location}`)
      } else {
        skipped++
      }
    }

    console.log(`[Backfill] Complete: ${updated} updated, ${skipped} skipped (no booking with coords)`)

    return NextResponse.json({
      message: 'Backfill complete',
      totalWithoutCoords: leadsWithoutCoords.length,
      updated,
      skipped,
      remaining: skipped,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * GET /api/admin/leads/backfill-coords
 *
 * Check how many leads are missing coordinates (dry run).
 */
export async function GET() {
  try {
    const [totalLeads, leadsWithCoords, leadsWithoutCoords] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({
        where: { latitude: { not: null }, longitude: { not: null } },
      }),
      prisma.lead.count({
        where: { OR: [{ latitude: null }, { longitude: null }] },
      }),
    ])

    // Check how many of the missing ones have bookings with coords
    const backfillable = await prisma.lead.count({
      where: {
        OR: [{ latitude: null }, { longitude: null }],
        bookings: {
          some: {
            latitude: { not: null },
            longitude: { not: null },
          },
        },
      },
    })

    return NextResponse.json({
      totalLeads,
      leadsWithCoords,
      leadsWithoutCoords,
      backfillable,
      notBackfillable: leadsWithoutCoords - backfillable,
      coveragePercent: totalLeads > 0
        ? Math.round((leadsWithCoords / totalLeads) * 100)
        : 0,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
