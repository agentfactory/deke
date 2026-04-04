/**
 * Draft Generator
 *
 * Generates email drafts for campaign leads after discovery.
 * Extracted from the discover route for reuse by the background runner.
 */

import { prisma } from '@/lib/db'
import { renderTemplate } from '@/lib/outreach/template-renderer'
import { buildDefaultSubject } from '@/lib/outreach/default-subject'

export interface DraftGenerationResult {
  generated: number
  skipped: number
}

/**
 * Determine a sensible greeting name for the lead.
 *
 * Handles three cases:
 *  1. A real person name is available → use firstName
 *  2. firstName is the placeholder pattern "Contact at Org" → fall back to org or "there"
 *  3. firstName looks like an institution/org name (capitalized single word like "MIT",
 *     "Harvard") → fall back to org team or "there"
 */
function resolveGreeting(firstName: string, lastName: string | null, organization: string | null): string {
  // Placeholder pattern used by discovery when no contact is found
  if (firstName === 'Contact' && lastName?.startsWith('at ')) {
    return organization ? `${organization} team` : 'there'
  }

  // Institution name used as firstName (e.g. "MIT", "Harvard", "Tufts")
  // Heuristic: single capitalized word that matches common institution patterns
  const looksLikeInstitution = /^[A-Z][A-Za-z]+$/.test(firstName) && firstName.length >= 3
  if (looksLikeInstitution && organization && organization.startsWith(firstName)) {
    return organization ? `${organization} team` : 'there'
  }

  return firstName
}

/**
 * Build the fallback email body template when no MessageTemplate record exists.
 */
function buildFallbackBody(): string {
  return `Hi {{firstName}},

I'm Deke Sharon — I'll be in the {{baseLocation}} area{{availabilityDates}} and wanted to reach out directly.

If you'd like to connect about a workshop or coaching session while I'm in town, I'm game — just say the word.

You can see what I offer at {{servicesLink}}

Warm regards,
Deke Sharon`
}

/**
 * Generate email drafts for all leads in a campaign that have usable emails.
 *
 * @param campaignId - The campaign to generate drafts for
 * @returns Count of drafts generated and skipped
 */
export async function generateDraftsForCampaign(campaignId: string): Promise<DraftGenerationResult> {
  let draftsGenerated = 0
  let draftsSkipped = 0

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: {
      id: true,
      baseLocation: true,
      startDate: true,
      endDate: true,
      booking: {
        select: {
          startDate: true,
          endDate: true,
          serviceType: true,
        },
      },
    },
  })

  if (!campaign) {
    throw new Error('Campaign not found')
  }

  // Build availability date string from campaign or booking dates
  const formatDate = (d: Date | string | null) => {
    if (!d) return null
    return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const availStart = formatDate(campaign.booking?.startDate || campaign.startDate)
  const availEnd = formatDate(campaign.booking?.endDate || campaign.endDate)
  let availabilityDates = ''
  if (availStart && availEnd) {
    availabilityDates = `${availStart} through ${availEnd}`
  } else if (availStart) {
    availabilityDates = `around ${availStart}`
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dekesharon.com'
  const workshopLink = `${baseUrl}/workshops`
  const servicesLink = `${baseUrl}/services`

  // Find the most recent EMAIL template to use as default
  const defaultTemplate = await prisma.messageTemplate.findFirst({
    where: { channel: 'EMAIL' },
    orderBy: { createdAt: 'desc' },
  })

  // Get campaign leads that have real emails
  const campaignLeads = await prisma.campaignLead.findMany({
    where: { campaignId },
    include: { lead: true },
  })

  // Check which already have drafts
  const existingDrafts = await prisma.emailDraft.findMany({
    where: { campaignId },
    select: { campaignLeadId: true },
  })
  const existingDraftIds = new Set(existingDrafts.map(d => d.campaignLeadId))

  for (const cl of campaignLeads) {
    // Skip if already has a draft
    if (existingDraftIds.has(cl.id)) {
      draftsSkipped++
      continue
    }

    // Skip leads that need enrichment (no usable email)
    if (cl.lead.needsEnrichment || cl.lead.email.includes('@placeholder.local')) {
      draftsSkipped++
      continue
    }

    const greeting = resolveGreeting(cl.lead.firstName, cl.lead.lastName, cl.lead.organization)

    // Build subject: per-lead personalization using org name
    let templateSubject = defaultTemplate?.subject
      ?? buildDefaultSubject(campaign.baseLocation, campaign.booking?.serviceType, cl.lead.organization)

    // Build body: use DB template if available, otherwise the personalized fallback
    let templateBody = defaultTemplate?.body ?? buildFallbackBody()

    const vars: Record<string, string> = {
      firstName: greeting,
      lastName: cl.lead.lastName ?? '',
      organization: cl.lead.organization || '',
      contactTitle: cl.lead.contactTitle || '',
      editorialSummary: cl.lead.editorialSummary || '',
      email: cl.lead.email,
      baseLocation: campaign.baseLocation,
      availabilityDates: availabilityDates ? ` ${availabilityDates}` : ' soon',
      workshopLink,
      servicesLink,
    }

    const renderedSubject = renderTemplate(templateSubject, vars)
    const renderedBody = renderTemplate(templateBody, vars)

    await prisma.emailDraft.create({
      data: {
        campaignId,
        campaignLeadId: cl.id,
        leadId: cl.leadId,
        subject: renderedSubject,
        body: renderedBody,
        status: 'DRAFT',
      },
    })
    draftsGenerated++
  }

  console.log(`[DraftGenerator] Generated ${draftsGenerated} drafts, skipped ${draftsSkipped}`)
  return { generated: draftsGenerated, skipped: draftsSkipped }
}
