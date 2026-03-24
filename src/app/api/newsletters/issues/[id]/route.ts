import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'
import { updateIssueSchema } from '@/lib/validations/newsletter'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const issue = await prisma.newsletterIssue.findUnique({
      where: { id },
      include: {
        ideas: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    return NextResponse.json({ issue })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = updateIssueSchema.parse(body)

    const issue = await prisma.newsletterIssue.update({
      where: { id },
      data,
      include: {
        ideas: { orderBy: { createdAt: 'desc' } },
      },
    })

    return NextResponse.json({ issue })
  } catch (error) {
    return handleApiError(error)
  }
}
