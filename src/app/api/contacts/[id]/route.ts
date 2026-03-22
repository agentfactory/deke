import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import { updateContactSchema, type UpdateContactInput } from '@/lib/validations/contact'

// GET /api/contacts/[id] - Fetch single contact
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        bookings: {
          select: {
            id: true,
            serviceType: true,
            status: true,
            startDate: true,
            endDate: true,
            location: true,
            amount: true,
            depositPaid: true,
            paymentStatus: true,
          },
          orderBy: { createdAt: 'desc' }
        },
        lead: {
          select: {
            id: true,
            status: true,
            source: true,
            score: true,
          }
        },
        _count: {
          select: {
            bookings: true,
          }
        }
      }
    })

    if (!contact) {
      throw new ApiError(404, 'Contact not found', 'CONTACT_NOT_FOUND')
    }

    return NextResponse.json(contact)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/contacts/[id] - Update contact
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const validatedData: UpdateContactInput = updateContactSchema.parse(body)

    const existingContact = await prisma.contact.findUnique({
      where: { id }
    })

    if (!existingContact) {
      throw new ApiError(404, 'Contact not found', 'CONTACT_NOT_FOUND')
    }

    // If email is being changed, check it's not already taken
    if (validatedData.email && validatedData.email !== existingContact.email) {
      const emailTaken = await prisma.contact.findUnique({
        where: { email: validatedData.email }
      })
      if (emailTaken) {
        throw new ApiError(409, 'A contact with this email already exists', 'EMAIL_ALREADY_EXISTS')
      }
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        organization: validatedData.organization,
        source: validatedData.source,
        contactTitle: validatedData.contactTitle,
        latitude: validatedData.latitude ?? undefined,
        longitude: validatedData.longitude ?? undefined,
        website: validatedData.website,
      },
      include: {
        _count: {
          select: {
            bookings: true,
          }
        }
      }
    })

    return NextResponse.json(contact)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/contacts/[id] - Delete contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        bookings: { select: { id: true } }
      }
    })

    if (!contact) {
      throw new ApiError(404, 'Contact not found', 'CONTACT_NOT_FOUND')
    }

    if (contact.bookings.length > 0) {
      throw new ApiError(
        409,
        `Cannot delete contact with ${contact.bookings.length} existing booking(s). Please delete or reassign bookings first.`,
        'CONTACT_HAS_BOOKINGS'
      )
    }

    await prisma.contact.delete({ where: { id } })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
}
