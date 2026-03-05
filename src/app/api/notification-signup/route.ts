import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'

const notificationSignupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  email: z.string().email('Valid email is required'),
  location: z.string().min(1, 'Location is required'),
  newsletter: z.boolean().default(false),
  isGroup: z.boolean().default(false),
  groupName: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = notificationSignupSchema.parse(body)

    // Upsert lead by email
    const existingLead = await prisma.lead.findUnique({
      where: { email: data.email },
    })

    let lead
    if (existingLead) {
      lead = await prisma.lead.update({
        where: { email: data.email },
        data: {
          firstName: data.firstName,
          lastName: existingLead.lastName,
        },
      })
    } else {
      lead = await prisma.lead.create({
        data: {
          firstName: data.firstName,
          lastName: '',
          email: data.email,
          source: 'notification-popup',
          status: 'NEW',
        },
      })
    }

    // Build details JSON with all preference info
    const details = JSON.stringify({
      location: data.location,
      newsletter: data.newsletter,
      isGroup: data.isGroup,
      groupName: data.isGroup ? data.groupName : undefined,
    })

    // Build a human-readable message
    const messageParts = [`Location: ${data.location}`]
    if (data.newsletter) messageParts.push('Opted in to general newsletter')
    if (data.isGroup) {
      messageParts.push(
        `Group interest${data.groupName ? `: ${data.groupName}` : ''}`
      )
    }

    // Create inquiry to track the notification signup
    await prisma.inquiry.create({
      data: {
        leadId: lead.id,
        serviceType: 'CONSULTATION',
        status: 'PENDING',
        details,
        message: `Area notification signup — ${messageParts.join('; ')}`,
      },
    })

    return NextResponse.json(
      { message: 'Signed up successfully' },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
