import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'
import { createIssueSchema } from '@/lib/validations/newsletter'

export async function GET() {
  try {
    const issues = await prisma.newsletterIssue.findMany({
      include: {
        _count: { select: { ideas: true } },
      },
      orderBy: { issueNumber: 'desc' },
    })

    return NextResponse.json({ issues })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const data = createIssueSchema.parse(body)

    // Auto-compute next issue number
    const latest = await prisma.newsletterIssue.findFirst({
      orderBy: { issueNumber: 'desc' },
      select: { issueNumber: true },
    })
    const nextNumber = (latest?.issueNumber ?? 0) + 1

    const issue = await prisma.newsletterIssue.create({
      data: {
        issueNumber: nextNumber,
        title: data.title || `The Arrangement #${nextNumber}`,
        subject: data.subject || `The Arrangement #${nextNumber}`,
      },
    })

    return NextResponse.json({ issue }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
