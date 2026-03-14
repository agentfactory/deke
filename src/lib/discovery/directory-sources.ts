/**
 * Directory-Based Discovery Sources
 *
 * Discovers choral/a cappella groups from specialized music directories
 * that Google Maps/Places API misses. These directories are the PRIMARY
 * source for comprehensive lead discovery — Google Maps only returns
 * groups with active GMB listings (~7 results), while directories like
 * CAMMAC contain 40+ groups per region.
 *
 * Sources:
 * 1. CAMMAC regional choir directories (cammac.ca)
 * 2. BHS chapter finder (ontariosings.com / barbershop.org)
 * 3. Sweet Adelines chapter locator (sweetadelines.com)
 * 4. Choirs Ontario member directory (choirsontario.org)
 * 5. ACDA chapter finder (acda.org)
 * 6. Chorus America (chorusamerica.org)
 *
 * Key lesson: Google Maps only returns groups with active, optimized GMB
 * listings. These directories are the primary scrape targets.
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

export interface DirectoryLead {
  firstName: string
  lastName: string
  email: string
  phone: string | null
  organization: string
  source: 'DIRECTORY_RESEARCH'
  latitude: number | null
  longitude: number | null
  score: number
  distance: number | null
  website: string | null
  emailVerified: boolean
  needsEnrichment: boolean
  enrichmentSource: string | null
  contactTitle: string | null
  directorySource: string
  groupType: string | null
}

export interface DirectoryDiagnostics {
  directoriesSearched: number
  directoriesFailed: number
  rawGroups: number
  enriched: number
  leadsCreated: number
  directoryResults: Array<{ directory: string; count: number; error?: string }>
  errors: string[]
}

export interface DirectoryResearchResult {
  leads: DirectoryLead[]
  diagnostics: DirectoryDiagnostics
}

/**
 * Directory source configuration
 *
 * Each directory has a search URL pattern, a region mapping,
 * and a parser function for extracting group names from results.
 */
interface DirectorySource {
  name: string
  /** Build search URLs for the given location */
  buildSearchUrls: (location: string, region: string, country: string) => string[]
  /** Parse HTML content to extract group entries */
  parseGroups: (html: string, location: string) => ParsedGroup[]
  /** Which countries/regions this directory covers */
  coverage: string[]
}

interface ParsedGroup {
  name: string
  type: string | null
  website: string | null
  location: string | null
  notes: string | null
}

// ============================================================
// Region Detection
// ============================================================

interface RegionInfo {
  city: string
  province: string
  country: 'CA' | 'US' | 'OTHER'
  region: string // e.g., "Ontario", "Quebec", "New England"
}

/**
 * Extract region info from a campaign's baseLocation string
 */
function detectRegion(baseLocation: string): RegionInfo {
  const loc = baseLocation.toLowerCase()

  // Canadian provinces
  const caProvinces: Record<string, string> = {
    'ontario': 'Ontario', 'on': 'Ontario',
    'quebec': 'Quebec', 'qc': 'Quebec', 'québec': 'Quebec',
    'british columbia': 'British Columbia', 'bc': 'British Columbia',
    'alberta': 'Alberta', 'ab': 'Alberta',
    'manitoba': 'Manitoba', 'mb': 'Manitoba',
    'saskatchewan': 'Saskatchewan', 'sk': 'Saskatchewan',
    'nova scotia': 'Nova Scotia', 'ns': 'Nova Scotia',
    'new brunswick': 'New Brunswick', 'nb': 'New Brunswick',
    'prince edward island': 'Prince Edward Island', 'pei': 'Prince Edward Island',
    'newfoundland': 'Newfoundland', 'nl': 'Newfoundland',
    'gatineau': 'Quebec', 'hull': 'Quebec',
    'ottawa': 'Ontario', 'toronto': 'Ontario', 'hamilton': 'Ontario',
    'vancouver': 'British Columbia', 'victoria': 'British Columbia',
    'montreal': 'Quebec', 'montréal': 'Quebec',
    'calgary': 'Alberta', 'edmonton': 'Alberta',
    'winnipeg': 'Manitoba',
  }

  // US states / regions
  const usRegions: Record<string, string> = {
    'new york': 'Mid-Atlantic', 'ny': 'Mid-Atlantic',
    'new jersey': 'Mid-Atlantic', 'nj': 'Mid-Atlantic',
    'pennsylvania': 'Mid-Atlantic', 'pa': 'Mid-Atlantic',
    'massachusetts': 'New England', 'ma': 'New England',
    'connecticut': 'New England', 'ct': 'New England',
    'california': 'Far Western', 'ca': 'Far Western',
    'texas': 'Southwestern', 'tx': 'Southwestern',
    'florida': 'Southeastern', 'fl': 'Southeastern',
    'illinois': 'Central States', 'il': 'Central States',
    'ohio': 'Johnny Appleseed', 'oh': 'Johnny Appleseed',
    'michigan': 'Pioneer', 'mi': 'Pioneer',
    'georgia': 'Dixie', 'ga': 'Dixie',
    'north carolina': 'Dixie', 'nc': 'Dixie',
    'virginia': 'Mid-Atlantic', 'va': 'Mid-Atlantic',
    'washington': 'Evergreen', 'wa': 'Evergreen',
    'oregon': 'Evergreen', 'or': 'Evergreen',
    'colorado': 'Rocky Mountain', 'co': 'Rocky Mountain',
    'minnesota': 'Land O\' Lakes', 'mn': 'Land O\' Lakes',
    'wisconsin': 'Land O\' Lakes', 'wi': 'Land O\' Lakes',
    'arizona': 'Far Western', 'az': 'Far Western',
  }

  // Check Canadian provinces first
  for (const [key, province] of Object.entries(caProvinces)) {
    if (loc.includes(key)) {
      const city = baseLocation.split(',')[0].trim()
      return { city, province, country: 'CA', region: province }
    }
  }

  // Check US regions
  for (const [key, region] of Object.entries(usRegions)) {
    if (loc.includes(key)) {
      const city = baseLocation.split(',')[0].trim()
      return { city, province: key, country: 'US', region }
    }
  }

  // Default: treat as US
  const city = baseLocation.split(',')[0].trim()
  return { city, province: '', country: 'US', region: '' }
}

// ============================================================
// HTML Parsing Utilities
// ============================================================

/**
 * Strip HTML tags to get plain text
 */
function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|li|tr|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

/**
 * Extract href URLs from HTML anchor tags
 */
function extractLinks(html: string): Array<{ href: string; text: string }> {
  const links: Array<{ href: string; text: string }> = []
  const linkRegex = /<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let match
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1]
    const text = stripHtml(match[2]).trim()
    if (href && text) {
      links.push({ href, text })
    }
  }
  return links
}

/**
 * Fetch page with timeout and user-agent
 */
async function fetchDirectoryPage(url: string, timeoutMs: number = 10000): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.warn(`[Directory] HTTP ${response.status} for ${url}`)
      return null
    }

    const text = await response.text()
    return text.substring(0, 500_000) // Limit to 500KB for directory pages
  } catch (error) {
    console.warn(`[Directory] Failed to fetch ${url}:`, error instanceof Error ? error.message : String(error))
    return null
  }
}

// ============================================================
// Directory Source: Generic Web Search
// ============================================================

/**
 * Parse choir/choral group listings from a generic web page
 *
 * Looks for patterns like:
 * - Organization names followed by descriptions
 * - Lists of groups with links
 * - Table rows with group info
 */
function parseGenericChoralPage(html: string, targetCity: string): ParsedGroup[] {
  const groups: ParsedGroup[] = []
  const seen = new Set<string>()

  // Extract links that look like choir/group names
  const links = extractLinks(html)
  for (const link of links) {
    const name = link.text
    if (name.length < 3 || name.length > 100) continue
    if (seen.has(name.toLowerCase())) continue

    // Check if the link text looks like a music group name
    if (isLikelyMusicGroup(name)) {
      seen.add(name.toLowerCase())
      groups.push({
        name,
        type: classifyGroupType(name),
        website: link.href.startsWith('http') ? link.href : null,
        location: targetCity,
        notes: null,
      })
    }
  }

  // Also scan plain text for group names near music keywords
  const text = stripHtml(html)
  const lines = text.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length < 5 || trimmed.length > 120) continue

    // Look for lines that are group names (capitalized, contain music keywords)
    if (isLikelyMusicGroup(trimmed) && !seen.has(trimmed.toLowerCase())) {
      seen.add(trimmed.toLowerCase())
      groups.push({
        name: trimmed,
        type: classifyGroupType(trimmed),
        website: null,
        location: targetCity,
        notes: null,
      })
    }
  }

  return groups
}

/**
 * Check if a string looks like a music group name
 */
function isLikelyMusicGroup(name: string): boolean {
  const lower = name.toLowerCase()

  const musicKeywords = [
    'choir', 'chorus', 'chorale', 'choral',
    'a cappella', 'acappella', 'a-cappella',
    'barbershop', 'sweet adelines', 'harmony',
    'singers', 'vocal', 'ensemble',
    'carollers', 'carolers',
    'glee', 'cantata',
    'chœur', 'choeur', // French
  ]

  return musicKeywords.some(kw => lower.includes(kw))
}

/**
 * Classify a group's type based on its name
 */
function classifyGroupType(name: string): string {
  const lower = name.toLowerCase()

  if (/barbershop|bhs|spebsqsa/.test(lower)) return 'barbershop'
  if (/sweet adelines|sai/.test(lower)) return 'sweet_adelines'
  if (/harmony inc|harmony incorporated/.test(lower)) return 'harmony_inc'
  if (/a\s?cappella|acappella/.test(lower)) return 'a_cappella'
  if (/gospel/.test(lower)) return 'gospel'
  if (/youth|children|junior|kids/.test(lower)) return 'youth'
  if (/university|college|student/.test(lower)) return 'university'
  if (/community/.test(lower)) return 'community'
  if (/men'?s|male/.test(lower)) return 'mens'
  if (/women'?s|ladies|female/.test(lower)) return 'womens'
  if (/church|cathedral|parish/.test(lower)) return 'church'

  return 'choir'
}

// ============================================================
// Directory Sources Configuration
// ============================================================

const DIRECTORY_SOURCES: DirectorySource[] = [
  // 1. CAMMAC — Canadian choirs directory (cammac.ca)
  {
    name: 'CAMMAC',
    coverage: ['CA'],
    buildSearchUrls: (_location, region, _country) => {
      const urls: string[] = []
      // CAMMAC has regional pages for each province
      const regionSlugs: Record<string, string[]> = {
        'Ontario': ['ottawa-gatineau', 'toronto', 'ontario'],
        'Quebec': ['montreal', 'quebec', 'ottawa-gatineau'],
        'British Columbia': ['british-columbia', 'vancouver'],
        'Alberta': ['alberta', 'calgary', 'edmonton'],
        'Manitoba': ['manitoba', 'winnipeg'],
      }

      const slugs = regionSlugs[region] || [region.toLowerCase().replace(/\s+/g, '-')]
      for (const slug of slugs) {
        urls.push(`https://www.cammac.ca/en/choirs-and-choruses/${slug}/`)
        urls.push(`https://www.cammac.ca/en/find-a-choir/${slug}/`)
      }
      // Also try the main directory
      urls.push('https://www.cammac.ca/en/choirs-and-choruses/')
      return urls
    },
    parseGroups: (html, location) => parseGenericChoralPage(html, location),
  },

  // 2. BHS Chapter Finder (barbershop.org / ontariosings.com)
  {
    name: 'BHS Chapter Finder',
    coverage: ['US', 'CA'],
    buildSearchUrls: (_location, region, country) => {
      const urls: string[] = []
      if (country === 'CA') {
        // Ontario District
        urls.push('https://ontariosings.com/chapters/')
        urls.push('https://ontariosings.com/find-a-chapter/')
        urls.push('https://ontariosings.com/choruses/')
      }
      urls.push('https://www.barbershop.org/find-a-chapter')
      urls.push(`https://www.barbershop.org/find-a-chapter?q=${encodeURIComponent(_location)}`)
      return urls
    },
    parseGroups: (html, location) => {
      const groups = parseGenericChoralPage(html, location)
      // Ensure all BHS groups are tagged as barbershop
      return groups.map(g => ({
        ...g,
        type: g.type || 'barbershop',
      }))
    },
  },

  // 3. Sweet Adelines Chapter Locator
  {
    name: 'Sweet Adelines',
    coverage: ['US', 'CA'],
    buildSearchUrls: (location, _region, _country) => {
      return [
        `https://sweetadelines.com/find-a-chapter?search=${encodeURIComponent(location)}`,
        'https://sweetadelines.com/find-a-chapter',
      ]
    },
    parseGroups: (html, location) => {
      const groups = parseGenericChoralPage(html, location)
      return groups.map(g => ({
        ...g,
        type: 'sweet_adelines',
      }))
    },
  },

  // 4. Choirs Ontario Member Directory
  {
    name: 'Choirs Ontario',
    coverage: ['CA'],
    buildSearchUrls: (location, _region, _country) => {
      return [
        'https://www.choirsontario.org/find-a-choir',
        `https://www.choirsontario.org/find-a-choir?city=${encodeURIComponent(location)}`,
        'https://www.choirsontario.org/member-directory',
      ]
    },
    parseGroups: (html, location) => parseGenericChoralPage(html, location),
  },

  // 5. Chorus America Member Directory
  {
    name: 'Chorus America',
    coverage: ['US', 'CA'],
    buildSearchUrls: (location, _region, _country) => {
      return [
        `https://www.chorusamerica.org/find-a-chorus?search=${encodeURIComponent(location)}`,
        'https://www.chorusamerica.org/find-a-chorus',
      ]
    },
    parseGroups: (html, location) => parseGenericChoralPage(html, location),
  },

  // 6. ACDA (American Choral Directors Association) — US only
  {
    name: 'ACDA',
    coverage: ['US'],
    buildSearchUrls: (location, _region, _country) => {
      return [
        `https://acda.org/find-a-choir/?search=${encodeURIComponent(location)}`,
      ]
    },
    parseGroups: (html, location) => parseGenericChoralPage(html, location),
  },

  // 7. CASA Acapedia — Contemporary A Cappella Society group directory (2,400+ profiles)
  // Deke Sharon founded CASA, so this is a primary source for a cappella groups.
  // The Acapedia wiki has group profiles with school/affiliation, rosters, and history.
  // Note: casa.org may block automated requests; we try multiple URL patterns and
  // fall back to Google search for CASA-listed groups in the area.
  {
    name: 'CASA Acapedia',
    coverage: ['US', 'CA'],
    buildSearchUrls: (location, region, _country) => {
      const encodedLocation = encodeURIComponent(location)
      const urls: string[] = []

      // Acapedia main directory and category pages
      urls.push('https://casa.org/acapedia')
      urls.push('https://www.casa.org/acapedia')

      // Regional/state pages (CASA uses state abbreviations and full names)
      if (region) {
        const encodedRegion = encodeURIComponent(region)
        urls.push(`https://www.casa.org/${encodedRegion}`)
        urls.push(`https://casa.org/${encodedRegion}`)
      }

      // Group category pages
      urls.push('https://www.casa.org/acappella/all-male')
      urls.push('https://www.casa.org/acappella/all-female')
      urls.push('https://www.casa.org/acappella/mixed')
      urls.push('https://www.casa.org/acappella/collegiate')

      // Search-style queries via Google for CASA-listed groups in the area
      urls.push(`https://www.google.com/search?q=site:casa.org+${encodedLocation}+a+cappella+group`)
      urls.push(`https://www.google.com/search?q=CASA+acapedia+${encodedLocation}+a+cappella`)

      return urls
    },
    parseGroups: (html, location) => {
      const groups = parseGenericChoralPage(html, location)
      // Tag all CASA groups as a cappella by default (CASA is an a cappella organization)
      return groups.map(g => ({
        ...g,
        type: g.type || 'a_cappella',
      }))
    },
  },

  // 8. Collegiate A Cappella Directory (collegiate-acappella.com)
  // Comprehensive directory of college a cappella groups — complementary to CASA.
  {
    name: 'Collegiate A Cappella',
    coverage: ['US', 'CA'],
    buildSearchUrls: (location, _region, _country) => {
      const encodedLocation = encodeURIComponent(location)
      return [
        'https://www.collegiate-acappella.com/CA-DirectoryA-G.html',
        'https://www.collegiate-acappella.com/CA-DirectoryH-N.html',
        'https://www.collegiate-acappella.com/CA-DirectoryO-Z.html',
        `https://www.google.com/search?q=site:collegiate-acappella.com+${encodedLocation}`,
      ]
    },
    parseGroups: (html, location) => {
      const groups = parseGenericChoralPage(html, location)
      return groups.map(g => ({
        ...g,
        type: g.type || 'a_cappella',
      }))
    },
  },
]

/**
 * Additional web search queries to supplement directory scraping
 *
 * These target pages that aggregate choir listings for specific cities,
 * such as Reddit threads, blog posts, and regional choir council pages.
 */
function buildSupplementarySearchUrls(city: string, region: string, country: string): string[] {
  const urls: string[] = []
  const encodedCity = encodeURIComponent(city)

  // Google search for choir listings (scrape search results page)
  // Note: This works for getting well-structured directory pages
  urls.push(`https://www.google.com/search?q=${encodedCity}+choirs+and+choruses+directory`)
  urls.push(`https://www.google.com/search?q=${encodedCity}+a+cappella+groups`)
  urls.push(`https://www.google.com/search?q=${encodedCity}+barbershop+chorus`)

  if (country === 'CA') {
    urls.push(`https://www.google.com/search?q=CAMMAC+${encodedCity}+choirs`)
    urls.push(`https://www.google.com/search?q=choirs+ontario+${encodedCity}`)
  }

  // CASA / a cappella specific searches (global)
  urls.push(`https://www.google.com/search?q=CASA+a+cappella+groups+near+${encodedCity}`)
  urls.push(`https://www.google.com/search?q=${encodedCity}+collegiate+a+cappella+groups`)

  return urls
}

// ============================================================
// Main Discovery Function
// ============================================================

/**
 * Discover leads from specialized choral/a cappella directories
 *
 * This is the PRIMARY discovery source for comprehensive lead generation.
 * Google Maps/Places is supplementary — it only returns groups with active GMB listings.
 *
 * @param campaign - Campaign with location and radius
 * @returns Array of discovered leads with diagnostics
 */
export async function discoverFromDirectories(campaign: Campaign): Promise<DirectoryResearchResult> {
  const diagnostics: DirectoryDiagnostics = {
    directoriesSearched: 0,
    directoriesFailed: 0,
    rawGroups: 0,
    enriched: 0,
    leadsCreated: 0,
    directoryResults: [],
    errors: [],
  }

  const regionInfo = detectRegion(campaign.baseLocation)
  console.log(`[Directory] Region detected: ${regionInfo.city}, ${regionInfo.province}, ${regionInfo.country} (region: ${regionInfo.region})`)

  // Filter directories by country coverage
  const applicableSources = DIRECTORY_SOURCES.filter(
    source => source.coverage.includes(regionInfo.country) || source.coverage.includes('OTHER')
  )

  console.log(`[Directory] ${applicableSources.length} applicable directory sources for ${regionInfo.country}`)

  const allGroups: ParsedGroup[] = []
  const seenGroupNames = new Set<string>()

  // Scrape each directory source
  for (const source of applicableSources) {
    const searchUrls = source.buildSearchUrls(regionInfo.city, regionInfo.region, regionInfo.country)

    let sourceGroupCount = 0
    let sourceError: string | undefined

    for (const url of searchUrls) {
      diagnostics.directoriesSearched++
      try {
        console.log(`[Directory:${source.name}] Fetching ${url}`)
        const html = await fetchDirectoryPage(url)

        if (!html) {
          console.log(`[Directory:${source.name}] No content from ${url}`)
          continue
        }

        const groups = source.parseGroups(html, regionInfo.city)
        console.log(`[Directory:${source.name}] Found ${groups.length} groups from ${url}`)

        for (const group of groups) {
          const key = group.name.toLowerCase().trim()
          if (!seenGroupNames.has(key)) {
            seenGroupNames.add(key)
            allGroups.push(group)
            sourceGroupCount++
          }
        }
      } catch (error) {
        diagnostics.directoriesFailed++
        sourceError = error instanceof Error ? error.message : String(error)
        console.error(`[Directory:${source.name}] Error: ${sourceError}`)
      }
    }

    diagnostics.directoryResults.push({
      directory: source.name,
      count: sourceGroupCount,
      error: sourceError,
    })
  }

  // Also try supplementary web searches
  const supplementaryUrls = buildSupplementarySearchUrls(
    regionInfo.city, regionInfo.region, regionInfo.country
  )

  for (const url of supplementaryUrls) {
    diagnostics.directoriesSearched++
    try {
      const html = await fetchDirectoryPage(url)
      if (!html) continue

      const groups = parseGenericChoralPage(html, regionInfo.city)
      let supplementaryCount = 0
      for (const group of groups) {
        const key = group.name.toLowerCase().trim()
        if (!seenGroupNames.has(key)) {
          seenGroupNames.add(key)
          allGroups.push(group)
          supplementaryCount++
        }
      }

      if (supplementaryCount > 0) {
        console.log(`[Directory:WebSearch] Found ${supplementaryCount} new groups from ${url}`)
      }
    } catch (error) {
      diagnostics.directoriesFailed++
      const errMsg = error instanceof Error ? error.message : String(error)
      console.warn(`[Directory:WebSearch] Error for ${url}: ${errMsg}`)
    }
  }

  diagnostics.rawGroups = allGroups.length
  console.log(`[Directory] Total unique groups found: ${allGroups.length}`)

  if (allGroups.length === 0) {
    console.log('[Directory] No groups found from any directory source')
    return { leads: [], diagnostics }
  }

  // Enrich groups with contact information
  const leads: DirectoryLead[] = []

  // Process in batches of 5 to avoid overwhelming websites
  const BATCH_SIZE = 5
  for (let i = 0; i < allGroups.length; i += BATCH_SIZE) {
    const batch = allGroups.slice(i, i + BATCH_SIZE)
    const enrichedBatch = await Promise.all(
      batch.map(async (group) => {
        try {
          const enrichment = await enrichOrganization(
            group.website,
            null,
            group.name
          )

          diagnostics.enriched++

          const lead: DirectoryLead = {
            firstName: enrichment.firstName || 'Contact',
            lastName: enrichment.lastName || `at ${group.name}`,
            email: enrichment.email || `needs-enrichment+${group.name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 40)}@placeholder.local`,
            phone: enrichment.phone,
            organization: group.name,
            source: 'DIRECTORY_RESEARCH',
            latitude: campaign.latitude, // Use campaign center as approximate
            longitude: campaign.longitude,
            score: calculateDirectoryScore(group, !!enrichment.email),
            distance: null, // Unknown for directory-sourced leads
            website: enrichment.website || group.website,
            emailVerified: enrichment.emailVerified,
            needsEnrichment: !enrichment.email,
            enrichmentSource: enrichment.enrichmentSource,
            contactTitle: enrichment.contactTitle,
            directorySource: group.type || 'directory',
            groupType: group.type,
          }

          return lead
        } catch (error) {
          console.error(`[Directory] Failed to enrich "${group.name}":`, error)
          return null
        }
      })
    )

    for (const lead of enrichedBatch) {
      if (lead) leads.push(lead)
    }
  }

  // Create leads in database (upsert by email) so orchestrator can reference them by ID
  const leadsWithIds = await createDirectoryLeadsInDatabase(leads)
  diagnostics.leadsCreated = leadsWithIds.length

  console.log(`[Directory] SUMMARY: ${diagnostics.directoriesSearched} directories searched, ${diagnostics.directoriesFailed} failed, ${diagnostics.rawGroups} groups → ${diagnostics.enriched} enriched → ${diagnostics.leadsCreated} leads`)

  return { leads: leadsWithIds, diagnostics }
}

/**
 * Create new leads in database (upsert by email)
 * Returns leads with database IDs so orchestrator can create CampaignLead records
 */
async function createDirectoryLeadsInDatabase(leads: DirectoryLead[]): Promise<any[]> {
  const createdLeads = []

  for (const lead of leads) {
    try {
      const dbLead = await prisma.lead.upsert({
        where: { email: lead.email },
        update: {
          organization: lead.organization,
          ...(lead.latitude && { latitude: lead.latitude }),
          ...(lead.longitude && { longitude: lead.longitude }),
          ...(lead.website && { website: lead.website }),
          ...(lead.emailVerified !== undefined && { emailVerified: lead.emailVerified }),
          ...(lead.needsEnrichment !== undefined && { needsEnrichment: lead.needsEnrichment }),
          ...(lead.enrichmentSource && { enrichmentSource: lead.enrichmentSource }),
          ...(lead.contactTitle && { contactTitle: lead.contactTitle }),
        },
        create: {
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          organization: lead.organization,
          source: 'DIRECTORY_RESEARCH',
          status: 'NEW',
          score: lead.score,
          latitude: lead.latitude,
          longitude: lead.longitude,
          website: lead.website || null,
          emailVerified: lead.emailVerified || false,
          needsEnrichment: lead.needsEnrichment || false,
          enrichmentSource: lead.enrichmentSource || null,
          contactTitle: lead.contactTitle || null,
        },
      })

      createdLeads.push({
        ...dbLead,
        distance: lead.distance,
        source: 'DIRECTORY_RESEARCH',
        needsEnrichment: lead.needsEnrichment || false,
        emailVerified: lead.emailVerified || false,
        directorySource: lead.directorySource,
        groupType: lead.groupType,
      })
    } catch (error) {
      console.error(`[Directory] Failed to create lead ${lead.email}:`, error)
    }
  }

  return createdLeads
}

/**
 * Calculate score for a directory-sourced lead
 *
 * Directory leads get a base bonus since they come from curated music
 * directories (higher quality than random Google Maps results).
 */
function calculateDirectoryScore(group: ParsedGroup, hasEmail: boolean): number {
  let score = 25 // Base score for directory-sourced lead (curated source)

  // Group type bonuses (a cappella/barbershop are Deke's primary audience)
  const typeScores: Record<string, number> = {
    'barbershop': 20,
    'sweet_adelines': 20,
    'harmony_inc': 20,
    'a_cappella': 25, // Highest priority for Deke
    'community': 10,
    'gospel': 10,
    'university': 15,
    'youth': 10,
    'mens': 10,
    'womens': 10,
    'choir': 5,
    'church': 5,
  }

  const typeBonus = typeScores[group.type || ''] || 0
  score += typeBonus

  // Email bonus
  if (hasEmail) {
    score += 15
  }

  // Website bonus (enrichable)
  if (group.website) {
    score += 5
  }

  return score
}
