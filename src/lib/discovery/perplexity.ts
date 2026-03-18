/**
 * Perplexity AI Discovery Source
 *
 * Uses Perplexity's Sonar API to find a cappella groups, choirs, and vocal ensembles
 * that Google Places misses — community groups, university ensembles, church choirs
 * without Google Business listings, etc.
 *
 * Perplexity aggregates results from across the web, finding organizations that
 * only exist on Facebook, community websites, or university pages.
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

interface PerplexityLead {
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

export interface PerplexityDiagnostics {
  apiCallsMade: number
  apiCallsFailed: number
  orgsFound: number
  orgsEnriched: number
  leadsCreated: number
  errors: string[]
}

export interface PerplexityResult {
  leads: PerplexityLead[]
  diagnostics: PerplexityDiagnostics
}

interface ParsedOrg {
  name: string
  website?: string
  phone?: string
  description?: string
}

/**
 * Query Perplexity Sonar API for vocal music organizations in a geographic area.
 *
 * Makes multiple targeted queries to maximize coverage:
 * 1. A cappella groups
 * 2. Choirs and choruses
 * 3. Barbershop harmony (not haircut shops)
 * 4. Youth/school vocal programs
 */
export async function discoverPerplexity(campaign: Campaign): Promise<PerplexityResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY

  const diagnostics: PerplexityDiagnostics = {
    apiCallsMade: 0,
    apiCallsFailed: 0,
    orgsFound: 0,
    orgsEnriched: 0,
    leadsCreated: 0,
    errors: [],
  }

  if (!apiKey) {
    console.log('[Perplexity] PERPLEXITY_API_KEY not set — skipping Perplexity discovery')
    return { leads: [], diagnostics }
  }

  const location = campaign.baseLocation
  const radius = campaign.radius

  // Targeted queries that maximize coverage of different organization types
  const queries = [
    `List every a cappella group, a cappella ensemble, and a cappella club within ${radius} miles of ${location}. Include university, college, high school, community, and professional groups. For each group provide the name, website URL if available, and phone number if available. Be exhaustive — include small community groups too.`,
    `List every choir, chorus, chorale, and vocal ensemble within ${radius} miles of ${location}. Include church choirs, community choruses, professional choirs, and youth choirs. For each provide the name, website URL if available, and phone number if available. Be as comprehensive as possible.`,
    `List every barbershop harmony group, Sweet Adelines chapter, Harmony Inc chapter, and BHS chorus within ${radius} miles of ${location}. For each provide the name, website URL if available, and phone number if available.`,
    `List every music school, conservatory, vocal music program, and singing group within ${radius} miles of ${location} that is not already a standard choir or a cappella group. Include community music schools, private vocal studios that run group programs, and festival choruses. For each provide the name, website URL, and phone number if available.`,
  ]

  const allOrgs: ParsedOrg[] = []

  for (const query of queries) {
    diagnostics.apiCallsMade++
    try {
      const orgs = await queryPerplexity(query, apiKey)
      allOrgs.push(...orgs)
      console.log(`[Perplexity] Query returned ${orgs.length} organizations`)
    } catch (error) {
      diagnostics.apiCallsFailed++
      const errMsg = error instanceof Error ? error.message : String(error)
      diagnostics.errors.push(errMsg)
      console.error(`[Perplexity] Query failed:`, errMsg)
    }
  }

  // Deduplicate by name
  const seen = new Map<string, ParsedOrg>()
  for (const org of allOrgs) {
    const key = org.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!seen.has(key)) {
      seen.set(key, org)
    } else {
      // Merge: prefer the entry with more data
      const existing = seen.get(key)!
      if (!existing.website && org.website) existing.website = org.website
      if (!existing.phone && org.phone) existing.phone = org.phone
      if (!existing.description && org.description) existing.description = org.description
    }
  }

  const uniqueOrgs = Array.from(seen.values())
  diagnostics.orgsFound = uniqueOrgs.length
  console.log(`[Perplexity] ${uniqueOrgs.length} unique organizations after dedup (from ${allOrgs.length} raw)`)

  // Check which organizations already exist in the database
  const existingLeads = await prisma.lead.findMany({
    where: {
      organization: {
        in: uniqueOrgs.map(o => o.name),
      },
    },
    select: {
      organization: true,
      email: true,
    },
  })
  const existingOrgSet = new Set(existingLeads.map(l => l.organization?.toLowerCase()))

  // Enrich new organizations
  const leads: PerplexityLead[] = []

  for (const org of uniqueOrgs) {
    // Skip if already in database
    if (existingOrgSet.has(org.name.toLowerCase())) {
      continue
    }

    const enrichment = await enrichOrganization(
      org.website || null,
      org.phone || null,
      org.name
    )
    diagnostics.orgsEnriched++

    // Use campaign center as coordinates (Perplexity doesn't give lat/lng)
    // These will be refined later if we can geocode the org's address
    const lat = campaign.latitude
    const lng = campaign.longitude

    if (enrichment.email) {
      leads.push({
        firstName: enrichment.firstName || 'Contact',
        lastName: enrichment.lastName || `at ${org.name}`,
        email: enrichment.email,
        phone: enrichment.phone || org.phone || null,
        organization: org.name,
        source: 'AI_RESEARCH',
        latitude: lat,
        longitude: lng,
        score: 30,
        distance: 0, // Within the search area by definition
        website: enrichment.website || org.website || null,
        emailVerified: enrichment.emailVerified,
        needsEnrichment: false,
        enrichmentSource: enrichment.enrichmentSource,
        contactTitle: enrichment.contactTitle || null,
        editorialSummary: org.description || null,
      })
    } else {
      // No email found — still create lead with website/phone for preview
      const placeholderEmail = `needs-enrichment+${org.name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 40)}@placeholder.local`

      leads.push({
        firstName: 'Contact',
        lastName: `at ${org.name}`,
        email: placeholderEmail,
        phone: enrichment.phone || org.phone || null,
        organization: org.name,
        source: 'AI_RESEARCH',
        latitude: lat,
        longitude: lng,
        score: 20,
        distance: 0,
        website: enrichment.website || org.website || null,
        emailVerified: false,
        needsEnrichment: true,
        enrichmentSource: null,
        contactTitle: enrichment.contactTitle || null,
        editorialSummary: org.description || null,
      })
    }
  }

  diagnostics.leadsCreated = leads.length
  console.log(`[Perplexity] SUMMARY: ${diagnostics.apiCallsMade} calls, ${diagnostics.orgsFound} orgs found, ${diagnostics.orgsEnriched} enriched, ${diagnostics.leadsCreated} leads created`)

  return { leads, diagnostics }
}

/**
 * Query Perplexity Sonar API and parse the response into organizations
 */
async function queryPerplexity(query: string, apiKey: string): Promise<ParsedOrg[]> {
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
          content: `You are a research assistant. Return ONLY a JSON array of organizations. Each object must have: "name" (string, required), "website" (string or null), "phone" (string or null), "description" (string or null, one sentence about the group). Do not include any text outside the JSON array. Do not include markdown formatting. If you find no results, return an empty array [].`
        },
        {
          role: 'user',
          content: query,
        },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'unknown')
    throw new Error(`Perplexity API error ${response.status}: ${errorBody}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''

  return parseOrgsFromResponse(content)
}

/**
 * Parse organizations from Perplexity's response text.
 * Handles both clean JSON and markdown-wrapped JSON.
 */
function parseOrgsFromResponse(content: string): ParsedOrg[] {
  // Try to extract JSON array from the response
  let jsonStr = content.trim()

  // Strip markdown code fences if present
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim()
  }

  // Find the first [ and last ]
  const start = jsonStr.indexOf('[')
  const end = jsonStr.lastIndexOf(']')
  if (start === -1 || end === -1) {
    console.warn('[Perplexity] No JSON array found in response')
    return []
  }

  jsonStr = jsonStr.substring(start, end + 1)

  try {
    const parsed = JSON.parse(jsonStr)
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item: any) => item && typeof item.name === 'string' && item.name.trim())
      .map((item: any) => ({
        name: item.name.trim(),
        website: typeof item.website === 'string' ? item.website.trim() : undefined,
        phone: typeof item.phone === 'string' ? item.phone.trim() : undefined,
        description: typeof item.description === 'string' ? item.description.trim() : undefined,
      }))
  } catch (error) {
    console.warn('[Perplexity] Failed to parse JSON from response:', error)
    return []
  }
}
