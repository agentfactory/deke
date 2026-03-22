'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Plus } from 'lucide-react';

const SERVICE_TYPES = [
  'ARRANGEMENT',
  'GROUP_COACHING',
  'INDIVIDUAL_COACHING',
  'WORKSHOP',
  'SPEAKING',
  'MASTERCLASS',
  'CONSULTATION'
] as const;

const STATUSES = [
  'PENDING',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'RESCHEDULED'
] as const;

const PAYMENT_STATUSES = [
  'UNPAID',
  'DEPOSIT_PAID',
  'PAID_IN_FULL',
  'REFUNDED',
  'OVERDUE'
] as const;

const bookingFormSchema = z.object({
  leadId: z.string().min(1, 'Lead is required'),
  serviceType: z.enum(SERVICE_TYPES),
  status: z.enum(STATUSES).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timezone: z.string().optional(),
  location: z.string().optional(),
  amount: z.string().optional(),
  depositPaid: z.string().optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  internalNotes: z.string().optional(),
  clientNotes: z.string().optional(),
  tripId: z.string().optional(),
  isPublic: z.boolean().optional(),
  publicTitle: z.string().optional(),
  publicDescription: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  organization: string | null;
}

interface Trip {
  id: string;
  name: string;
  location: string;
  startDate: string;
}

interface BookingFormProps {
  initialValues?: Partial<BookingFormValues>;
  onSubmit: (values: BookingFormValues) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function BookingForm({
  initialValues,
  onSubmit,
  isLoading = false,
  submitLabel = 'Create Booking',
}: BookingFormProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [showCreateLead, setShowCreateLead] = useState(false);
  const [creatingLead, setCreatingLead] = useState(false);
  const [newLead, setNewLead] = useState({ firstName: '', lastName: '', email: '', organization: '' });

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads?limit=500');
      if (res.ok) {
        const data = await res.json();
        setLeads(Array.isArray(data) ? data : data.leads || []);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [leadsRes, tripsRes] = await Promise.all([
          fetch('/api/leads?limit=500'),
          fetch('/api/trips'),
        ]);

        if (leadsRes.ok) {
          const leadsData = await leadsRes.json();
          setLeads(Array.isArray(leadsData) ? leadsData : leadsData.leads || []);
        }

        if (tripsRes.ok) {
          const tripsData = await tripsRes.json();
          setTrips(tripsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingLeads(false);
      }
    }

    fetchData();
  }, []);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      leadId: initialValues?.leadId || '',
      serviceType: initialValues?.serviceType || 'WORKSHOP',
      status: initialValues?.status || 'PENDING',
      startDate: initialValues?.startDate || '',
      endDate: initialValues?.endDate || '',
      timezone: initialValues?.timezone || '',
      location: initialValues?.location || '',
      amount: initialValues?.amount || '',
      depositPaid: initialValues?.depositPaid || '',
      paymentStatus: initialValues?.paymentStatus || 'UNPAID',
      internalNotes: initialValues?.internalNotes || '',
      clientNotes: initialValues?.clientNotes || '',
      tripId: initialValues?.tripId || '',
      isPublic: initialValues?.isPublic || false,
      publicTitle: initialValues?.publicTitle || '',
      publicDescription: initialValues?.publicDescription || '',
    },
  });

  const isPublic = form.watch('isPublic');

  const handleCreateLead = async () => {
    if (!newLead.firstName || !newLead.email) return;

    setCreatingLead(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create lead');
      }

      const created = await res.json();
      await fetchLeads();
      form.setValue('leadId', created.id);
      setShowCreateLead(false);
      setNewLead({ firstName: '', lastName: '', email: '', organization: '' });
    } catch (error) {
      console.error('Error creating lead:', error);
      alert(error instanceof Error ? error.message : 'Failed to create lead');
    } finally {
      setCreatingLead(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Lead Selection */}
        <FormField
          control={form.control}
          name="leadId"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Lead / Client</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowCreateLead(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  New Lead
                </Button>
              </div>
              {loadingLeads ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading leads...
                </div>
              ) : leads.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No leads found.{' '}
                  <button type="button" className="underline" onClick={() => setShowCreateLead(true)}>
                    Create a new lead
                  </button>{' '}
                  to get started.
                </div>
              ) : (
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a lead" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.firstName} {lead.lastName} {lead.organization ? `(${lead.organization})` : ''} - {lead.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormDescription>
                The person or organization this booking is for
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Trip Selection (Optional) */}
        <FormField
          control={form.control}
          name="tripId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trip (Optional)</FormLabel>
              <Select onValueChange={(val) => field.onChange(val === "none" ? "" : val)} value={field.value || "none"}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a trip (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No trip</SelectItem>
                  {trips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {trip.name} - {trip.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Associate this booking with a trip for tracking
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Service Type */}
        <FormField
          control={form.control}
          name="serviceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SERVICE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location & Timezone */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., America/New_York" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Financial */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Amount ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="depositPaid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deposit Paid ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Payment Status */}
        <FormField
          control={form.control}
          name="paymentStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PAYMENT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="internalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Internal Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notes for internal use (not visible to client)"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notes visible to client"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Public Event Settings */}
        <div className="rounded-lg border p-4 space-y-4">
          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div>
                  <FormLabel>Show on Public Events Page</FormLabel>
                  <FormDescription>
                    Display this booking on the public /events page
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {isPublic && (
            <>
              <FormField
                control={form.control}
                name="publicTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A Cappella Workshop at UCLA" {...field} />
                    </FormControl>
                    <FormDescription>
                      Public-facing title shown on the events page
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="publicDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description for the public events page"
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        {/* Submit */}
        <Button type="submit" disabled={isLoading || loadingLeads} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </form>

      {/* Quick Create Lead Dialog */}
      <Dialog open={showCreateLead} onOpenChange={setShowCreateLead}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Lead</DialogTitle>
            <DialogDescription>
              Add a new lead to associate with this booking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newLeadFirstName">First Name *</Label>
                <Input
                  id="newLeadFirstName"
                  value={newLead.firstName}
                  onChange={(e) => setNewLead(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newLeadLastName">Last Name</Label>
                <Input
                  id="newLeadLastName"
                  value={newLead.lastName}
                  onChange={(e) => setNewLead(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newLeadEmail">Email *</Label>
              <Input
                id="newLeadEmail"
                type="email"
                value={newLead.email}
                onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newLeadOrg">Organization</Label>
              <Input
                id="newLeadOrg"
                value={newLead.organization}
                onChange={(e) => setNewLead(prev => ({ ...prev, organization: e.target.value }))}
                placeholder="Organization name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateLead(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateLead}
              disabled={creatingLead || !newLead.firstName || !newLead.email}
            >
              {creatingLead ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Lead'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
