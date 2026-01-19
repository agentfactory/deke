'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingForm } from '@/components/bookings/booking-form';
import { ArrowLeft } from 'lucide-react';

export default function NewBookingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setIsLoading(true);

      // Transform form values to API format
      const payload = {
        leadId: values.leadId,
        serviceType: values.serviceType,
        status: values.status,
        startDate: values.startDate || null,
        endDate: values.endDate || null,
        timezone: values.timezone || null,
        location: values.location || null,
        amount: values.amount ? parseFloat(values.amount) : null,
        depositPaid: values.depositPaid ? parseFloat(values.depositPaid) : null,
        paymentStatus: values.paymentStatus,
        internalNotes: values.internalNotes || null,
        clientNotes: values.clientNotes || null,
        tripId: values.tripId || null,
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create booking');
      }

      const booking = await response.json();
      router.push(`/dashboard/bookings/${booking.id}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Booking</h1>
          <p className="text-muted-foreground">Add a new service booking</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel="Create Booking"
          />
        </CardContent>
      </Card>
    </div>
  );
}
