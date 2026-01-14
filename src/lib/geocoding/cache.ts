/**
 * Geocoding Cache
 *
 * Simple in-memory cache for geocoded addresses.
 * Reduces API calls and respects Nominatim rate limits.
 * TTL: 24 hours
 */

import type { GeocodeResult } from './nominatim'

interface CacheEntry {
  result: GeocodeResult | null
  timestamp: number
}

// Cache TTL: 24 hours in milliseconds
const CACHE_TTL = 24 * 60 * 60 * 1000

// In-memory cache storage
const cache = new Map<string, CacheEntry>()

/**
 * Normalize address for cache key
 * Converts to lowercase and trims whitespace
 */
function normalizeAddress(address: string): string {
  return address.trim().toLowerCase()
}

/**
 * Check if cache entry is still valid
 */
function isEntryValid(entry: CacheEntry): boolean {
  const now = Date.now()
  return (now - entry.timestamp) < CACHE_TTL
}

/**
 * Get cached geocode result for an address
 *
 * @param address - The address to lookup
 * @returns Cached result or undefined if not found or expired
 */
export function getCached(address: string): GeocodeResult | null | undefined {
  const key = normalizeAddress(address)
  const entry = cache.get(key)

  if (!entry) {
    return undefined
  }

  if (!isEntryValid(entry)) {
    // Entry expired, remove it
    cache.delete(key)
    return undefined
  }

  return entry.result
}

/**
 * Store geocode result in cache
 *
 * @param address - The address that was geocoded
 * @param result - The geocoding result (or null if failed)
 */
export function setCached(address: string, result: GeocodeResult | null): void {
  const key = normalizeAddress(address)
  cache.set(key, {
    result,
    timestamp: Date.now(),
  })
}

/**
 * Clear entire cache
 * Useful for testing or manual cache invalidation
 */
export function clearCache(): void {
  cache.clear()
}

/**
 * Remove expired entries from cache
 * Can be called periodically to free memory
 */
export function cleanupCache(): void {
  const now = Date.now()

  for (const [key, entry] of cache.entries()) {
    if ((now - entry.timestamp) >= CACHE_TTL) {
      cache.delete(key)
    }
  }
}

/**
 * Get cache statistics
 * Useful for monitoring and debugging
 */
export function getCacheStats(): {
  size: number
  validEntries: number
  expiredEntries: number
} {
  let validEntries = 0
  let expiredEntries = 0

  for (const entry of cache.values()) {
    if (isEntryValid(entry)) {
      validEntries++
    } else {
      expiredEntries++
    }
  }

  return {
    size: cache.size,
    validEntries,
    expiredEntries,
  }
}
