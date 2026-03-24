import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import { sendEmail } from '@/lib/outreach/providers/resend'
import { sendDraftsSchema } from '@/lib/validations/email-draft'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params
    const body = await request.json()
    const { draftIds } = sendDraftsSchema.parse(body)

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })
    if (!campaign) {
      throw new ApiError(404, 'Campaign not found', 'NOT_FOUND')
    }

    // Build query - either specific drafts or all DRAFT status
    const where: { campaignId: string; status: string; id?: { in: string[] } } = {
      campaignId,
      status: 'DRAFT',
    }
    if (draftIds && draftIds.length > 0) {
      where.id = { in: draftIds }
    }

    const drafts = await prisma.emailDraft.findMany({
      where,
      include: {
        lead: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (drafts.length === 0) {
      throw new ApiError(400, 'No eligible drafts found to send', 'NO_DRAFTS')
    }

    let sent = 0
    let failed = 0

    for (const draft of drafts) {
      try {
        const leadEmail = draft.lead.email
        if (!leadEmail) {
          await prisma.emailDraft.update({
            where: { id: draft.id },
            data: { status: 'FAILED', errorMessage: 'Lead has no email address' },
          })
          failed++
          continue
        }

        const result = await sendEmail({
          to: leadEmail,
          subject: draft.subject,
          html: draft.body,
          campaignId,
          leadId: draft.leadId,
        })

        if (result.success) {
          await prisma.emailDraft.update({
            where: { id: draft.id },
            data: { status: 'SENT', sentAt: new Date() },
          })

          // Create outreach log
          await prisma.outreachLog.create({
            data: {
              campaignLeadId: draft.campaignLeadId,
              campaignId,
              channel: 'EMAIL',
              status: 'SENT',
              sentAt: new Date(),
            },
          })

          // Update campaign lead status
          await prisma.campaignLead.update({
            where: { id: draft.campaignLeadId },
            data: { status: 'CONTACTED' },
          })

          sent++
        } else {
          await prisma.emailDraft.update({
            where: { id: draft.id },
            data: { status: 'FAILED', errorMessage: result.error },
          })
          failed++
        }
      } catch (emailError) {
        const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error'
        await prisma.emailDraft.update({
          where: { id: draft.id },
          data: { status: 'FAILED', errorMessage },
        })
        failed++
      }
    }

    return NextResponse.json({ sent, failed })
  } catch (error) {
    return handleApiError(error)
  }
}
