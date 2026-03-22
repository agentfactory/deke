import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'
import { templateFiltersSchema, outreachChannelSchema, serviceTypeSchema } from '@/lib/validations/template'
import { z } from 'zod'

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().optional().nullable(),
  body: z.string().min(1, 'Body is required'),
  channel: outreachChannelSchema.optional().default('EMAIL'),
  serviceType: serviceTypeSchema.optional().nullable(),
  variables: z.string().optional().nullable(),
})

// POST /api/templates - Create template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createTemplateSchema.parse(body)

    const template = await prisma.messageTemplate.create({
      data: {
        name: data.name,
        subject: data.subject ?? null,
        body: data.body,
        channel: data.channel,
        serviceType: data.serviceType ?? null,
        variables: data.variables ?? null,
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

// GET /api/templates - List message templates with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters = templateFiltersSchema.parse({
      serviceType: searchParams.get('serviceType') || undefined,
      channel: searchParams.get('channel') || undefined,
    })

    const where: any = {}
    if (filters.serviceType) where.serviceType = filters.serviceType
    if (filters.channel) where.channel = filters.channel

    const templates = await prisma.messageTemplate.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ templates })
  } catch (error) {
    return handleApiError(error)
  }
}
