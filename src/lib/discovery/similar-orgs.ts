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
    contact?: {
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
    contactOrg: campaign.booking?.contact?.organization,
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
    if (orgType === 'UNKNOWN' && campaign.booking?.contact?.organization) {
      orgType = classifyOrganization(campaign.booking.contact?.organization || '')
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

  // Find leads with similar organization names within the bounding box
  const leads = await prisma.lead.findMany({
    where: {
      AND: [
        {
          OR: orgConditions,
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
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  console.log(`[Discovery:SimilarOrgs] Found ${leads.length} leads in bounding box`)

  // Filter by exact haversine distance and calculate distance for each lead
  const results = leads
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
        source: 'SIMILAR_ORG' as const,
      }
    })
    .filter((lead): lead is NonNullable<typeof lead> => lead !== null && lead.distance <= campaign.radius)

  console.log(`[Discovery:SimilarOrgs] Returning ${results.length} leads after distance filter`)
  return results
}
