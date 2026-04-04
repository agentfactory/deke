/**
 * Enrichment Orchestrator
 *
 * Takes an organization's website URL and returns the best contact information.
 * Pipeline: scrape website -> pick best email (personal > generic > none)
 * NEVER generates fake emails.
 */

import { scrapeWebsite, type ScrapedEmail } from './website-scraper'
import { firecrawlScrape, isFirecrawlAvailable } from './firecrawl-scraper'
import { httpScrapeWebsite } from './http-scraper'
import { isValidContactName, stripTitlePrefix } from './name-validator'

// Track Firecrawl credit exhaustion across the session
let firecrawlDisabled = false
let firecrawlFailCount = 0

export interface EnrichmentResult {
  email: string | null
  firstName: string | null
  lastName: string | null
  contactTitle: string | null  // "Music Director", "President", etc.
  emailType: 'personal' | 'generic' | null
  emailVerified: boolean // true if scraped from real website
  needsEnrichment: boolean // true if no email found
  enrichmentSource: string | null // "website_scrape" | null
  website: string | null
  phone: string | null
}

/**
 * Enrich an organization with real contact information
 *
 * @param websiteUrl - Organization website URL (from Google Places)
 * @param phone - Phone number (from Google Places)
 * @param orgName - Organization name for fallback context
 * @returns Best contact info found, or needsEnrichment flag
 */
export async function enrichOrganization(
  websiteUrl: string | null,
  phone: string | null,
  orgName: string
): Promise<EnrichmentResult> {
  const baseResult: EnrichmentResult = {
    email: null,
    firstName: null,
    lastName: null,
    contactTitle: null,
    emailType: null,
    emailVerified: false,
    needsEnrichment: true,
    enrichmentSource: null,
    website: websiteUrl,
    phone,
  }

  // If no website, we can't scrape - mark as needs enrichment
  if (!websiteUrl) {
    console.log(`[Enrichment] No website for "${orgName}" — needs manual enrichment`)
    return baseResult
  }

  try {
    // Strategy: Try Firecrawl first (self-hosted = free, cleaner markdown output).
    // Fall back to HTTP scraper if Firecrawl is unavailable or fails.
    let scrapeResult: { emails: ScrapedEmail[] } = { emails: [] }

    // Step 1: Firecrawl (preferred — self-hosted is free, gives clean markdown)
    if (isFirecrawlAvailable() && !firecrawlDisabled) {
      try {
        const fcResult = await firecrawlScrape(websiteUrl)
        if (fcResult.emails.length > 0) {
          console.log(`[Enrichment] Firecrawl found ${fcResult.emails.length} emails for "${orgName}"`)
          scrapeResult = fcResult
          firecrawlFailCount = 0
        }
      } catch (fcError) {
        firecrawlFailCount++
        const errMsg = fcError instanceof Error ? fcError.message : String(fcError)
        console.warn(`[Enrichment] Firecrawl failed for "${orgName}": ${errMsg}`)

        if (errMsg.includes('402') || errMsg.includes('Insufficient credits') || errMsg.includes('429')) {
          firecrawlDisabled = true
          console.warn('[Enrichment] Firecrawl unavailable — falling back to HTTP scraper')
        } else if (firecrawlFailCount >= 5) {
          firecrawlDisabled = true
          console.warn('[Enrichment] Firecrawl failed 5 times — falling back to HTTP scraper')
        }
      }
    }

    // Step 2: HTTP scraper fallback (if Firecrawl found nothing or is unavailable)
    if (scrapeResult.emails.length === 0) {
      try {
        scrapeResult = await httpScrapeWebsite(websiteUrl)
        if (scrapeResult.emails.length > 0) {
          console.log(`[Enrichment] HTTP scraper found ${scrapeResult.emails.length} emails for "${orgName}"`)
        }
      } catch (httpError) {
        console.warn(`[Enrichment] HTTP scraper failed for "${orgName}":`, httpError instanceof Error ? httpError.message : httpError)
        scrapeResult = { emails: [] }
      }
    }

    if (scrapeResult.emails.length === 0) {
      console.log(`[Enrichment] No emails found on website for "${orgName}"`)
      return baseResult
    }

    // Pick the best email: personal with name > personal without > generic
    const bestEmail = pickBestEmail(scrapeResult.emails)

    if (!bestEmail) {
      return baseResult
    }

    // Parse name from the scraped email context (with validation)
    let firstName = 'Contact'
    let lastName = `at ${orgName}`
    let inferredTitle: string | null = null

    if (bestEmail.name) {
      const { name: cleanName, title: strippedTitle } = stripTitlePrefix(bestEmail.name)
      inferredTitle = strippedTitle

      if (isValidContactName(cleanName)) {
        const nameParts = cleanName.split(' ')
        if (nameParts.length >= 2) {
          firstName = nameParts[0]
          lastName = nameParts.slice(1).join(' ')
        } else if (nameParts.length === 1) {
          firstName = nameParts[0]
        }
      }
      // else: keep default "Contact" / "at {orgName}"
    }

    const titleInfo = bestEmail.title ? ` (${bestEmail.title})` : ''
    console.log(`[Enrichment] Found ${bestEmail.type} email for "${orgName}": ${bestEmail.email}${titleInfo}`)

    return {
      email: bestEmail.email,
      firstName,
      lastName,
      contactTitle: bestEmail.title || inferredTitle || null,
      emailType: bestEmail.type,
      emailVerified: true,
      needsEnrichment: false,
      enrichmentSource: 'website_scrape',
      website: websiteUrl,
      phone,
    }
  } catch (error) {
    console.error(`[Enrichment] Failed to enrich "${orgName}":`, error)
    return baseResult
  }
}

/**
 * Pick the best email from scraped results
 * Priority: personal with name > personal > generic
 */
function pickBestEmail(emails: ScrapedEmail[]): ScrapedEmail | null {
  if (emails.length === 0) return null

  // Already sorted by quality in scraper, but let's be explicit
  const personalWithName = emails.find(e => e.type === 'personal' && e.name)
  if (personalWithName) return personalWithName

  const personal = emails.find(e => e.type === 'personal')
  if (personal) return personal

  const generic = emails.find(e => e.type === 'generic')
  if (generic) return generic

  return emails[0]
}
