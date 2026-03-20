import { format } from 'date-fns'

interface CalendarEvent {
  title: string
  description?: string | null
  location?: string | null
  startDate: Date
  endDate?: Date | null
  url?: string
}

/**
 * Format a date as iCal DTSTART/DTEND value (UTC)
 * Format: 20260320T090000Z
 */
function formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/**
 * Escape special characters for iCal text fields
 */
function escapeIcal(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * Generate an iCal (.ics) string for a single event
 */
export function generateICalEvent(event: CalendarEvent): string {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@dekesharon.com`
  const now = formatICalDate(new Date())
  const start = formatICalDate(event.startDate)
  const end = event.endDate
    ? formatICalDate(event.endDate)
    : formatICalDate(new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000)) // Default 2hr

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Deke Sharon//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcal(event.title)}`,
  ]

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcal(event.description)}`)
  }
  if (event.location) {
    lines.push(`LOCATION:${escapeIcal(event.location)}`)
  }
  if (event.url) {
    lines.push(`URL:${event.url}`)
  }

  lines.push('END:VEVENT', 'END:VCALENDAR')

  return lines.join('\r\n')
}

/**
 * Generate a combined iCal feed for multiple events
 */
export function generateICalFeed(events: CalendarEvent[]): string {
  const now = formatICalDate(new Date())

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Deke Sharon//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Deke Sharon Events',
    'X-WR-CALDESC:Upcoming workshops\\, masterclasses\\, and events with Deke Sharon',
  ]

  for (const event of events) {
    const uid = `event-${Buffer.from(event.title + (event.startDate?.toISOString() || '')).toString('base64').slice(0, 20)}@dekesharon.com`
    const start = formatICalDate(event.startDate)
    const end = event.endDate
      ? formatICalDate(event.endDate)
      : formatICalDate(new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000))

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${uid}`)
    lines.push(`DTSTAMP:${now}`)
    lines.push(`DTSTART:${start}`)
    lines.push(`DTEND:${end}`)
    lines.push(`SUMMARY:${escapeIcal(event.title)}`)

    if (event.description) {
      lines.push(`DESCRIPTION:${escapeIcal(event.description)}`)
    }
    if (event.location) {
      lines.push(`LOCATION:${escapeIcal(event.location)}`)
    }
    if (event.url) {
      lines.push(`URL:${event.url}`)
    }

    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

/**
 * Generate a Google Calendar add URL
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const start = format(event.startDate, "yyyyMMdd'T'HHmmss'Z'")
  const end = event.endDate
    ? format(event.endDate, "yyyyMMdd'T'HHmmss'Z'")
    : format(new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000), "yyyyMMdd'T'HHmmss'Z'")

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
  })

  if (event.location) params.set('location', event.location)
  if (event.description) params.set('details', event.description)

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
