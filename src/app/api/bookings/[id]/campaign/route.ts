import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import { geocodeAddress } from '@/lib/services/geocoding'
import { discoverLeads } from '@/lib/discovery'

// POST /api/bookings/[id]/campaign - Create campaign from existing booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch booking with lead info
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        lead: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        campaigns: {
          select: { id: true },
        },
      },
    })

    if (!booking) {
      throw new ApiError(404, 'Booking not found', 'BOOKING_NOT_FOUND')
    }

    if (!booking.location) {
      throw new ApiError(400, 'Booking must have a location to create a campaign', 'NO_LOCATION')
    }

    // Check if booking already has campaigns
    if (booking.campaigns.length > 0) {
      throw new ApiError(400, 'Booking already has a linked campaign', 'CAMPAIGN_EXISTS')
    }

    // Geocode if needed
    let latitude = booking.latitude
    let longitude = booking.longitude

    if (!latitude || !longitude) {
      const geoResult = await geocodeAddress(booking.location)
      if (!geoResult) {
        throw new ApiError(400, 'Could not geocode booking location', 'GEOCODE_FAILED')
      }
      latitude = geoResult.latitude
      longitude = geoResult.longitude
    }

    // Compute campaign window
    const availBefore = booking.availabilityBefore ?? 3
    const availAfter = booking.availabilityAfter ?? 3
    const startDate = booking.startDate || new Date()
    const endDate = booking.endDate || startDate

    const campaignStart = new Date(startDate)
    campaignStart.setDate(campaignStart.getDate() - availBefore)
    const campaignEnd = new Date(endDate)
    campaignEnd.setDate(campaignEnd.getDate() + availAfter)

    const campaignName = `${booking.serviceType} - ${booking.lead.firstName} ${booking.lead.lastName} - ${booking.location} (${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        name: campaignName,
        baseLocation: booking.location,
        latitude,
        longitude,
        radius: 100,
        startDate: campaignStart,
        endDate: campaignEnd,
        bookingId: booking.id,
        status: 'DRAFT',
      },
    })

    // Trigger lead discovery (async)
    discoverLeads(campaign.id).catch((err) => {
      console.error('Lead discovery failed (non-blocking):', err)
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
