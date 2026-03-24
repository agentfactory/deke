import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'

// GET — all comments for dashboard moderation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending' | 'approved' | 'all'

    const where: Record<string, boolean> = {}
    if (status === 'pending') where.approved = false
    if (status === 'approved') where.approved = true

    const comments = await prisma.newsletterComment.findMany({
      where,
      include: {
        issue: { select: { issueNumber: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const pendingCount = await prisma.newsletterComment.count({
      where: { approved: false },
    })

    return NextResponse.json({ comments, pendingCount })
  } catch (error) {
    return handleApiError(error)
  }
}
