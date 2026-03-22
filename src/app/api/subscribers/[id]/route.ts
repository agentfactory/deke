import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'

// DELETE /api/subscribers/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await prisma.emailSubscriber.findUnique({ where: { id } })
    if (!existing) {
      throw new ApiError(404, 'Subscriber not found', 'SUBSCRIBER_NOT_FOUND')
    }

    await prisma.emailSubscriber.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
}
