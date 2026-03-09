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

    // Verify campaign exists
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
      // Find template
      let templateSubject = 'Collaboration Opportunity with Deke Sharon'
      let templateBody = 'Hi {{firstName}},\n\nI\'m reaching out because I\'ll be in the {{baseLocation}} area soon and thought there might be an opportunity to work together.\n\nWould you be open to a conversation?\n\nBest,\nDeke Sharon'

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

        const vars = {
          firstName: cl.lead.firstName,
          lastName: cl.lead.lastName,
          organization: cl.lead.organization || '',
          contactTitle: cl.lead.contactTitle || '',
          editorialSummary: cl.lead.editorialSummary || '',
          email: cl.lead.email,
          baseLocation: campaign.baseLocation,
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

    return NextResponse.json(
      {
        message: 'Lead discovery and draft generation completed',
        campaignId: campaign.id,
        campaignName: campaign.name,
        discovered: {
          total: result.total,
          bySource: {
            pastClients: result.bySource.PAST_CLIENT,
            dormantLeads: result.bySource.DORMANT,
            similarOrgs: result.bySource.SIMILAR_ORG,
            aiResearch: result.bySource.AI_RESEARCH,
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
          leadsPerSecond: Math.round((result.total / result.duration) * 1000),
        },
        warnings: result.warnings || [],
        newLeadsCount: result.total,
      },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
