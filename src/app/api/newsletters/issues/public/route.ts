import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'

// Public — no auth. Returns only SENT issues for the archive.
export async function GET() {
  try {
    const issues = await prisma.newsletterIssue.findMany({
      where: { status: 'SENT' },
      select: {
        id: true,
        issueNumber: true,
        title: true,
        subject: true,
        storyContent: true,
        sentAt: true,
        _count: { select: { comments: { where: { approved: true } } } },
      },
      orderBy: { issueNumber: 'desc' },
    })

    return NextResponse.json({ issues })
  } catch (error) {
    return handleApiError(error)
  }
}
