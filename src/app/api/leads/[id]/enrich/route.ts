import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { enrichOrganization } from '@/lib/enrichment'
import { handleApiError } from '@/lib/api-error'

/**
 * POST /api/leads/[id]/enrich
 * Re-run enrichment on a single lead to find missing email/contact info.
 * Used by the "Re-enrich" button in the leads table.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const lead = await prisma.lead.findUnique({ where: { id } })
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    if (!lead.website) {
      return NextResponse.json(
        { error: 'No website URL available for enrichment', lead },
        { status: 422 }
      )
    }

    console.log(`[Re-enrich] Starting enrichment for "${lead.organization || lead.email}" — ${lead.website}`)

    const enrichment = await enrichOrganization(
      lead.website,
      lead.phone,
      lead.organization || `${lead.firstName} ${lead.lastName}`
    )

    if (enrichment.email && !enrichment.email.includes('@placeholder.local')) {
      // Found an email — update the lead
      const updateData: Record<string, unknown> = {
        needsEnrichment: false,
        emailVerified: enrichment.emailVerified,
        enrichmentSource: enrichment.enrichmentSource || 'website_scrape',
      }

      // Only update email if lead had no real email before
      if (!lead.email || lead.email.includes('@placeholder.local') || lead.needsEnrichment) {
        updateData.email = enrichment.email
      }

      // Update name if we found a real person (not generic "Contact at Org")
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

      const updated = await prisma.lead.update({
        where: { id },
        data: updateData,
      })

      console.log(`[Re-enrich] Success for "${lead.organization}": ${enrichment.email}`)

      return NextResponse.json({
        success: true,
        enriched: true,
        lead: updated,
        enrichment: {
          email: enrichment.email,
          firstName: enrichment.firstName,
          lastName: enrichment.lastName,
          contactTitle: enrichment.contactTitle,
          emailType: enrichment.emailType,
          source: enrichment.enrichmentSource,
        },
      })
    } else {
      // Still no email found
      console.log(`[Re-enrich] No email found for "${lead.organization}" — still needs enrichment`)

      return NextResponse.json({
        success: true,
        enriched: false,
        message: 'No email found during re-enrichment',
        lead,
      })
    }
  } catch (error) {
    return handleApiError(error)
  }
}
