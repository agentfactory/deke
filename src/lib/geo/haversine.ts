/**
 * Haversine Distance Formula
 *
 * Calculates the great-circle distance between two points on a sphere
 * given their longitudes and latitudes.
 *
 * Used for calculating distances between geographic coordinates.
 */

// Earth's radius constants
const EARTH_RADIUS_MILES = 3959
const EARTH_RADIUS_KM = 6371

export interface GeoPoint {
  lat: number
  lon: number
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Calculate the great-circle distance between two points using the Haversine formula
 *
 * @param point1 - First point {lat, lon}
 * @param point2 - Second point {lat, lon}
 * @param unit - Unit of measurement ('miles' or 'km')
 * @returns Distance between the two points in the specified unit
 *
 * @example
 * ```typescript
 * const sanFrancisco = { lat: 37.7749, lon: -122.4194 }
 * const losAngeles = { lat: 34.0522, lon: -118.2437 }
 *
 * const distanceMiles = haversineDistance(sanFrancisco, losAngeles, 'miles')
 * console.log(`Distance: ${distanceMiles.toFixed(2)} miles`) // ~347 miles
 *
 * const distanceKm = haversineDistance(sanFrancisco, losAngeles, 'km')
 * console.log(`Distance: ${distanceKm.toFixed(2)} km`) // ~559 km
 * ```
 */
export function haversineDistance(
  point1: GeoPoint,
  point2: GeoPoint,
  unit: 'miles' | 'km' = 'miles'
): number {
  // Validate inputs
  if (!isValidCoordinate(point1) || !isValidCoordinate(point2)) {
    throw new Error('Invalid coordinates provided')
  }

  // Convert latitude and longitude from degrees to radians
  const lat1Rad = toRadians(point1.lat)
  const lat2Rad = toRadians(point2.lat)
  const deltaLatRad = toRadians(point2.lat - point1.lat)
  const deltaLonRad = toRadians(point2.lon - point1.lon)

  // Haversine formula
  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  // Calculate distance
  const radius = unit === 'km' ? EARTH_RADIUS_KM : EARTH_RADIUS_MILES
  const distance = radius * c

  return distance
}

/**
 * Validate that coordinates are within valid ranges
 * Latitude: -90 to 90
 * Longitude: -180 to 180
 */
function isValidCoordinate(point: GeoPoint): boolean {
  if (typeof point.lat !== 'number' || typeof point.lon !== 'number') {
    return false
  }

  if (isNaN(point.lat) || isNaN(point.lon)) {
    return false
  }

  if (point.lat < -90 || point.lat > 90) {
    return false
  }

  if (point.lon < -180 || point.lon > 180) {
    return false
  }

  return true
}

/**
 * Calculate distance and return in both miles and kilometers
 *
 * @param point1 - First point {lat, lon}
 * @param point2 - Second point {lat, lon}
 * @returns Object with distance in both miles and km
 *
 * @example
 * ```typescript
 * const point1 = { lat: 37.7749, lon: -122.4194 }
 * const point2 = { lat: 34.0522, lon: -118.2437 }
 *
 * const { miles, km } = calculateDistance(point1, point2)
 * console.log(`Distance: ${miles.toFixed(2)} miles (${km.toFixed(2)} km)`)
 * ```
 */
export function calculateDistance(
  point1: GeoPoint,
  point2: GeoPoint
): { miles: number; km: number } {
  return {
    miles: haversineDistance(point1, point2, 'miles'),
    km: haversineDistance(point1, point2, 'km'),
  }
}
