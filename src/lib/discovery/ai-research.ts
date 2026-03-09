/**
 * AI Research Discovery (Google Places API)
 *
 * Discovers new leads by scraping geographic data from Google Places API.
 * Focuses on music-specific organizations: choirs, barbershop groups,
 * a cappella ensembles, and youth music education programs.
 */

import { prisma } from '@/lib/db'
import { enrichOrganization } from '@/lib/enrichment'

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
  website?: string | null
  emailVerified?: boolean
  needsEnrichment?: boolean
  enrichmentSource?: string | null
  contactTitle?: string | null
  editorialSummary?: string | null
  googleRating?: number | null
}

// Music-specific keywords for targeted search
// Uses Text Search API for more precise matching than generic place types
const MUSIC_KEYWORDS = [
  // Vocal music groups (specific organizations to avoid haircut barbershops)
  'choir',
  'chorus',
  'chorale',
  'Sweet Adelines',
  'Harmony Inc',
  'Barbershop Harmony Society',
  'BHS chorus',
  'CASA a cappella',
  'a cappella group',
  'vocal ensemble',
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
 * @returns Music relevance score (0-35 points, or 0 if excluded)
 */
function calculateMusicRelevance(place: any): number {
  let score = 0
  const name = (place.name || '').toLowerCase()
  const types = place.types || []

  // CRITICAL: Exclude haircut barbershops (return 0 immediately)
  const haircutKeywords = /\bcut\b|\bhaircut\b|\bbarber\s*shop\b|\bgrooming\b|\bshave\b|\bfade\b|\btrim\b|\bsalon\b/i
  if (haircutKeywords.test(name)) {
    return 0 // Not a music organization - it's a haircut place
  }

  // Also check Google Place types for hair care
  const haircutTypes = ['hair_care', 'beauty_salon', 'barber_shop']
  if (types.some((type: string) => haircutTypes.includes(type))) {
    return 0 // Definitely a haircut place
  }

  // +20 pts: General music keywords in name (excluding "barbershop" alone due to ambiguity)
  if (/\bchoir\b|\bchorus\b|\bchorale\b|\bsingers?\b|\bvocal\b|\bharmony\b/i.test(name)) {
    score += 20
  }

  // +15 pts: Specific music organizations (high-value targets)
  if (/sweet adelines|sai|harmony inc|harmony incorporated|casa|a\s?cappella/i.test(name)) {
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
 * Deduplicate places by Google's place_id
 *
 * When searching multiple keywords, the same place can appear multiple times.
 * This function ensures we only keep one instance of each unique place.
 *
 * @param places - Array of places (potentially with duplicates)
 * @returns Deduplicated array of places
 */
function deduplicateByPlaceId(places: any[]): any[] {
  const placeMap = new Map<string, any>()

  for (const place of places) {
    const placeId = place.place_id
    if (!placeId) continue

    // Keep first occurrence (all data is the same for same place_id)
    if (!placeMap.has(placeId)) {
      placeMap.set(placeId, place)
    }
  }

  return Array.from(placeMap.values())
}

interface PlaceDetails {
  phone: string | null
  website: string | null
  googleRating: number | null
  userRatingCount: number | null
  editorialSummary: string | null
  primaryType: string | null
}

/**
 * Fetch place details from Google Places (New) API
 *
 * Gets phone, website, rating, editorial summary, and primary type.
 * Uses GET https://places.googleapis.com/v1/places/{PLACE_ID}
 */
async function fetchPlaceDetails(
  placeId: string,
  apiKey: string
): Promise<PlaceDetails> {
  const emptyResult: PlaceDetails = {
    phone: null,
    website: null,
    googleRating: null,
    userRatingCount: null,
    editorialSummary: null,
    primaryType: null,
  }

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'nationalPhoneNumber,websiteUri,rating,userRatingCount,editorialSummary,primaryTypeDisplayName,displayName',
        },
      }
    )

    if (!response.ok) {
      console.error(`[AI Research] Details API error: ${response.status} ${response.statusText}`)
      return emptyResult
    }

    const data = await response.json()

    return {
      phone: data.nationalPhoneNumber || null,
      website: data.websiteUri || null,
      googleRating: data.rating || null,
      userRatingCount: data.userRatingCount || null,
      editorialSummary: data.editorialSummary?.text || null,
      primaryType: data.primaryTypeDisplayName?.text || null,
    }
  } catch (error) {
    console.error(`[AI Research] Failed to fetch details for place ${placeId}:`, error)
    return emptyResult
  }
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

    // CRITICAL: Deduplicate by place_id FIRST (same place appears in multiple keyword searches)
    const uniquePlaces = deduplicateByPlaceId(allPlaces)

    console.log(
      `AI Research: ${uniquePlaces.length} unique places (removed ${allPlaces.length - uniquePlaces.length} duplicates)`
    )

    // Score each UNIQUE place by music relevance + proximity
    const scoredPlaces = uniquePlaces.map((place) => {
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
      `AI Research: ${musicOrgs.length} music-relevant organizations (filtered from ${uniquePlaces.length})`
    )

    // Sort by combined score (music relevance + proximity)
    const sorted = musicOrgs.sort(
      (a, b) => b.musicScore + b.proximityScore - (a.musicScore + a.proximityScore)
    )

    // LIMIT TO TOP 20 highest-quality leads
    const top20 = sorted.slice(0, 20)

    console.log(`AI Research: Top 20 music organizations selected`)

    // Enrich top 20 with REAL contact information from Places New API
    console.log('[AI Research] Using Places New API — fetching details (phone, website, rating, summary)...')

    const enrichedPlaces = await Promise.all(
      top20.map(async (place) => {
        const details = await fetchPlaceDetails(place.place_id, apiKey)
        return {
          ...place,
          phone: details.phone,
          website: details.website,
          googleRating: details.googleRating,
          userRatingCount: details.userRatingCount,
          editorialSummary: details.editorialSummary,
          primaryType: details.primaryType,
        }
      })
    )

    console.log('[AI Research] Contact details enriched')

    // Batch convert places to leads and CREATE them in database
    const discovered = await placesToLeadsBatch(enrichedPlaces, campaign)

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
 * Search Google Places (New) API using Text Search
 *
 * Uses POST https://places.googleapis.com/v1/places:searchText
 * Returns place IDs, names, locations, types, and addresses.
 */
async function searchPlacesByKeyword(
  lat: number,
  lng: number,
  location: string,
  radius: number,
  keyword: string,
  apiKey: string
): Promise<any[]> {
  const query = `${keyword} in ${location}`

  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.displayName,places.id,places.location,places.types,places.formattedAddress',
    },
    body: JSON.stringify({
      textQuery: query,
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radiusMeters: radius,
        },
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Places New API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const places = data.places || []

  // Map New API response to match our internal format
  return places.map((place: any) => ({
    name: place.displayName?.text || '',
    place_id: place.id,
    geometry: {
      location: {
        lat: place.location?.latitude || 0,
        lng: place.location?.longitude || 0,
      },
    },
    types: place.types || [],
    formatted_address: place.formattedAddress || '',
  }))
}

/**
 * Batch convert Google Places to Leads with REAL enrichment
 *
 * Does a single database query to check for existing orgs,
 * then enriches new orgs by scraping their websites for real contact info.
 * NEVER generates fake emails.
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
      // ENRICH: Scrape website for real contacts instead of generating fake ones
      const enrichment = await enrichOrganization(
        place.website || null,
        place.phone || null,
        organization
      )

      if (enrichment.email) {
        // Found a real email via enrichment
        leads.push({
          firstName: enrichment.firstName || 'Contact',
          lastName: enrichment.lastName || `at ${organization}`,
          email: enrichment.email,
          phone: enrichment.phone,
          organization,
          source: 'AI_RESEARCH',
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          score: 30,
          distance,
          website: enrichment.website,
          emailVerified: enrichment.emailVerified,
          needsEnrichment: false,
          enrichmentSource: enrichment.enrichmentSource,
          contactTitle: enrichment.contactTitle || null,
          editorialSummary: place.editorialSummary || null,
          googleRating: place.googleRating || null,
        })
      } else {
        // No email found - create lead with needsEnrichment flag
        const placeholderEmail = `needs-enrichment+${organization.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 40)}@placeholder.local`

        leads.push({
          firstName: 'Contact',
          lastName: `at ${organization}`,
          email: placeholderEmail,
          phone: enrichment.phone,
          organization,
          source: 'AI_RESEARCH',
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          score: 15, // Lower score for leads without emails
          distance,
          website: enrichment.website,
          emailVerified: false,
          needsEnrichment: true,
          enrichmentSource: null,
          contactTitle: enrichment.contactTitle || null,
          editorialSummary: place.editorialSummary || null,
          googleRating: place.googleRating || null,
        })
      }
    }
  }

  return leads
}

// Deprecated functions removed - all contact generation now goes through enrichment pipeline

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
          // Update enrichment fields
          ...(lead.website && { website: lead.website }),
          ...(lead.emailVerified !== undefined && { emailVerified: lead.emailVerified }),
          ...(lead.needsEnrichment !== undefined && { needsEnrichment: lead.needsEnrichment }),
          ...(lead.enrichmentSource && { enrichmentSource: lead.enrichmentSource }),
          // New fields from Places New API + scraper
          ...(lead.contactTitle && { contactTitle: lead.contactTitle }),
          ...(lead.editorialSummary && { editorialSummary: lead.editorialSummary }),
          ...(lead.googleRating && { googleRating: lead.googleRating }),
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
          // Enrichment fields
          website: lead.website || null,
          emailVerified: lead.emailVerified || false,
          needsEnrichment: lead.needsEnrichment || false,
          enrichmentSource: lead.enrichmentSource || null,
          // New fields from Places New API + scraper
          contactTitle: lead.contactTitle || null,
          editorialSummary: lead.editorialSummary || null,
          googleRating: lead.googleRating || null,
        },
      })

      // Return with distance, source, and enrichment info
      createdLeads.push({
        ...dbLead,
        distance: lead.distance,
        source: lead.source,
        needsEnrichment: lead.needsEnrichment || false,
        emailVerified: lead.emailVerified || false,
      })
    } catch (error) {
      console.error(`Failed to create lead ${lead.email}:`, error)
      // Continue with other leads
    }
  }

  return createdLeads
}
