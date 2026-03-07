import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import { renderTemplate } from '@/lib/outreach/template-renderer'
import { generateDraftsSchema } from '@/lib/validations/email-draft'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params
    const body = await request.json()
    const { leadIds, templateId } = generateDraftsSchema.parse(body)

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })
    if (!campaign) {
      throw new ApiError(404, 'Campaign not found', 'NOT_FOUND')
    }

    // Fetch template
    let templateSubject = 'Collaboration Opportunity with Deke Sharon'
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

    // Check which already have drafts
    const existingDrafts = await prisma.emailDraft.findMany({
      where: {
        campaignId,
        campaignLeadId: { in: campaignLeads.map(cl => cl.id) },
      },
      select: { campaignLeadId: true },
    })
    const existingIds = new Set(existingDrafts.map(d => d.campaignLeadId))

    let created = 0
    let skipped = 0

    for (const cl of campaignLeads) {
      if (existingIds.has(cl.id)) {
        skipped++
        continue
      }

      const vars = {
        firstName: cl.lead.firstName,
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

    return NextResponse.json({ created, skipped })
  } catch (error) {
    return handleApiError(error)
  }
}
