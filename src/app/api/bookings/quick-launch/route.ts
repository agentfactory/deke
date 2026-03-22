import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { geocodeAddress } from "@/lib/services/geocoding";
import { discoverLeads } from "@/lib/discovery";
import { sendBookingNotification } from "@/lib/notifications/booking-notification";

// Combined booking + campaign creation + lead discovery
const QuickLaunchSchema = z.object({
  client: z.object({
    firstName: z.string().min(1, "Client first name is required"),
    lastName: z.string().min(1, "Client last name is required"),
    email: z.string().email("Valid email is required"),
    organization: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
  }),
  serviceType: z.string().min(1, "Service type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  location: z.string().min(1, "Location is required for campaign"),
  amount: z.number().nullable().optional(),
  depositPaid: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  tripId: z.string().nullable().optional(),
  // Campaign settings
  availabilityBefore: z.number().int().min(0).max(30).default(3),
  availabilityAfter: z.number().int().min(0).max(30).default(3),
  campaignRadius: z.number().min(1).max(1000).default(100),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = QuickLaunchSchema.safeParse(body);
    if (!result.success) {
      return ApiError.badRequest(result.error.issues[0].message);
    }

    const {
      client,
      serviceType,
      startDate,
      endDate,
      location,
      amount,
      depositPaid,
      notes,
      tripId,
      availabilityBefore,
      availabilityAfter,
      campaignRadius,
    } = result.data;

    // Step 1: Geocode location
    const geoResult = await geocodeAddress(location);
    if (!geoResult) {
      return ApiError.badRequest(
        "Could not geocode location. Please provide a valid address."
      );
    }

    // Step 2: Find or create Lead
    let lead = await prisma.lead.findUnique({
      where: { email: client.email },
    });

    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          organization: client.organization || null,
          phone: client.phone || null,
          source: "direct_booking",
          status: "CONVERTED",
          convertedAt: new Date(),
          latitude: geoResult.latitude,
          longitude: geoResult.longitude,
        },
      });
    } else if (lead.status !== 'CONVERTED') {
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          firstName: lead.firstName || client.firstName,
          lastName: lead.lastName || client.lastName,
          organization: lead.organization || client.organization || null,
          phone: lead.phone || client.phone || null,
          status: 'CONVERTED',
          convertedAt: new Date(),
          latitude: geoResult.latitude,
          longitude: geoResult.longitude,
        },
      });
    } else {
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          firstName: lead.firstName || client.firstName,
          lastName: lead.lastName || client.lastName,
          organization: lead.organization || client.organization || null,
          phone: lead.phone || client.phone || null,
          latitude: geoResult.latitude,
          longitude: geoResult.longitude,
        },
      });
    }

    // Step 2.5: Find or create Contact
    let contact = await prisma.contact.findUnique({
      where: { email: client.email },
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          organization: client.organization || null,
          phone: client.phone || null,
          source: "direct_booking",
          leadId: lead.id,
        },
      });
    } else {
      contact = await prisma.contact.update({
        where: { id: contact.id },
        data: {
          firstName: contact.firstName || client.firstName,
          lastName: contact.lastName || client.lastName,
          organization: contact.organization || client.organization || null,
          phone: contact.phone || client.phone || null,
        },
      });
    }

    // Step 3: Verify Trip exists if provided
    if (tripId) {
      const trip = await prisma.trip.findUnique({ where: { id: tripId } });
      if (!trip) {
        return ApiError.badRequest("Trip not found");
      }
    }

    // Step 4: Create Booking with availability fields
    const booking = await prisma.booking.create({
      data: {
        contactId: contact.id,
        tripId: tripId || null,
        serviceType,
        status: "CONFIRMED",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        latitude: geoResult.latitude,
        longitude: geoResult.longitude,
        amount: amount || null,
        depositPaid: depositPaid || null,
        paymentStatus: depositPaid ? "DEPOSIT_PAID" : "UNPAID",
        internalNotes: notes || null,
        availabilityBefore,
        availabilityAfter,
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            organization: true,
          },
        },
      },
    });

    // Step 5: Compute campaign window
    const bookingStart = new Date(startDate);
    const bookingEnd = new Date(endDate);
    const campaignStart = new Date(bookingStart);
    campaignStart.setDate(campaignStart.getDate() - availabilityBefore);
    const campaignEnd = new Date(bookingEnd);
    campaignEnd.setDate(campaignEnd.getDate() + availabilityAfter);

    // Step 6: Create Campaign linked to booking
    const campaign = await prisma.campaign.create({
      data: {
        name: `${serviceType} - ${location} (${bookingStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`,
        baseLocation: location,
        latitude: geoResult.latitude,
        longitude: geoResult.longitude,
        radius: campaignRadius,
        startDate: campaignStart,
        endDate: campaignEnd,
        bookingId: booking.id,
        status: "DRAFT",
      },
    });

    // Step 7: Trigger lead discovery (async - don't block response)
    let discoveryResult = null;
    try {
      discoveryResult = await discoverLeads(campaign.id);
    } catch (err) {
      console.error("Lead discovery failed (non-blocking):", err);
    }

    // Send booking notification (async - don't block)
    sendBookingNotification({
      bookingId: booking.id,
      contactName: `${booking.contact.firstName} ${booking.contact.lastName}`,
      contactEmail: booking.contact.email,
      organization: booking.contact.organization,
      serviceType: booking.serviceType,
      startDate: booking.startDate,
      endDate: booking.endDate,
      location: booking.location,
      amount: booking.amount,
      clientNotes: booking.internalNotes,
    }).catch((error) => {
      console.error("Failed to send booking notification:", error);
    });

    return NextResponse.json(
      {
        booking,
        campaign: {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          radius: campaign.radius,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
        },
        discoveryResult,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
