/**
 * Nominatim Geocoding Provider
 *
 * Uses OpenStreetMap's Nominatim API for geocoding addresses.
 * Free tier with 1 request/second rate limit.
 *
 * API Docs: https://nominatim.org/release-docs/develop/api/Search/
 */

export interface GeocodeResult {
  latitude: number
  longitude: number
  displayName: string
}

export interface NominatimResponse {
  lat: string
  lon: string
  display_name: string
  [key: string]: unknown
}

const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search'
const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000 // 1 second
const RATE_LIMIT_DELAY = 1000 // 1 request per second

// Track last request time for rate limiting
let lastRequestTime = 0

/**
 * Sleep for specified milliseconds
 */
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Enforce rate limit of 1 request per second
 */
async function enforceRateLimit(): Promise<void> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime

  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    const waitTime = RATE_LIMIT_DELAY - timeSinceLastRequest
    await sleep(waitTime)
  }

  lastRequestTime = Date.now()
}

/**
 * Geocode an address using Nominatim API with retry logic
 *
 * @param address - The address to geocode
 * @param retryCount - Current retry attempt (used internally)
 * @returns GeocodeResult or null if geocoding fails
 */
export async function geocodeAddress(
  address: string,
  retryCount = 0
): Promise<GeocodeResult | null> {
  if (!address || address.trim().length === 0) {
    console.warn('Empty address provided to geocodeAddress')
    return null
  }

  try {
    // Enforce rate limit
    await enforceRateLimit()

    // Build URL with query parameters
    const params = new URLSearchParams({
      q: address.trim(),
      format: 'json',
      limit: '1',
      addressdetails: '1',
    })

    const url = `${NOMINATIM_API_URL}?${params.toString()}`

    // Make request with proper headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Deke Speaker Lead Discovery (https://github.com/yourusername/deke)',
        'Accept': 'application/json',
      },
    })

    // Handle rate limiting (429)
    if (response.status === 429) {
      if (retryCount < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount)
        console.warn(`Rate limited by Nominatim. Retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`)
        await sleep(delay)
        return geocodeAddress(address, retryCount + 1)
      } else {
        console.error(`Max retries reached for address: ${address}`)
        return null
      }
    }

    // Handle other error responses
    if (!response.ok) {
      console.error(`Nominatim API error: ${response.status} ${response.statusText}`)
      return null
    }

    const data: NominatimResponse[] = await response.json()

    // No results found
    if (!data || data.length === 0) {
      console.warn(`No geocoding results found for address: ${address}`)
      return null
    }

    // Parse first result
    const result = data[0]
    const latitude = parseFloat(result.lat)
    const longitude = parseFloat(result.lon)

    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude)) {
      console.error(`Invalid coordinates received from Nominatim: lat=${result.lat}, lon=${result.lon}`)
      return null
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      console.error(`Coordinates out of range: lat=${latitude}, lon=${longitude}`)
      return null
    }

    return {
      latitude,
      longitude,
      displayName: result.display_name,
    }
  } catch (error) {
    // Network or parsing error - retry with exponential backoff
    if (retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount)
      console.warn(`Geocoding error, retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES}):`, error)
      await sleep(delay)
      return geocodeAddress(address, retryCount + 1)
    } else {
      console.error(`Failed to geocode address after ${MAX_RETRIES} retries:`, address, error)
      return null
    }
  }
}
