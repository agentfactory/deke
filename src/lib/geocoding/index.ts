/**
 * Geocoding Service
 *
 * Main export for geocoding functionality with caching.
 * Uses Nominatim API with automatic cache management.
 */

import { geocodeAddress as geocodeAddressNominatim } from './nominatim'
import { getCached, setCached } from './cache'

// Re-export types
export type { GeocodeResult } from './nominatim'

// Re-export cache utilities for advanced usage
export { clearCache, cleanupCache, getCacheStats } from './cache'

/**
 * Geocode an address with automatic caching
 *
 * This is the main function to use for geocoding.
 * It automatically:
 * - Checks cache first
 * - Falls back to Nominatim API if not cached
 * - Stores result in cache
 * - Respects rate limits
 * - Handles retries
 *
 * @param address - The address to geocode
 * @returns GeocodeResult or null if geocoding fails
 *
 * @example
 * ```typescript
 * const result = await geocode('1600 Amphitheatre Parkway, Mountain View, CA')
 * if (result) {
 *   console.log(`Coordinates: ${result.latitude}, ${result.longitude}`)
 * }
 * ```
 */
export async function geocode(address: string): Promise<{
  latitude: number
  longitude: number
  displayName: string
} | null> {
  if (!address || address.trim().length === 0) {
    return null
  }

  // Check cache first
  const cached = getCached(address)
  if (cached !== undefined) {
    // Cache hit (either success or known failure)
    return cached
  }

  // Cache miss - fetch from API
  const result = await geocodeAddressNominatim(address)

  // Store in cache (including null results to avoid repeated API calls for bad addresses)
  setCached(address, result)

  return result
}

/**
 * Batch geocode multiple addresses
 *
 * Geocodes multiple addresses with proper rate limiting.
 * Results are returned in the same order as input.
 *
 * @param addresses - Array of addresses to geocode
 * @param onProgress - Optional callback for progress updates
 * @returns Array of results (null for failed geocoding)
 *
 * @example
 * ```typescript
 * const addresses = ['Address 1', 'Address 2', 'Address 3']
 * const results = await batchGeocode(addresses, (current, total) => {
 *   console.log(`Progress: ${current}/${total}`)
 * })
 * ```
 */
export async function batchGeocode(
  addresses: string[],
  onProgress?: (current: number, total: number) => void
): Promise<Array<{
  latitude: number
  longitude: number
  displayName: string
} | null>> {
  const results: Array<{
    latitude: number
    longitude: number
    displayName: string
  } | null> = []

  for (let i = 0; i < addresses.length; i++) {
    const result = await geocode(addresses[i])
    results.push(result)

    if (onProgress) {
      onProgress(i + 1, addresses.length)
    }
  }

  return results
}
