import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { sendBookingNotification } from "@/lib/notifications/booking-notification";

// Zero-friction booking creation
// Auto-creates Lead if needed, creates Booking, optionally links to Trip
const QuickBookingSchema = z.object({
  client: z.object({
    firstName: z.string().min(1, "Client first name is required"),
    lastName: z.string().min(1, "Client last name is required"),
    email: z.string().email("Valid email is required"),
    organization: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
  }),
  serviceType: z.string().min(1, "Service type is required"),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  amount: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  tripId: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = QuickBookingSchema.safeParse(body);
    if (!result.success) {
      return ApiError.badRequest(result.error.issues[0].message);
    }

    const { client, serviceType, startDate, endDate, location, amount, notes, tripId } = result.data;

    // Step 1: Find or create Lead
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
          status: "QUALIFIED", // They're booking, so they're qualified
        },
      });
    } else {
      // Update lead info if provided
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          firstName: client.firstName,
          lastName: client.lastName,
          organization: client.organization || lead.organization,
          phone: client.phone || lead.phone,
        },
      });
    }

    // Step 2: Verify Trip exists if provided
    if (tripId) {
      const trip = await prisma.trip.findUnique({ where: { id: tripId } });
      if (!trip) {
        return ApiError.badRequest("Trip not found");
      }
    }

    // Step 3: Create Booking
    const booking = await prisma.booking.create({
      data: {
        leadId: lead.id,
        tripId: tripId || null,
        serviceType,
        status: "CONFIRMED",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        location: location || null,
        amount: amount || null,
        paymentStatus: "UNPAID",
        internalNotes: notes || null,
      },
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            organization: true,
          },
        },
        trip: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Send booking notification emails (async - don't block response)
    sendBookingNotification({
      bookingId: booking.id,
      leadName: `${booking.lead.firstName} ${booking.lead.lastName}`,
      leadEmail: booking.lead.email,
      organization: booking.lead.organization,
      serviceType: booking.serviceType,
      startDate: booking.startDate,
      endDate: booking.endDate,
      location: booking.location,
      amount: booking.amount,
      clientNotes: booking.internalNotes,
    }).catch((error) => {
      console.error('Failed to send booking notification:', error);
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
