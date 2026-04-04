/**
 * Perplexity-powered Lead Discovery
 *
 * Uses Perplexity's Sonar API to intelligently find contemporary vocal groups.
 * Unlike keyword search (Firecrawl), Perplexity understands context:
 * "contemporary a cappella groups near Boston" returns curated results,
 * not classical choirs or school music departments.
 *
 * Flow:
 * 1. Ask Perplexity targeted questions about vocal groups near campaign location
 * 2. Parse structured response for org names + websites
 * 3. Feed URLs into existing Firecrawl enrichment pipeline for contact scraping
 */

import { enrichOrganization } from '@/lib/enrichment'
import { prisma } from '@/lib/db'
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

interface PerplexityOrg {
  name: string
  website: string | null
  description: string | null
}

/**
 * Clean an org name returned by Perplexity.
 * Strips page title junk, event names, descriptions appended after separators.
 */
function cleanOrgName(name: string): string {
  let cleaned = name
    // Strip everything after common separators that indicate page title junk
    .replace(/\s*[-–—|:]\s*(Home|About|Contact|Welcome|Events Calendar|Booking Inquiries|Official|Overview|Website|Page).*$/i, '')
    // Strip "Upcoming Events", "Friends and Families Concert:" prefixes
    .replace(/^(?:Upcoming Events|Events|Concert|Friends and Families Concert)\s*[:–—-]\s*/i, '')
    // Strip trailing descriptions after separators
    .replace(/\s*[-–—]\s*(singing|group|performing|booking|contemporary|events|calendar).*$/i, '')
    .trim()

  // If a colon remains, take only what's after it (often "Concert Series: Real Group Name")
  if (cleaned.includes(':')) {
    const parts = cleaned.split(':')
    const afterColon = parts[parts.length - 1].trim()
    // Use the after-colon part only if it looks substantial
    if (afterColon.length >= 5) {
      cleaned = afterColon
    }
  }

  return cleaned || name
}

/**
 * Validate an org name — reject page titles, search terms, event names,
 * individual instructor names, and institutional groups.
 */
function isValidOrgName(name: string): boolean {
  const lower = name.toLowerCase()

  // Too short or too long
  if (name.length < 3 || name.length > 80) return false

  // Reject page titles and web junk
  const pageTitlePatterns = [
    'upcoming events', 'events calendar', 'booking inquiries',
    'friends and families', 'concert:', 'concerts',
    'bands for hire', 'bands near', 'groups near',
    'pop vocals with', 'lessons with', 'classes with',
  ]
  if (pageTitlePatterns.some(p => lower.includes(p))) return false

  // Reject generic search-like terms
  const searchTermPatterns = [
    /^(boston|new york|chicago|los angeles)\s+(a cappella|singing|vocal)\s+(bands|groups|ensembles)$/i,
    /^(a cappella|singing|vocal)\s+(bands|groups|ensembles)\s+(in|near|around)\b/i,
    /\bbands for hire\b/i,
    /\bfor hire\b/i,
  ]
  if (searchTermPatterns.some(p => p.test(name))) return false

  // Reject college/university affiliated groups (org name contains institution)
  const collegePatterns = [
    'berklee', 'college of music', 'university', 'college',
    'school of music', 'conservatory', 'institute',
    'endicott ensembles', 'campus',
  ]
  if (collegePatterns.some(p => lower.includes(p))) return false

  // Reject if it looks like a person's name (2 words, both capitalized, no org keywords)
  const words = name.split(/\s+/)
  if (words.length === 2) {
    const bothCapitalized = words.every(w => /^[A-Z][a-z]+$/.test(w))
    const hasOrgKeyword = /choir|chorus|singers|a cappella|barbershop|vocal|ensemble|blend|harmony|notes|tones|sound/i.test(name)
    if (bothCapitalized && !hasOrgKeyword) return false
  }

  return true
}

/**
 * Build Perplexity prompts tailored to the campaign location.
 *
 * Each prompt asks for a specific slice of the contemporary vocal group market.
 * We ask for JSON output to make parsing reliable.
 */
function buildPrompts(campaign: Campaign): string[] {
  // Extract city/region from baseLocation
  const parts = campaign.baseLocation.split(',').map(p => p.trim())
  const location = parts.length >= 2
    ? `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`
    : campaign.baseLocation
  const radius = campaign.radius

  const nameRules = `IMPORTANT: "name" must be ONLY the group's proper name (e.g. "Vinyl Street A Cappella", "Northshoremen Barbershop Chorus"). Do NOT include descriptions, page titles, event names, taglines, or instructor names. Do NOT include groups that are part of a college or university.`

  return [
    `List contemporary a cappella groups and pop/rock/jazz vocal ensembles within ${radius} miles of ${location}. Focus on community and semi-professional groups — NOT college a cappella, NOT classical choirs, NOT school programs, NOT church choirs. ${nameRules} Return as JSON array: [{"name": "...", "website": "..."}]. Include up to 15 groups.`,

    `List barbershop choruses, Sweet Adelines chapters, and Harmony Inc chapters within ${radius} miles of ${location}. ${nameRules} Return as JSON array: [{"name": "...", "website": "..."}]. Include up to 10 groups.`,

    `List community singing groups, vocal bands, and show choirs within ${radius} miles of ${location} that focus on contemporary music (pop, rock, jazz, soul, R&B). Exclude classical choral societies, university/college groups, and K-12 school programs. ${nameRules} Return as JSON array: [{"name": "...", "website": "..."}]. Include up to 10 groups.`,
  ]
}

/**
 * Call Perplexity Sonar API
 */
async function queryPerplexity(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: 'You are a research assistant helping find singing groups and vocal ensembles. Always respond with valid JSON arrays. If you cannot find groups matching the criteria, return an empty array [].',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'unknown')
    throw new Error(`Perplexity API error: ${response.status} ${response.statusText} - ${errorBody}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || '[]'
}

/**
 * Parse Perplexity response into structured org list.
 * Handles markdown code fences, partial JSON, etc.
 */
function parseOrgs(responseText: string): PerplexityOrg[] {
  // Strip markdown code fences if present
  let cleaned = responseText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()

  // Try to extract JSON array from the response
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/)
  if (!arrayMatch) {
    console.warn('[Perplexity] No JSON array found in response')
    return []
  }

  try {
    const parsed = JSON.parse(arrayMatch[0])
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item: any) => item.name && typeof item.name === 'string')
      .map((item: any) => ({
        name: cleanOrgName(item.name.trim()),
        website: item.website?.trim() || item.url?.trim() || null,
        description: item.description?.trim() || null,
      }))
      .filter((item: PerplexityOrg) => isValidOrgName(item.name))
  } catch (error) {
    console.warn('[Perplexity] Failed to parse JSON:', error instanceof Error ? error.message : error)
    return []
  }
}

/**
 * Discover leads using Perplexity AI search + Firecrawl enrichment
 *
 * Flow:
 * 1. Ask Perplexity 3 targeted questions about vocal groups near campaign
 * 2. Parse structured responses for org names + websites
 * 3. Deduplicate by name
 * 4. Enrich top candidates via existing Firecrawl scraping pipeline
 * 5. Create leads in database
 */
export async function discoverWithPerplexity(campaign: Campaign): Promise<AIResearchResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY

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
    const msg = 'PERPLEXITY_API_KEY not set - skipping Perplexity discovery'
    console.warn(`[Perplexity Research] ${msg}`)
    diagnostics.errors.push(msg)
    return { leads: [], diagnostics }
  }

  const prompts = buildPrompts(campaign)
  const allOrgs: PerplexityOrg[] = []

  console.log(`[Perplexity Research] Starting: ${prompts.length} queries for "${campaign.baseLocation}" (${campaign.radius}mi)`)

  // Query Perplexity for each prompt
  for (let i = 0; i < prompts.length; i++) {
    diagnostics.apiCallsMade++
    const label = ['a cappella/pop/jazz', 'barbershop/SA/HI', 'community/vocal bands'][i]

    try {
      const response = await queryPerplexity(prompts[i], apiKey)
      const orgs = parseOrgs(response)

      diagnostics.keywordResults.push({ keyword: label, count: orgs.length })
      allOrgs.push(...orgs)
      console.log(`[Perplexity Research] "${label}" → ${orgs.length} orgs`)
    } catch (error) {
      diagnostics.apiCallsFailed++
      const errMsg = error instanceof Error ? error.message : String(error)
      diagnostics.keywordResults.push({ keyword: label, count: 0, error: errMsg })
      diagnostics.errors.push(`Perplexity "${label}": ${errMsg}`)
      console.error(`[Perplexity Research] Error on "${label}":`, errMsg)
    }
  }

  diagnostics.rawPlaces = allOrgs.length
  console.log(`[Perplexity Research] Found ${allOrgs.length} total orgs from ${diagnostics.apiCallsMade} queries`)

  // If ALL queries failed, throw
  if (diagnostics.apiCallsFailed === diagnostics.apiCallsMade && diagnostics.apiCallsMade > 0) {
    const msg = `All ${diagnostics.apiCallsMade} Perplexity queries failed. First error: ${diagnostics.errors[0] || 'unknown'}`
    throw new Error(msg)
  }

  // Deduplicate by normalized org name
  const uniqueOrgs = deduplicateByName(allOrgs)
  diagnostics.uniquePlaces = uniqueOrgs.length
  diagnostics.musicRelevant = uniqueOrgs.length // Perplexity already filtered for relevance
  console.log(`[Perplexity Research] ${uniqueOrgs.length} unique orgs (removed ${allOrgs.length - uniqueOrgs.length} dupes)`)

  if (uniqueOrgs.length === 0) {
    console.log('[Perplexity Research] No orgs found')
    return { leads: [], diagnostics }
  }

  // Enrich each org with contact info via existing pipeline
  const MAX_ENRICHMENT = 25
  const candidates = uniqueOrgs.slice(0, MAX_ENRICHMENT)
  console.log(`[Perplexity Research] Enriching top ${candidates.length} orgs for contacts...`)

  const leads: DiscoveredLead[] = []

  for (const org of candidates) {
    try {
      if (!org.website) {
        console.log(`[Perplexity Research] No website for "${org.name}" — skipping`)
        continue
      }

      const enrichment = await enrichOrganization(org.website, null, org.name)
      diagnostics.enriched++

      if (enrichment.email) {
        // Filter out third-party SaaS emails
        const thirdPartyDomains = [
          'mymusicstaff.com', 'groupanizer.com', 'placeholder.local',
          'wixpress.com', 'squarespace.com', 'wordpress.com',
          'mailchimp.com', 'constantcontact.com',
        ]
        const emailDomain = enrichment.email.split('@')[1]?.toLowerCase() || ''
        if (thirdPartyDomains.some(d => emailDomain.includes(d))) {
          console.log(`[Perplexity Research] Skipping third-party email ${enrichment.email} for "${org.name}"`)
          continue
        }

        // Score boost: Perplexity leads are pre-vetted for genre relevance
        const baseScore = enrichment.firstName && enrichment.firstName !== 'Contact' ? 45 : 35

        leads.push({
          firstName: enrichment.firstName || 'Contact',
          lastName: enrichment.lastName || `at ${org.name}`,
          email: enrichment.email,
          phone: enrichment.phone,
          organization: org.name,
          source: 'AI_RESEARCH',
          latitude: campaign.latitude,
          longitude: campaign.longitude,
          score: baseScore,
          distance: 0,
          website: org.website,
          emailVerified: enrichment.emailVerified,
          needsEnrichment: false,
          enrichmentSource: enrichment.enrichmentSource || 'perplexity+firecrawl',
          contactTitle: enrichment.contactTitle,
          editorialSummary: org.description?.substring(0, 200) || null,
        })
      } else {
        console.log(`[Perplexity Research] No email found for "${org.name}" — skipping`)
      }
    } catch (error) {
      console.error(`[Perplexity Research] Failed to enrich "${org.name}":`, error instanceof Error ? error.message : error)
    }
  }

  // Deduplicate leads by org name
  const uniqueLeads = deduplicateLeadsByOrg(leads)
  console.log(`[Perplexity Research] ${uniqueLeads.length} leads after dedup`)

  // Create in database
  const createdLeads = await createLeadsInDatabase(uniqueLeads)
  diagnostics.leadsCreated = createdLeads.length

  console.log(`[Perplexity Research] SUMMARY: ${diagnostics.apiCallsMade} queries, ${diagnostics.rawPlaces} raw → ${diagnostics.uniquePlaces} unique → ${diagnostics.enriched} enriched → ${diagnostics.leadsCreated} leads`)

  return { leads: createdLeads, diagnostics }
}

/**
 * Deduplicate orgs by normalized name
 */
function deduplicateByName(orgs: PerplexityOrg[]): PerplexityOrg[] {
  const seen = new Map<string, PerplexityOrg>()

  for (const org of orgs) {
    const key = org.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!seen.has(key)) {
      seen.set(key, org)
    } else {
      // Prefer the one with a website
      const existing = seen.get(key)!
      if (!existing.website && org.website) {
        seen.set(key, org)
      }
    }
  }

  return Array.from(seen.values())
}

/**
 * Deduplicate leads by org name
 */
function deduplicateLeadsByOrg(leads: DiscoveredLead[]): DiscoveredLead[] {
  const orgMap = new Map<string, DiscoveredLead>()

  for (const lead of leads) {
    const key = lead.organization.toLowerCase()
    if (!orgMap.has(key)) {
      orgMap.set(key, lead)
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
      console.error(`[Perplexity Research] Failed to create lead ${lead.email}:`, error)
    }
  }

  return created
}
