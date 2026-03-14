import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import { discoverLeads } from '@/lib/discovery'
import { renderTemplate } from '@/lib/outreach/template-renderer'

type Params = {
  params: Promise<{
    id: string
  }>
}

/**
 * POST /api/campaigns/[id]/discover
 *
 * Streamlined 3-step workflow: Create -> [auto: discover + enrich + draft] -> Review & Send
 *
 * 1. Runs all discovery sources (past clients, dormant, similar orgs, AI research)
 * 2. AI Research now enriches via website scraping (real contacts, not fake)
 * 3. Auto-generates email drafts for leads with verified/scraped emails
 * 4. Sets campaign status to READY
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    // Verify campaign exists (include booking for date context)
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        baseLocation: true,
        latitude: true,
        longitude: true,
        radius: true,
        status: true,
        startDate: true,
        endDate: true,
        booking: {
          select: {
            startDate: true,
            endDate: true,
            serviceType: true,
            location: true,
          },
        },
      },
    })

    if (!campaign) {
      throw new ApiError(404, 'Campaign not found', 'CAMPAIGN_NOT_FOUND')
    }

    // Run discovery engine (includes enrichment)
    const result = await discoverLeads(id)

    // Auto-generate email drafts for leads with real emails
    let draftsGenerated = 0
    let draftsSkipped = 0

    try {
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

      // Get campaign leads that have real emails (not placeholder or needsEnrichment)
      const campaignLeads = await prisma.campaignLead.findMany({
        where: {
          campaignId: id,
        },
        include: {
          lead: true,
        },
      })

      // Check which already have drafts
      const existingDrafts = await prisma.emailDraft.findMany({
        where: { campaignId: id },
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
            campaignId: id,
            campaignLeadId: cl.id,
            leadId: cl.leadId,
            subject: renderedSubject,
            body: renderedBody,
            status: 'DRAFT',
          },
        })
        draftsGenerated++
      }

      console.log(`[Discover] Auto-generated ${draftsGenerated} drafts, skipped ${draftsSkipped}`)
    } catch (draftError) {
      console.error('[Discover] Draft generation failed (discovery still succeeded):', draftError)
    }

    // Auto-advance campaign status to READY
    if (campaign.status === 'DRAFT') {
      await prisma.campaign.update({
        where: { id },
        data: { status: 'READY' },
      })
    }

    const status = result.total === 0 ? 'no_results' : 'success'

    return NextResponse.json(
      {
        message: result.total === 0
          ? 'Discovery completed but found no leads — check diagnostics for details'
          : 'Lead discovery and draft generation completed',
        status,
        campaignId: campaign.id,
        campaignName: campaign.name,
        discovered: {
          total: result.total,
          bySource: {
            pastClients: result.bySource.PAST_CLIENT,
            dormantLeads: result.bySource.DORMANT,
            similarOrgs: result.bySource.SIMILAR_ORG,
            aiResearch: result.bySource.AI_RESEARCH,
            directoryResearch: result.bySource.DIRECTORY_RESEARCH,
          },
        },
        drafts: {
          generated: draftsGenerated,
          skipped: draftsSkipped,
        },
        scoring: {
          avgScore: result.avgScore,
          scoreDistribution: result.scoreStats.distribution,
          min: result.scoreStats.min,
          max: result.scoreStats.max,
          median: result.scoreStats.median,
        },
        deduplication: {
          originalCount: result.deduplicationStats.original,
          duplicatesRemoved: result.deduplicationStats.duplicatesRemoved,
          deduplicationRate: result.deduplicationStats.deduplicationRate,
        },
        performance: {
          duration: result.duration,
          leadsPerSecond: result.duration > 0 ? Math.round((result.total / result.duration) * 1000) : 0,
        },
        warnings: result.warnings || [],
        errors: result.errors || [],
        diagnostics: (result.diagnostics || []).map(d => ({
          source: d.source,
          count: d.count,
          durationMs: d.durationMs,
          error: d.error || null,
          details: d.details || null,
        })),
        newLeadsCount: result.total,
      },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
