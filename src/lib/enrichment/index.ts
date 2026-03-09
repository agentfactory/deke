/**
 * Enrichment Orchestrator
 *
 * Takes an organization's website URL and returns the best contact information.
 * Pipeline: scrape website -> pick best email (personal > generic > none)
 * NEVER generates fake emails.
 */

import { scrapeWebsite, type ScrapedEmail } from './website-scraper'

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
    const scrapeResult = await scrapeWebsite(websiteUrl)

    if (scrapeResult.emails.length === 0) {
      console.log(`[Enrichment] No emails found on website for "${orgName}"`)
      return baseResult
    }

    // Pick the best email: personal with name > personal without > generic
    const bestEmail = pickBestEmail(scrapeResult.emails)

    if (!bestEmail) {
      return baseResult
    }

    // Parse name from the scraped email context
    let firstName = 'Contact'
    let lastName = `at ${orgName}`

    if (bestEmail.name) {
      const nameParts = bestEmail.name.split(' ')
      if (nameParts.length >= 2) {
        firstName = nameParts[0]
        lastName = nameParts.slice(1).join(' ')
      } else if (nameParts.length === 1) {
        firstName = nameParts[0]
      }
    }

    const titleInfo = bestEmail.title ? ` (${bestEmail.title})` : ''
    console.log(`[Enrichment] Found ${bestEmail.type} email for "${orgName}": ${bestEmail.email}${titleInfo}`)

    return {
      email: bestEmail.email,
      firstName,
      lastName,
      contactTitle: bestEmail.title || null,
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
