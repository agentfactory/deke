import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { handleApiError, ApiError } from '@/lib/api-error'
import { geocodeAddress } from '@/lib/services/geocoding'
import { discoverLeads } from '@/lib/discovery'

/**
 * POST /api/bookings/[id]/discover
 *
 * One-click discovery: creates a campaign (if needed) and runs lead discovery.
 * Returns discovered leads split into readyToContact and needsResearch.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch booking with lead and existing campaigns
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        lead: {
          select: { firstName: true, lastName: true, organization: true },
        },
        campaigns: {
          select: { id: true, status: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!booking) {
      throw new ApiError(404, 'Booking not found', 'BOOKING_NOT_FOUND')
    }

    if (!booking.location) {
      throw new ApiError(400, 'Booking must have a location to discover opportunities', 'NO_LOCATION')
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

      // Save coordinates back to booking
      await prisma.booking.update({
        where: { id },
        data: { latitude, longitude },
      })
    }

    // Create campaign if one doesn't exist
    let campaignId: string

    if (booking.campaigns.length > 0) {
      campaignId = booking.campaigns[0].id
    } else {
      // Compute campaign window from availability
      const availBefore = booking.availabilityBefore ?? 3
      const availAfter = booking.availabilityAfter ?? 3
      const startDate = booking.startDate || new Date()
      const endDate = booking.endDate || startDate

      const campaignStart = new Date(startDate)
      campaignStart.setDate(campaignStart.getDate() - availBefore)
      const campaignEnd = new Date(endDate)
      campaignEnd.setDate(campaignEnd.getDate() + availAfter)

      const campaignName = `${booking.serviceType.replace('_', ' ')} - ${booking.lead.firstName} ${booking.lead.lastName} - ${booking.location}`

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

      campaignId = campaign.id
    }

    // Run discovery
    const discoveryResult = await discoverLeads(campaignId)

    // Fetch the campaign leads split into two tiers
    const campaignLeads = await prisma.campaignLead.findMany({
      where: { campaignId },
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            organization: true,
            website: true,
            emailVerified: true,
            needsEnrichment: true,
            contactTitle: true,
            editorialSummary: true,
            googleRating: true,
          },
        },
      },
      orderBy: { score: 'desc' },
    })

    const readyToContact = campaignLeads.filter(
      (cl: { status: string }) => cl.status !== 'NEEDS_RESEARCH' && cl.status !== 'REMOVED'
    )
    const needsResearch = campaignLeads.filter(
      (cl: { status: string }) => cl.status === 'NEEDS_RESEARCH'
    )

    return NextResponse.json({
      campaignId,
      readyToContact,
      needsResearch,
      discoveryResult: {
        total: discoveryResult.total,
        needsResearch: discoveryResult.needsResearch,
        filteredOut: discoveryResult.filteredOut,
        bySource: discoveryResult.bySource,
        duration: discoveryResult.duration,
        warnings: discoveryResult.warnings,
        errors: discoveryResult.errors,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
