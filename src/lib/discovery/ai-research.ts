/**
 * AI Research Discovery (Google Places API)
 *
 * Discovers new leads by scraping geographic data from Google Places API.
 * Focuses on music-specific organizations: choirs, barbershop groups,
 * a cappella ensembles, and youth music education programs.
 */

import { prisma } from '@/lib/db'

interface Campaign {
  id: string
  latitude: number
  longitude: number
  radius: number
  baseLocation: string
}

interface DiscoveredLead {
  firstName: string
  lastName: string
  email: string
  phone: string | null
  organization: string
  source: 'AI_RESEARCH'
  latitude: number
  longitude: number
  score: number
  distance: number
}

// Music-specific keywords for targeted search
// Uses Text Search API for more precise matching than generic place types
const MUSIC_KEYWORDS = [
  // Vocal music groups
  'choir',
  'chorus',
  'barbershop quartet',
  'Sweet Adelines',
  'Harmony Inc',
  'CASA a cappella',
  'a cappella group',
  'gospel choir',
  'community chorus',

  // Youth music education
  'high school choir',
  'middle school choir',
  'music school',
  'conservatory',
  'youth choir',
]

/**
 * Calculate music relevance score for a place
 *
 * Higher scores indicate stronger music focus and better lead quality
 *
 * @param place - Google Place result
 * @returns Music relevance score (0-35 points)
 */
function calculateMusicRelevance(place: any): number {
  let score = 0
  const name = (place.name || '').toLowerCase()

  // +20 pts: General music keywords in name
  if (/\bchoir\b|\bchorus\b|\bsingers?\b|\bvocal\b|\bharmony\b|\bbarbershop\b/i.test(name)) {
    score += 20
  }

  // +15 pts: Specific music organizations (high-value targets)
  if (/barbershop|sweet adelines|sai|harmony inc|casa|a\s?cappella/i.test(name)) {
    score += 15
  }

  // +15 pts: Music education institutions
  if (/music\s+school|conservatory|academy.*music|music.*academy/i.test(name)) {
    score += 15
  }

  // +10 pts: Youth music programs
  if (/youth.*choir|children.*choir|student.*choir|school.*choir/i.test(name)) {
    score += 10
  }

  return score
}

/**
 * Calculate proximity bonus based on distance from campaign center
 *
 * Closer organizations get higher scores
 *
 * @param distance - Distance in miles
 * @param maxRadius - Campaign radius in miles
 * @returns Proximity score (0-15 points)
 */
function calculateProximityBonus(distance: number, maxRadius: number): number {
  const percentage = distance / maxRadius

  if (percentage <= 0.25) return 15 // Inner 25%
  if (percentage <= 0.50) return 10 // Inner 50%
  if (percentage <= 0.75) return 5  // Inner 75%
  return 0 // Outer ring
}

/**
 * Search Google Places API for organizations in the campaign radius
 *
 * @param campaign - Campaign with location and radius
 * @returns Array of discovered leads
 */
export async function discoverAIResearch(campaign: Campaign): Promise<DiscoveredLead[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  // If no API key, return empty (graceful degradation)
  if (!apiKey) {
    console.warn('GOOGLE_PLACES_API_KEY not set - skipping AI research discovery')
    return []
  }

  try {
    const allPlaces: any[] = []

    // Convert radius from miles to meters (Places API uses meters)
    const radiusMeters = campaign.radius * 1609.34

    // Search for each music keyword using Text Search API
    for (const keyword of MUSIC_KEYWORDS) {
      try {
        const places = await searchPlacesByKeyword(
          campaign.latitude,
          campaign.longitude,
          campaign.baseLocation,
          radiusMeters,
          keyword,
          apiKey
        )
        allPlaces.push(...places)
      } catch (error) {
        console.error(`Error searching for "${keyword}":`, error)
        // Continue with other keywords
      }
    }

    console.log(`AI Research: Found ${allPlaces.length} raw places from Google`)

    // Score each place by music relevance + proximity
    const scoredPlaces = allPlaces.map((place) => {
      const distance = haversineDistance(
        campaign.latitude,
        campaign.longitude,
        place.geometry.location.lat,
        place.geometry.location.lng
      )

      return {
        ...place,
        musicScore: calculateMusicRelevance(place),
        proximityScore: calculateProximityBonus(distance, campaign.radius),
        distance,
      }
    })

    // Filter: ONLY organizations with music relevance (score > 0)
    const musicOrgs = scoredPlaces.filter((p) => p.musicScore > 0)

    console.log(
      `AI Research: ${musicOrgs.length} music-relevant organizations (filtered from ${allPlaces.length})`
    )

    // Sort by combined score (music relevance + proximity)
    const sorted = musicOrgs.sort(
      (a, b) => b.musicScore + b.proximityScore - (a.musicScore + a.proximityScore)
    )

    // LIMIT TO TOP 20 highest-quality leads
    const top20 = sorted.slice(0, 20)

    console.log(`AI Research: Top 20 music organizations selected`)

    // Batch convert places to leads and CREATE them in database
    const discovered = await placesToLeadsBatch(top20, campaign)

    // Deduplicate by organization name
    const uniqueLeads = deduplicateByOrganization(discovered)

    console.log(`AI Research: ${uniqueLeads.length} unique organizations after dedup`)

    // Insert new leads into database and return with IDs
    const leadsWithIds = await createLeadsInDatabase(uniqueLeads)

    console.log(`AI Research: Created ${leadsWithIds.length} leads in database`)

    return leadsWithIds
  } catch (error) {
    console.error('AI Research discovery failed:', error)
    return []
  }
}

/**
 * Search Google Places API using keyword-based text search
 *
 * Uses Text Search endpoint: https://developers.google.com/maps/documentation/places/web-service/search-text
 *
 * This provides more precise targeting than generic place types,
 * allowing us to search for "choir" or "barbershop quartet" specifically
 */
async function searchPlacesByKeyword(
  lat: number,
  lng: number,
  location: string,
  radius: number,
  keyword: string,
  apiKey: string
): Promise<any[]> {
  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')

  // Construct query: "choir in Ottawa" or "barbershop quartet in Ottawa"
  const query = `${keyword} in ${location}`

  url.searchParams.set('query', query)
  url.searchParams.set('location', `${lat},${lng}`)
  url.searchParams.set('radius', radius.toString())
  url.searchParams.set('key', apiKey)

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`Places API error: ${response.statusText}`)
  }

  const data = await response.json()

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Places API status: ${data.status}`)
  }

  return data.results || []
}

/**
 * Batch convert Google Places to Leads (optimized)
 *
 * Does a single database query to check for existing orgs instead of 1 query per place
 */
async function placesToLeadsBatch(places: any[], campaign: Campaign): Promise<DiscoveredLead[]> {
  if (places.length === 0) return []

  // Extract all organization names
  const orgNames = places
    .map((place) => place.name)
    .filter((name): name is string => !!name)

  // Single batch query to find all existing organizations
  const existingLeads = await prisma.lead.findMany({
    where: {
      organization: {
        in: orgNames,
      },
    },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      organization: true,
    },
  })

  // Create a map for fast lookup
  const existingLeadsMap = new Map(
    existingLeads.map((lead) => [lead.organization?.toLowerCase() || '', lead])
  )

  // Convert all places to leads
  const leads: DiscoveredLead[] = []

  for (const place of places) {
    const organization = place.name
    if (!organization) continue

    // Calculate distance
    const distance = haversineDistance(
      campaign.latitude,
      campaign.longitude,
      place.geometry.location.lat,
      place.geometry.location.lng
    )

    // Check if exists in our map
    const existing = existingLeadsMap.get(organization.toLowerCase())

    if (existing) {
      // Use existing lead data
      leads.push({
        firstName: existing.firstName,
        lastName: existing.lastName,
        email: existing.email,
        phone: existing.phone,
        organization,
        source: 'AI_RESEARCH',
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        score: 30,
        distance,
      })
    } else {
      // Generate synthetic contact
      const firstName = 'Contact'
      const lastName = `at ${organization}`
      const email = generateOrgEmail(organization)

      leads.push({
        firstName,
        lastName,
        email,
        phone: null,
        organization,
        source: 'AI_RESEARCH',
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        score: 30,
        distance,
      })
    }
  }

  return leads
}

/**
 * Convert Google Place to Lead (DEPRECATED - use placesToLeadsBatch instead)
 *
 * Generates synthetic contact info since Places API doesn't provide individual contacts
 */
async function placeToLead(place: any, campaign: Campaign): Promise<DiscoveredLead | null> {
  // Extract organization name
  const organization = place.name
  if (!organization) return null

  // Calculate distance
  const distance = haversineDistance(
    campaign.latitude,
    campaign.longitude,
    place.geometry.location.lat,
    place.geometry.location.lng
  )

  // Check if this organization already exists in our database
  const existingLead = await prisma.lead.findFirst({
    where: {
      organization: {
        contains: organization,
        mode: 'insensitive',
      },
    },
  })

  // If exists, return existing lead data
  if (existingLead) {
    return {
      firstName: existingLead.firstName,
      lastName: existingLead.lastName,
      email: existingLead.email,
      phone: existingLead.phone,
      organization,
      source: 'AI_RESEARCH',
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      score: 30, // Base score for AI research
      distance,
    }
  }

  // Generate synthetic contact (to be enriched later)
  // Format: "Contact at [Organization Name]"
  const firstName = 'Contact'
  const lastName = `at ${organization}`
  const email = generateOrgEmail(organization)

  return {
    firstName,
    lastName,
    email,
    phone: null, // Will need manual enrichment
    organization,
    source: 'AI_RESEARCH',
    latitude: place.geometry.location.lat,
    longitude: place.geometry.location.lng,
    score: 30,
    distance,
  }
}

/**
 * Generate a synthetic email for an organization
 * Format: contact@[domain-from-org-name].com
 */
function generateOrgEmail(organization: string): string {
  // Convert org name to domain-friendly format
  const domain = organization
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .substring(0, 50) // Limit length

  return `contact@${domain}.com`
}

/**
 * Calculate distance between two points using Haversine formula
 *
 * @returns Distance in miles
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Deduplicate leads by organization name
 * Keep the closest one if multiple locations exist
 */
function deduplicateByOrganization(leads: DiscoveredLead[]): DiscoveredLead[] {
  const orgMap = new Map<string, DiscoveredLead>()

  for (const lead of leads) {
    const orgKey = lead.organization.toLowerCase()
    const existing = orgMap.get(orgKey)

    // Keep the closer one
    if (!existing || lead.distance < existing.distance) {
      orgMap.set(orgKey, lead)
    }
  }

  return Array.from(orgMap.values())
}

/**
 * Create new leads in database (upsert by email)
 * Returns leads with database IDs
 */
async function createLeadsInDatabase(leads: DiscoveredLead[]): Promise<any[]> {
  const createdLeads = []

  for (const lead of leads) {
    try {
      // Upsert lead (create if not exists, update if exists)
      const dbLead = await prisma.lead.upsert({
        where: { email: lead.email },
        update: {
          // Update fields that might have changed
          latitude: lead.latitude,
          longitude: lead.longitude,
          organization: lead.organization,
        },
        create: {
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          organization: lead.organization,
          source: lead.source,
          status: 'NEW',
          score: lead.score,
          latitude: lead.latitude,
          longitude: lead.longitude,
        },
      })

      // Return with distance and source info
      createdLeads.push({
        ...dbLead,
        distance: lead.distance,
        source: lead.source,
      })
    } catch (error) {
      console.error(`Failed to create lead ${lead.email}:`, error)
      // Continue with other leads
    }
  }

  return createdLeads
}
