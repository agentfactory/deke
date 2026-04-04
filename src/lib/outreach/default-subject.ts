/**
 * Builds a contextual, personalized email subject based on campaign location,
 * booking service type, and the target organization name.
 *
 * Goals: feel personal, reference location and org specifically, never feel like
 * a mass-blast or a "sales opportunity" pitch.
 */

const SERVICE_TEMPLATES: Record<string, string[]> = {
  WORKSHOP: [
    'Coming to {city} — a thought for {org}',
    'Working in {city} this {season} — curious about {org}',
    'A quick note to {org} — I\'ll be in {city}',
    'In {city} soon — would love to work with {org}',
  ],
  GROUP_COACHING: [
    'Coaching in {city} — thinking about {org}',
    'Coming to {city} — wondering if this is a fit for {org}',
    'A thought for {org} — I\'ll be in {city}',
    'In {city} soon — a note for {org}',
  ],
  INDIVIDUAL_COACHING: [
    'Coming to {city} — a note for {org}',
    'In {city} soon — wondering about {org}',
    'A thought for {org} while I\'m in {city}',
    'Vocal coaching in {city} — thinking of {org}',
  ],
  MASTERCLASS: [
    'A masterclass in {city} — wondering about {org}',
    'Coming to {city} — a thought for {org}',
    'In {city} for a masterclass — curious about {org}',
    'A note for {org} — I\'ll be in {city}',
  ],
  SPEAKING: [
    'Speaking in {city} — a quick note for {org}',
    'Coming to {city} — thinking about {org}',
    'In {city} soon — wondering if there\'s a fit for {org}',
    'A note for {org} while I\'m in {city}',
  ],
  ARRANGEMENT: [
    'Coming to {city} — a thought for {org}',
    'Arranging work in {city} — curious about {org}',
    'A note for {org} — I\'ll be in {city}',
    'In {city} soon — thinking of {org}',
  ],
  CONSULTATION: [
    'Coming to {city} — a thought for {org}',
    'In {city} soon — wondering about {org}',
    'A note for {org} while I\'m in {city}',
    'Thinking about {org} — I\'ll be in {city}',
  ],
}

// Fallback templates when no org name is available
const NO_ORG_TEMPLATES: Record<string, string[]> = {
  WORKSHOP: [
    'Coming to {city} — could this be a good fit?',
    'Working in {city} this {season} — wondering if there\'s a match',
    'In {city} soon — a quick thought',
  ],
  GROUP_COACHING: [
    'Coaching visit to {city} — would love to connect',
    'Coming to {city} — wondering if there\'s a fit',
    'In {city} soon — a quick note',
  ],
  _default: [
    'Coming to {city} — a quick thought',
    'In {city} soon — wondering if there\'s a fit',
    'A note while I\'m passing through {city}',
  ],
}

function getSeason(date: Date = new Date()): string {
  const month = date.getMonth() + 1
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'fall'
  return 'winter'
}

/**
 * Shorten an organization name for use in a subject line.
 * E.g. "MIT Logarhythms" → "the Logarhythms"
 *      "Harvard University Glee Club" → "Harvard Glee Club"
 *      "Tufts Beelzebubs" → "the Beelzebubs"
 *      "Northwestern Purple Haze" → "the Purple Haze"
 */
function shortenOrgForSubject(org: string): string {
  // Strip common suffixes that add length without meaning in a subject
  const suffixesToStrip = [
    /\bUniversity\b/g,
    /\bCollege\b/g,
    /\bSchool of Music\b/g,
    /\bConservatory\b/g,
    /\bDepartment\b/g,
    /\bA Cappella\b/g,
  ]
  let shortened = org
  for (const suffix of suffixesToStrip) {
    shortened = shortened.replace(suffix, '').trim()
  }
  // Collapse multiple spaces
  shortened = shortened.replace(/\s+/g, ' ').trim()

  // If the org has 2+ words and the first word looks like a university/location name,
  // prefix with "the" to sound natural: "the Logarhythms", "the Beelzebubs"
  const words = shortened.split(' ')
  const INSTITUTION_PREFIXES = ['MIT', 'Harvard', 'Yale', 'Tufts', 'Northwestern', 'Columbia', 'UCLA', 'USC', 'UChicago', 'Stanford', 'Princeton', 'Cornell', 'Dartmouth', 'Brown', 'Penn']
  if (words.length >= 2 && INSTITUTION_PREFIXES.includes(words[0])) {
    // Use everything after the institution prefix, with "the"
    const remainder = words.slice(1).join(' ')
    if (remainder.length > 0) return `the ${remainder}`
  }

  // For other orgs, prefix with "the" if it's a group name (not a place/person name)
  // Heuristic: if it doesn't end in common org-type words, add "the"
  const ORG_TYPE_WORDS = ['Choir', 'Ensemble', 'Group', 'Club', 'Association', 'Institute', 'Center', 'Academy']
  const lastWord = words[words.length - 1]
  if (!ORG_TYPE_WORDS.includes(lastWord) && shortened.length <= 30) {
    return `the ${shortened}`
  }

  return shortened
}

/**
 * Pick a template deterministically based on the org name so the same org
 * always gets the same subject variant, but different orgs in the same campaign
 * get different phrasing (avoiding a wall of identical subjects in the review UI).
 */
function pickTemplate(templates: string[], seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return templates[hash % templates.length]
}

export function buildDefaultSubject(
  baseLocation: string,
  serviceType?: string | null,
  organization?: string | null,
): string {
  const city = baseLocation.split(',')[0].trim()
  const season = getSeason()

  if (organization) {
    const orgShort = shortenOrgForSubject(organization)
    const templates = (serviceType && SERVICE_TEMPLATES[serviceType]) || SERVICE_TEMPLATES.WORKSHOP
    const template = pickTemplate(templates, organization)
    return template
      .replace('{city}', city)
      .replace('{org}', orgShort)
      .replace('{season}', season)
  }

  // No org name available
  const key = (serviceType && NO_ORG_TEMPLATES[serviceType]) ? serviceType : '_default'
  const templates = NO_ORG_TEMPLATES[key]
  const template = pickTemplate(templates, city)
  return template
    .replace('{city}', city)
    .replace('{season}', season)
}
