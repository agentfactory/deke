/**
 * Website Scraper for Contact Enrichment (Firecrawl)
 *
 * Scrapes organization websites via Firecrawl API to find real contact information.
 * Two-pass approach:
 *   Pass 1: Title-email pairs — find leadership titles, then name+email nearby
 *   Pass 2: Email-name pairs — email regex → nearby names (improved context)
 *
 * Music-org-specific patterns: staff pages, "Music Director:" labels, board lists.
 */

import { isValidContactName, stripTitlePrefix } from './name-validator'

export interface ScrapedEmail {
  email: string
  name: string | null
  title: string | null  // "Music Director", "President", etc.
  type: 'personal' | 'generic'
}

export interface ScrapeResult {
  emails: ScrapedEmail[]
  source: 'website_scrape'
}

// Pages most likely to contain contact info — expanded for music orgs
const CONTACT_PATHS = [
  '/contact', '/about', '/about-us', '/staff', '/team', '/leadership',
  '/board', '/directors', '/our-team', '/people', '/who-we-are',
  '/board-of-directors', '/our-staff', '/connect', '/get-in-touch',
]

// Generic email prefixes that aren't tied to a real person
const GENERIC_PREFIXES = [
  'info', 'admin', 'office', 'contact', 'hello', 'help',
  'support', 'noreply', 'no-reply', 'webmaster', 'mail',
  'general', 'enquiries', 'inquiries', 'reception',
]

// Leadership titles common in music organizations
const LEADERSHIP_TITLES = [
  'music director', 'artistic director', 'chorus master',
  'choirmaster', 'conductor', 'director of music',
  'president', 'executive director', 'managing director',
  'chair', 'chairperson', 'board president',
  'vocal director', 'associate director',
]

// Build regex from leadership titles (case insensitive)
const TITLE_REGEX = new RegExp(
  `(${LEADERSHIP_TITLES.map(t => t.replace(/\s+/g, '\\s+')).join('|')})`,
  'gi'
)

// Email regex - matches standard email addresses
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

// Name pattern: handles "Dr.", "Rev.", "Prof." prefixes and "Last, First" ordering
const NAME_PATTERN = /(?:(?:Dr|Rev|Prof|Mr|Mrs|Ms)\.?\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g
const NAME_REVERSED_PATTERN = /([A-Z][a-z]+),\s+([A-Z][a-z]+(?:\s+[A-Z]\.?)?)/g

/**
 * Classify an email as personal or generic
 */
function classifyEmail(email: string): 'personal' | 'generic' {
  const localPart = email.split('@')[0].toLowerCase()
  if (GENERIC_PREFIXES.some(prefix => localPart === prefix)) {
    return 'generic'
  }
  // If localPart contains a dot and looks like name.name, it's personal
  if (/^[a-z]+\.[a-z]+$/.test(localPart)) {
    return 'personal'
  }
  // If it's just a first name or abbreviation, still likely personal
  if (/^[a-z]{2,}$/.test(localPart) && !GENERIC_PREFIXES.includes(localPart)) {
    return 'personal'
  }
  return 'generic'
}

/**
 * Extract name near an email address in the text
 * Looks within ~300 chars before the email (expanded from 200)
 */
function extractNameNearEmail(text: string, emailIndex: number): { name: string | null; title: string | null } {
  const contextStart = Math.max(0, emailIndex - 300)
  const contextEnd = Math.min(text.length, emailIndex + 100)
  const context = text.substring(contextStart, contextEnd)

  // Try to find a title in this context
  let title: string | null = null
  const titleMatch = TITLE_REGEX.exec(context)
  TITLE_REGEX.lastIndex = 0 // Reset regex state
  if (titleMatch) {
    title = titleMatch[1].trim()
    // Normalize title casing: "music director" → "Music Director"
    title = title.replace(/\b\w/g, c => c.toUpperCase())
  }

  // Look for "Last, First" pattern (common on board pages)
  const beforeEmail = text.substring(contextStart, emailIndex)
  const reversedNames: string[] = []
  let rMatch
  const rRegex = new RegExp(NAME_REVERSED_PATTERN.source, 'g')
  while ((rMatch = rRegex.exec(beforeEmail)) !== null) {
    reversedNames.push(`${rMatch[2]} ${rMatch[1]}`)
  }
  if (reversedNames.length > 0) {
    return { name: reversedNames[reversedNames.length - 1], title }
  }

  // Look for standard "First Last" name patterns
  const names: string[] = []
  let match
  const regex = new RegExp(NAME_PATTERN.source, 'g')
  while ((match = regex.exec(beforeEmail)) !== null) {
    // Extract just the name part (group 1 has the name without prefix)
    names.push(match[1]?.trim() || match[0].trim())
  }

  let name = names.length > 0 ? names[names.length - 1] : null

  // Validate and clean the extracted name
  if (name) {
    const stripped = stripTitlePrefix(name)
    const inferredTitle = stripped.title || title
    if (!isValidContactName(stripped.name)) {
      return { name: null, title: inferredTitle }
    }
    return { name: stripped.name, title: inferredTitle }
  }

  return { name, title }
}

/**
 * Pass 1: Title-email pairs
 *
 * Find leadership titles, then look for name+email within 300 chars.
 * Patterns:
 *   - "Music Director: Jane Smith" (title: name)
 *   - "Jane Smith, Music Director" (name, title)
 *   - "**Jane Smith** - Music Director"
 *   - "Jane Smith | Music Director | jane@org.com"
 */
function extractTitleEmailPairs(text: string): ScrapedEmail[] {
  const results: ScrapedEmail[] = []
  const foundEmails = new Set<string>()

  for (const titleStr of LEADERSHIP_TITLES) {
    const titleRegex = new RegExp(titleStr.replace(/\s+/g, '\\s+'), 'gi')
    let tMatch
    while ((tMatch = titleRegex.exec(text)) !== null) {
      const titleIndex = tMatch.index
      // Look within 300 chars around the title for email + name
      const start = Math.max(0, titleIndex - 300)
      const end = Math.min(text.length, titleIndex + titleStr.length + 300)
      const context = text.substring(start, end)

      // Find emails in context
      const emailRegex = new RegExp(EMAIL_REGEX.source, 'g')
      let eMatch
      while ((eMatch = emailRegex.exec(context)) !== null) {
        const email = eMatch[0].toLowerCase()
        if (foundEmails.has(email)) continue
        if (email.includes('.png') || email.includes('.jpg') || email.includes('.css')) continue

        // Find name in context
        const nameRegex = new RegExp(NAME_PATTERN.source, 'g')
        const names: string[] = []
        let nMatch
        while ((nMatch = nameRegex.exec(context)) !== null) {
          names.push(nMatch[1]?.trim() || nMatch[0].trim())
        }

        // Also check reversed names
        const rRegex = new RegExp(NAME_REVERSED_PATTERN.source, 'g')
        let rMatch
        while ((rMatch = rRegex.exec(context)) !== null) {
          names.push(`${rMatch[2]} ${rMatch[1]}`)
        }

        const normalizedTitle = tMatch[0].trim().replace(/\b\w/g, c => c.toUpperCase())
        const emailType = classifyEmail(email)

        // Validate and clean name candidates
        let validName: string | null = null
        for (const candidate of names) {
          const stripped = stripTitlePrefix(candidate)
          if (isValidContactName(stripped.name)) {
            validName = stripped.name
            break
          }
        }

        foundEmails.add(email)
        results.push({
          email,
          name: validName,
          title: normalizedTitle,
          type: validName || emailType === 'personal' ? 'personal' : emailType,
        })
      }
    }
  }

  return results
}

/**
 * Scrape a URL using plain HTTP fetch.
 * Strips HTML to get readable text for email/name extraction.
 */
async function fetchAndConvertToText(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LeadBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    })

    clearTimeout(timeout)

    if (!response.ok) return null

    const html = await response.text()
    // Strip HTML to text
    return html
      .substring(0, 200_000)
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim()
  } catch {
    return null
  }
}

// Simple in-memory cache for scrape results
const scrapeCache = new Map<string, { result: ScrapeResult; timestamp: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Scrape a website for contact information using Firecrawl
 *
 * Two-pass approach:
 *   Pass 1: Find leadership titles → look for name+email nearby
 *   Pass 2: Find emails → look for names nearby (fallback)
 *
 * @param websiteUrl - The organization's website URL
 * @returns Scraped emails with names, titles, and classification
 */
export async function scrapeWebsite(websiteUrl: string): Promise<ScrapeResult> {
  // Normalize URL
  let baseUrl: string
  try {
    const url = new URL(websiteUrl)
    baseUrl = `${url.protocol}//${url.host}`
  } catch {
    return { emails: [], source: 'website_scrape' }
  }

  // Check cache
  const cached = scrapeCache.get(baseUrl)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result
  }

  const allEmails = new Map<string, ScrapedEmail>()
  let pagesScraped = 0
  const maxPages = 3 // Homepage + 2 contact pages (keeps enrichment fast)

  // Scrape homepage + contact pages
  const pagesToScrape = [baseUrl, ...CONTACT_PATHS.map(path => `${baseUrl}${path}`)]

  for (const pageUrl of pagesToScrape) {
    if (pagesScraped >= maxPages) break

    const text = await fetchAndConvertToText(pageUrl)
    if (!text) continue

    pagesScraped++

    // === PASS 1: Title-email pairs (leadership-focused) ===
    const titlePairs = extractTitleEmailPairs(text)
    for (const pair of titlePairs) {
      const existing = allEmails.get(pair.email)
      if (!existing) {
        allEmails.set(pair.email, pair)
      } else if (!existing.title && pair.title) {
        // Upgrade existing entry with title
        existing.title = pair.title
        if (pair.name && !existing.name) existing.name = pair.name
        if (existing.type === 'generic' && pair.name) existing.type = 'personal'
      }
    }

    // === PASS 2: Email-name pairs (broader search) ===

    // Extract emails from markdown text
    let emailMatch
    const emailRegex = new RegExp(EMAIL_REGEX.source, 'g')
    while ((emailMatch = emailRegex.exec(text)) !== null) {
      const email = emailMatch[0].toLowerCase()

      // Skip image/asset filenames
      if (email.includes('.png') || email.includes('.jpg') || email.includes('.gif')) continue
      if (email.includes('.css') || email.includes('.js')) continue

      const existing = allEmails.get(email)
      if (!existing) {
        const { name, title } = extractNameNearEmail(text, emailMatch.index)
        allEmails.set(email, {
          email,
          name,
          title,
          type: classifyEmail(email),
        })
      } else if (!existing.name || !existing.title) {
        // Try to fill in missing name/title
        const { name, title } = extractNameNearEmail(text, emailMatch.index)
        if (name && !existing.name) {
          existing.name = name
          if (existing.type === 'generic') existing.type = 'personal'
        }
        if (title && !existing.title) existing.title = title
      }
    }
  }

  // Filter: reject known platform/SaaS emails, keep everything else
  const platformDomains = [
    'mymusicstaff.com', 'groupanizer.com', 'wixpress.com',
    'squarespace.com', 'wordpress.com', 'mailchimp.com',
    'constantcontact.com', 'google.com', 'googleapis.com',
    'w3.org', 'schema.org', 'cloudflare.com', 'sentry.io',
    'placeholder.local', 'example.com',
  ]
  const filteredEmails = Array.from(allEmails.values()).filter(e => {
    const emailDomain = e.email.split('@')[1]
    return !platformDomains.some(d => emailDomain.includes(d))
  })

  // Sort by priority:
  // 1. Personal email + name + leadership title
  // 2. Personal email + name (no title)
  // 3. Personal email only
  // 4. Generic email with leadership name found separately
  // 5. Generic email alone
  filteredEmails.sort((a, b) => {
    const scoreA = priorityScore(a)
    const scoreB = priorityScore(b)
    return scoreB - scoreA
  })

  const result: ScrapeResult = {
    emails: filteredEmails,
    source: 'website_scrape',
  }

  // Cache result
  scrapeCache.set(baseUrl, { result, timestamp: Date.now() })

  return result
}

/**
 * Calculate priority score for sorting scraped emails
 */
function priorityScore(email: ScrapedEmail): number {
  let score = 0
  if (email.type === 'personal') score += 10
  if (email.name) score += 5
  if (email.title) score += 8 // Leadership title is very valuable
  return score
}
