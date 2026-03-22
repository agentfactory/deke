/**
 * Dormant Leads Discovery
 *
 * Discovers leads that were contacted but have gone dormant (no contact in 6+ months).
 * Includes leads with DECLINED or EXPIRED inquiries that might be ready to reconsider.
 *
 * Phase 5: Includes leads without coordinates (lower proximity score, distance: null)
 */

import { prisma } from '@/lib/db'
import { haversineDistance, calculateBoundingBox } from '@/lib/geo'

interface Campaign {
  latitude: number
  longitude: number
  radius: number
}

export async function discoverDormantLeads(campaign: Campaign) {
  console.log('[Discovery:Dormant] Starting search', {
    lat: campaign.latitude,
    lng: campaign.longitude,
    radius: campaign.radius,
  })

  // Calculate bounding box for efficient database query
  const bbox = calculateBoundingBox(
    { lat: campaign.latitude, lon: campaign.longitude },
    campaign.radius
  )

  // Calculate date threshold: 6 months ago
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  // Dormancy conditions (shared between geo and no-geo queries)
  const dormancyConditions = {
    AND: [
      {
        OR: [
          { lastContactedAt: { lt: sixMonthsAgo } },
          {
            inquiries: {
              some: {
                status: { in: ['DECLINED', 'EXPIRED'] },
              },
            },
          },
        ],
      },
      { status: { notIn: ['WON', 'COMPLETED'] } },
    ],
  }

  // TWO queries: with and without coordinates
  const [geoLeads, noGeoLeads] = await Promise.all([
    prisma.lead.findMany({
      where: {
        ...dormancyConditions,
        latitude: { gte: bbox.minLat, lte: bbox.maxLat },
        longitude: { gte: bbox.minLon, lte: bbox.maxLon },
      },
      include: {
        inquiries: {
          where: { status: { in: ['DECLINED', 'EXPIRED'] } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
    prisma.lead.findMany({
      where: {
        ...dormancyConditions,
        OR: [
          { latitude: null },
          { longitude: null },
        ],
      },
      include: {
        inquiries: {
          where: { status: { in: ['DECLINED', 'EXPIRED'] } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
  ])

  console.log(`[Discovery:Dormant] Found ${geoLeads.length} geo leads + ${noGeoLeads.length} without coordinates`)

  // Process geo leads with distance filter
  const geoResults = geoLeads
    .map((lead) => {
      if (lead.latitude === null || lead.longitude === null) return null

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

  // Include no-geo leads with null distance
  const noGeoResults = noGeoLeads.map((lead) => ({
    ...lead,
    distance: null as number | null,
    source: 'DORMANT' as const,
  }))

  const results = [...geoResults, ...noGeoResults]
  console.log(`[Discovery:Dormant] Returning ${results.length} leads (${geoResults.length} geo + ${noGeoResults.length} no-geo)`)
  return results
}
