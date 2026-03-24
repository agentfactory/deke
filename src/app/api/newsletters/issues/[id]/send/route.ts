import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'
import { buildNewsletterEmail } from '@/lib/newsletter/email-template'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const issue = await prisma.newsletterIssue.findUnique({ where: { id } })
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    if (issue.status !== 'READY') {
      return NextResponse.json(
        { error: `Issue must be READY to send. Current status: ${issue.status}` },
        { status: 400 }
      )
    }

    // Mark as sending
    await prisma.newsletterIssue.update({
      where: { id },
      data: { status: 'SENDING' },
    })

    // Fetch all opted-in subscribers
    const subscribers = await prisma.emailSubscriber.findMany({
      where: { newsletterOptIn: true },
    })

    if (subscribers.length === 0) {
      await prisma.newsletterIssue.update({
        where: { id },
        data: { status: 'READY' },
      })
      return NextResponse.json(
        { error: 'No subscribers with newsletter opt-in found' },
        { status: 400 }
      )
    }

    const apiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.RESEND_FROM_EMAIL
    if (!apiKey || !fromEmail) {
      await prisma.newsletterIssue.update({
        where: { id },
        data: { status: 'READY' },
      })
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const resend = new Resend(apiKey)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dekesharon.com'

    let sent = 0
    let failed = 0

    for (const subscriber of subscribers) {
      try {
        const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${subscriber.unsubscribeToken}`
        const html = buildNewsletterEmail(issue, unsubscribeUrl)

        await resend.emails.send({
          from: fromEmail,
          to: subscriber.email,
          subject: issue.subject || issue.title,
          html,
          tags: [
            { name: 'type', value: 'newsletter' },
            { name: 'issue', value: String(issue.issueNumber) },
          ],
        })
        sent++

        // Rate limit: ~10/sec
        await new Promise(r => setTimeout(r, 100))
      } catch (err) {
        console.error(`Failed to send to ${subscriber.email}:`, err)
        failed++
      }
    }

    // Update issue
    await prisma.newsletterIssue.update({
      where: { id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        subscriberCount: sent,
      },
    })

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: subscribers.length,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
