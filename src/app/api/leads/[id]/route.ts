import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import { updateLeadSchema, type UpdateLeadInput } from '@/lib/validations/lead'

// GET /api/leads/[id] - Fetch single lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const lead = await prisma.lead.findUnique({
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
          orderBy: {
            createdAt: 'desc'
          }
        },
        inquiries: {
          select: {
            id: true,
            serviceType: true,
            status: true,
            message: true,
            quotedAmount: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            songTitle: true,
            songArtist: true,
            voiceParts: true,
            packageTier: true,
            status: true,
            basePrice: true,
            rushFee: true,
            totalAmount: true,
            dueDate: true,
            deliveredAt: true,
            revisionsUsed: true,
            revisionsMax: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        campaignLeads: {
          select: {
            id: true,
            campaignId: true,
            score: true,
            distance: true,
            source: true,
            status: true,
            campaign: {
              select: {
                id: true,
                name: true,
                status: true,
                baseLocation: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            bookings: true,
            inquiries: true,
            orders: true,
            campaignLeads: true,
          }
        }
      }
    })

    if (!lead) {
      throw new ApiError(404, 'Lead not found', 'LEAD_NOT_FOUND')
    }

    return NextResponse.json(lead)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/leads/[id] - Update lead
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate input
    const validatedData: UpdateLeadInput = updateLeadSchema.parse(body)

    // Check if lead exists
    const existingLead = await prisma.lead.findUnique({
      where: { id }
    })

    if (!existingLead) {
      throw new ApiError(404, 'Lead not found', 'LEAD_NOT_FOUND')
    }

    // Update lead (auto-update lastContactedAt)
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        organization: validatedData.organization,
        source: validatedData.source,
        status: validatedData.status,
        score: validatedData.score ?? undefined,
        latitude: validatedData.latitude ?? undefined,
        longitude: validatedData.longitude ?? undefined,
        lastContactedAt: new Date(),
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
    })

    return NextResponse.json(lead)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/leads/[id] - Delete lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if lead exists
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        bookings: {
          select: {
            id: true,
            serviceType: true,
          }
        },
        orders: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    })

    if (!lead) {
      throw new ApiError(404, 'Lead not found', 'LEAD_NOT_FOUND')
    }

    // Check if bookings or orders exist - prevent deletion
    const hasBookings = lead.bookings && lead.bookings.length > 0
    const hasOrders = lead.orders && lead.orders.length > 0

    if (hasBookings || hasOrders) {
      const issues = []
      if (hasBookings) issues.push(`${lead.bookings.length} booking(s)`)
      if (hasOrders) issues.push(`${lead.orders.length} order(s)`)

      throw new ApiError(
        409,
        `Cannot delete lead with existing ${issues.join(' and ')}. Please delete those first or reassign them to another lead.`,
        'LEAD_HAS_DEPENDENCIES'
      )
    }

    // Delete lead (cascade delete for inquiries and chatSessions handled by schema)
    await prisma.lead.delete({
      where: { id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
}
