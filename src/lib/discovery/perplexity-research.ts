/**
 * Perplexity-powered Lead Discovery
 *
 * Uses Perplexity's Sonar API to find leads for Deke Sharon's services:
 * workshops, coaching, masterclasses, and arranging for vocal groups.
 *
 * Deke's market segments:
 * 1. College/university a cappella groups (his bread and butter)
 * 2. Community/semi-pro a cappella groups
 * 3. Barbershop choruses, Sweet Adelines, Harmony Inc chapters
 * 4. Contemporary community choruses (pop, jazz, show choir)
 * 5. A cappella festivals and competitions
 *
 * NOT his market: classical-only choirs, K-12 school music departments,
 * church choirs, orchestras, bands
 *
 * Flow:
 * 1. Ask Perplexity targeted questions per market segment
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
  email: string | null
  contactName: string | null
  description: string | null
}

/**
 * Clean an org name returned by Perplexity.
 * Strips page title junk, event names, descriptions appended after separators.
 */
function cleanOrgName(name: string): string {
  let cleaned = name
    .replace(/\s*[-–—|:]\s*(Home|About|Contact|Welcome|Events Calendar|Booking Inquiries|Official|Overview|Website|Page).*$/i, '')
    .replace(/^(?:Upcoming Events|Events|Concert|Friends and Families Concert)\s*[:–—-]\s*/i, '')
    .replace(/\s*[-–—]\s*(singing|group|performing|booking|contemporary|events|calendar).*$/i, '')
    .trim()

  // Handle colons — "Overboard: Boston a cappella group..." → "Overboard"
  if (cleaned.includes(':')) {
    const beforeColon = cleaned.split(':')[0].trim()
    const afterColon = cleaned.split(':').slice(1).join(':').trim().toLowerCase()
    const descriptiveWords = ['boston', 'new york', 'group', 'singing', 'a cappella', 'vocal', 'pop', 'rock', 'jazz', 'contemporary', 'community', 'greater', 'performing']
    const isDescriptive = descriptiveWords.some(w => afterColon.includes(w))
    if (beforeColon.length >= 3 && isDescriptive) {
      cleaned = beforeColon
    } else {
      const after = cleaned.split(':').slice(1).join(':').trim()
      if (after.length >= 5) {
        cleaned = after
      }
    }
  }

  return cleaned || name
}

/**
 * Validate an org name — reject page titles, search terms, and non-org names.
 * NOTE: We do NOT reject college a cappella groups — they're Deke's core market.
 */
function isValidOrgName(name: string): boolean {
  const lower = name.toLowerCase()

  if (name.length < 3 || name.length > 100) return false

  // Reject page titles and web junk
  const pageTitlePatterns = [
    'upcoming events', 'events calendar', 'booking inquiries',
    'friends and families', 'bands for hire', 'bands near',
    'groups near', 'pop vocals with', 'lessons with', 'classes with',
  ]
  if (pageTitlePatterns.some(p => lower.includes(p))) return false

  // Reject generic search terms
  if (/^(boston|new york|chicago)\s+(a cappella|singing|vocal)\s+(bands|groups|ensembles)$/i.test(name)) return false
  if (/\bfor hire\b/i.test(name)) return false

  // Reject things that are clearly NOT vocal groups
  const hardReject = [
    'symphony', 'philharmonic', 'opera company',
    'marching band', 'drum corps', 'orchestra',
    'guitar', 'piano', 'violin',
  ]
  if (hardReject.some(p => lower.includes(p))) return false

  // Reject if it looks like a person's name (2 words, both capitalized, no org keywords)
  const words = name.split(/\s+/)
  if (words.length === 2) {
    const bothCapitalized = words.every(w => /^[A-Z][a-z]+$/.test(w))
    const hasOrgKeyword = /choir|chorus|singers|a cappella|barbershop|vocal|ensemble|blend|harmony|notes|tones|sound|voices|adelines/i.test(name)
    if (bothCapitalized && !hasOrgKeyword) return false
  }

  return true
}

/**
 * Build Perplexity prompts for Deke Sharon's market segments.
 *
 * Deke is the father of contemporary a cappella. His clients are:
 * - College a cappella groups (workshops, coaching, arranging)
 * - Community/semi-pro a cappella (workshops, performances)
 * - Barbershop/Sweet Adelines/Harmony Inc (workshops, coaching)
 * - Contemporary choruses doing pop/jazz (not classical-only)
 * - Festivals and competitions
 */
function buildPrompts(campaign: Campaign): string[] {
  const parts = campaign.baseLocation.split(',').map(p => p.trim())
  const location = parts.length >= 2
    ? `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`
    : campaign.baseLocation
  const radius = campaign.radius

  const nameRules = `IMPORTANT: Return ONLY the group's official name (e.g. "Vocal Revolution", "The Nor'easters", "Boston Skyline Chorus"). Do NOT include page titles, descriptions, or taglines in the name field.`
  const contactRules = `Include the group's website URL and contact email if you can find it. For the contact email, look for the music director's email, group contact email, or info@ email from their website.`
  const jsonFormat = `Return as JSON array: [{"name": "...", "website": "...", "email": "...", "contactName": "..."}]. If you can't find an email or contact name, use null for those fields.`

  return [
    // Segment 1: College a cappella — Deke's core market
    `List college and university a cappella groups within ${radius} miles of ${location}. Include groups from all nearby colleges and universities — there are typically many groups per school. These groups hire coaches, arrangers, and workshop leaders. ${nameRules} ${contactRules} ${jsonFormat} Be thorough — list at least 15-20 groups.`,

    // Segment 2: Community/semi-pro a cappella
    `List community a cappella groups, post-collegiate a cappella groups, and semi-professional vocal ensembles within ${radius} miles of ${location}. Include groups that perform pop, rock, jazz, R&B, or contemporary arrangements. ${nameRules} ${contactRules} ${jsonFormat} List at least 10-15 groups.`,

    // Segment 3: Barbershop / Sweet Adelines / Harmony Inc
    `List barbershop choruses (BHS chapters), barbershop quartets, Sweet Adelines chapters, and Harmony Inc chapters within ${radius} miles of ${location}. Check the Barbershop Harmony Society Northeastern District, Sweet Adelines Region 1, and Harmony Inc directories. ${nameRules} ${contactRules} ${jsonFormat} List at least 10-15 groups.`,

    // Segment 4: Contemporary choruses + festivals
    `List community choruses and choirs within ${radius} miles of ${location} that perform contemporary, pop, jazz, gospel, or show music (not exclusively classical). Also list any a cappella festivals, vocal competitions, or singing conventions in the area. ${nameRules} ${contactRules} ${jsonFormat} List at least 10 groups.`,
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
          content: 'You are a research assistant helping find singing groups and vocal ensembles for Deke Sharon, the father of contemporary a cappella. He offers workshops, coaching, masterclasses, and arranging services. Find groups that would benefit from his services. Always respond with valid JSON arrays. If you cannot find groups matching the criteria, return an empty array [].',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 4000,
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
 */
function parseOrgs(responseText: string): PerplexityOrg[] {
  let cleaned = responseText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()

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
        email: item.email?.trim() || null,
        contactName: item.contactName?.trim() || item.contact_name?.trim() || null,
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

  const labels = ['college a cappella', 'community a cappella', 'barbershop/SA/HI', 'contemporary chorus/festivals']

  for (let i = 0; i < prompts.length; i++) {
    diagnostics.apiCallsMade++
    const label = labels[i]

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

  if (diagnostics.apiCallsFailed === diagnostics.apiCallsMade && diagnostics.apiCallsMade > 0) {
    const msg = `All ${diagnostics.apiCallsMade} Perplexity queries failed. First error: ${diagnostics.errors[0] || 'unknown'}`
    throw new Error(msg)
  }

  // Deduplicate by normalized org name
  const uniqueOrgs = deduplicateByName(allOrgs)
  diagnostics.uniquePlaces = uniqueOrgs.length
  diagnostics.musicRelevant = uniqueOrgs.length
  console.log(`[Perplexity Research] ${uniqueOrgs.length} unique orgs (removed ${allOrgs.length - uniqueOrgs.length} dupes)`)

  if (uniqueOrgs.length === 0) {
    console.log('[Perplexity Research] No orgs found')
    return { leads: [], diagnostics }
  }

  // Enrich each org with contact info
  const MAX_ENRICHMENT = 50
  const candidates = uniqueOrgs.slice(0, MAX_ENRICHMENT)
  console.log(`[Perplexity Research] Enriching ${candidates.length} orgs for contacts...`)

  const leads: DiscoveredLead[] = []

  // Third-party SaaS email domains to skip
  const thirdPartyDomains = [
    'mymusicstaff.com', 'groupanizer.com', 'placeholder.local',
    'wixpress.com', 'squarespace.com', 'wordpress.com',
    'mailchimp.com', 'constantcontact.com',
  ]

  for (const org of candidates) {
    try {
      let email: string | null = null
      let firstName = 'Contact'
      let lastName = `at ${org.name}`
      let contactTitle: string | null = null
      let enrichmentSource: string | null = null
      let emailVerified = false
      let phone: string | null = null

      // Step 1: Use Perplexity-provided email if available (free, no scraping)
      if (org.email && org.email.includes('@')) {
        const emailDomain = org.email.split('@')[1]?.toLowerCase() || ''
        if (!thirdPartyDomains.some(d => emailDomain.includes(d))) {
          email = org.email.toLowerCase()
          enrichmentSource = 'perplexity'
          emailVerified = false // Not verified, came from AI

          if (org.contactName) {
            const nameParts = org.contactName.split(' ')
            if (nameParts.length >= 2) {
              firstName = nameParts[0]
              lastName = nameParts.slice(1).join(' ')
            } else if (nameParts.length === 1) {
              firstName = nameParts[0]
            }
          }
          console.log(`[Perplexity Research] Using Perplexity-provided email for "${org.name}": ${email}`)
        }
      }

      // Step 2: If no Perplexity email, try website scraping enrichment
      if (!email && org.website) {
        const enrichment = await enrichOrganization(org.website, null, org.name)
        diagnostics.enriched++

        if (enrichment.email) {
          const emailDomain = enrichment.email.split('@')[1]?.toLowerCase() || ''
          if (!thirdPartyDomains.some(d => emailDomain.includes(d))) {
            email = enrichment.email
            firstName = enrichment.firstName || 'Contact'
            lastName = enrichment.lastName || `at ${org.name}`
            contactTitle = enrichment.contactTitle
            enrichmentSource = enrichment.enrichmentSource || 'website_scrape'
            emailVerified = enrichment.emailVerified
            phone = enrichment.phone
          }
        }
      }

      // Create lead even without email — org name + website is still a valuable lead
      const hasEmail = !!email
      const baseScore = hasEmail
        ? (firstName !== 'Contact' ? 45 : 35)
        : (org.website ? 20 : 10) // Lower score for leads needing enrichment

      if (!hasEmail) {
        console.log(`[Perplexity Research] No email for "${org.name}" — creating lead with needsEnrichment=true`)
      }

      // Generate a placeholder email for leads without one (required by DB unique constraint)
      const leadEmail = email || `needs-enrichment+${org.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}@placeholder.local`

      leads.push({
        firstName,
        lastName,
        email: leadEmail,
        phone,
        organization: org.name,
        source: 'AI_RESEARCH',
        latitude: campaign.latitude,
        longitude: campaign.longitude,
        score: baseScore,
        distance: 0,
        website: org.website,
        emailVerified: hasEmail ? emailVerified : false,
        needsEnrichment: !hasEmail,
        enrichmentSource: hasEmail ? enrichmentSource : null,
        contactTitle,
        editorialSummary: org.description?.substring(0, 200) || null,
      })
    } catch (error) {
      console.error(`[Perplexity Research] Failed to enrich "${org.name}":`, error instanceof Error ? error.message : error)
    }
  }

  const uniqueLeads = deduplicateLeadsByOrg(leads)
  console.log(`[Perplexity Research] ${uniqueLeads.length} leads after dedup`)

  const createdLeads = await createLeadsInDatabase(uniqueLeads)
  diagnostics.leadsCreated = createdLeads.length

  console.log(`[Perplexity Research] SUMMARY: ${diagnostics.apiCallsMade} queries, ${diagnostics.rawPlaces} raw → ${diagnostics.uniquePlaces} unique → ${diagnostics.enriched} enriched → ${diagnostics.leadsCreated} leads`)

  return { leads: createdLeads, diagnostics }
}

function deduplicateByName(orgs: PerplexityOrg[]): PerplexityOrg[] {
  const seen = new Map<string, PerplexityOrg>()
  for (const org of orgs) {
    const key = org.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!seen.has(key)) {
      seen.set(key, org)
    } else {
      const existing = seen.get(key)!
      if (!existing.website && org.website) {
        seen.set(key, org)
      }
    }
  }
  return Array.from(seen.values())
}

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
