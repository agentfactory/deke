import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * Webhook handler for Resend email events
 * Receives delivery, open, click, bounce events from Resend
 *
 * Event types:
 * - email.sent
 * - email.delivered
 * - email.opened
 * - email.clicked
 * - email.bounced
 * - email.complained
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // TODO: Verify webhook signature for security
    // const signature = request.headers.get('svix-signature')
    // if (!verifyWebhookSignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    const { type, data } = body

    // Extract campaign and lead IDs from tags
    const campaignId = data.tags?.find((t: any) => t.name === 'campaignId')?.value
    const leadId = data.tags?.find((t: any) => t.name === 'leadId')?.value

    if (!campaignId || !leadId) {
      console.warn('Resend webhook missing campaign or lead ID tags')
      return NextResponse.json({ received: true })
    }

    // Find the outreach log
    const outreachLog = await prisma.outreachLog.findFirst({
      where: {
        campaignId,
        campaignLead: {
          leadId,
        },
        channel: 'EMAIL',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!outreachLog) {
      console.warn('Outreach log not found for email event')
      return NextResponse.json({ received: true })
    }

    // Update outreach log based on event type
    const updates: any = {}

    switch (type) {
      case 'email.delivered':
        updates.status = 'DELIVERED'
        break

      case 'email.opened':
        updates.status = 'OPENED'
        updates.openedAt = new Date()

        // Update campaign lead status
        await prisma.campaignLead.update({
          where: { id: outreachLog.campaignLeadId },
          data: { status: 'OPENED' },
        })
        break

      case 'email.clicked':
        updates.status = 'CLICKED'
        updates.clickedAt = new Date()

        // Update campaign lead status
        await prisma.campaignLead.update({
          where: { id: outreachLog.campaignLeadId },
          data: { status: 'CLICKED' },
        })

        // Phase 6: Auto-pause follow-ups on click (high intent)
        const { autoPauseFollowUp } = await import('@/lib/follow-up/scheduler')
        await autoPauseFollowUp(outreachLog.campaignLeadId, 'clicked')
        break

      case 'email.bounced':
        updates.status = 'BOUNCED'
        updates.errorMessage = data.error || 'Email bounced'

        // Add to suppression list
        const campaignLead = await prisma.campaignLead.findUnique({
          where: { id: outreachLog.campaignLeadId },
          include: { lead: true },
        })

        if (campaignLead) {
          await prisma.suppression.upsert({
            where: { email: campaignLead.lead.email },
            create: {
              email: campaignLead.lead.email,
              reason: 'bounce',
              source: campaignId,
            },
            update: {
              reason: 'bounce',
            },
          })
        }
        break

      case 'email.complained':
        updates.status = 'FAILED'
        updates.errorMessage = 'Spam complaint'

        // Add to suppression list
        const complaintLead = await prisma.campaignLead.findUnique({
          where: { id: outreachLog.campaignLeadId },
          include: { lead: true },
        })

        if (complaintLead) {
          await prisma.suppression.upsert({
            where: { email: complaintLead.lead.email },
            create: {
              email: complaintLead.lead.email,
              reason: 'complaint',
              source: campaignId,
            },
            update: {
              reason: 'complaint',
            },
          })
        }
        break
    }

    // Update the outreach log
    if (Object.keys(updates).length > 0) {
      await prisma.outreachLog.update({
        where: { id: outreachLog.id },
        data: updates,
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Resend webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
