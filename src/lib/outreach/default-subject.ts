/**
 * Builds a contextual default email subject based on campaign location and booking service type.
 */

const SERVICE_LABELS: Record<string, string> = {
  ARRANGEMENT: 'Arrangement',
  GROUP_COACHING: 'A Cappella Coaching',
  INDIVIDUAL_COACHING: 'Vocal Coaching',
  WORKSHOP: 'A Cappella Workshop',
  SPEAKING: 'Speaking',
  MASTERCLASS: 'Masterclass',
  CONSULTATION: 'Consultation',
}

export function buildDefaultSubject(baseLocation: string, serviceType?: string | null): string {
  const label = (serviceType && SERVICE_LABELS[serviceType]) || 'A Cappella'
  const city = baseLocation.split(',')[0].trim()
  return `${label} Opportunity in ${city} - Deke Sharon`
}
