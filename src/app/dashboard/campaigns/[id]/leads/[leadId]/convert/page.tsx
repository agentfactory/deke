"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Convert Lead to Contact & Redirect to Booking Page
 *
 * This page calls the lead convert API to create a contact,
 * then redirects to the booking form with the contact's ID.
 *
 * URL: /dashboard/campaigns/[campaignId]/leads/[leadId]/convert
 * Redirects to: /booking?contactId={contactId}
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function convertAndRedirect() {
      const { leadId } = await params;
      const { service } = await searchParams;

      try {
        // Convert lead to contact
        const response = await fetch(`/api/leads/${leadId}/convert`, {
          method: 'POST',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to convert lead');
        }

        const contact = await response.json();

        // Build booking URL with contactId
        let bookingUrl = `/booking?contactId=${contact.id}`;

        // Add service query param if provided
        if (service) {
          bookingUrl += `&service=${service}`;
        }

        // Redirect to booking form
        router.push(bookingUrl);
      } catch (err) {
        console.error('Error converting lead:', err);
        setError(err instanceof Error ? err.message : 'Failed to convert lead');
      }
    }

    convertAndRedirect();
  }, [params, searchParams, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="text-primary underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">
          Converting lead and redirecting to booking form...
        </p>
      </div>
    </div>
  );
}
