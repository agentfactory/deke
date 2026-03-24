import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'

const unsubscribeSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = unsubscribeSchema.parse(body)

    const subscriber = await prisma.emailSubscriber.findUnique({
      where: { unsubscribeToken: token },
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Invalid or expired unsubscribe link' },
        { status: 404 }
      )
    }

    await prisma.emailSubscriber.update({
      where: { id: subscriber.id },
      data: { newsletterOptIn: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
