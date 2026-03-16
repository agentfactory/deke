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

export interface AIResearchDiagnostics {
  apiCallsMade: number
  apiCallsFailed: number
  rawPlaces: number
  uniquePlaces: number
  musicRelevant: number
  enriched: number
  leadsCreated: number
  keywordResults: Array<{ keyword: string; count: number; error?: string }>
  errors: string[]
}

export interface AIResearchResult {
  leads: DiscoveredLead[]
  diagnostics: AIResearchDiagnostics
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

    if (!placeMap.has(placeId)) {
      placeMap.set(placeId, { ...place, _searchKeywords: [place._searchKeyword] })
    } else {
      // Accumulate all keywords that found this place
      const existing = placeMap.get(placeId)
      if (place._searchKeyword && !existing._searchKeywords.includes(place._searchKeyword)) {
        existing._searchKeywords.push(place._searchKeyword)
      }
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
 * Fetch place details from Google Places API (legacy)
 *
 * Gets phone, website, rating, editorial summary, and primary type.
 * Uses GET https://maps.googleapis.com/maps/api/place/details/json
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
    const fields = 'formatted_phone_number,website,rating,user_ratings_total,editorial_summary,type,name'
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`
    )

    if (!response.ok) {
      console.error(`[AI Research] Details API error: ${response.status} ${response.statusText}`)
      return emptyResult
    }

    const data = await response.json()

    if (data.status !== 'OK') {
      console.error(`[AI Research] Details API status: ${data.status} - ${data.error_message || ''}`)
      return emptyResult
    }

    const result = data.result || {}

    return {
      phone: result.formatted_phone_number || null,
      website: result.website || null,
      googleRating: result.rating || null,
      userRatingCount: result.user_ratings_total || null,
      editorialSummary: result.editorial_summary?.overview || null,
      primaryType: result.types?.[0] || null,
    }
  } catch (error) {
    console.error(`[AI Research] Failed to fetch details for place ${placeId}:`, error)
    return emptyResult
  }
}

// Maximum API calls to prevent runaway costs
const MAX_API_CALLS = 200

/**
 * Generate search grid points to cover the full campaign radius
 *
 * Google Places API caps search radius at 50km. For larger campaign radii,
 * we create a grid of overlapping 50km circles to cover the full area.
 *
 * @param lat - Campaign center latitude
 * @param lng - Campaign center longitude
 * @param radiusMeters - Campaign radius in meters
 * @returns Array of {lat, lng, searchRadius} covering the full area
 */
function generateSearchGrid(lat: number, lng: number, radiusMeters: number): Array<{ lat: number; lng: number; searchRadius: number }> {
  const MAX_SEARCH_RADIUS = 50000 // Google's 50km limit

  if (radiusMeters <= MAX_SEARCH_RADIUS) {
    return [{ lat, lng, searchRadius: radiusMeters }]
  }

  // Center point always included
  const points: Array<{ lat: number; lng: number; searchRadius: number }> = [
    { lat, lng, searchRadius: MAX_SEARCH_RADIUS },
  ]

  // Place additional points at cardinal directions ~80km from center
  // With 50km search radius each, this covers up to ~130km from center
  const offsetKm = 80
  const earthRadiusKm = 6371

  // Latitude offset: ~80km north and south
  const latOffset = offsetKm / earthRadiusKm * (180 / Math.PI)

  // Longitude offset: ~80km east and west (adjusted for latitude)
  const lngOffset = offsetKm / (earthRadiusKm * Math.cos(lat * Math.PI / 180)) * (180 / Math.PI)

  // Cardinal directions: N, S, E, W
  points.push({ lat: lat + latOffset, lng, searchRadius: MAX_SEARCH_RADIUS }) // North
  points.push({ lat: lat - latOffset, lng, searchRadius: MAX_SEARCH_RADIUS }) // South
  points.push({ lat, lng: lng + lngOffset, searchRadius: MAX_SEARCH_RADIUS }) // East
  points.push({ lat, lng: lng - lngOffset, searchRadius: MAX_SEARCH_RADIUS }) // West

  return points
}

/**
 * Search Google Places API for organizations in the campaign radius
 *
 * @param campaign - Campaign with location and radius
 * @returns Array of discovered leads
 */
export async function discoverAIResearch(campaign: Campaign): Promise<AIResearchResult> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  const diagnostics: AIResearchDiagnostics = {
    apiCallsMade: 0,
    apiCallsFailed: 0,
    rawPlaces: 0,
    uniquePlaces: 0,
    musicRelevant: 0,
    enriched: 0,
    leadsCreated: 0,
    keywordResults: [],
    errors: [],
  }

  // If no API key, return empty with clear diagnostic
  if (!apiKey) {
    const msg = 'GOOGLE_PLACES_API_KEY not set - skipping AI research discovery'
    console.warn(msg)
    diagnostics.errors.push(msg)
    return { leads: [], diagnostics }
  }

  const allPlaces: any[] = []

  // Convert radius from miles to meters (Places API uses meters)
  const radiusMeters = campaign.radius * 1609.34

  // Generate search grid to cover full campaign radius (works around 50km API limit)
  const searchGrid = generateSearchGrid(campaign.latitude, campaign.longitude, radiusMeters)

  console.log(`[AI Research] Starting search: ${MUSIC_KEYWORDS.length} keywords × ${searchGrid.length} grid point${searchGrid.length > 1 ? 's' : ''}, radius=${radiusMeters}m, location="${campaign.baseLocation}" (${campaign.latitude}, ${campaign.longitude})`)

  // Search for each music keyword across all grid points
  for (const keyword of MUSIC_KEYWORDS) {
    let keywordTotal = 0

    for (const gridPoint of searchGrid) {
      // Safety cap on total API calls
      if (diagnostics.apiCallsMade >= MAX_API_CALLS) {
        console.warn(`[AI Research] Reached MAX_API_CALLS limit (${MAX_API_CALLS}), stopping search`)
        break
      }

      diagnostics.apiCallsMade++
      try {
        const places = await searchPlacesByKeyword(
          gridPoint.lat,
          gridPoint.lng,
          campaign.baseLocation,
          gridPoint.searchRadius,
          keyword,
          apiKey
        )
        keywordTotal += places.length
        allPlaces.push(...places)
      } catch (error) {
        diagnostics.apiCallsFailed++
        const errMsg = error instanceof Error ? error.message : String(error)
        diagnostics.errors.push(`Keyword "${keyword}" at grid (${gridPoint.lat.toFixed(2)},${gridPoint.lng.toFixed(2)}): ${errMsg}`)
        console.error(`[AI Research] Error searching for "${keyword}":`, errMsg)
      }
    }

    diagnostics.keywordResults.push({ keyword, count: keywordTotal })

    if (diagnostics.apiCallsMade >= MAX_API_CALLS) break
  }

  diagnostics.rawPlaces = allPlaces.length
  console.log(`[AI Research] Found ${allPlaces.length} raw places from ${diagnostics.apiCallsMade} API calls (${diagnostics.apiCallsFailed} failed)`)

  // If ALL keyword searches failed, throw with aggregated error
  if (diagnostics.apiCallsFailed === diagnostics.apiCallsMade) {
    const aggregatedMsg = `All ${diagnostics.apiCallsMade} Places API calls failed. First error: ${diagnostics.errors[0] || 'unknown'}`
    console.error(`[AI Research] FATAL: ${aggregatedMsg}`)
    throw new Error(aggregatedMsg)
  }

  // CRITICAL: Deduplicate by place_id FIRST (same place appears in multiple keyword searches)
  const uniquePlaces = deduplicateByPlaceId(allPlaces)
  diagnostics.uniquePlaces = uniquePlaces.length

  console.log(
    `[AI Research] ${uniquePlaces.length} unique places (removed ${allPlaces.length - uniquePlaces.length} duplicates)`
  )

  // Music-specific keywords that provide strong signal when Google returns a result for them
  const MUSIC_SPECIFIC_KEYWORDS = [
    'choir', 'chorus', 'chorale', 'a cappella', 'vocal ensemble',
    'gospel choir', 'community chorus', 'youth choir', 'high school choir',
    'middle school choir', 'sweet adelines', 'harmony inc',
    'barbershop harmony society', 'bhs chorus', 'casa a cappella',
  ]

  // Score each UNIQUE place by music relevance + proximity
  const scoredPlaces = uniquePlaces.map((place) => {
    const distance = haversineDistance(
      campaign.latitude,
      campaign.longitude,
      place.geometry.location.lat,
      place.geometry.location.lng
    )

    let musicScore = calculateMusicRelevance(place)

    // Keyword trust boost: if Google returned this place for a music-specific query
    // but the name doesn't contain music keywords (e.g., "First Baptist Church" for "choir"),
    // give it enough score to pass the filter
    if (musicScore < 10 && musicScore >= 0 && place._searchKeywords) {
      const hasSpecificKeyword = place._searchKeywords.some((kw: string) =>
        MUSIC_SPECIFIC_KEYWORDS.some(mk => kw.toLowerCase().includes(mk))
      )
      if (hasSpecificKeyword) {
        musicScore = Math.max(musicScore, 10)
      }
    }

    return {
      ...place,
      musicScore,
      proximityScore: calculateProximityBonus(distance, campaign.radius),
      distance,
    }
  })

  // Filter: ONLY organizations with strong music relevance (score >= 10)
  // Requires at least one real music signal (choir/chorus=20, music education=15, youth program=10)
  // or keyword trust boost from Google returning the place for a music-specific query
  const musicOrgs = scoredPlaces.filter((p) => p.musicScore >= 10)
  diagnostics.musicRelevant = musicOrgs.length

  const filteredOut = uniquePlaces.length - musicOrgs.length
  console.log(
    `[AI Research] ${musicOrgs.length} music-relevant organizations (${filteredOut} filtered out as non-music)`
  )

  // Warn if music filter removes everything
  if (musicOrgs.length === 0 && uniquePlaces.length > 0) {
    const warnMsg = `Found ${uniquePlaces.length} places but music relevance filter removed all of them. Top place names: ${uniquePlaces.slice(0, 5).map((p: any) => p.name).join(', ')}`
    diagnostics.errors.push(warnMsg)
    console.warn(`[AI Research] WARNING: ${warnMsg}`)
    return { leads: [], diagnostics }
  }

  if (musicOrgs.length === 0) {
    console.log('[AI Research] No music-relevant places found — returning empty')
    return { leads: [], diagnostics }
  }

  // Sort by combined score (music relevance + proximity)
  const sorted = musicOrgs.sort(
    (a, b) => b.musicScore + b.proximityScore - (a.musicScore + a.proximityScore)
  )

  // Limit to top candidates for enrichment
  const MAX_ENRICHMENT_CANDIDATES = 150
  const topResults = sorted.slice(0, MAX_ENRICHMENT_CANDIDATES)

  console.log(`[AI Research] Top ${topResults.length} music organizations selected for enrichment`)

  // Enrich top results with REAL contact information from Places New API
  // Process in batches to avoid rate limiting
  console.log('[AI Research] Using Places New API — fetching details (phone, website, rating, summary)...')

  const ENRICHMENT_BATCH_SIZE = 20
  const enrichedPlaces: any[] = []

  for (let i = 0; i < topResults.length; i += ENRICHMENT_BATCH_SIZE) {
    const batch = topResults.slice(i, i + ENRICHMENT_BATCH_SIZE)
    const batchResults = await Promise.all(
      batch.map(async (place) => {
        const details = await fetchPlaceDetails(place.place_id, apiKey)
        diagnostics.apiCallsMade++
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
    enrichedPlaces.push(...batchResults)

    // Small delay between batches to respect rate limits
    if (i + ENRICHMENT_BATCH_SIZE < topResults.length) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  diagnostics.enriched = enrichedPlaces.length
  console.log(`[AI Research] ${enrichedPlaces.length} places enriched with contact details`)

  // Batch convert places to leads and CREATE them in database
  const discovered = await placesToLeadsBatch(enrichedPlaces, campaign)

  // Deduplicate by organization name
  const uniqueLeads = deduplicateByOrganization(discovered)

  console.log(`[AI Research] ${uniqueLeads.length} unique organizations after dedup`)

  // Insert new leads into database and return with IDs
  const leadsWithIds = await createLeadsInDatabase(uniqueLeads)
  diagnostics.leadsCreated = leadsWithIds.length

  console.log(`[AI Research] Created ${leadsWithIds.length} leads in database`)

  // Summary log
  console.log(`[AI Research] SUMMARY: ${diagnostics.apiCallsMade} calls, ${diagnostics.apiCallsFailed} failed, ${diagnostics.rawPlaces} raw → ${diagnostics.uniquePlaces} unique → ${diagnostics.musicRelevant} music → ${diagnostics.enriched} enriched → ${diagnostics.leadsCreated} leads`)

  return { leads: leadsWithIds, diagnostics }
}

/**
 * Search Google Places API using Text Search (legacy)
 *
 * Uses GET https://maps.googleapis.com/maps/api/place/textsearch/json
 * Returns place IDs, names, locations, types, and addresses.
 * This is the most widely-enabled Google Maps API.
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
  const params = new URLSearchParams({
    query,
    location: `${lat},${lng}`,
    radius: String(Math.min(radius, 50000)), // Legacy API max 50km
    key: apiKey,
  })

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`
  )

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'unknown')
    console.error(`[AI Research] Places Text Search failed for "${query}":`, errorBody)
    throw new Error(`Places API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  if (data.status === 'REQUEST_DENIED') {
    console.error(`[AI Research] Places API denied for "${query}": ${data.error_message || 'unknown'}`)
    throw new Error(`Places API denied: ${data.error_message || 'Check API key and enabled APIs'}`)
  }

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    console.error(`[AI Research] Places API status "${data.status}" for "${query}": ${data.error_message || ''}`)
    throw new Error(`Places API error: ${data.status}`)
  }

  let places = data.results || []

  // Paginate: Google Text Search returns up to 20 results per page, max 3 pages (60 results)
  let nextPageToken = data.next_page_token
  let pageCount = 1

  while (nextPageToken && pageCount < 3) {
    // Google requires ~2 second delay before next_page_token becomes valid
    await new Promise(resolve => setTimeout(resolve, 2000))

    const pageParams = new URLSearchParams({
      pagetoken: nextPageToken,
      key: apiKey,
    })

    try {
      const pageResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?${pageParams}`
      )

      if (!pageResponse.ok) break

      const pageData = await pageResponse.json()
      if (pageData.status !== 'OK') break

      const pageResults = pageData.results || []
      places.push(...pageResults)
      nextPageToken = pageData.next_page_token
      pageCount++
    } catch {
      break
    }
  }

  console.log(`[AI Research] "${keyword}" → ${places.length} results (${pageCount} page${pageCount > 1 ? 's' : ''})`)

  return places.map((place: any) => ({
    name: place.name || '',
    place_id: place.place_id,
    geometry: {
      location: {
        lat: place.geometry?.location?.lat || 0,
        lng: place.geometry?.location?.lng || 0,
      },
    },
    types: place.types || [],
    formatted_address: place.formatted_address || '',
    _searchKeyword: keyword,
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
          score: 20, // Lower score for leads without emails (but still valid music orgs)
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
