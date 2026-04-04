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
// BUDGET: 300 credits/month. Each search ≈ 1 credit, each enrichment ≈ 1-3 credits.
// Target: ~50 credits per campaign run max (allows ~6 campaigns/month).
//
// Strategy: Target contemporary vocal groups (pop, rock, jazz, a cappella).
// Avoid generic "choir" which drowns results in classical/scholastic noise.
// Boston area alone has hundreds of singing groups — these queries zero in on
// the ones most likely to book contemporary vocal coaching/arranging.
const SEARCH_QUERIES = [
  'a cappella group',
  'pop a cappella',
  'contemporary a cappella',
  'vocal group pop rock jazz',
  'barbershop chorus',
  'community singing group',
]

// Max searches to prevent runaway costs (each search ≈ 1 credit)
// Budget: ~50 credits per campaign. 6 queries × up to 3 location variants = 18 search credits max
const MAX_SEARCHES = 18
// Max orgs to enrich (each enrichment ≈ 1-3 credits, cap at ~20 = 20-60 credits)
const MAX_ENRICHMENT_CANDIDATES = 20

/**
 * Build search location strings from campaign data.
 *
 * Problem: "Endicott College, Massachusetts" is too specific — Firecrawl
 * searches for choirs AT the college, not choirs NEAR the college.
 *
 * Solution: Extract the city/state/region and search more broadly.
 * For larger radii, add nearby major city searches.
 */
function buildSearchLocations(campaign: Campaign): string[] {
  const base = campaign.baseLocation.trim()
  const locations: string[] = []

  // Venue/institution keywords — if the first part contains these, it's a venue not a city
  const venueKeywords = /\b(college|university|school|church|hall|center|centre|theatre|theater|arena|stadium|hotel|resort|club|academy|institute|auditorium|pavilion)\b/i

  const parts = base.split(',').map(p => p.trim())

  if (parts.length >= 3) {
    // "Venue, City, State" → use "City, State" and "near City State"
    const cityState = parts.slice(-2).join(', ')
    locations.push(cityState)
    locations.push(`near ${parts[parts.length - 2]} ${parts[parts.length - 1]}`)
  } else if (parts.length === 2) {
    const firstPart = parts[0]
    const secondPart = parts[1]

    if (venueKeywords.test(firstPart)) {
      // "Endicott College, Massachusetts" → venue + state, search state broadly
      // Use "near [state]" for broader results
      locations.push(secondPart)
      locations.push(`near ${firstPart} ${secondPart}`)
    } else {
      // "Beverly, Massachusetts" → city + state, use as-is
      locations.push(`${firstPart}, ${secondPart}`)
      locations.push(`near ${firstPart} ${secondPart}`)
    }
  } else {
    // Single string — use as-is
    locations.push(base)
  }

  // For larger radii (50+ miles), add state-level search for broader coverage
  if (campaign.radius >= 50) {
    const state = parts[parts.length - 1]
    if (state && state.length > 1 && !locations.includes(state)) {
      locations.push(state)
    }
  }

  // Deduplicate
  return [...new Set(locations)]
}

/**
 * Discover leads using Firecrawl search + scrape
 *
 * Flow:
 * 1. Build smart search locations from campaign (city/region, not venue)
 * 2. Search for music orgs across location variants
 * 3. Deduplicate by domain
 * 4. Scrape top candidates for contact info via enrichment pipeline
 * 5. Create leads in database
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

  // Build smart search locations (city/region, not venue name)
  const searchLocations = buildSearchLocations(campaign)
  console.log(`[Firecrawl Research] Starting search: ${SEARCH_QUERIES.length} queries × ${searchLocations.length} locations (${searchLocations.join(' | ')})`)

  // Search for each music keyword × location variant
  for (const query of SEARCH_QUERIES) {
    for (const location of searchLocations) {
      if (diagnostics.apiCallsMade >= MAX_SEARCHES) {
        console.warn(`[Firecrawl Research] Reached max searches (${MAX_SEARCHES}), stopping`)
        break
      }

      diagnostics.apiCallsMade++
      const searchQuery = `${query} ${location}`

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
    } // end location loop
    if (diagnostics.apiCallsMade >= MAX_SEARCHES) break
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
        // Filter out third-party SaaS/platform emails that aren't the org's own
        const thirdPartyDomains = [
          'mymusicstaff.com', 'groupanizer.com', 'placeholder.local',
          'wixpress.com', 'squarespace.com', 'wordpress.com',
          'mailchimp.com', 'constantcontact.com',
        ]
        const emailDomain = enrichment.email.split('@')[1]?.toLowerCase() || ''
        if (thirdPartyDomains.some(d => emailDomain.includes(d))) {
          console.log(`[Firecrawl Research] Skipping third-party email ${enrichment.email} for "${orgName}"`)
          continue
        }

        // Boost score for contemporary/performance groups
        const descText = `${orgName} ${candidate.description}`.toLowerCase()
        const genreSignals = ['a cappella', 'acappella', 'pop', 'rock', 'jazz', 'contemporary', 'barbershop', 'vocal band', 'show choir']
        const hasGenreBoost = genreSignals.some(s => descText.includes(s))
        const baseScore = enrichment.firstName && enrichment.firstName !== 'Contact' ? 40 : 30
        const score = hasGenreBoost ? baseScore + 10 : baseScore

        leads.push({
          firstName: enrichment.firstName || 'Contact',
          lastName: enrichment.lastName || `at ${orgName}`,
          email: enrichment.email,
          phone: enrichment.phone,
          organization: orgName,
          source: 'AI_RESEARCH',
          latitude: campaign.latitude, // Use campaign center (no precise geo from Firecrawl)
          longitude: campaign.longitude,
          score,
          distance: 0, // Unknown — will be scored by proximity to campaign center
          website: candidate.url,
          emailVerified: enrichment.emailVerified,
          needsEnrichment: false,
          enrichmentSource: enrichment.enrichmentSource || 'firecrawl',
          contactTitle: enrichment.contactTitle,
          editorialSummary: candidate.description.substring(0, 200) || null,
        })
      } else {
        // No email found — skip this lead entirely instead of creating garbage
        console.log(`[Firecrawl Research] No email found for "${orgName}" — skipping (not creating placeholder)`)
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
 * Check if a search result is music-relevant AND is an actual organization page
 * (not a PDF, news article, directory listing, or generic info page)
 */
function isMusicRelevant(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase()
  const lowerTitle = title.toLowerCase()

  // Reject non-organization content types
  if (lowerTitle.startsWith('[pdf]')) return false
  if (lowerTitle.startsWith('[doc]')) return false

  // Reject news articles (has article-like patterns)
  const newsPatterns = [
    'changing shape', 'new member spotlight', 'member profile',
    'article_', '/article/', '/news/', 'featured artist',
  ]
  if (newsPatterns.some(p => text.includes(p))) return false

  // Reject generic directory/listing pages (not the org's own site)
  const directoryPatterns = [
    'chapter directory', 'our regions', 'find a choir',
    'member directory', 'listing/', 'safe space alliance',
    'dirchap.asp',
  ]
  if (directoryPatterns.some(p => text.includes(p))) return false

  // Strong positive signals — contemporary/performance vocal groups
  const strongSignals = [
    'a cappella', 'acappella', 'a-cappella',
    'barbershop', 'sweet adelines', 'harmony inc',
    'pop', 'rock', 'jazz', 'contemporary',
    'vocal group', 'vocal ensemble', 'vocal band',
    'singing group', 'show choir',
  ]

  // Moderate positive signals — could be good leads, but need vetting
  const moderateSignals = [
    'chorus', 'chorale', 'singers', 'singing',
    'community choir', 'gospel choir', 'gospel',
    'music director', 'artistic director',
  ]

  const hasStrong = strongSignals.some(kw => text.includes(kw))
  const hasModerate = moderateSignals.some(kw => text.includes(kw))
  if (!hasStrong && !hasModerate) return false

  // Scholastic/institutional — reject unless they have a strong contemporary signal
  const scholasticKeywords = [
    'high school choir', 'middle school choir', 'elementary choir',
    'school music department', 'school district',
    'university choir', 'college choir', 'collegiate choir',
    'conservatory', 'music school',
    'youth orchestra', 'marching band',
  ]
  const isScholastic = scholasticKeywords.some(kw => text.includes(kw))
  if (isScholastic && !hasStrong) return false

  // Classical/traditional — reject unless they have a strong contemporary signal
  const classicalKeywords = [
    'classical', 'symphony', 'orchestra', 'opera',
    'choral society', 'bach', 'handel', 'mozart',
    'sacred music', 'hymn', 'liturgical',
    'early music', 'chamber choir', 'madrigal',
  ]
  const isClassical = classicalKeywords.some(kw => text.includes(kw))
  if (isClassical && !hasStrong) return false

  // Hard exclude — non-music businesses
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
 * "Home — Harmony Northshore" → "Harmony Northshore"
 */
function extractOrgName(title: string): string {
  // Remove [PDF] and similar prefixes
  let name = title
    .replace(/^\[PDF\]\s*/i, '')
    .replace(/^\[DOC\]\s*/i, '')

  // Remove common suffixes (after separators)
  name = name
    .replace(/\s*[-–—|:]\s*(Home|About|Contact|Welcome|Official|Overview|Website|Site|Page).*$/i, '')
    .replace(/\s*[-–—|]\s*Facebook$/i, '')
    .replace(/\s*[-–—|]\s*LinkedIn$/i, '')
    .replace(/\s*[-–—|]\s*YouTube$/i, '')
    .replace(/\s*[-–—|]\s*X$/i, '')
    .replace(/\s*[-–—|]\s*Rackcdn\.com$/i, '')
    .replace(/\s*[-–—|]\s*Safe Space Alliance$/i, '')
    .trim()

  // Remove leading "Home —", "Welcome to ", "About —" etc.
  name = name
    .replace(/^(?:Home|Welcome|About|Contact)\s*[-–—|:]\s*/i, '')
    .replace(/^Welcome\s+to\s+(?:the\s+)?/i, '')
    .trim()

  // Remove trailing location/context after pipes/dashes (e.g. "Chorus | Ottawa, ON | Community Choir of the ...")
  // Keep only the first segment if it looks like a real org name
  const segments = name.split(/\s*[|]\s*/)
  if (segments.length > 1) {
    // Use first segment if it's substantial, otherwise try combining first two
    const first = segments[0].trim()
    if (first.length >= 5) {
      name = first
    }
  }

  // Remove trailing " - City, ST" or " - Province" patterns
  name = name.replace(/\s*[-–—]\s*[A-Z][a-z]+(?:,\s*[A-Z]{2})?\s*$/, '').trim()

  // Remove trailing ellipsis and truncated text
  name = name.replace(/\s*\.{3}\s*$/, '').replace(/\s*…\s*$/, '').trim()

  // Remove "New Member Spotlight:" and similar article prefixes
  name = name.replace(/^(?:New Member Spotlight|Member Profile|Featured|Spotlight|Article|News):\s*/i, '').trim()

  // Remove " changing shape" and similar news article suffixes
  name = name.replace(/\s+changing\s+.*$/i, '').trim()

  // If name is too short after cleaning, use original first segment
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

      // Skip social media, directories, generic sites, and non-org domains
      const skipDomains = [
        'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
        'linkedin.com', 'youtube.com', 'tiktok.com',
        'yelp.com', 'yellowpages.com', 'bbb.org',
        'wikipedia.org', 'reddit.com',
        'eventbrite.com', 'meetup.com',
        // News/media sites
        'gloucestertimes.com', 'cbc.ca', 'ottawacitizen.com',
        // PDF/CDN hosts
        'rackcdn.com', 'cloudfront.net',
        // Generic directories
        'safespacealliance.com', 'nac-cna.ca',
        'northshorechamber.org', // Chamber of commerce listings
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
