import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { enrichOrganization } from '@/lib/enrichment'
import { handleApiError } from '@/lib/api-error'

/**
 * GET /api/cron/enrich
 * Batch re-enrichment job — finds all leads with needsEnrichment=true
 * and retries scraping their websites for contact info.
 *
 * Self-hosted Firecrawl is free, so we can run this aggressively.
 * Secured with CRON_SECRET.
 *
 * Configure in railway.json / vercel.json to run nightly.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find leads that need enrichment and have a website to scrape
    const leads = await prisma.lead.findMany({
      where: {
        needsEnrichment: true,
        website: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Process up to 50 per run to avoid timeouts
    })

    console.log(`[Cron Enrich] Found ${leads.length} leads needing enrichment`)

    if (leads.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No leads need enrichment',
        processed: 0,
        enriched: 0,
        failed: 0,
      })
    }

    let enriched = 0
    let failed = 0
    let noResult = 0
    const results: Array<{ id: string; org: string; result: string }> = []

    for (const lead of leads) {
      try {
        const enrichment = await enrichOrganization(
          lead.website!,
          lead.phone,
          lead.organization || `${lead.firstName} ${lead.lastName}`
        )

        if (enrichment.email && !enrichment.email.includes('@placeholder.local')) {
          const updateData: Record<string, unknown> = {
            needsEnrichment: false,
            emailVerified: enrichment.emailVerified,
            enrichmentSource: enrichment.enrichmentSource || 'website_scrape',
          }

          if (!lead.email || lead.email.includes('@placeholder.local')) {
            updateData.email = enrichment.email
          }

          if (enrichment.firstName && enrichment.firstName !== 'Contact') {
            updateData.firstName = enrichment.firstName
            if (enrichment.lastName) updateData.lastName = enrichment.lastName
          }

          if (enrichment.contactTitle) {
            updateData.contactTitle = enrichment.contactTitle
          }

          if (enrichment.phone && !lead.phone) {
            updateData.phone = enrichment.phone
          }

          await prisma.lead.update({ where: { id: lead.id }, data: updateData })
          enriched++
          results.push({ id: lead.id, org: lead.organization || 'unknown', result: `found: ${enrichment.email}` })
        } else {
          noResult++
          results.push({ id: lead.id, org: lead.organization || 'unknown', result: 'no email found' })
        }

        // Small delay between requests to be polite
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        failed++
        const msg = error instanceof Error ? error.message : 'unknown error'
        results.push({ id: lead.id, org: lead.organization || 'unknown', result: `error: ${msg}` })
        console.error(`[Cron Enrich] Failed for "${lead.organization}":`, msg)
      }
    }

    console.log(`[Cron Enrich] Complete: ${enriched} enriched, ${noResult} no result, ${failed} failed out of ${leads.length}`)

    return NextResponse.json({
      success: true,
      processed: leads.length,
      enriched,
      noResult,
      failed,
      results,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
