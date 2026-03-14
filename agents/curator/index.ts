/**
 * CURATOR Agent - Lead Quality Evaluator
 *
 * Uses Claude AI to evaluate lead quality before outreach.
 * Subscribes to discovery_completed events and automatically
 * assesses all new leads, storing quality scores in the database.
 */

import { BaseAgent } from '../base-agent'
import { eventBus } from '@/lib/event-bus'
import { prisma } from '@/lib/db'
import type { AgentConfig, AgentResponse, AgentEvent } from '../types'
import {
  evaluateLeadBatch,
  batchLeads,
  type QualityResult,
  type LeadForEvaluation,
} from './evaluator'

const CURATOR_CONFIG: AgentConfig = {
  id: 'curator',
  name: 'CURATOR',
  tier: 'intelligence',
  description:
    'Lead quality evaluator - uses AI to assess lead relevance before outreach',
  systemPrompt: `You are CURATOR, Deke Sharon's lead quality specialist.

Your mission:
- Evaluate every discovered lead for genuine relevance to Deke's services
- Filter out "AI slop" — irrelevant businesses, wrong contacts, non-music orgs
- Ensure only high-quality leads receive outreach
- Provide clear reasoning for quality scores

Quality standards:
- Score 70+: Strong fit — choirs, a cappella groups, music schools, festivals
- Score 50-69: Moderate fit — arts orgs, churches with music programs
- Score below 50: Poor fit — rejected from outreach
- Never pass leads with placeholder emails or fake contact names

Be rigorous. One well-targeted email beats ten generic ones.`,
  tools: [],
}

export class CURATORAgent extends BaseAgent {
  constructor() {
    super(CURATOR_CONFIG)
    this.initializeHandlers()
  }

  private initializeHandlers(): void {
    // Auto-evaluate after discovery completes
    eventBus.subscribe(
      'discovery_completed',
      async (event: AgentEvent) => {
        await this.handleDiscoveryCompleted(event)
      }
    )

    // Manual evaluation request
    eventBus.subscribe(
      'evaluate_leads',
      async (event: AgentEvent) => {
        if (event.targetAgent === 'curator') {
          await this.handleEvaluateRequest(event)
        }
      }
    )
  }

  private async handleDiscoveryCompleted(event: AgentEvent): Promise<void> {
    const campaignId = event.payload.campaignId as string
    if (!campaignId) {
      console.error('[CURATOR] discovery_completed event missing campaignId')
      return
    }

    console.log(
      `[CURATOR] Discovery completed for campaign ${campaignId}, starting quality evaluation`
    )
    await this.evaluateCampaignLeads(campaignId)
  }

  private async handleEvaluateRequest(event: AgentEvent): Promise<void> {
    const campaignId = event.payload.campaignId as string
    if (!campaignId) {
      console.error('[CURATOR] evaluate_leads event missing campaignId')
      return
    }

    console.log(
      `[CURATOR] Manual evaluation requested for campaign ${campaignId}`
    )
    await this.evaluateCampaignLeads(campaignId)
  }

  /**
   * Evaluate all unevaluated leads in a campaign
   */
  async evaluateCampaignLeads(campaignId: string): Promise<{
    evaluated: number
    passed: number
    failed: number
  }> {
    // Fetch campaign context
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign) {
      console.error(`[CURATOR] Campaign ${campaignId} not found`)
      return { evaluated: 0, passed: 0, failed: 0 }
    }

    // Fetch unevaluated campaign leads with lead data
    const campaignLeads = await prisma.campaignLead.findMany({
      where: {
        campaignId,
        qualityEvaluatedAt: null,
      },
      include: {
        lead: true,
      },
    })

    if (campaignLeads.length === 0) {
      console.log(`[CURATOR] No unevaluated leads for campaign ${campaignId}`)
      return { evaluated: 0, passed: 0, failed: 0 }
    }

    console.log(
      `[CURATOR] Evaluating ${campaignLeads.length} leads for campaign ${campaignId}`
    )

    // Prepare leads for evaluation
    const leadsForEval: LeadForEvaluation[] = campaignLeads.map((cl: any) => ({
      id: cl.lead.id,
      campaignLeadId: cl.id,
      firstName: cl.lead.firstName,
      lastName: cl.lead.lastName,
      email: cl.lead.email,
      organization: cl.lead.organization,
      source: cl.source,
      score: cl.score,
      contactTitle: cl.lead.contactTitle,
      website: cl.lead.website,
      editorialSummary: cl.lead.editorialSummary,
      googleRating: cl.lead.googleRating,
    }))

    // Batch and evaluate
    const batches = batchLeads(leadsForEval)
    const allResults: QualityResult[] = []

    const campaignContext = {
      name: campaign.name,
      baseLocation: campaign.baseLocation,
      radius: campaign.radius,
      targetOrgTypes: campaign.targetOrgTypes,
    }

    for (const batch of batches) {
      const results = await evaluateLeadBatch(batch, campaignContext)
      allResults.push(...results)
    }

    // Update database with results
    const now = new Date()
    let passed = 0
    let failed = 0

    for (const result of allResults) {
      try {
        await prisma.campaignLead.update({
          where: { id: result.campaignLeadId },
          data: {
            qualityScore: result.qualityScore,
            qualityReason: result.qualityReason,
            qualityPassed: result.qualityPassed,
            qualityEvaluatedAt: now,
          },
        })
        if (result.qualityPassed) passed++
        else failed++
      } catch (updateError) {
        console.error(
          `[CURATOR] Failed to update lead ${result.campaignLeadId}:`,
          updateError
        )
      }
    }

    console.log(
      `[CURATOR] Evaluation complete: ${allResults.length} evaluated, ${passed} passed, ${failed} failed`
    )

    // Emit completion event
    await this.emitEvent('quality_evaluation_completed', {
      campaignId,
      evaluated: allResults.length,
      passed,
      failed,
    })

    return { evaluated: allResults.length, passed, failed }
  }

  async processMessage(message: string): Promise<AgentResponse> {
    return {
      message:
        "CURATOR here! I evaluate lead quality using AI to ensure only relevant, high-quality leads receive outreach. I'm triggered automatically after discovery completes.",
      metadata: {
        status: 'active',
        agent: 'curator',
      },
    }
  }
}

// Export singleton instance
export const curatorAgent = new CURATORAgent()
