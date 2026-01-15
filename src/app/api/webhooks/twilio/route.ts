import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * Webhook handler for Twilio SMS events
 * Receives delivery status and reply events from Twilio
 *
 * Status callbacks:
 * - queued
 * - sent
 * - delivered
 * - undelivered
 * - failed
 *
 * Incoming messages:
 * - User replies (including STOP for opt-out)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // TODO: Verify Twilio signature for security
    // const signature = request.headers.get('x-twilio-signature')
    // if (!verifyTwilioSignature(formData, signature)) {
    //   return new Response('Invalid signature', { status: 401 })
    // }

    const messageStatus = formData.get('MessageStatus') as string
    const messageSid = formData.get('MessageSid') as string
    const to = formData.get('To') as string
    const from = formData.get('From') as string
    const body = formData.get('Body') as string

    // Handle incoming messages (replies)
    if (body && from) {
      const normalizedFrom = from.replace(/[^0-9]/g, '')

      // Check for STOP message (opt-out)
      const isOptOut = /^stop$/i.test(body.trim())

      if (isOptOut) {
        // Add to suppression list
        await prisma.suppression.upsert({
          where: { phone: normalizedFrom },
          create: {
            phone: normalizedFrom,
            reason: 'opt_out',
            source: 'sms_reply',
          },
          update: {
            reason: 'opt_out',
          },
        })

        // Update any campaign leads with this phone
        const lead = await prisma.lead.findFirst({
          where: { phone: normalizedFrom },
        })

        if (lead) {
          await prisma.campaignLead.updateMany({
            where: { leadId: lead.id },
            data: { status: 'REMOVED' },
          })
        }

        return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
          headers: { 'Content-Type': 'text/xml' },
        })
      }

      // Handle regular reply
      const lead = await prisma.lead.findFirst({
        where: { phone: normalizedFrom },
      })

      if (lead) {
        // Find the most recent outreach log for this lead
        const outreachLog = await prisma.outreachLog.findFirst({
          where: {
            campaignLead: { leadId: lead.id },
            channel: 'SMS',
          },
          orderBy: {
            sentAt: 'desc',
          },
        })

        if (outreachLog) {
          // Update outreach log
          await prisma.outreachLog.update({
            where: { id: outreachLog.id },
            data: {
              status: 'RESPONDED',
              respondedAt: new Date(),
            },
          })

          // Update campaign lead status
          await prisma.campaignLead.update({
            where: { id: outreachLog.campaignLeadId },
            data: { status: 'RESPONDED' },
          })

          // Phase 6: Auto-pause follow-ups on response
          const { autoPauseFollowUp } = await import('@/lib/follow-up/scheduler')
          await autoPauseFollowUp(outreachLog.campaignLeadId, 'responded')
        }
      }

      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    // Handle status callbacks
    if (messageStatus && messageSid) {
      // Find outreach log by message SID (would need to store SID in OutreachLog)
      // For now, we'll match by phone number and recent timestamp
      const normalizedTo = to?.replace(/[^0-9]/g, '')

      if (!normalizedTo) {
        return NextResponse.json({ received: true })
      }

      const lead = await prisma.lead.findFirst({
        where: { phone: normalizedTo },
      })

      if (!lead) {
        return NextResponse.json({ received: true })
      }

      // Find the most recent SMS outreach log for this lead
      const outreachLog = await prisma.outreachLog.findFirst({
        where: {
          campaignLead: { leadId: lead.id },
          channel: 'SMS',
        },
        orderBy: {
          sentAt: 'desc',
        },
      })

      if (!outreachLog) {
        return NextResponse.json({ received: true })
      }

      // Update status based on Twilio status
      const updates: any = {}

      switch (messageStatus) {
        case 'delivered':
          updates.status = 'DELIVERED'
          break

        case 'undelivered':
        case 'failed':
          updates.status = 'FAILED'
          updates.errorMessage = formData.get('ErrorCode') as string || 'Delivery failed'
          break
      }

      if (Object.keys(updates).length > 0) {
        await prisma.outreachLog.update({
          where: { id: outreachLog.id },
          data: updates,
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Twilio webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
