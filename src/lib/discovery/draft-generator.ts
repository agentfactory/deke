/**
 * Draft Generator
 *
 * Generates email drafts for campaign leads after discovery.
 * Extracted from the discover route for reuse by the background runner.
 */

import { prisma } from '@/lib/db'
import { renderTemplate } from '@/lib/outreach/template-renderer'

export interface DraftGenerationResult {
  generated: number
  skipped: number
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

  // Find template
  let templateSubject = 'Collaboration Opportunity with Deke Sharon'
  let templateBody = `Hi {{firstName}},

I'm Deke Sharon, and I'll be in the {{baseLocation}} area{{availabilityDates}} — I'd love to explore working with {{organization}}.

I offer workshops, coaching, and masterclasses tailored to vocal groups of all levels. You can see the full list of what I offer here: {{workshopLink}}

Would you be open to a quick conversation about what might be a good fit?

Best,
Deke Sharon
{{servicesLink}}`

  const defaultTemplate = await prisma.messageTemplate.findFirst({
    where: { channel: 'EMAIL' },
    orderBy: { createdAt: 'desc' },
  })
  if (defaultTemplate) {
    templateSubject = defaultTemplate.subject || templateSubject
    templateBody = defaultTemplate.body
  }

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

    const vars: Record<string, string> = {
      firstName: cl.lead.firstName,
      lastName: cl.lead.lastName,
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
