/**
 * SCOUT Agent - Opportunity Discovery Coordinator
 *
 * Monitors upcoming bookings and automatically discovers nearby
 * opportunities to maximize trip profitability. Coordinates with
 * the Opportunity Finder system to identify high-value leads.
 */

import { BaseAgent } from '../base-agent';
import { eventBus } from '@/lib/event-bus';
import type { AgentConfig, AgentResponse, AgentEvent } from '../types';

const SCOUT_CONFIG: AgentConfig = {
  id: 'scout',
  name: 'SCOUT',
  tier: 'intelligence',
  description: 'Opportunity discovery coordinator - finds high-value leads near existing bookings',
  systemPrompt: `You are SCOUT, Deke Sharon's opportunity discovery specialist.

Your mission:
- Monitor upcoming bookings for opportunity discovery
- Automatically trigger campaigns when bookings are confirmed
- Identify high-value leads near travel locations
- Maximize trip profitability (target: 200%+ increase)
- Alert team when exceptional opportunities are found

Discovery Strategy:
1. Past clients within 100 miles of booking
2. Dormant leads (6+ months no contact)
3. Similar organizations (type, size, location)
4. AI-powered research (Phase 5)

When discovering opportunities:
- Prioritize leads with score 70+
- Focus on geographic clustering
- Consider travel logistics and timing
- Recommend optimal outreach strategy

Be proactive, data-driven, and strategic. Your goal is to turn every
trip into multiple revenue opportunities.`,
  tools: [],
};

export class SCOUTAgent extends BaseAgent {
  constructor() {
    super(SCOUT_CONFIG);
    this.initializeHandlers();
  }

  /**
   * Subscribe to events this agent should handle
   */
  private initializeHandlers(): void {
    // Subscribe to booking confirmation events
    eventBus.subscribe('booking_confirmed', async (event: AgentEvent) => {
      await this.handleBookingConfirmed(event);
    });

    // Subscribe to opportunity discovery requests
    eventBus.subscribe('discover_opportunities', async (event: AgentEvent) => {
      if (event.targetAgent === 'scout') {
        await this.handleDiscoveryRequest(event);
      }
    });
  }

  /**
   * Handle booking confirmation - automatically trigger discovery
   */
  private async handleBookingConfirmed(event: AgentEvent): Promise<void> {
    console.log('[SCOUT] New booking confirmed, initiating opportunity discovery');
    console.log('[SCOUT] Booking details:', event.payload);

    // TODO Phase 5: Implement automatic campaign creation
    // - Extract booking location and dates
    // - Create opportunity campaign
    // - Run discovery algorithms
    // - Alert HARMONY if high-value leads found

    await this.emitEvent(
      'discovery_initiated',
      {
        bookingId: event.payload.bookingId,
        status: 'started',
        timestamp: new Date(),
      },
      event.sourceAgent
    );
  }

  /**
   * Handle explicit discovery request from another agent
   */
  private async handleDiscoveryRequest(event: AgentEvent): Promise<void> {
    console.log('[SCOUT] Received discovery request from:', event.sourceAgent);
    console.log('[SCOUT] Request details:', event.payload);

    // Emit acknowledgment
    await this.emitEvent(
      'discovery_acknowledged',
      {
        originalEventId: event.eventId,
        status: 'received',
        message: 'SCOUT is analyzing opportunities in the area',
      },
      event.sourceAgent
    );

    // TODO Phase 5: Implement full discovery logic
    // - Call opportunity finder APIs
    // - Score and rank leads
    // - Return results to requesting agent
  }

  /**
   * Process a direct message to SCOUT
   * (Phase 5 will implement full discovery features)
   */
  async processMessage(message: string): Promise<AgentResponse> {
    return {
      message:
        "SCOUT here! I'm ready to discover opportunities near your bookings. (Full discovery automation coming in Phase 5)",
      metadata: {
        status: 'stub',
        agent: 'scout',
        phase: 'phase4-coordination-only',
      },
    };
  }
}

// Export singleton instance
export const scoutAgent = new SCOUTAgent();
