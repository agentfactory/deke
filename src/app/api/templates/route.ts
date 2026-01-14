import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'
import { templateFiltersSchema } from '@/lib/validations/template'

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
