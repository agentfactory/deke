/**
 * Similar Organizations Discovery
 *
 * Discovers leads from organizations similar to the booking location.
 * Uses organization type classification to find similar institutions.
 */

import { prisma } from '@/lib/db'
import { haversineDistance, calculateBoundingBox } from '@/lib/geo'
import { classifyFromLocation, classifyOrganization, getSimilarOrgKeywords } from './org-classifier'

interface Campaign {
  latitude: number
  longitude: number
  radius: number
  targetOrgTypes?: string | null // JSON array of org types for prospect mode
  booking?: {
    location: string | null
    lead?: {
      organization: string | null
    } | null
  } | null
}

export async function discoverSimilarOrgs(campaign: Campaign) {
  console.log('[Discovery:SimilarOrgs] Starting search', {
    lat: campaign.latitude,
    lng: campaign.longitude,
    radius: campaign.radius,
    bookingLocation: campaign.booking?.location,
    leadOrg: campaign.booking?.lead?.organization,
  })

  // Determine search keywords: from targetOrgTypes (prospect mode) or booking location
  let keywords: string[] = []

  if (campaign.targetOrgTypes) {
    // Prospect mode: use explicit target org types
    try {
      const orgTypes = JSON.parse(campaign.targetOrgTypes) as string[]
      for (const type of orgTypes) {
        const typeKeywords = getSimilarOrgKeywords(type as any)
        keywords.push(...typeKeywords)
      }
      // Deduplicate keywords
      keywords = [...new Set(keywords)]
      console.log(`[Discovery:SimilarOrgs] Using ${orgTypes.length} target org types with ${keywords.length} keywords`)
    } catch (error) {
      console.error('[Discovery:SimilarOrgs] Failed to parse targetOrgTypes:', error)
    }
  }

  if (keywords.length === 0) {
    // Booking-based mode: classify from booking location
    const bookingLocation = campaign.booking?.location
    if (!bookingLocation) {
      console.warn('[Discovery:SimilarOrgs] No booking location or target org types — skipping')
      return []
    }

    let orgType = classifyFromLocation(bookingLocation)

    // Fallback: if location is a street address (UNKNOWN), try classifying the lead's organization name
    if (orgType === 'UNKNOWN' && campaign.booking?.lead?.organization) {
      orgType = classifyOrganization(campaign.booking.lead.organization)
      if (orgType !== 'UNKNOWN') {
        console.log(`[Discovery:SimilarOrgs] Location unclassifiable, fell back to lead org: ${orgType}`)
      }
    }

    if (orgType === 'UNKNOWN') {
      console.warn(`[Discovery:SimilarOrgs] Could not classify: "${bookingLocation}" — skipping`)
      return []
    }

    console.log(`[Discovery:SimilarOrgs] Classified as ${orgType}`)
    keywords = getSimilarOrgKeywords(orgType)
    if (keywords.length === 0) {
      return []
    }
  }

  // Calculate bounding box for efficient database query
  const bbox = calculateBoundingBox(
    { lat: campaign.latitude, lon: campaign.longitude },
    campaign.radius
  )

  // Build OR conditions for organization name matching
  const orgConditions = keywords.map((keyword) => ({
    organization: {
      contains: keyword,
      mode: 'insensitive' as const,
    },
  }))

  console.log(`[Discovery:SimilarOrgs] Searching with ${keywords.length} keywords:`, keywords)

  // Find leads with similar organization names — two queries:
  // 1. Leads WITH coordinates (geo-filtered by bounding box)
  // 2. Leads WITHOUT coordinates (included but with null distance)
  const [geoLeads, noGeoLeads] = await Promise.all([
    prisma.lead.findMany({
      where: {
        AND: [
          { OR: orgConditions },
          {
            latitude: { gte: bbox.minLat, lte: bbox.maxLat },
            longitude: { gte: bbox.minLon, lte: bbox.maxLon },
          },
          { status: { notIn: ['WON', 'COMPLETED'] } },
        ],
      },
      include: {
        inquiries: { orderBy: { createdAt: 'desc' }, take: 1 },
        bookings: true,
      },
    }),
    prisma.lead.findMany({
      where: {
        AND: [
          { OR: orgConditions },
          {
            OR: [
              { latitude: null },
              { longitude: null },
            ],
          },
          { status: { notIn: ['WON', 'COMPLETED'] } },
        ],
      },
      include: {
        inquiries: { orderBy: { createdAt: 'desc' }, take: 1 },
        bookings: true,
      },
    }),
  ])

  console.log(`[Discovery:SimilarOrgs] Found ${geoLeads.length} geo leads + ${noGeoLeads.length} no-geo leads`)

  // Filter geo leads by exact haversine distance
  const geoResults = geoLeads
    .map((lead) => {
      if (lead.latitude === null || lead.longitude === null) return null

      const distance = haversineDistance(
        { lat: campaign.latitude, lon: campaign.longitude },
        { lat: lead.latitude, lon: lead.longitude },
        'miles'
      )

      return { ...lead, distance, source: 'SIMILAR_ORG' as const }
    })
    .filter((lead): lead is NonNullable<typeof lead> => lead !== null && lead.distance <= campaign.radius)

  // Include no-geo leads with null distance
  const noGeoResults = noGeoLeads.map((lead) => ({
    ...lead,
    distance: null as number | null,
    source: 'SIMILAR_ORG' as const,
  }))

  const results = [...geoResults, ...noGeoResults]
  console.log(`[Discovery:SimilarOrgs] Returning ${results.length} leads (${geoResults.length} geo + ${noGeoResults.length} no-geo)`)
  return results
}
