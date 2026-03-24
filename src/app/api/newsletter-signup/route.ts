import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'
import { sendSignupNotification } from '@/lib/notifications/signup-notification'

const newsletterSchema = z.object({
  email: z.string().email('Valid email is required'),
  source: z.string().default('newsletter-popup'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = newsletterSchema.parse(body)

    // Check for existing subscriber
    const existingSubscriber = await prisma.emailSubscriber.findUnique({
      where: { email: data.email },
    })

    if (existingSubscriber) {
      return NextResponse.json(
        { success: true, duplicate: true, message: "You're already subscribed!" },
        { status: 200 }
      )
    }

    // Also check leads table
    const existingLead = await prisma.lead.findUnique({
      where: { email: data.email },
    })

    if (existingLead) {
      // Already a lead — just ensure they're marked as newsletter subscriber
      await prisma.emailSubscriber.create({
        data: {
          firstName: existingLead.firstName || 'Subscriber',
          email: data.email,
          location: 'Not specified',
          newsletterOptIn: true,
          source: data.source,
        },
      })
    } else {
      // New subscriber — create both lead and subscriber records
      const lead = await prisma.lead.create({
        data: {
          firstName: 'Subscriber',
          lastName: '',
          email: data.email,
          source: data.source,
          status: 'NEW',
        },
      })

      await prisma.emailSubscriber.create({
        data: {
          firstName: 'Subscriber',
          email: data.email,
          location: 'Not specified',
          newsletterOptIn: true,
          source: data.source,
        },
      })
    }

    // Send admin notification (fire-and-forget)
    sendSignupNotification({
      type: 'newsletter-popup',
      name: 'Newsletter Subscriber',
      email: data.email,
      message: `Newsletter signup via ${data.source}`,
    }).catch(err => console.error('Newsletter signup notification failed:', err))

    return NextResponse.json(
      { success: true, message: "You're subscribed!" },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
