/**
 * Past Clients Discovery
 *
 * Discovers leads from past clients with completed bookings within the campaign radius.
 * These are high-value prospects as they have already worked with Deke.
 */

import { prisma } from '@/lib/db'
import { haversineDistance, calculateBoundingBox } from '@/lib/geo'

interface Campaign {
  latitude: number
  longitude: number
  radius: number
}

export async function discoverPastClients(campaign: Campaign) {
  // Calculate bounding box for efficient database query
  const bbox = calculateBoundingBox(
    { lat: campaign.latitude, lon: campaign.longitude },
    campaign.radius
  )

  // Find leads with completed bookings within the bounding box
  const leads = await prisma.lead.findMany({
    where: {
      status: { in: ['WON', 'COMPLETED'] },
      latitude: { gte: bbox.minLat, lte: bbox.maxLat },
      longitude: { gte: bbox.minLon, lte: bbox.maxLon },
    },
    include: {
      bookings: {
        where: { status: { in: ['COMPLETED', 'CONFIRMED'] } },
      },
    },
  })

  // Filter by exact haversine distance and calculate distance for each lead
  return leads
    .map((lead) => {
      if (lead.latitude === null || lead.longitude === null) {
        return null
      }

      const distance = haversineDistance(
        { lat: campaign.latitude, lon: campaign.longitude },
        { lat: lead.latitude, lon: lead.longitude },
        'miles'
      )

      return {
        ...lead,
        distance,
        source: 'PAST_CLIENT' as const,
      }
    })
    .filter((lead): lead is NonNullable<typeof lead> => lead !== null && lead.distance <= campaign.radius)
}
