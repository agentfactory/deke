import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import { sendSubscriberNotification } from '@/lib/notifications/subscriber-notification'

const subscriberSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  email: z.string().email('Valid email is required'),
  location: z.string().min(1, 'Location is required'),
  groupName: z.string().optional(),
  newsletterOptIn: z.boolean().default(false),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = subscriberSchema.safeParse(body)

    if (!result.success) {
      return ApiError.badRequest(result.error.issues[0].message)
    }

    const data = result.data

    // Check for duplicate
    const existing = await prisma.emailSubscriber.findUnique({
      where: { email: data.email },
    })

    if (existing) {
      return NextResponse.json(
        { success: true, duplicate: true, message: "You're already on the list!" },
        { status: 200 }
      )
    }

    // Create subscriber record
    const subscriber = await prisma.emailSubscriber.create({
      data: {
        firstName: data.firstName,
        email: data.email,
        location: data.location,
        groupName: data.groupName || null,
        newsletterOptIn: data.newsletterOptIn,
        source: 'popup',
      },
    })

    // Send notification emails (fire-and-forget)
    sendSubscriberNotification({
      id: subscriber.id,
      firstName: subscriber.firstName,
      email: subscriber.email,
      location: subscriber.location,
      groupName: subscriber.groupName,
      newsletterOptIn: subscriber.newsletterOptIn,
    }).catch(err => console.error('Subscriber notification failed:', err))

    return NextResponse.json(
      { success: true, message: "You're on the list!" },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
