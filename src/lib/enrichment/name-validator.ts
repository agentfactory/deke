/**
 * Name Validator for Contact Enrichment
 *
 * Validates scraped contact names to filter out garbage data like
 * street addresses, navigation menu text, and other non-name content.
 * Also strips role/title prefixes from names.
 */

// Street-related words that indicate an address, not a name
const ADDRESS_WORDS = new Set([
  'ave', 'avenue', 'st', 'street', 'rd', 'road', 'blvd', 'boulevard',
  'ln', 'lane', 'way', 'ct', 'court', 'pl', 'place', 'hwy', 'highway',
  'drive', 'cres', 'crescent', 'pkwy', 'parkway', 'terr', 'terrace',
])

// Words commonly scraped from website navigation/UI, not real names
const WEB_JUNK_WORDS = new Set([
  'menu', 'welcome', 'videos', 'media', 'home', 'about', 'contact',
  'login', 'search', 'subscribe', 'newsletter', 'donate', 'navigation',
  'footer', 'header', 'sidebar', 'click', 'here', 'read', 'more',
  'copyright', 'privacy', 'policy', 'terms', 'blog', 'news', 'events',
  'gallery', 'photos', 'calendar', 'join', 'register', 'signup',
  'shop', 'store', 'cart', 'checkout', 'account', 'settings',
])

// Single-word values that are clearly not personal names
const SINGLE_WORD_BLOCKLIST = new Set([
  'contact', 'info', 'admin', 'office', 'team', 'staff', 'board',
  'choir', 'music', 'group', 'ensemble', 'chorus', 'orchestra',
  'singers', 'voices', 'director', 'president', 'treasurer',
  'secretary', 'coordinator', 'manager', 'webmaster',
])

// Role/title prefixes that should be stripped from names
const TITLE_PREFIXES_REGEX = /^(treasurer|president|vice\s+president|secretary|director|chair(?:person)?|board\s+member|coordinator|manager|minister|pastor|reverend|deacon)\s+/i

/**
 * Check if a scraped name looks like a real person's name.
 *
 * Rejects addresses, navigation text, and other non-name content.
 * Should be called AFTER stripTitlePrefix.
 */
export function isValidContactName(name: string): boolean {
  if (!name || name.trim().length === 0) return false

  const trimmed = name.trim()
  const words = trimmed.split(/\s+/)

  // Too many words — likely nav/menu text
  if (words.length > 3) return false

  // Single word — check against blocklist
  if (words.length === 1) {
    if (SINGLE_WORD_BLOCKLIST.has(words[0].toLowerCase())) return false
  }

  const lowerWords = words.map(w => w.toLowerCase())

  // Check for address words (skip "Dr" at position 0 since it's an honorific)
  for (let i = 0; i < lowerWords.length; i++) {
    const word = lowerWords[i]
    // "Dr" and "Drive" overlap — only treat as address if not first word
    if (word === 'drive' || word === 'dr') {
      if (i > 0) return false
      continue
    }
    // "St" can be "Saint" when first — only reject in non-first position
    if (word === 'st' || word === 'street') {
      if (i > 0) return false
      continue
    }
    if (ADDRESS_WORDS.has(word)) return false
  }

  // Check for web junk words
  for (const word of lowerWords) {
    if (WEB_JUNK_WORDS.has(word)) return false
  }

  return true
}

/**
 * Strip a role/title prefix from a name and return both parts.
 *
 * e.g. "Treasurer Katarina Michalyshyn" -> { name: "Katarina Michalyshyn", title: "Treasurer" }
 * e.g. "Jane Smith" -> { name: "Jane Smith", title: null }
 */
export function stripTitlePrefix(name: string): { name: string; title: string | null } {
  if (!name) return { name, title: null }

  const match = TITLE_PREFIXES_REGEX.exec(name.trim())
  if (match) {
    const title = match[1].trim().replace(/\b\w/g, c => c.toUpperCase())
    const remainder = name.trim().substring(match[0].length).trim()
    // Only strip if remainder still looks like a name (at least one word)
    if (remainder.length > 0) {
      return { name: remainder, title }
    }
  }

  return { name: name.trim(), title: null }
}
