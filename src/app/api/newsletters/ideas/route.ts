import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'
import { createIdeaSchema, NEWSLETTER_SECTIONS, IDEA_STATUSES } from '@/lib/validations/newsletter'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')
    const status = searchParams.get('status')

    const where: Record<string, string> = {}
    if (section && NEWSLETTER_SECTIONS.includes(section as never)) {
      where.section = section
    }
    if (status && IDEA_STATUSES.includes(status as never)) {
      where.status = status
    }

    const ideas = await prisma.newsletterIdea.findMany({
      where,
      include: { issue: { select: { id: true, title: true, issueNumber: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ ideas })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createIdeaSchema.parse(body)

    const idea = await prisma.newsletterIdea.create({ data })

    return NextResponse.json({ idea }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
