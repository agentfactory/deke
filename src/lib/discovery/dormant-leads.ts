/**
 * Dormant Leads Discovery
 *
 * Discovers leads that were contacted but have gone dormant (no contact in 6+ months).
 * Includes leads with DECLINED or EXPIRED inquiries that might be ready to reconsider.
 */

import { prisma } from '@/lib/db'
import { haversineDistance, calculateBoundingBox } from '@/lib/geo'

interface Campaign {
  latitude: number
  longitude: number
  radius: number
}

export async function discoverDormantLeads(campaign: Campaign) {
  // Calculate bounding box for efficient database query
  const bbox = calculateBoundingBox(
    { lat: campaign.latitude, lon: campaign.longitude },
    campaign.radius
  )

  // Calculate date threshold: 6 months ago
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  // Find leads with no recent contact within the bounding box
  const leads = await prisma.lead.findMany({
    where: {
      AND: [
        {
          OR: [
            // Leads contacted but not recently
            {
              lastContactedAt: { lt: sixMonthsAgo },
            },
            // Leads with DECLINED or EXPIRED inquiries
            {
              inquiries: {
                some: {
                  status: { in: ['DECLINED', 'EXPIRED'] },
                },
              },
            },
          ],
        },
        // Must have coordinates
        {
          latitude: { gte: bbox.minLat, lte: bbox.maxLat },
          longitude: { gte: bbox.minLon, lte: bbox.maxLon },
        },
        // Exclude leads that are already WON or COMPLETED (handled by past-clients)
        {
          status: { notIn: ['WON', 'COMPLETED'] },
        },
      ],
    },
    include: {
      inquiries: {
        where: { status: { in: ['DECLINED', 'EXPIRED'] } },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      bookings: true,
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
        source: 'DORMANT' as const,
      }
    })
    .filter((lead): lead is NonNullable<typeof lead> => lead !== null && lead.distance <= campaign.radius)
}
