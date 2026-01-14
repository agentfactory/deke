/**
 * Similar Organizations Discovery
 *
 * Discovers leads from organizations similar to the booking location.
 * Uses organization type classification to find similar institutions.
 */

import { prisma } from '@/lib/db'
import { haversineDistance, calculateBoundingBox } from '@/lib/geo'
import { classifyFromLocation, getSimilarOrgKeywords } from './org-classifier'

interface Campaign {
  latitude: number
  longitude: number
  radius: number
  booking?: {
    location: string | null
  } | null
}

export async function discoverSimilarOrgs(campaign: Campaign) {
  // Determine organization type from the booking location
  const bookingLocation = campaign.booking?.location
  if (!bookingLocation) {
    // No booking location to base similarity on
    return []
  }

  const orgType = classifyFromLocation(bookingLocation)
  if (orgType === 'UNKNOWN') {
    // Could not classify organization type
    return []
  }

  // Get keywords for similar organization search
  const keywords = getSimilarOrgKeywords(orgType)
  if (keywords.length === 0) {
    return []
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
        source: 'SIMILAR_ORG' as const,
        orgType, // Include the detected organization type for debugging
      }
    })
    .filter((lead): lead is NonNullable<typeof lead> => lead !== null && lead.distance <= campaign.radius)
}
