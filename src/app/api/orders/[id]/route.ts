import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import { updateOrderSchema, type UpdateOrderInput } from '@/lib/validations/order'

// GET /api/orders/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            organization: true,
          },
        },
      },
    })

    if (!order) {
      throw new ApiError(404, 'Order not found', 'ORDER_NOT_FOUND')
    }

    return NextResponse.json(order)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/orders/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const validatedData: UpdateOrderInput = updateOrderSchema.parse(body)

    const existing = await prisma.order.findUnique({ where: { id } })
    if (!existing) {
      throw new ApiError(404, 'Order not found', 'ORDER_NOT_FOUND')
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: validatedData.status,
        songTitle: validatedData.songTitle,
        songArtist: validatedData.songArtist,
        voiceParts: validatedData.voiceParts,
        packageTier: validatedData.packageTier,
        basePrice: validatedData.basePrice,
        rushFee: validatedData.rushFee,
        totalAmount: validatedData.totalAmount,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        deliveredAt: validatedData.deliveredAt ? new Date(validatedData.deliveredAt) : undefined,
        downloadUrl: validatedData.downloadUrl,
        revisionsUsed: validatedData.revisionsUsed,
        revisionsMax: validatedData.revisionsMax,
      },
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/orders/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) {
      throw new ApiError(404, 'Order not found', 'ORDER_NOT_FOUND')
    }

    await prisma.order.delete({ where: { id } })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
}
