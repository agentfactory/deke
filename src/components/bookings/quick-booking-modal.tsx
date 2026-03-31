'use client';

import { useState } from 'react';
import { addDays, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, CheckCircle2, Globe, CalendarRange, CalendarDays as CalendarDaysIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SERVICE_TYPES = [
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'SPEAKING', label: 'Speaking' },
  { value: 'FESTIVAL', label: 'Festival' },
  { value: 'GROUP_COACHING', label: 'Group Coaching' },
  { value: 'INDIVIDUAL_COACHING', label: 'Individual Coaching' },
  { value: 'MASTERCLASS', label: 'Masterclass' },
  { value: 'ARRANGEMENT', label: 'Arrangement' },
  { value: 'CONSULTATION', label: 'Consultation' },
];

interface QuickBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-filled date string from calendar click (YYYY-MM-DD) */
  defaultDate?: string;
  /** Called after a booking is successfully created */
  onSuccess?: () => void;
}

export function QuickBookingModal({
  open,
  onOpenChange,
  defaultDate,
  onSuccess,
}: QuickBookingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [isSingleDay, setIsSingleDay] = useState(false);

  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientOrganization: '',
    serviceType: 'WORKSHOP',
    startDate: defaultDate ? new Date(`${defaultDate}T09:00:00`).toISOString() : '',
    endDate: defaultDate ? addDays(new Date(`${defaultDate}T09:00:00`), 1).toISOString() : '',
    location: '',
    amount: '',
    isPublic: false,
    publicTitle: '',
    publicDescription: '',
  });

  // Reset form when modal opens with a new date
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setIsSingleDay(false);
      setForm({
        clientName: '',
        clientEmail: '',
        clientOrganization: '',
        serviceType: 'WORKSHOP',
        startDate: defaultDate ? new Date(`${defaultDate}T09:00:00`).toISOString() : '',
        endDate: defaultDate ? addDays(new Date(`${defaultDate}T09:00:00`), 1).toISOString() : '',
        location: '',
        amount: '',
        isPublic: false,
        publicTitle: '',
        publicDescription: '',
      });
      setError(null);
      setSuccess(false);
    }
    onOpenChange(isOpen);
  };

  const handleSingleDayToggle = (checked: boolean) => {
    setIsSingleDay(checked);
    if (checked && form.startDate) {
      setForm(prev => ({ ...prev, endDate: prev.startDate }));
    } else if (!checked && form.startDate) {
      const start = parseISO(form.startDate);
      setForm(prev => ({ ...prev, endDate: addDays(start, 1).toISOString() }));
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const nameParts = form.clientName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || firstName;

      const response = await fetch('/api/bookings/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: {
            firstName,
            lastName,
            email: form.clientEmail,
            organization: form.clientOrganization || null,
          },
          serviceType: form.serviceType,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          location: form.location || null,
          amount: form.amount ? parseFloat(form.amount) : null,
          isPublic: form.isPublic,
          publicTitle: form.publicTitle || null,
          publicDescription: form.publicDescription || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create booking');
      }

      setSuccess(true);
      onSuccess?.();

      // Close after brief success display
      setTimeout(() => {
        handleOpenChange(false);
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Quick Booking</DialogTitle>
          <DialogDescription>
            Create a booking fast. Lead is auto-created if new.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="text-sm font-medium">Booking created!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Client */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="qb-name">Name *</Label>
                <Input
                  id="qb-name"
                  placeholder="John Smith"
                  value={form.clientName}
                  onChange={(e) => handleChange('clientName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="qb-email">Email</Label>
                <Input
                  id="qb-email"
                  type="email"
                  placeholder="john@example.com"
                  value={form.clientEmail}
                  onChange={(e) => handleChange('clientEmail', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="qb-org">Organization</Label>
                <Input
                  id="qb-org"
                  placeholder="Harmony Singers"
                  value={form.clientOrganization}
                  onChange={(e) => handleChange('clientOrganization', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="qb-service">Service *</Label>
                <Select value={form.serviceType} onValueChange={(v) => handleChange('serviceType', v)}>
                  <SelectTrigger id="qb-service">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Scheduling */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Dates</Label>
                <div className="flex items-center gap-2">
                  {isSingleDay ? (
                    <CalendarDaysIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <CalendarRange className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {isSingleDay ? 'Single day' : 'Multi-day'}
                  </span>
                  <Switch
                    checked={isSingleDay}
                    onCheckedChange={handleSingleDayToggle}
                    aria-label="Toggle single day event"
                  />
                </div>
              </div>
              <div className={`grid gap-3 ${isSingleDay ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div className="space-y-1.5">
                  <Label>{isSingleDay ? 'Date' : 'Start Date'}</Label>
                  <DatePicker
                    value={form.startDate ? parseISO(form.startDate) : null}
                    onChange={(date) => {
                      const iso = date ? date.toISOString() : '';
                      handleChange('startDate', iso);
                      if (date) {
                        if (isSingleDay) {
                          handleChange('endDate', iso);
                        } else {
                          const currentEnd = form.endDate ? parseISO(form.endDate) : null;
                          if (!currentEnd || currentEnd <= date) {
                            handleChange('endDate', addDays(date, 1).toISOString());
                          }
                        }
                      }
                    }}
                    enableTime
                    placeholder={isSingleDay ? 'Select date' : 'Start date'}
                  />
                </div>
                {!isSingleDay && (
                  <div className="space-y-1.5">
                    <Label>End Date</Label>
                    <DatePicker
                      value={form.endDate ? parseISO(form.endDate) : null}
                      onChange={(date) => handleChange('endDate', date ? date.toISOString() : '')}
                      enableTime
                      placeholder="End date"
                      defaultMonth={form.startDate ? parseISO(form.startDate) : undefined}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="qb-location">Location</Label>
                <Input
                  id="qb-location"
                  placeholder="San Francisco, CA"
                  value={form.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="qb-amount">Amount ($)</Label>
                <Input
                  id="qb-amount"
                  type="number"
                  step="0.01"
                  placeholder="2500"
                  value={form.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                />
              </div>
            </div>

            {/* Public Event Toggle */}
            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Public Event</Label>
                </div>
                <Switch
                  checked={form.isPublic}
                  onCheckedChange={(v) => handleChange('isPublic', v)}
                />
              </div>
              {form.isPublic && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="qb-public-title">Event Title</Label>
                    <Input
                      id="qb-public-title"
                      placeholder="A Cappella Workshop at UCLA"
                      value={form.publicTitle}
                      onChange={(e) => handleChange('publicTitle', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="qb-public-desc">Event Description</Label>
                    <Textarea
                      id="qb-public-desc"
                      placeholder="Brief description for the public events page..."
                      rows={2}
                      value={form.publicDescription}
                      onChange={(e) => handleChange('publicDescription', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Booking
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
