/**
 * Past Clients Discovery
 *
 * Discovers leads from past clients with completed bookings within the campaign radius.
 * These are high-value prospects as they have already worked with Deke.
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

export async function discoverPastClients(campaign: Campaign) {
  console.log('[Discovery:PastClients] Starting search', {
    lat: campaign.latitude,
    lng: campaign.longitude,
    radius: campaign.radius,
  })

  // Calculate bounding box for efficient database query
  const bbox = calculateBoundingBox(
    { lat: campaign.latitude, lon: campaign.longitude },
    campaign.radius
  )

  console.log('[Discovery:PastClients] Bounding box', bbox)

  // Find leads with completed bookings - TWO queries:
  // 1. Leads WITH coordinates in bounding box
  // 2. Leads WITHOUT coordinates (still include them)
  const [geoLeads, noGeoLeads] = await Promise.all([
    prisma.lead.findMany({
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
    }),
    prisma.lead.findMany({
      where: {
        status: { in: ['WON', 'COMPLETED'] },
        OR: [
          { latitude: null },
          { longitude: null },
        ],
      },
      include: {
        bookings: {
          where: { status: { in: ['COMPLETED', 'CONFIRMED'] } },
        },
      },
    }),
  ])

  console.log(`[Discovery:PastClients] Found ${geoLeads.length} geo leads + ${noGeoLeads.length} without coordinates`)

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
        source: 'PAST_CLIENT' as const,
      }
    })
    .filter((lead): lead is NonNullable<typeof lead> => lead !== null && lead.distance <= campaign.radius)

  // Include no-geo leads with null distance
  const noGeoResults = noGeoLeads.map((lead) => ({
    ...lead,
    distance: null as number | null,
    source: 'PAST_CLIENT' as const,
  }))

  const results = [...geoResults, ...noGeoResults]
  console.log(`[Discovery:PastClients] Returning ${results.length} leads (${geoResults.length} geo + ${noGeoResults.length} no-geo)`)
  return results
}
