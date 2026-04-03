/**
 * Firecrawl-powered website scraper for contact extraction
 *
 * Uses Firecrawl's /scrape endpoint to get clean markdown from websites,
 * then extracts contacts using pattern matching on the clean output.
 * Falls back gracefully if Firecrawl is unavailable.
 *
 * Credit budget: ~1-2 credits per org (scrape = 1 credit/page)
 */

import FirecrawlApp from '@mendable/firecrawl-js'
import type { ScrapedEmail } from './website-scraper'

export interface FirecrawlScrapeResult {
  emails: ScrapedEmail[]
  source: 'firecrawl'
  pagesScraped: number
  creditsUsed: number
}

// Leadership titles we're looking for (same as website-scraper.ts)
const LEADERSHIP_TITLES = [
  'music director', 'artistic director', 'chorus master', 'choirmaster',
  'conductor', 'director of music', 'president', 'executive director',
  'managing director', 'chair', 'chairperson', 'board president',
  'vocal director', 'associate director',
]

// Generic emails to deprioritize
const GENERIC_PREFIXES = [
  'info', 'admin', 'contact', 'hello', 'help', 'support', 'noreply',
  'webmaster', 'office', 'general', 'membership', 'secretary',
]

let firecrawlClient: FirecrawlApp | null = null

function getClient(): FirecrawlApp | null {
  if (firecrawlClient) return firecrawlClient
  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) return null
  firecrawlClient = new FirecrawlApp({ apiKey })
  return firecrawlClient
}

/**
 * Scrape a website using Firecrawl and extract contacts
 *
 * Strategy:
 * 1. Scrape the homepage as markdown (1 credit)
 * 2. If no contacts found, scrape /about or /contact page (1 more credit)
 * 3. Extract emails, names, and titles from the clean markdown
 */
export async function firecrawlScrape(websiteUrl: string): Promise<FirecrawlScrapeResult> {
  const client = getClient()
  if (!client) {
    throw new Error('Firecrawl API key not configured')
  }

  const emptyResult: FirecrawlScrapeResult = {
    emails: [],
    source: 'firecrawl',
    pagesScraped: 0,
    creditsUsed: 0,
  }

  // Normalize URL
  let baseUrl = websiteUrl.trim()
  if (!baseUrl.startsWith('http')) baseUrl = `https://${baseUrl}`
  // Remove trailing slash
  baseUrl = baseUrl.replace(/\/+$/, '')

  const allEmails: ScrapedEmail[] = []
  let pagesScraped = 0
  let creditsUsed = 0

  // Phase 1: Scrape homepage
  try {
    const homeResult = await client.scrape(baseUrl, {
      formats: ['markdown'],
      timeout: 15000,
    })

    pagesScraped++
    creditsUsed++

    if (homeResult?.markdown) {
      const contacts = extractContactsFromMarkdown(homeResult.markdown, baseUrl)
      allEmails.push(...contacts)
    }
  } catch (error) {
    console.error(`[Firecrawl] Failed to scrape homepage ${baseUrl}:`, error instanceof Error ? error.message : error)
  }

  // Phase 2: If no personal emails found, try contact/about pages
  const hasPersonalEmail = allEmails.some(e => e.type === 'personal')
  if (!hasPersonalEmail) {
    const contactPaths = ['/contact', '/about', '/about-us', '/staff', '/leadership', '/board']

    for (const path of contactPaths) {
      if (creditsUsed >= 3) break // Cap at 3 credits per org

      try {
        const pageUrl = `${baseUrl}${path}`
        const pageResult = await client.scrape(pageUrl, {
          formats: ['markdown'],
          timeout: 15000,
        })

        pagesScraped++
        creditsUsed++

        if (pageResult?.markdown) {
          const contacts = extractContactsFromMarkdown(pageResult.markdown, baseUrl)
          // Only add new emails we haven't seen
          for (const contact of contacts) {
            if (!allEmails.some(e => e.email === contact.email)) {
              allEmails.push(contact)
            }
          }

          // Stop if we found a personal email
          if (contacts.some(c => c.type === 'personal')) break
        }
      } catch {
        // Page doesn't exist or failed — skip silently
        continue
      }
    }
  }

  // Sort: personal with name+title > personal with name > personal > generic with title > generic
  allEmails.sort((a, b) => {
    const scoreA = (a.type === 'personal' ? 100 : 0) + (a.name ? 50 : 0) + (a.title ? 25 : 0)
    const scoreB = (b.type === 'personal' ? 100 : 0) + (b.name ? 50 : 0) + (b.title ? 25 : 0)
    return scoreB - scoreA
  })

  return {
    emails: allEmails,
    source: 'firecrawl',
    pagesScraped,
    creditsUsed,
  }
}

/**
 * Extract contacts from clean markdown text
 *
 * Firecrawl gives us clean markdown (no HTML noise), making extraction
 * much more reliable than raw HTML parsing.
 */
function extractContactsFromMarkdown(markdown: string, baseUrl: string): ScrapedEmail[] {
  const contacts: ScrapedEmail[] = []
  const seenEmails = new Set<string>()

  // Get the org's domain for filtering
  let orgDomain = ''
  try {
    orgDomain = new URL(baseUrl).hostname.replace('www.', '')
  } catch { /* ignore */ }

  // Extract all emails from the markdown
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const emailMatches = markdown.match(emailRegex) || []

  for (const email of emailMatches) {
    const lowerEmail = email.toLowerCase()

    // Skip obvious non-emails
    if (lowerEmail.endsWith('.png') || lowerEmail.endsWith('.jpg') || lowerEmail.endsWith('.gif')) continue
    if (lowerEmail.includes('example.com') || lowerEmail.includes('sentry.io')) continue
    if (seenEmails.has(lowerEmail)) continue
    seenEmails.add(lowerEmail)

    // Determine if personal or generic
    const prefix = lowerEmail.split('@')[0]
    const isGeneric = GENERIC_PREFIXES.some(gp => prefix === gp || prefix.startsWith(`${gp}.`) || prefix.startsWith(`${gp}_`))
    const emailType: 'personal' | 'generic' = isGeneric ? 'generic' : 'personal'

    // Find the email's context (surrounding text, ~500 chars)
    const emailIndex = markdown.indexOf(email)
    const contextStart = Math.max(0, emailIndex - 300)
    const contextEnd = Math.min(markdown.length, emailIndex + email.length + 300)
    const context = markdown.substring(contextStart, contextEnd)

    // Try to find a name near the email
    const name = extractNameFromContext(context, email)

    // Try to find a leadership title near the email
    const title = extractTitleFromContext(context)

    contacts.push({
      email: lowerEmail,
      name,
      title,
      type: emailType,
    })
  }

  return contacts
}

/**
 * Extract a person's name from text context around an email
 */
function extractNameFromContext(context: string, email: string): string | null {
  // Clean the context - remove markdown formatting
  const clean = context
    .replace(/[#*_\[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Look for "Name - Title" or "Name, Title" patterns near the email
  // Common patterns on choir websites:
  // "John Smith - Music Director"
  // "John Smith, Artistic Director"
  // "Music Director: John Smith"

  // Pattern 1: Name before a title separator
  const nameBeforeTitle = clean.match(
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*[-–—,|]\s*(?:music|artistic|choir|vocal|chorus|executive|managing|board|associate)\s*director/i
  )
  if (nameBeforeTitle) return nameBeforeTitle[1].trim()

  // Pattern 2: Title followed by name
  const titleBeforeName = clean.match(
    /(?:music|artistic|choir|vocal|chorus|executive|managing|board|associate)\s*director\s*[:–—-]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i
  )
  if (titleBeforeName) return titleBeforeName[1].trim()

  // Pattern 3: "President" or "Conductor" patterns
  const presidentPattern = clean.match(
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*[-–—,|]\s*(?:president|conductor|chair)/i
  )
  if (presidentPattern) return presidentPattern[1].trim()

  // Pattern 4: Name right before the email (common in contact lists)
  const beforeEmail = clean.split(email)[0] || ''
  const lastLine = beforeEmail.split(/[.\n]/).pop()?.trim() || ''
  const nameMatch = lastLine.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/)
  if (nameMatch) {
    const candidate = nameMatch[1]
    // Filter out common non-name words
    const nonNames = ['Contact', 'Email', 'Phone', 'Address', 'Website', 'Send', 'Click', 'Please', 'The']
    if (!nonNames.some(nn => candidate.startsWith(nn))) {
      return candidate
    }
  }

  return null
}

/**
 * Extract a leadership title from text context
 */
function extractTitleFromContext(context: string): string | null {
  const clean = context.toLowerCase()

  for (const title of LEADERSHIP_TITLES) {
    if (clean.includes(title)) {
      // Return the title in proper case
      return title.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
    }
  }

  return null
}

/**
 * Check if Firecrawl is available (API key set)
 */
export function isFirecrawlAvailable(): boolean {
  return !!process.env.FIRECRAWL_API_KEY
}
