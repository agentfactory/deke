import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import {
  createLeadSchema,
  leadFiltersSchema,
  type CreateLeadInput
} from '@/lib/validations/lead'

// POST /api/leads - Create or update lead (upsert by email)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData: CreateLeadInput = createLeadSchema.parse(body)

    // Check if lead exists
    const existingLead = await prisma.lead.findUnique({
      where: { email: validatedData.email }
    })

    let lead
    let isNew = false

    if (existingLead) {
      // Update existing lead
      lead = await prisma.lead.update({
        where: { email: validatedData.email },
        data: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          phone: validatedData.phone ?? existingLead.phone,
          organization: validatedData.organization ?? existingLead.organization,
          source: validatedData.source ?? existingLead.source,
          // Keep the higher score between existing and new
          score: Math.max(existingLead.score, validatedData.score ?? 0),
          latitude: validatedData.latitude ?? existingLead.latitude,
          longitude: validatedData.longitude ?? existingLead.longitude,
          lastContactedAt: new Date(),
        }
      })
    } else {
      // Create new lead
      isNew = true
      lead = await prisma.lead.create({
        data: {
          email: validatedData.email,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          phone: validatedData.phone ?? null,
          organization: validatedData.organization ?? null,
          source: validatedData.source ?? 'website',
          status: validatedData.status ?? 'NEW',
          score: validatedData.score ?? 0,
          latitude: validatedData.latitude ?? null,
          longitude: validatedData.longitude ?? null,
        }
      })
    }

    return NextResponse.json(lead, { status: isNew ? 201 : 200 })
  } catch (error) {
    return handleApiError(error)
  }
}

// GET /api/leads - List leads with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters = leadFiltersSchema.parse({
      status: searchParams.get('status') || undefined,
      source: searchParams.get('source') || undefined,
      email: searchParams.get('email') || undefined,
      organization: searchParams.get('organization') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    })

    const where: any = {}
    if (filters.status) where.status = filters.status
    if (filters.source) where.source = filters.source
    if (filters.email) where.email = { contains: filters.email, mode: 'insensitive' }
    if (filters.organization) where.organization = { contains: filters.organization, mode: 'insensitive' }

    const limit = filters.limit ?? 50
    const offset = filters.offset ?? 0

    // Get leads with related data counts
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          _count: {
            select: {
              bookings: true,
              inquiries: true,
              orders: true,
            }
          }
        }
      }),
      prisma.lead.count({ where })
    ])

    return NextResponse.json({
      leads,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + leads.length < total
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
