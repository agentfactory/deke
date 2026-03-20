/**
 * Background Discovery Runner
 *
 * Runs the discovery pipeline as a background job (detached promise).
 * Updates campaign.discoveryStatus so the frontend can poll for progress.
 */

import { prisma } from '@/lib/db'
import { discoverLeads } from './orchestrator'
import { generateDraftsForCampaign } from './draft-generator'

/**
 * Run discovery in the background (fire-and-forget).
 *
 * Call this WITHOUT await — it runs as a detached promise in the Node.js event loop.
 * Updates discoveryStatus in the database so the frontend can poll GET /api/campaigns/[id]/discover.
 *
 * @param campaignId - The campaign to run discovery for
 */
export function runDiscoveryInBackground(campaignId: string): void {
  // Detached promise — intentionally not awaited
  void (async () => {
    try {
      console.log(`[BackgroundRunner] Starting discovery for campaign ${campaignId}`)

      // Run the discovery orchestrator
      const result = await discoverLeads(campaignId)

      // Generate email drafts
      let drafts = { generated: 0, skipped: 0 }
      try {
        drafts = await generateDraftsForCampaign(campaignId)
      } catch (draftError) {
        console.error('[BackgroundRunner] Draft generation failed (discovery still succeeded):', draftError)
      }

      // Mark as completed and advance campaign status
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          discoveryStatus: 'COMPLETED',
          discoveryError: null,
          // Auto-advance from DRAFT to READY
          ...(await prisma.campaign.findUnique({ where: { id: campaignId }, select: { status: true } })
            .then(c => c?.status === 'DRAFT' ? { status: 'READY' } : {})),
        },
      })

      console.log(`[BackgroundRunner] Discovery completed for campaign ${campaignId}: ${result.total} leads, ${drafts.generated} drafts`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`[BackgroundRunner] Discovery FAILED for campaign ${campaignId}:`, errorMessage)

      try {
        await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            discoveryStatus: 'FAILED',
            discoveryError: errorMessage.substring(0, 1000), // Truncate for DB storage
          },
        })
      } catch (dbError) {
        console.error('[BackgroundRunner] Failed to update campaign status after error:', dbError)
      }
    }
  })()
}
