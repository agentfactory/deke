/**
 * Geocoding Service
 *
 * Converts addresses to geographic coordinates (latitude, longitude)
 * using Nominatim (OpenStreetMap) geocoding API
 *
 * Free tier: No API key required, rate limit 1 req/sec
 * Alternative: OpenCage Geocoder API for better accuracy
 */

export interface GeocodingResult {
  latitude: number
  longitude: number
  formattedAddress: string
}

/**
 * Geocode an address to coordinates
 * @param address - The address to geocode (e.g., "San Francisco, CA" or "94102")
 * @returns Coordinates and formatted address, or null if geocoding fails
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodingResult | null> {
  if (!address || address.trim().length === 0) {
    return null
  }

  try {
    // Use Nominatim (OpenStreetMap) geocoding API
    // Free, no API key required, but rate limited to 1 req/sec
    const encodedAddress = encodeURIComponent(address.trim())
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1&addressdetails=1`

    const response = await fetch(url, {
      headers: {
        // Required by Nominatim usage policy
        'User-Agent': 'Deke-Sharon-App/1.0',
      },
    })

    if (!response.ok) {
      console.error(`Geocoding API error: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()

    if (!data || data.length === 0) {
      console.warn(`No geocoding results for address: ${address}`)
      return null
    }

    const result = data[0]

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formattedAddress: result.display_name,
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * Geocode with rate limiting
 * Ensures we don't exceed Nominatim's 1 req/sec limit
 */
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 1000 // 1 second

export async function geocodeAddressWithRateLimit(
  address: string
): Promise<GeocodingResult | null> {
  // Wait if necessary to respect rate limit
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest
    await new Promise(resolve => setTimeout(resolve, waitTime))
  }

  lastRequestTime = Date.now()
  return geocodeAddress(address)
}

/**
 * Batch geocode multiple addresses with rate limiting
 * @param addresses - Array of addresses to geocode
 * @returns Array of results (null for failed geocoding)
 */
export async function batchGeocode(
  addresses: string[]
): Promise<(GeocodingResult | null)[]> {
  const results: (GeocodingResult | null)[] = []

  for (const address of addresses) {
    const result = await geocodeAddressWithRateLimit(address)
    results.push(result)
  }

  return results
}

/**
 * Reverse geocode: convert coordinates to address
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Formatted address, or null if reverse geocoding fails
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    console.error('Invalid coordinates for reverse geocoding')
    return null
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Deke-Sharon-App/1.0',
      },
    })

    if (!response.ok) {
      console.error(`Reverse geocoding API error: ${response.status}`)
      return null
    }

    const data = await response.json()

    if (!data || !data.display_name) {
      console.warn(`No reverse geocoding result for coords: ${latitude}, ${longitude}`)
      return null
    }

    return data.display_name
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}
