/**
 * Lead Deduplication
 *
 * Ensures each lead appears only once in discovery results.
 * When a lead is found by multiple sources, keeps the one with the highest score.
 */

interface Lead {
  email: string
  score?: number
  source: string
  [key: string]: unknown
}

/**
 * Deduplicate leads by email, keeping the highest-scoring instance
 *
 * @param leads - Array of discovered leads (may contain duplicates)
 * @returns Array of deduplicated leads
 *
 * @example
 * ```typescript
 * const leads = [
 *   { email: 'john@example.com', score: 70, source: 'PAST_CLIENT' },
 *   { email: 'john@example.com', score: 50, source: 'DORMANT' },
 *   { email: 'jane@example.com', score: 60, source: 'SIMILAR_ORG' },
 * ]
 *
 * const deduped = deduplicate(leads)
 * // Returns 2 leads: john@example.com with score 70, jane@example.com with score 60
 * ```
 */
export function deduplicate<T extends Lead>(leads: T[]): T[] {
  // Use email as the deduplication key
  const byEmail = leads.reduce((acc, lead) => {
    const email = lead.email

    // If this email hasn't been seen, or this lead has a higher score, keep it
    if (!acc[email] || (lead.score || 0) > (acc[email].score || 0)) {
      acc[email] = lead
    }

    return acc
  }, {} as Record<string, T>)

  // Return all unique leads as an array
  return Object.values(byEmail)
}

/**
 * Get deduplication statistics
 *
 * @param originalCount - Count before deduplication
 * @param deduplicatedCount - Count after deduplication
 * @returns Statistics about deduplication
 */
export function getDeduplicationStats(originalCount: number, deduplicatedCount: number) {
  const duplicatesRemoved = originalCount - deduplicatedCount
  const deduplicationRate = originalCount > 0 ? (duplicatesRemoved / originalCount) * 100 : 0

  return {
    original: originalCount,
    deduplicated: deduplicatedCount,
    duplicatesRemoved,
    deduplicationRate: Math.round(deduplicationRate * 10) / 10, // Round to 1 decimal
  }
}

/**
 * Find duplicate emails across sources
 *
 * Useful for debugging and understanding lead source overlap.
 *
 * @param leads - Array of leads
 * @returns Map of email to array of sources where it was found
 */
export function findDuplicates(leads: Lead[]): Map<string, string[]> {
  const duplicates = new Map<string, string[]>()

  leads.forEach((lead) => {
    const existing = duplicates.get(lead.email) || []
    duplicates.set(lead.email, [...existing, lead.source])
  })

  // Filter to only emails that appear in multiple sources
  const result = new Map<string, string[]>()
  duplicates.forEach((sources, email) => {
    if (sources.length > 1) {
      result.set(email, sources)
    }
  })

  return result
}
