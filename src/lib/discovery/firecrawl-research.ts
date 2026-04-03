/**
 * Firecrawl-powered Lead Discovery
 *
 * Replaces Google Places API for finding new music organizations.
 * Uses Firecrawl's /search endpoint to find orgs, then /scrape to extract contacts.
 *
 * Advantages over Google Places:
 * - No billing setup required (Firecrawl handles everything)
 * - Reads actual website content (not just business listings)
 * - AI-powered extraction works on any site layout
 * - Finds contacts Google Places doesn't index
 */

import FirecrawlApp from '@mendable/firecrawl-js'
import { prisma } from '@/lib/db'
import { enrichOrganization } from '@/lib/enrichment'
import type { AIResearchDiagnostics, AIResearchResult } from './ai-research'

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

// Music-specific search queries for Firecrawl
const SEARCH_QUERIES = [
  'choir',
  'a cappella group',
  'community chorus',
  'barbershop chorus',
  'Sweet Adelines chapter',
  'vocal ensemble',
  'youth choir',
  'music school',
  'choral society',
  'gospel choir',
]

// Max searches to prevent runaway costs (each search ≈ 1-5 credits)
const MAX_SEARCHES = 10
// Max orgs to enrich (each enrichment ≈ 1-3 credits)
const MAX_ENRICHMENT_CANDIDATES = 40

/**
 * Discover leads using Firecrawl search + scrape
 *
 * Flow:
 * 1. Search for music orgs near the campaign location
 * 2. Deduplicate by domain
 * 3. Scrape top candidates for contact info via enrichment pipeline
 * 4. Create leads in database
 */
export async function discoverWithFirecrawl(campaign: Campaign): Promise<AIResearchResult> {
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

  if (!apiKey) {
    const msg = 'FIRECRAWL_API_KEY not set - skipping Firecrawl discovery'
    console.warn(`[Firecrawl Research] ${msg}`)
    diagnostics.errors.push(msg)
    return { leads: [], diagnostics }
  }

  const client = new FirecrawlApp({ apiKey })
  const allResults: Array<{ title: string; url: string; description: string }> = []

  console.log(`[Firecrawl Research] Starting search: ${SEARCH_QUERIES.length} queries for "${campaign.baseLocation}"`)

  // Search for each music keyword
  for (const query of SEARCH_QUERIES) {
    if (diagnostics.apiCallsMade >= MAX_SEARCHES) {
      console.warn(`[Firecrawl Research] Reached max searches (${MAX_SEARCHES}), stopping`)
      break
    }

    diagnostics.apiCallsMade++
    const searchQuery = `${query} ${campaign.baseLocation}`

    try {
      const searchResult = await client.search(searchQuery, {
        limit: 10,
        scrapeOptions: { formats: ['markdown'] },
      }) as any

      // Handle various response shapes from Firecrawl SDK v4
      // v4 returns { web: [...] } for search results
      const data = searchResult?.web || searchResult?.data || searchResult?.results || (Array.isArray(searchResult) ? searchResult : [])

      if (data.length > 0) {
        const results = data.map((item: any) => ({
          title: item.title || item.metadata?.title || '',
          url: item.url || item.metadata?.sourceURL || '',
          description: item.description || item.markdown?.substring(0, 200) || '',
        }))

        diagnostics.keywordResults.push({ keyword: query, count: results.length })
        allResults.push(...results)
        console.log(`[Firecrawl Research] "${searchQuery}" → ${results.length} results`)
      } else {
        // Log raw response for debugging
        console.log(`[Firecrawl Research] "${searchQuery}" raw response keys:`, Object.keys(searchResult || {}))
        diagnostics.keywordResults.push({ keyword: query, count: 0, error: 'No results' })
        console.log(`[Firecrawl Research] "${searchQuery}" → 0 results`)
      }
    } catch (error) {
      diagnostics.apiCallsFailed++
      const errMsg = error instanceof Error ? error.message : String(error)
      diagnostics.keywordResults.push({ keyword: query, count: 0, error: errMsg })
      diagnostics.errors.push(`Search "${query}": ${errMsg}`)
      console.error(`[Firecrawl Research] Error searching "${query}":`, errMsg)
    }
  }

  diagnostics.rawPlaces = allResults.length
  console.log(`[Firecrawl Research] Found ${allResults.length} raw results from ${diagnostics.apiCallsMade} searches`)

  // If ALL searches failed, throw
  if (diagnostics.apiCallsFailed === diagnostics.apiCallsMade && diagnostics.apiCallsMade > 0) {
    const msg = `All ${diagnostics.apiCallsMade} Firecrawl searches failed. First error: ${diagnostics.errors[0] || 'unknown'}`
    throw new Error(msg)
  }

  // Deduplicate by domain (same org appears in multiple search results)
  const uniqueByDomain = deduplicateByDomain(allResults)
  diagnostics.uniquePlaces = uniqueByDomain.length
  console.log(`[Firecrawl Research] ${uniqueByDomain.length} unique domains (removed ${allResults.length - uniqueByDomain.length} dupes)`)

  // Filter for music relevance based on title and description
  const musicRelevant = uniqueByDomain.filter(r => isMusicRelevant(r.title, r.description))
  diagnostics.musicRelevant = musicRelevant.length
  console.log(`[Firecrawl Research] ${musicRelevant.length} music-relevant results`)

  if (musicRelevant.length === 0) {
    console.log('[Firecrawl Research] No music-relevant results found')
    return { leads: [], diagnostics }
  }

  // Take top candidates for enrichment
  const candidates = musicRelevant.slice(0, MAX_ENRICHMENT_CANDIDATES)
  console.log(`[Firecrawl Research] Enriching top ${candidates.length} candidates...`)

  // Enrich each candidate with contact info
  const leads: DiscoveredLead[] = []

  for (const candidate of candidates) {
    try {
      const orgName = extractOrgName(candidate.title)
      const enrichment = await enrichOrganization(candidate.url, null, orgName)

      diagnostics.enriched++

      if (enrichment.email) {
        leads.push({
          firstName: enrichment.firstName || 'Contact',
          lastName: enrichment.lastName || `at ${orgName}`,
          email: enrichment.email,
          phone: enrichment.phone,
          organization: orgName,
          source: 'AI_RESEARCH',
          latitude: campaign.latitude, // Use campaign center (no precise geo from Firecrawl)
          longitude: campaign.longitude,
          score: 30,
          distance: 0, // Unknown — will be scored by proximity to campaign center
          website: candidate.url,
          emailVerified: enrichment.emailVerified,
          needsEnrichment: false,
          enrichmentSource: enrichment.enrichmentSource || 'firecrawl',
          contactTitle: enrichment.contactTitle,
          editorialSummary: candidate.description.substring(0, 200) || null,
        })
      } else {
        // No email found — create with needsEnrichment flag
        const placeholderEmail = `needs-enrichment+${orgName.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 40)}@placeholder.local`

        leads.push({
          firstName: 'Contact',
          lastName: `at ${orgName}`,
          email: placeholderEmail,
          phone: enrichment.phone,
          organization: orgName,
          source: 'AI_RESEARCH',
          latitude: campaign.latitude,
          longitude: campaign.longitude,
          score: 20,
          distance: 0,
          website: candidate.url,
          emailVerified: false,
          needsEnrichment: true,
          enrichmentSource: null,
          contactTitle: enrichment.contactTitle,
          editorialSummary: candidate.description.substring(0, 200) || null,
        })
      }
    } catch (error) {
      console.error(`[Firecrawl Research] Failed to enrich ${candidate.url}:`, error instanceof Error ? error.message : error)
    }
  }

  // Deduplicate by org name
  const uniqueLeads = deduplicateByOrganization(leads)
  console.log(`[Firecrawl Research] ${uniqueLeads.length} unique leads after dedup`)

  // Create in database
  const createdLeads = await createLeadsInDatabase(uniqueLeads)
  diagnostics.leadsCreated = createdLeads.length

  console.log(`[Firecrawl Research] SUMMARY: ${diagnostics.apiCallsMade} searches, ${diagnostics.rawPlaces} raw → ${diagnostics.uniquePlaces} unique → ${diagnostics.musicRelevant} music → ${diagnostics.enriched} enriched → ${diagnostics.leadsCreated} leads`)

  return { leads: createdLeads, diagnostics }
}

/**
 * Check if a search result is music-relevant
 */
function isMusicRelevant(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase()

  // Positive signals
  const musicKeywords = [
    'choir', 'choral', 'chorus', 'chorale', 'a cappella', 'acappella',
    'barbershop', 'sweet adelines', 'harmony', 'vocal ensemble',
    'singers', 'singing', 'music school', 'conservatory',
    'gospel choir', 'youth choir', 'community choir',
    'music director', 'artistic director', 'conductor',
  ]

  const hasMusic = musicKeywords.some(kw => text.includes(kw))
  if (!hasMusic) return false

  // Negative signals (filter out noise)
  const excludeKeywords = [
    'haircut', 'barber shop', 'salon', 'grooming', 'shave',
    'restaurant', 'pizza', 'bar & grill',
    'real estate', 'plumbing', 'roofing',
  ]

  const isExcluded = excludeKeywords.some(kw => text.includes(kw))
  return !isExcluded
}

/**
 * Extract a clean org name from a search result title
 * "Ottawa Choral Society - Home" → "Ottawa Choral Society"
 */
function extractOrgName(title: string): string {
  // Remove common suffixes
  let name = title
    .replace(/\s*[-–—|]\s*(Home|About|Contact|Welcome|Official).*$/i, '')
    .replace(/\s*[-–—|]\s*Facebook$/i, '')
    .replace(/\s*[-–—|]\s*LinkedIn$/i, '')
    .replace(/\s*[-–—|]\s*YouTube$/i, '')
    .replace(/\s*[-–—|]\s*X$/i, '')
    .trim()

  // If name is too short after cleaning, use original
  if (name.length < 3) name = title.split(/[-–—|]/)[0].trim()

  return name || title
}

/**
 * Deduplicate search results by domain
 */
function deduplicateByDomain(results: Array<{ title: string; url: string; description: string }>) {
  const domainMap = new Map<string, typeof results[0]>()

  for (const result of results) {
    try {
      const domain = new URL(result.url).hostname.replace('www.', '')

      // Skip social media, directories, and generic sites
      const skipDomains = [
        'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
        'linkedin.com', 'youtube.com', 'tiktok.com',
        'yelp.com', 'yellowpages.com', 'bbb.org',
        'wikipedia.org', 'reddit.com',
        'eventbrite.com', 'meetup.com',
      ]
      if (skipDomains.some(sd => domain.includes(sd))) continue

      // Keep first occurrence per domain (usually highest ranked)
      if (!domainMap.has(domain)) {
        domainMap.set(domain, result)
      }
    } catch {
      // Invalid URL — skip
    }
  }

  return Array.from(domainMap.values())
}

/**
 * Deduplicate leads by org name (keep the one with more info)
 */
function deduplicateByOrganization(leads: DiscoveredLead[]): DiscoveredLead[] {
  const orgMap = new Map<string, DiscoveredLead>()

  for (const lead of leads) {
    const orgKey = lead.organization.toLowerCase()
    const existing = orgMap.get(orgKey)

    if (!existing) {
      orgMap.set(orgKey, lead)
    } else {
      // Keep the one with a real email over placeholder
      if (lead.email && !lead.email.includes('@placeholder.local') &&
          existing.email?.includes('@placeholder.local')) {
        orgMap.set(orgKey, lead)
      }
    }
  }

  return Array.from(orgMap.values())
}

/**
 * Create leads in database (upsert by email)
 */
async function createLeadsInDatabase(leads: DiscoveredLead[]): Promise<any[]> {
  const created = []

  for (const lead of leads) {
    try {
      const dbLead = await prisma.lead.upsert({
        where: { email: lead.email },
        update: {
          organization: lead.organization,
          ...(lead.website && { website: lead.website }),
          ...(lead.emailVerified !== undefined && { emailVerified: lead.emailVerified }),
          ...(lead.needsEnrichment !== undefined && { needsEnrichment: lead.needsEnrichment }),
          ...(lead.enrichmentSource && { enrichmentSource: lead.enrichmentSource }),
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
          website: lead.website || null,
          emailVerified: lead.emailVerified || false,
          needsEnrichment: lead.needsEnrichment || false,
          enrichmentSource: lead.enrichmentSource || null,
          contactTitle: lead.contactTitle || null,
          editorialSummary: lead.editorialSummary || null,
        },
      })

      created.push({
        ...dbLead,
        distance: lead.distance,
        source: lead.source,
        needsEnrichment: lead.needsEnrichment || false,
        emailVerified: lead.emailVerified || false,
      })
    } catch (error) {
      console.error(`[Firecrawl Research] Failed to create lead ${lead.email}:`, error)
    }
  }

  return created
}
