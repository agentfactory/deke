import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import { z } from 'zod'

const updateGroupRequestSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWING', 'MATCHED', 'CLOSED']).optional(),
  notes: z.string().optional().nullable(),
})

// PATCH /api/group-requests/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = updateGroupRequestSchema.parse(body)

    const existing = await prisma.groupRequest.findUnique({ where: { id } })
    if (!existing) {
      throw new ApiError(404, 'Group request not found', 'GROUP_REQUEST_NOT_FOUND')
    }

    const updated = await prisma.groupRequest.update({
      where: { id },
      data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/group-requests/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await prisma.groupRequest.findUnique({ where: { id } })
    if (!existing) {
      throw new ApiError(404, 'Group request not found', 'GROUP_REQUEST_NOT_FOUND')
    }

    await prisma.groupRequest.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
}
