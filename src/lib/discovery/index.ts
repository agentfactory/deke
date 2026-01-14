/**
 * Lead Discovery Engine
 *
 * Complete lead discovery system for opportunity finder campaigns.
 *
 * @module discovery
 */

// Main orchestrator (primary API)
export {
  discoverLeads,
  clearDiscoveredLeads,
  getDiscoveryStats,
  type DiscoveryResult,
} from './orchestrator'

// Individual discovery sources (for advanced usage)
export { discoverPastClients } from './past-clients'
export { discoverDormantLeads } from './dormant-leads'
export { discoverSimilarOrgs } from './similar-orgs'
export { discoverAIResearch } from './ai-research'

// Scoring and deduplication utilities
export { calculateScore, calculateScoreStats } from './scorer'
export { deduplicate, getDeduplicationStats, findDuplicates } from './deduplicator'

// Organization classification
export {
  classifyOrganization,
  classifyFromLocation,
  getSimilarOrgKeywords,
  type OrgType,
} from './org-classifier'
