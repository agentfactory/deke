import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'

// POST /api/leads/[id]/convert - Convert lead to contact
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const lead = await prisma.lead.findUnique({
      where: { id }
    })

    if (!lead) {
      throw new ApiError(404, 'Lead not found', 'LEAD_NOT_FOUND')
    }

    if (lead.status === 'CONVERTED') {
      // Return existing contact
      const existingContact = await prisma.contact.findFirst({
        where: { leadId: lead.id }
      })
      if (existingContact) {
        return NextResponse.json(existingContact, { status: 200 })
      }
    }

    // Check if a contact with this email already exists
    const existingContactByEmail = await prisma.contact.findUnique({
      where: { email: lead.email }
    })

    if (existingContactByEmail) {
      // Link the existing contact to this lead if not already linked
      if (!existingContactByEmail.leadId) {
        await prisma.contact.update({
          where: { id: existingContactByEmail.id },
          data: { leadId: lead.id }
        })
      }

      // Mark lead as converted
      await prisma.lead.update({
        where: { id },
        data: {
          status: 'CONVERTED',
          convertedAt: new Date(),
        }
      })

      return NextResponse.json(existingContactByEmail, { status: 200 })
    }

    // Create contact from lead fields
    const contact = await prisma.contact.create({
      data: {
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        organization: lead.organization,
        source: lead.source,
        contactTitle: lead.contactTitle,
        latitude: lead.latitude,
        longitude: lead.longitude,
        website: lead.website,
        emailVerified: lead.emailVerified,
        editorialSummary: lead.editorialSummary,
        googleRating: lead.googleRating,
        leadId: lead.id,
      }
    })

    // Mark lead as converted
    await prisma.lead.update({
      where: { id },
      data: {
        status: 'CONVERTED',
        convertedAt: new Date(),
      }
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
