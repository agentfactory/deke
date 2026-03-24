import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import { updateIdeaSchema } from '@/lib/validations/newsletter'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = updateIdeaSchema.parse(body)

    const idea = await prisma.newsletterIdea.update({
      where: { id },
      data,
      include: { issue: { select: { id: true, title: true, issueNumber: true } } },
    })

    return NextResponse.json({ idea })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.newsletterIdea.delete({ where: { id } })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
}
