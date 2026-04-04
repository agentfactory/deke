/**
 * Plain HTTP Website Scraper — No Firecrawl Dependency
 *
 * Uses Node.js fetch() to grab HTML from org websites and extract
 * contact emails, names, and titles. Works even when Firecrawl credits
 * are exhausted.
 *
 * Strategy: scrape homepage + /contact + /about (max 3 pages).
 * Extract emails with context-aware name/title detection.
 */

import { isValidContactName, stripTitlePrefix } from './name-validator'
import type { ScrapedEmail, ScrapeResult } from './website-scraper'

// Pages most likely to contain contact info
const CONTACT_PATHS = ['/contact', '/about', '/about-us', '/staff', '/leadership']

// Generic email prefixes
const GENERIC_PREFIXES = [
  'info', 'admin', 'office', 'contact', 'hello', 'help',
  'support', 'noreply', 'no-reply', 'webmaster', 'mail',
  'general', 'enquiries', 'inquiries', 'reception', 'membership', 'secretary',
]

// Leadership titles
const LEADERSHIP_TITLES = [
  'music director', 'artistic director', 'chorus master', 'choirmaster',
  'conductor', 'director of music', 'president', 'executive director',
  'managing director', 'chair', 'chairperson', 'board president',
  'vocal director', 'associate director',
]

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const NAME_PATTERN = /(?:(?:Dr|Rev|Prof|Mr|Mrs|Ms)\.?\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g

// Skip domains that aren't the org's own contacts
const SKIP_DOMAINS = [
  'mymusicstaff.com', 'groupanizer.com', 'wixpress.com',
  'squarespace.com', 'wordpress.com', 'mailchimp.com',
  'constantcontact.com', 'google.com', 'googleapis.com',
  'w3.org', 'schema.org', 'cloudflare.com', 'jquery.com',
  'sentry.io', 'placeholder.local', 'example.com',
  'bootstrapcdn.com', 'github.com', 'gravatar.com',
]

/**
 * Fetch a page's HTML using plain HTTP (no API credits)
 */
async function fetchPage(url: string): Promise<string | null> {
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

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) return null

    const html = await response.text()
    // Limit to 200KB
    return html.substring(0, 200_000)
  } catch {
    return null
  }
}

/**
 * Strip HTML tags to get readable text, preserving some structure
 */
function htmlToText(html: string): string {
  return html
    // Remove script/style blocks entirely
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    // Convert block elements to newlines
    .replace(/<\/?(p|div|br|h[1-6]|li|tr|td|th|section|article|header|footer|nav)[^>]*>/gi, '\n')
    // Remove remaining tags
    .replace(/<[^>]+>/g, ' ')
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Collapse whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim()
}

/**
 * Also extract emails from raw HTML (mailto: links, etc.)
 */
function extractEmailsFromHtml(html: string): string[] {
  const mailtoRegex = /mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
  const emails: string[] = []
  let match
  while ((match = mailtoRegex.exec(html)) !== null) {
    emails.push(match[1].toLowerCase())
  }
  return emails
}

function classifyEmail(email: string): 'personal' | 'generic' {
  const localPart = email.split('@')[0].toLowerCase()
  if (GENERIC_PREFIXES.some(prefix => localPart === prefix)) return 'generic'
  if (/^[a-z]+\.[a-z]+$/.test(localPart)) return 'personal'
  if (/^[a-z]{2,}$/.test(localPart) && !GENERIC_PREFIXES.includes(localPart)) return 'personal'
  return 'generic'
}

function extractNameNearEmail(text: string, emailIndex: number): { name: string | null; title: string | null } {
  const start = Math.max(0, emailIndex - 300)
  const end = Math.min(text.length, emailIndex + 100)
  const context = text.substring(start, end)

  // Find title
  let title: string | null = null
  for (const t of LEADERSHIP_TITLES) {
    if (context.toLowerCase().includes(t)) {
      title = t.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
      break
    }
  }

  // Find name before email
  const beforeEmail = text.substring(start, emailIndex)
  const names: string[] = []
  let match
  const regex = new RegExp(NAME_PATTERN.source, 'g')
  while ((match = regex.exec(beforeEmail)) !== null) {
    names.push(match[1]?.trim() || match[0].trim())
  }

  let name: string | null = names.length > 0 ? names[names.length - 1] : null
  if (name) {
    const stripped = stripTitlePrefix(name)
    if (!isValidContactName(stripped.name)) {
      return { name: null, title: stripped.title || title }
    }
    return { name: stripped.name, title: stripped.title || title }
  }

  return { name: null, title }
}

/**
 * Extract contacts from text content of a page
 */
function extractContacts(text: string, orgDomain: string): ScrapedEmail[] {
  const contacts: ScrapedEmail[] = []
  const seenEmails = new Set<string>()

  let match
  const regex = new RegExp(EMAIL_REGEX.source, 'g')
  while ((match = regex.exec(text)) !== null) {
    const email = match[0].toLowerCase()
    if (seenEmails.has(email)) continue

    // Skip non-email extensions
    if (/\.(png|jpg|gif|css|js|svg|webp)$/i.test(email)) continue

    // Skip third-party domains
    const emailDomain = email.split('@')[1] || ''
    if (SKIP_DOMAINS.some(d => emailDomain.includes(d))) continue

    // Keep emails from org's domain or common providers
    const isOrgDomain = emailDomain === orgDomain || emailDomain === `www.${orgDomain}`
    const isCommonProvider = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'icloud.com', 'comcast.net', 'verizon.net'].includes(emailDomain)
    if (!isOrgDomain && !isCommonProvider) continue

    seenEmails.add(email)

    const { name, title } = extractNameNearEmail(text, match.index)
    contacts.push({
      email,
      name,
      title,
      type: classifyEmail(email),
    })
  }

  return contacts
}

/**
 * Scrape a website using plain HTTP fetch (no Firecrawl API needed)
 *
 * Tries homepage + up to 2 subpages (/contact, /about, etc.)
 * Max 3 HTTP requests per org.
 */
export async function httpScrapeWebsite(websiteUrl: string): Promise<ScrapeResult> {
  let baseUrl: string
  try {
    const url = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`)
    baseUrl = `${url.protocol}//${url.host}`
  } catch {
    return { emails: [], source: 'website_scrape' }
  }

  const orgDomain = new URL(baseUrl).hostname.replace(/^www\./, '')
  const allEmails = new Map<string, ScrapedEmail>()
  let pagesScraped = 0

  // Scrape homepage first
  const homeHtml = await fetchPage(baseUrl)
  if (homeHtml) {
    pagesScraped++
    const text = htmlToText(homeHtml)
    const mailtoEmails = extractEmailsFromHtml(homeHtml)

    // Extract from text
    for (const contact of extractContacts(text, orgDomain)) {
      if (!allEmails.has(contact.email)) allEmails.set(contact.email, contact)
    }

    // Also check mailto links (sometimes obfuscated in HTML)
    for (const email of mailtoEmails) {
      if (!allEmails.has(email)) {
        allEmails.set(email, {
          email,
          name: null,
          title: null,
          type: classifyEmail(email),
        })
      }
    }
  }

  // If we found a personal email with a name, we're done
  const hasGoodEmail = Array.from(allEmails.values()).some(e => e.type === 'personal' && e.name)
  if (!hasGoodEmail) {
    // Try contact/about pages (max 2 more)
    for (const path of CONTACT_PATHS) {
      if (pagesScraped >= 3) break

      // Small delay between requests to be polite
      await new Promise(resolve => setTimeout(resolve, 200))

      const html = await fetchPage(`${baseUrl}${path}`)
      if (!html) continue

      pagesScraped++
      const text = htmlToText(html)
      const mailtoEmails = extractEmailsFromHtml(html)

      for (const contact of extractContacts(text, orgDomain)) {
        const existing = allEmails.get(contact.email)
        if (!existing) {
          allEmails.set(contact.email, contact)
        } else {
          // Upgrade with name/title if found
          if (contact.name && !existing.name) existing.name = contact.name
          if (contact.title && !existing.title) existing.title = contact.title
          if (contact.name && existing.type === 'generic') existing.type = 'personal'
        }
      }

      for (const email of mailtoEmails) {
        if (!allEmails.has(email)) {
          allEmails.set(email, {
            email,
            name: null,
            title: null,
            type: classifyEmail(email),
          })
        }
      }

      // Stop if we found a personal email
      if (Array.from(allEmails.values()).some(e => e.type === 'personal' && e.name)) break
    }
  }

  // Sort by quality
  const sorted = Array.from(allEmails.values()).sort((a, b) => {
    const scoreA = (a.type === 'personal' ? 10 : 0) + (a.name ? 5 : 0) + (a.title ? 8 : 0)
    const scoreB = (b.type === 'personal' ? 10 : 0) + (b.name ? 5 : 0) + (b.title ? 8 : 0)
    return scoreB - scoreA
  })

  console.log(`[HTTP Scraper] ${websiteUrl}: scraped ${pagesScraped} pages, found ${sorted.length} emails`)

  return { emails: sorted, source: 'website_scrape' }
}
