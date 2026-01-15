"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Convert Lead to Booking Page
 *
 * This page redirects from a campaign lead to the booking form
 * with the lead's information pre-populated.
 *
 * URL: /dashboard/campaigns/[campaignId]/leads/[leadId]/convert
 * Redirects to: /booking?leadId={leadId}
 *
 * Optionally accepts ?service={serviceType} query param to pre-select service
 */
export default function ConvertLeadToBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; leadId: string }>;
  searchParams: Promise<{ service?: string }>;
}) {
  const router = useRouter();

  useEffect(() => {
    async function redirect() {
      const { leadId } = await params;
      const { service } = await searchParams;

      // Build booking URL with leadId
      let bookingUrl = `/booking?leadId=${leadId}`;

      // Add service query param if provided
      if (service) {
        bookingUrl += `&service=${service}`;
      }

      // Redirect to booking form
      router.push(bookingUrl);
    }

    redirect();
  }, [params, searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">
          Redirecting to booking form...
        </p>
      </div>
    </div>
  );
}
