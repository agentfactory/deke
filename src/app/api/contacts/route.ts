import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import {
  createContactSchema,
  contactFiltersSchema,
  type CreateContactInput
} from '@/lib/validations/contact'

// POST /api/contacts - Create or update contact (upsert by email)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData: CreateContactInput = createContactSchema.parse(body)

    const contactEmail = validatedData.email || null

    let contact
    let isNew = false

    // Only look up existing contact if a real email was provided
    const existingContact = contactEmail
      ? await prisma.contact.findUnique({ where: { email: contactEmail } })
      : null

    if (existingContact) {
      contact = await prisma.contact.update({
        where: { email: contactEmail! },
        data: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          phone: validatedData.phone ?? existingContact.phone,
          organization: validatedData.organization ?? existingContact.organization,
          source: validatedData.source ?? existingContact.source,
          contactTitle: validatedData.contactTitle ?? existingContact.contactTitle,
          latitude: validatedData.latitude ?? existingContact.latitude,
          longitude: validatedData.longitude ?? existingContact.longitude,
          website: validatedData.website ?? existingContact.website,
        }
      })
    } else {
      isNew = true
      contact = await prisma.contact.create({
        data: {
          email: contactEmail || `noemail-${randomUUID()}@placeholder.internal`,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          phone: validatedData.phone ?? null,
          organization: validatedData.organization ?? null,
          source: validatedData.source ?? null,
          contactTitle: validatedData.contactTitle ?? null,
          latitude: validatedData.latitude ?? null,
          longitude: validatedData.longitude ?? null,
          website: validatedData.website ?? null,
          leadId: validatedData.leadId ?? null,
        }
      })
    }

    return NextResponse.json(contact, { status: isNew ? 201 : 200 })
  } catch (error) {
    return handleApiError(error)
  }
}

// GET /api/contacts - List contacts with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters = contactFiltersSchema.parse({
      email: searchParams.get('email') || undefined,
      organization: searchParams.get('organization') || undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    })

    const where: any = {}
    if (filters.email) where.email = { contains: filters.email, mode: 'insensitive' }
    if (filters.organization) where.organization = { contains: filters.organization, mode: 'insensitive' }
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { organization: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    const limit = filters.limit ?? 50
    const offset = filters.offset ?? 0

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              bookings: true,
            }
          },
          lead: {
            select: {
              id: true,
              status: true,
            }
          }
        }
      }),
      prisma.contact.count({ where })
    ])

    return NextResponse.json({
      contacts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + contacts.length < total
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
