/**
 * AI Research Discovery (Firecrawl Search)
 *
 * Discovers new leads by searching the web via Firecrawl API.
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
const MUSIC_KEYWORDS = [
  // Vocal music groups (specific organizations to avoid haircut barbershops)
  'choir',
  'chorus',
  'chorale',
  'Sweet Adelines',
  'Barbershop Harmony Society',
  'a cappella group',
  'vocal ensemble',
  'community chorus',

  // Youth music education
  'high school choir',
  'music school',
]

// Firecrawl search result shape
interface FirecrawlSearchResult {
  url: string
  title: string
  description: string
  _searchKeyword?: string
}

/**
 * Search the web using Firecrawl API
 */
async function firecrawlSearch(
  query: string,
  apiKey: string,
  limit: number = 10
): Promise<FirecrawlSearchResult[]> {
  const response = await fetch('https://api.firecrawl.dev/v1/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, limit }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'unknown')
    throw new Error(`Firecrawl search error: ${response.status} ${response.statusText} - ${errorBody}`)
  }

  const data = await response.json()

  if (!data.success) {
    throw new Error(`Firecrawl search failed: ${data.error || 'unknown'}`)
  }

  return (data.data || []).map((item: any) => ({
    url: item.url || '',
    title: item.title || '',
    description: item.description || '',
  }))
}

/**
 * Extract a clean organization name from a search result title
 * Strips common suffixes like " - Home", " | Official Site", etc.
 */
function extractOrgName(title: string): string {
  return title
    .replace(/\s*[-–—|]\s*(Home|Homepage|Official\s+Site|Official\s+Website|Welcome|About(\s+Us)?|Contact(\s+Us)?|Main\s+Page).*$/i, '')
    .replace(/\s*[-–—|]\s*$/, '')
    .trim()
}

// In-memory geocoding cache
const geocodeCache = new Map<string, { lat: number; lng: number } | null>()

/**
 * Geocode an address using free Nominatim API (OpenStreetMap)
 * Rate limited to 1 request/second per Nominatim policy
 */
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (geocodeCache.has(address)) {
    return geocodeCache.get(address) || null
  }

  try {
    const params = new URLSearchParams({
      q: address,
      format: 'json',
      limit: '1',
    })

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          'User-Agent': 'DekeBot/1.0 (contact enrichment)',
        },
      }
    )

    if (!response.ok) {
      geocodeCache.set(address, null)
      return null
    }

    const results = await response.json()
    if (results.length === 0) {
      geocodeCache.set(address, null)
      return null
    }

    const coords = {
      lat: parseFloat(results[0].lat),
      lng: parseFloat(results[0].lon),
    }

    geocodeCache.set(address, coords)
    return coords
  } catch {
    geocodeCache.set(address, null)
    return null
  }
}

/**
 * Try to extract an address-like string from a search result description
 */
function extractAddressHint(description: string, title: string): string | null {
  // Look for patterns like "123 Main St", "City, State", zip codes
  const addressPattern = /\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*(?:St|Ave|Blvd|Dr|Rd|Ln|Way|Ct|Pl|Pkwy|Cir)\b[^.]*(?:,\s*[A-Z]{2}\s+\d{5})?/i
  const match = description.match(addressPattern)
  if (match) return match[0]

  // Look for "City, State" pattern
  const cityStatePattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})\b/
  const csMatch = description.match(cityStatePattern)
  if (csMatch) return csMatch[0]

  // Fall back to org name as a search hint
  return null
}

/**
 * Calculate music relevance score for a search result
 *
 * Higher scores indicate stronger music focus and better lead quality
 *
 * @param name - Organization name from search result
 * @returns Music relevance score (0-35 points, or -1 if excluded)
 */
function calculateMusicRelevance(name: string): number {
  let score = 0
  const lowerName = name.toLowerCase()

  // CRITICAL: Exclude haircut barbershops (return -1 to signal explicit exclusion)
  const haircutKeywords = /\bcut\b|\bhaircut\b|\bbarber\s*shop\b|\bgrooming\b|\bshave\b|\bfade\b|\btrim\b|\bsalon\b|\brazor\b/i
  if (haircutKeywords.test(name)) {
    return -1 // Not a music organization - it's a haircut place
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
 * Deduplicate search results by normalized URL
 */
function deduplicateByUrl(results: FirecrawlSearchResult[]): FirecrawlSearchResult[] {
  const urlMap = new Map<string, FirecrawlSearchResult & { _searchKeywords: string[] }>()

  for (const result of results) {
    if (!result.url) continue

    // Normalize URL: strip protocol, www, trailing slash
    const normalized = result.url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/+$/, '')
      .toLowerCase()

    if (!urlMap.has(normalized)) {
      urlMap.set(normalized, { ...result, _searchKeywords: [result._searchKeyword || ''] })
    } else {
      const existing = urlMap.get(normalized)!
      if (result._searchKeyword && !existing._searchKeywords.includes(result._searchKeyword)) {
        existing._searchKeywords.push(result._searchKeyword)
      }
    }
  }

  return Array.from(urlMap.values())
}

// Maximum API calls to prevent runaway costs
const MAX_API_CALLS = 200

/**
 * Search Firecrawl for organizations in the campaign area
 *
 * @param campaign - Campaign with location and radius
 * @returns Array of discovered leads
 */
export async function discoverAIResearch(campaign: Campaign): Promise<AIResearchResult> {
  const apiKey = process.env.FIRECRAWL_API_KEY

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
    const msg = 'FIRECRAWL_API_KEY not set - skipping AI research discovery'
    console.warn(msg)
    diagnostics.errors.push(msg)
    return { leads: [], diagnostics }
  }

  const allResults: FirecrawlSearchResult[] = []

  console.log(`[AI Research] Starting Firecrawl search: ${MUSIC_KEYWORDS.length} keywords, location="${campaign.baseLocation}"`)

  // Search for each music keyword
  for (const keyword of MUSIC_KEYWORDS) {
    if (diagnostics.apiCallsMade >= MAX_API_CALLS) {
      console.warn(`[AI Research] Reached MAX_API_CALLS limit (${MAX_API_CALLS}), stopping search`)
      break
    }

    diagnostics.apiCallsMade++
    try {
      const query = `${keyword} in ${campaign.baseLocation}`
      const results = await firecrawlSearch(query, apiKey, 10)

      // Tag each result with the keyword that found it
      const tagged = results.map(r => ({ ...r, _searchKeyword: keyword }))

      diagnostics.keywordResults.push({ keyword, count: results.length })
      allResults.push(...tagged)
    } catch (error) {
      diagnostics.apiCallsFailed++
      const errMsg = error instanceof Error ? error.message : String(error)
      diagnostics.keywordResults.push({ keyword, count: 0, error: errMsg })
      diagnostics.errors.push(`Keyword "${keyword}": ${errMsg}`)
      console.error(`[AI Research] Error searching for "${keyword}":`, errMsg)
    }
  }

  diagnostics.rawPlaces = allResults.length
  console.log(`[AI Research] Found ${allResults.length} raw results from ${diagnostics.apiCallsMade} API calls (${diagnostics.apiCallsFailed} failed)`)

  // If ALL keyword searches failed, throw with aggregated error
  if (diagnostics.apiCallsFailed === diagnostics.apiCallsMade && diagnostics.apiCallsMade > 0) {
    const aggregatedMsg = `All ${diagnostics.apiCallsMade} Firecrawl API calls failed. First error: ${diagnostics.errors[0] || 'unknown'}`
    console.error(`[AI Research] FATAL: ${aggregatedMsg}`)
    throw new Error(aggregatedMsg)
  }

  // Deduplicate by URL
  const uniqueResults = deduplicateByUrl(allResults)
  diagnostics.uniquePlaces = uniqueResults.length

  console.log(
    `[AI Research] ${uniqueResults.length} unique results (removed ${allResults.length - uniqueResults.length} duplicates)`
  )

  // Music-specific keywords that provide strong signal
  const MUSIC_SPECIFIC_KEYWORDS = [
    'choir', 'chorus', 'chorale', 'a cappella', 'vocal ensemble',
    'gospel choir', 'community chorus', 'youth choir', 'high school choir',
    'middle school choir', 'sweet adelines', 'harmony inc',
    'barbershop harmony society', 'bhs chorus', 'casa a cappella',
  ]

  // Geocode results and score by music relevance
  console.log('[AI Research] Geocoding search results...')

  const scoredResults = []
  for (const result of uniqueResults) {
    const orgName = extractOrgName(result.title)
    if (!orgName) continue

    let musicScore = calculateMusicRelevance(orgName)

    // Also check the description for music relevance if name alone doesn't score
    if (musicScore === 0) {
      const descScore = calculateMusicRelevance(result.description)
      if (descScore > 0) {
        musicScore = Math.max(musicScore, Math.floor(descScore / 2)) // Half credit from description
      }
    }

    // Keyword trust boost (same logic as before)
    if (musicScore >= 0 && musicScore < 10 && (result as any)._searchKeywords) {
      const hasSpecificKeyword = (result as any)._searchKeywords.some((kw: string) =>
        MUSIC_SPECIFIC_KEYWORDS.some(mk => kw.toLowerCase().includes(mk))
      )
      if (hasSpecificKeyword) {
        musicScore = Math.max(musicScore, 10)
      }
    }

    // Try to geocode
    const addressHint = extractAddressHint(result.description, result.title)
    let coords: { lat: number; lng: number } | null = null

    if (addressHint) {
      coords = await geocodeAddress(addressHint)
      // Nominatim rate limit: 1 req/sec
      await new Promise(resolve => setTimeout(resolve, 1100))
    }

    // If no address found in description, try geocoding the org name + location
    if (!coords) {
      coords = await geocodeAddress(`${orgName} ${campaign.baseLocation}`)
      await new Promise(resolve => setTimeout(resolve, 1100))
    }

    // Fall back to campaign center if geocoding fails
    const lat = coords?.lat ?? campaign.latitude
    const lng = coords?.lng ?? campaign.longitude

    const distance = haversineDistance(campaign.latitude, campaign.longitude, lat, lng)

    scoredResults.push({
      name: orgName,
      url: result.url,
      description: result.description,
      geometry: { location: { lat, lng } },
      _searchKeywords: (result as any)._searchKeywords || [result._searchKeyword],
      musicScore,
      proximityScore: calculateProximityBonus(distance, campaign.radius),
      distance,
    })
  }

  // Filter: ONLY organizations with strong music relevance (score >= 10)
  const maxDistance = campaign.radius * 2
  const musicOrgs = scoredResults.filter((p) => p.musicScore >= 10 && p.distance <= maxDistance)
  diagnostics.musicRelevant = musicOrgs.length

  const filteredOut = scoredResults.length - musicOrgs.length
  console.log(
    `[AI Research] ${musicOrgs.length} music-relevant organizations (${filteredOut} filtered out)`
  )

  if (musicOrgs.length === 0 && scoredResults.length > 0) {
    const warnMsg = `Found ${scoredResults.length} results but music relevance filter removed all of them. Top titles: ${scoredResults.slice(0, 5).map(p => p.name).join(', ')}`
    diagnostics.errors.push(warnMsg)
    console.warn(`[AI Research] WARNING: ${warnMsg}`)
    return { leads: [], diagnostics }
  }

  if (musicOrgs.length === 0) {
    console.log('[AI Research] No music-relevant results found — returning empty')
    return { leads: [], diagnostics }
  }

  // Sort by combined score
  const sorted = musicOrgs.sort(
    (a, b) => b.musicScore + b.proximityScore - (a.musicScore + a.proximityScore)
  )

  // Limit to top candidates for enrichment
  const MAX_ENRICHMENT_CANDIDATES = 50
  const topResults = sorted.slice(0, MAX_ENRICHMENT_CANDIDATES)

  console.log(`[AI Research] Top ${topResults.length} music organizations selected for enrichment`)

  // Enrich top results with REAL contact information via Firecrawl scraping
  console.log('[AI Research] Enriching via Firecrawl website scraping...')

  const enrichedPlaces: any[] = []
  const ENRICHMENT_BATCH_SIZE = 20

  for (let i = 0; i < topResults.length; i += ENRICHMENT_BATCH_SIZE) {
    const batch = topResults.slice(i, i + ENRICHMENT_BATCH_SIZE)
    const batchResults = await Promise.all(
      batch.map(async (result) => {
        diagnostics.apiCallsMade++
        return {
          ...result,
          website: result.url,
          phone: null, // Firecrawl search doesn't provide phone; enrichment will find it
          editorialSummary: result.description || null,
          googleRating: null,
        }
      })
    )
    enrichedPlaces.push(...batchResults)
  }

  diagnostics.enriched = enrichedPlaces.length
  console.log(`[AI Research] ${enrichedPlaces.length} results prepared for contact enrichment`)

  // Convert to leads with website enrichment for real contacts
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
 * Batch convert search results to Leads with REAL enrichment
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
          // New fields from scraper
          ...(lead.contactTitle && { contactTitle: lead.contactTitle }),
          ...(lead.editorialSummary && { editorialSummary: lead.editorialSummary }),
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
          // New fields from scraper
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
