import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import { renderTemplate } from '@/lib/outreach/template-renderer'
import { buildDefaultSubject } from '@/lib/outreach/default-subject'
import { generateDraftsSchema } from '@/lib/validations/email-draft'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params
    const body = await request.json()
    const { leadIds, templateId, force } = generateDraftsSchema.parse(body)

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { booking: { select: { serviceType: true } } },
    })
    if (!campaign) {
      throw new ApiError(404, 'Campaign not found', 'NOT_FOUND')
    }

    // Fetch template
    let templateSubject = buildDefaultSubject(campaign.baseLocation, campaign.booking?.serviceType)
    let templateBody = 'Hi {{firstName}},\n\nI\'m reaching out because I\'ll be in the {{baseLocation}} area soon and thought there might be an opportunity to work together.\n\nWould you be open to a conversation?\n\nBest,\nDeke Sharon'

    if (templateId) {
      const template = await prisma.messageTemplate.findUnique({
        where: { id: templateId },
      })
      if (!template) {
        throw new ApiError(404, 'Template not found', 'TEMPLATE_NOT_FOUND')
      }
      templateSubject = template.subject || templateSubject
      templateBody = template.body
    } else {
      // Try to find a default template
      const defaultTemplate = await prisma.messageTemplate.findFirst({
        where: { channel: 'EMAIL' },
        orderBy: { createdAt: 'desc' },
      })
      if (defaultTemplate) {
        templateSubject = defaultTemplate.subject || templateSubject
        templateBody = defaultTemplate.body
      }
    }

    // Fetch campaign leads with lead data
    const campaignLeads = await prisma.campaignLead.findMany({
      where: {
        campaignId,
        id: { in: leadIds },
      },
      include: { lead: true },
    })

    if (campaignLeads.length === 0) {
      throw new ApiError(400, 'No matching campaign leads found', 'NO_LEADS')
    }

    // Quality gate: filter out leads that shouldn't receive drafts (skip when force=true)
    const genericPrefixes = ['info@', 'hello@', 'contact@', 'admin@', 'office@', 'general@']
    const draftableLeads = force ? campaignLeads : campaignLeads.filter((cl: any) => {
      // No placeholder emails
      if (cl.lead.email?.includes('@placeholder.local')) return false
      // No fake "Contact at Org" names from unenriched leads
      if (cl.lead.firstName === 'Contact' && cl.lead.lastName?.startsWith('at ')) return false
      // For cold leads, reject generic-only emails (info@, hello@, etc.)
      if (cl.source === 'AI_RESEARCH') {
        if (genericPrefixes.some(p => cl.lead.email?.startsWith(p))) return false
      }
      // Gate on CURATOR quality evaluation if it has been run
      if (cl.qualityPassed === false) return false
      return true
    })

    const qualityFiltered = campaignLeads.length - draftableLeads.length

    // Check which already have drafts
    const existingDrafts = await prisma.emailDraft.findMany({
      where: {
        campaignId,
        campaignLeadId: { in: draftableLeads.map(cl => cl.id) },
      },
      select: { campaignLeadId: true },
    })
    const existingIds = new Set(existingDrafts.map(d => d.campaignLeadId))

    let created = 0
    let skipped = 0

    for (const cl of draftableLeads) {
      if (existingIds.has(cl.id)) {
        skipped++
        continue
      }

      // Use org-based greeting when no real person name is available
      let greeting = cl.lead.firstName
      if (cl.lead.firstName === 'Contact' && cl.lead.lastName?.startsWith('at ')) {
        greeting = cl.lead.organization ? `${cl.lead.organization} team` : 'there'
      }

      const vars = {
        firstName: greeting,
        lastName: cl.lead.lastName,
        organization: cl.lead.organization || '',
        email: cl.lead.email,
        baseLocation: campaign.baseLocation,
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
      created++
    }

    return NextResponse.json({ created, skipped, qualityFiltered })
  } catch (error) {
    return handleApiError(error)
  }
}
