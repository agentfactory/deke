/**
 * Bounding Box Calculator
 *
 * Calculate geographic bounding boxes for radius-based searches.
 * Used to optimize database queries by filtering candidates before
 * applying precise haversine distance calculations.
 */

export interface GeoPoint {
  lat: number
  lon: number
}

export interface BoundingBox {
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
}

// Earth's radius in miles
const EARTH_RADIUS_MILES = 3959

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Convert radians to degrees
 */
function toDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}

/**
 * Calculate bounding box for a center point and radius
 *
 * Returns the minimum and maximum latitude/longitude that encompass
 * all points within the specified radius from the center point.
 *
 * This is useful for database queries: first filter by the bounding box
 * (which can use indexes), then apply precise haversine distance.
 *
 * @param center - Center point {lat, lon}
 * @param radiusMiles - Radius in miles
 * @returns Bounding box {minLat, maxLat, minLon, maxLon}
 *
 * @example
 * ```typescript
 * const center = { lat: 37.7749, lon: -122.4194 } // San Francisco
 * const radius = 50 // miles
 *
 * const bbox = calculateBoundingBox(center, radius)
 *
 * // Use in database query:
 * // WHERE lat >= bbox.minLat AND lat <= bbox.maxLat
 * //   AND lon >= bbox.minLon AND lon <= bbox.maxLon
 * ```
 */
export function calculateBoundingBox(
  center: GeoPoint,
  radiusMiles: number
): BoundingBox {
  // Validate inputs
  if (!isValidCoordinate(center)) {
    throw new Error('Invalid center coordinates')
  }

  if (radiusMiles <= 0 || !isFinite(radiusMiles)) {
    throw new Error('Radius must be a positive number')
  }

  const { lat, lon } = center

  // Convert latitude to radians
  const latRad = toRadians(lat)

  // Calculate angular distance in radians
  const angularDistance = radiusMiles / EARTH_RADIUS_MILES

  // Calculate latitude bounds
  const minLat = lat - toDegrees(angularDistance)
  const maxLat = lat + toDegrees(angularDistance)

  // Calculate longitude bounds
  // Longitude adjustment depends on latitude (due to Earth's curvature)
  // At higher latitudes, longitude degrees represent shorter distances
  let minLon: number
  let maxLon: number

  // Check if we're near the poles (within 0.1 degrees)
  const nearNorthPole = lat > 89.9
  const nearSouthPole = lat < -89.9

  if (nearNorthPole || nearSouthPole) {
    // Near poles, longitude bounds are full circle
    minLon = -180
    maxLon = 180
  } else {
    // Calculate longitude offset based on latitude
    const deltaLon = toDegrees(
      Math.asin(Math.sin(angularDistance) / Math.cos(latRad))
    )

    minLon = lon - deltaLon
    maxLon = lon + deltaLon

    // Handle antimeridian crossing (longitude wrapping)
    // Note: This simplified approach may have issues near ±180°
    // For production, consider using a specialized geospatial library
    if (minLon < -180) {
      minLon += 360
    }
    if (maxLon > 180) {
      maxLon -= 360
    }
  }

  // Clamp latitude to valid range
  const clampedMinLat = Math.max(minLat, -90)
  const clampedMaxLat = Math.min(maxLat, 90)

  return {
    minLat: clampedMinLat,
    maxLat: clampedMaxLat,
    minLon,
    maxLon,
  }
}

/**
 * Validate that coordinates are within valid ranges
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
 * Check if a point is within a bounding box
 *
 * Note: This is a simple rectangular check and does not handle
 * antimeridian crossing. For production use, consider a proper
 * geospatial library.
 *
 * @param point - Point to check {lat, lon}
 * @param bbox - Bounding box to check against
 * @returns true if point is within the bounding box
 *
 * @example
 * ```typescript
 * const center = { lat: 37.7749, lon: -122.4194 }
 * const bbox = calculateBoundingBox(center, 50)
 * const point = { lat: 37.8, lon: -122.4 }
 *
 * if (isPointInBoundingBox(point, bbox)) {
 *   console.log('Point is within the bounding box')
 * }
 * ```
 */
export function isPointInBoundingBox(
  point: GeoPoint,
  bbox: BoundingBox
): boolean {
  if (!isValidCoordinate(point)) {
    return false
  }

  const { lat, lon } = point
  const { minLat, maxLat, minLon, maxLon } = bbox

  // Check latitude (straightforward)
  if (lat < minLat || lat > maxLat) {
    return false
  }

  // Check longitude (handles wrapping if needed)
  if (minLon <= maxLon) {
    // Normal case (no antimeridian crossing)
    return lon >= minLon && lon <= maxLon
  } else {
    // Wraps around antimeridian
    return lon >= minLon || lon <= maxLon
  }
}

/**
 * Calculate bounding box area in square miles (approximate)
 *
 * This is a rough approximation that works well for small areas
 * but becomes less accurate for large areas or areas near poles.
 *
 * @param bbox - Bounding box
 * @returns Approximate area in square miles
 */
export function calculateBoundingBoxArea(bbox: BoundingBox): number {
  const { minLat, maxLat, minLon, maxLon } = bbox

  // Calculate height in miles (latitude)
  const latDiff = maxLat - minLat
  const heightMiles = latDiff * 69 // 1 degree latitude ≈ 69 miles

  // Calculate width in miles (longitude, adjusted for latitude)
  const avgLat = (minLat + maxLat) / 2
  const lonDiff = maxLon - minLon
  const widthMiles = lonDiff * 69 * Math.cos(toRadians(avgLat))

  return heightMiles * Math.abs(widthMiles)
}
