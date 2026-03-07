'use client'

import { DayStepper } from './day-stepper'

interface AvailabilityWindowProps {
  daysBefore: number
  daysAfter: number
  bookingDate: string | null
  onDaysBeforeChange: (days: number) => void
  onDaysAfterChange: (days: number) => void
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function AvailabilityWindow({
  daysBefore,
  daysAfter,
  bookingDate,
  onDaysBeforeChange,
  onDaysAfterChange,
}: AvailabilityWindowProps) {
  // Compute dates for the visual timeline
  const booking = bookingDate ? new Date(bookingDate) : null
  const windowStart = booking ? new Date(booking.getTime() - daysBefore * 86400000) : null
  const windowEnd = booking ? new Date(booking.getTime() + daysAfter * 86400000) : null

  // Total width of timeline in days
  const totalDays = daysBefore + 1 + daysAfter
  const beforePercent = totalDays > 0 ? (daysBefore / totalDays) * 100 : 0
  const bookingPercent = totalDays > 0 ? (1 / totalDays) * 100 : 100
  const afterPercent = totalDays > 0 ? (daysAfter / totalDays) * 100 : 0

  return (
    <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
          Availability Window
        </h3>
        {booking && (
          <span className="text-xs text-zinc-400">
            {windowStart && formatDate(windowStart)} - {windowEnd && formatDate(windowEnd)}
          </span>
        )}
      </div>

      {/* Day Steppers */}
      <div className="flex items-center justify-around">
        <DayStepper
          value={daysBefore}
          onChange={onDaysBeforeChange}
          label="Days Before"
        />
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-zinc-400 uppercase tracking-wide">Booking</span>
          <div className="h-8 w-8 rounded-full bg-orange-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">B</span>
          </div>
          <span className="text-xs text-zinc-500">
            {booking ? formatDate(booking) : 'Set date'}
          </span>
        </div>
        <DayStepper
          value={daysAfter}
          onChange={onDaysAfterChange}
          label="Days After"
        />
      </div>

      {/* Visual Timeline Bar */}
      {(daysBefore > 0 || daysAfter > 0) && (
        <div className="space-y-2">
          <div className="flex h-3 rounded-full overflow-hidden bg-zinc-800">
            {daysBefore > 0 && (
              <div
                className="bg-emerald-600/70 transition-all duration-200"
                style={{ width: `${beforePercent}%` }}
              />
            )}
            <div
              className="bg-orange-600 transition-all duration-200"
              style={{ width: `${bookingPercent}%`, minWidth: '4px' }}
            />
            {daysAfter > 0 && (
              <div
                className="bg-emerald-600/70 transition-all duration-200"
                style={{ width: `${afterPercent}%` }}
              />
            )}
          </div>
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>{windowStart ? formatDate(windowStart) : ''}</span>
            <span>{windowEnd ? formatDate(windowEnd) : ''}</span>
          </div>
        </div>
      )}

      <p className="text-xs text-zinc-500">
        Deke is available for nearby gigs during this window. The campaign will discover leads within this timeframe.
      </p>
    </div>
  )
}
