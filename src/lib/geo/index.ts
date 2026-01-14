/**
 * Geographic Utilities
 *
 * Main export for geographic calculations and utilities.
 * Includes distance calculations and bounding box operations.
 */

// Export haversine distance functions
export {
  haversineDistance,
  calculateDistance,
  type GeoPoint,
} from './haversine'

// Export bounding box functions
export {
  calculateBoundingBox,
  isPointInBoundingBox,
  calculateBoundingBoxArea,
  type BoundingBox,
} from './bounding-box'
