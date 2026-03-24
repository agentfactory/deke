import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'

// PATCH — approve or reject a comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { approved } = await request.json()

    const comment = await prisma.newsletterComment.update({
      where: { id },
      data: { approved: Boolean(approved) },
    })

    return NextResponse.json({ comment })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE — remove a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.newsletterComment.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
}
