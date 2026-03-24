import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'

export async function GET() {
  try {
    const [subscribers, count] = await Promise.all([
      prisma.emailSubscriber.findMany({
        where: { newsletterOptIn: true },
        select: {
          id: true,
          firstName: true,
          email: true,
          location: true,
          source: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.emailSubscriber.count({
        where: { newsletterOptIn: true },
      }),
    ])

    return NextResponse.json({ subscribers, count })
  } catch (error) {
    return handleApiError(error)
  }
}
