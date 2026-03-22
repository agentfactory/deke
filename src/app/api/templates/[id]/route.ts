import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import { z } from 'zod'
import { outreachChannelSchema, serviceTypeSchema } from '@/lib/validations/template'

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  subject: z.string().optional().nullable(),
  body: z.string().min(1).optional(),
  channel: outreachChannelSchema.optional(),
  serviceType: serviceTypeSchema.optional().nullable(),
  variables: z.string().optional().nullable(),
})

// GET /api/templates/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const template = await prisma.messageTemplate.findUnique({ where: { id } })
    if (!template) {
      throw new ApiError(404, 'Template not found', 'TEMPLATE_NOT_FOUND')
    }
    return NextResponse.json(template)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/templates/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateTemplateSchema.parse(body)

    const existing = await prisma.messageTemplate.findUnique({ where: { id } })
    if (!existing) {
      throw new ApiError(404, 'Template not found', 'TEMPLATE_NOT_FOUND')
    }

    const template = await prisma.messageTemplate.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(template)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/templates/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await prisma.messageTemplate.findUnique({ where: { id } })
    if (!existing) {
      throw new ApiError(404, 'Template not found', 'TEMPLATE_NOT_FOUND')
    }

    await prisma.messageTemplate.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
}
