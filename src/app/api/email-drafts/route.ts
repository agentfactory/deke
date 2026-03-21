import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'

// GET /api/email-drafts — list all email drafts across campaigns
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || undefined
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const [drafts, total] = await Promise.all([
      prisma.emailDraft.findMany({
        where,
        include: {
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              organization: true,
            },
          },
          campaign: {
            select: {
              id: true,
              name: true,
              baseLocation: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.emailDraft.count({ where }),
    ])

    return NextResponse.json({
      drafts,
      pagination: { total, limit, offset, hasMore: offset + drafts.length < total },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
