/**
 * Agent Registry
 *
 * Imports and initializes all agents to ensure event subscriptions
 * are registered when the application starts.
 */

import { harmonyAgent } from './harmony';
import { maestroAgent } from './maestro';
import { conductorAgent } from './conductor';
import { scoutAgent } from './scout';

// Export all agents
export const agents = {
  harmony: harmonyAgent,
  maestro: maestroAgent,
  conductor: conductorAgent,
  scout: scoutAgent,
} as const;

// Type for agent IDs
export type AgentKey = keyof typeof agents;

/**
 * Get an agent by ID
 */
export function getAgent(agentId: AgentKey) {
  return agents[agentId];
}

/**
 * Initialize all agents
 * Called when the application starts to ensure event subscriptions are active
 */
export function initializeAgents() {
  console.log('[AgentRegistry] Initializing agents...');
  console.log('[AgentRegistry] Active agents:', Object.keys(agents));

  // Agents are already initialized via their module-level exports
  // This function ensures the modules are loaded
  return agents;
}

// Auto-initialize when this module is imported
initializeAgents();
