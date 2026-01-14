import { prisma } from '@/lib/db'
import type { AgentEvent } from '../../agents/types'

type EventHandler = (event: AgentEvent) => Promise<void>

/**
 * Event Bus for Agent Coordination
 *
 * Singleton pattern that manages event subscription and emission
 * for the agent ecosystem. Persists all events to database and
 * coordinates handler execution.
 */
class EventBus {
  private static instance: EventBus
  private handlers = new Map<string, Set<EventHandler>>()

  private constructor() {}

  /**
   * Get the singleton instance
   */
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus()
    }
    return EventBus.instance
  }

  /**
   * Subscribe to an event type
   */
  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set())
    }
    this.handlers.get(eventType)!.add(handler)
  }

  /**
   * Unsubscribe from an event type
   */
  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  /**
   * Emit an event to the system
   *
   * Process:
   * 1. Persist to database (source of truth)
   * 2. Call all registered handlers in parallel
   * 3. Update duration metrics
   */
  async emit(event: AgentEvent): Promise<void> {
    const startTime = Date.now()
    let success = true
    let errorMsg: string | undefined

    try {
      // STEP 1: Persist to database (source of truth)
      await prisma.agentLog.create({
        data: {
          agentId: event.sourceAgent,
          actionType: event.eventType,
          input: JSON.stringify({
            eventId: event.eventId,
            targetAgent: event.targetAgent,
            payload: event.payload,
          }),
          success: true,
          durationMs: 0,
        },
      })
    } catch (dbError) {
      success = false
      errorMsg = dbError instanceof Error ? dbError.message : 'Database error'
      console.error('[EventBus] Failed to persist event:', errorMsg)
      // Continue to handlers even if DB fails (graceful degradation)
    }

    // STEP 2: Call handlers (fire-and-forget, parallel)
    const handlers = this.handlers.get(event.eventType)
    if (handlers && handlers.size > 0) {
      const handlerPromises = Array.from(handlers).map(async (handler) => {
        try {
          await handler(event)
        } catch (handlerError) {
          console.error('[EventBus] Handler error:', {
            eventType: event.eventType,
            error: handlerError instanceof Error ? handlerError.message : 'Unknown',
          })
        }
      })
      await Promise.allSettled(handlerPromises)
    }

    // STEP 3: Update duration in log
    const durationMs = Date.now() - startTime
    try {
      await prisma.agentLog.updateMany({
        where: {
          agentId: event.sourceAgent,
          actionType: event.eventType,
          input: { contains: event.eventId },
        },
        data: { durationMs, success, errorMsg },
      })
    } catch (updateError) {
      console.error('[EventBus] Failed to update log duration:', updateError)
    }
  }

  /**
   * Get list of event types with active subscriptions
   */
  getSubscribedEvents(): string[] {
    return Array.from(this.handlers.keys())
  }

  /**
   * Get count of handlers for an event type
   */
  getHandlerCount(eventType: string): number {
    return this.handlers.get(eventType)?.size || 0
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance()
