# Geographic Utilities

Core geographic calculations for distance and bounding box operations.

## Features

- **Haversine Distance**: Calculate great-circle distance between coordinates
- **Bounding Boxes**: Optimize radius-based searches
- **Type Safe**: Full TypeScript support
- **Zero Dependencies**: Pure math implementations
- **Well Tested**: Validated formulas

## Quick Start

```typescript
import { haversineDistance, calculateBoundingBox } from '@/lib/geo'

// Calculate distance between two points
const sanFrancisco = { lat: 37.7749, lon: -122.4194 }
const losAngeles = { lat: 34.0522, lon: -118.2437 }

const distance = haversineDistance(sanFrancisco, losAngeles, 'miles')
console.log(`Distance: ${distance.toFixed(2)} miles`) // ~347 miles

// Create bounding box for radius search
const bbox = calculateBoundingBox(sanFrancisco, 50) // 50 miles
// Use bbox to filter database queries before applying haversine
```

## API Reference

### Distance Calculations

#### `haversineDistance(point1, point2, unit?)`

Calculate the great-circle distance between two geographic points.

**Parameters:**
- `point1` - First point `{lat: number, lon: number}`
- `point2` - Second point `{lat: number, lon: number}`
- `unit` - Optional: `'miles'` (default) or `'km'`

**Returns:**
- `number` - Distance in the specified unit

**Example:**
```typescript
const sf = { lat: 37.7749, lon: -122.4194 }
const la = { lat: 34.0522, lon: -118.2437 }

const miles = haversineDistance(sf, la, 'miles')
const km = haversineDistance(sf, la, 'km')

console.log(`${miles.toFixed(2)} miles = ${km.toFixed(2)} km`)
```

**Validation:**
- Throws error if coordinates are invalid
- Validates latitude: -90 to 90
- Validates longitude: -180 to 180

#### `calculateDistance(point1, point2)`

Calculate distance and return both miles and kilometers.

**Parameters:**
- `point1` - First point `{lat: number, lon: number}`
- `point2` - Second point `{lat: number, lon: number}`

**Returns:**
- `{miles: number, km: number}`

**Example:**
```typescript
const point1 = { lat: 37.7749, lon: -122.4194 }
const point2 = { lat: 34.0522, lon: -118.2437 }

const { miles, km } = calculateDistance(point1, point2)
console.log(`Distance: ${miles.toFixed(2)} miles (${km.toFixed(2)} km)`)
```

### Bounding Box Operations

#### `calculateBoundingBox(center, radiusMiles)`

Calculate a rectangular bounding box around a center point.

**Parameters:**
- `center` - Center point `{lat: number, lon: number}`
- `radiusMiles` - Radius in miles

**Returns:**
- `BoundingBox`: `{minLat, maxLat, minLon, maxLon}`

**Example:**
```typescript
const center = { lat: 37.7749, lon: -122.4194 }
const bbox = calculateBoundingBox(center, 50) // 50 miles

// Use in database query
const venues = await db.venue.findMany({
  where: {
    latitude: { gte: bbox.minLat, lte: bbox.maxLat },
    longitude: { gte: bbox.minLon, lte: bbox.maxLon }
  }
})

// Then filter with exact haversine distance
const nearby = venues.filter(venue =>
  haversineDistance(center, {lat: venue.latitude, lon: venue.longitude}, 'miles') <= 50
)
```

**Special Cases:**
- Near poles (lat > 89.9° or < -89.9°): Returns full longitude range
- Handles Earth's curvature (longitude adjustment based on latitude)
- Clamps latitude to valid range (-90 to 90)

#### `isPointInBoundingBox(point, bbox)`

Check if a point is within a bounding box.

**Parameters:**
- `point` - Point to check `{lat: number, lon: number}`
- `bbox` - Bounding box to check against

**Returns:**
- `boolean` - true if point is within the box

**Example:**
```typescript
const center = { lat: 37.7749, lon: -122.4194 }
const bbox = calculateBoundingBox(center, 50)
const point = { lat: 37.8, lon: -122.4 }

if (isPointInBoundingBox(point, bbox)) {
  console.log('Point might be within radius')
  // Now check exact distance with haversine
  const distance = haversineDistance(center, point, 'miles')
  if (distance <= 50) {
    console.log('Confirmed within radius')
  }
}
```

#### `calculateBoundingBoxArea(bbox)`

Calculate approximate area of a bounding box in square miles.

**Parameters:**
- `bbox` - Bounding box

**Returns:**
- `number` - Approximate area in square miles

**Example:**
```typescript
const bbox = calculateBoundingBox({ lat: 37.7749, lon: -122.4194 }, 50)
const area = calculateBoundingBoxArea(bbox)
console.log(`Search area: ${area.toFixed(2)} square miles`)
```

**Note:** This is an approximation that works well for small areas but becomes less accurate for large areas or areas near poles.

## Types

```typescript
interface GeoPoint {
  lat: number
  lon: number
}

interface BoundingBox {
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
}
```

## Usage Patterns

### Two-Stage Radius Search

The most efficient way to find points within a radius:

```typescript
// Stage 1: Bounding box filter (fast, uses database indexes)
const bbox = calculateBoundingBox(center, radiusMiles)
const candidates = await db.venue.findMany({
  where: {
    latitude: { gte: bbox.minLat, lte: bbox.maxLat },
    longitude: { gte: bbox.minLon, lte: bbox.maxLon }
  }
})

// Stage 2: Exact distance filter (slower, but fewer points to check)
const results = candidates
  .map(venue => ({
    ...venue,
    distance: haversineDistance(
      center,
      { lat: venue.latitude, lon: venue.longitude },
      'miles'
    )
  }))
  .filter(venue => venue.distance <= radiusMiles)
  .sort((a, b) => a.distance - b.distance)
```

### Why Two Stages?

1. **Bounding box** (Stage 1):
   - Simple comparison operations
   - Can use database indexes
   - Very fast
   - May include some points outside the radius (corners of rectangle)

2. **Haversine** (Stage 2):
   - Precise distance calculation
   - More expensive (trigonometry)
   - Filters out corner points
   - Provides exact distances for sorting

### Find Nearest Locations

```typescript
async function findNearestVenues(
  center: GeoPoint,
  maxResults: number = 10,
  maxDistance: number = 100
) {
  const bbox = calculateBoundingBox(center, maxDistance)

  const candidates = await db.venue.findMany({
    where: {
      latitude: { gte: bbox.minLat, lte: bbox.maxLat },
      longitude: { gte: bbox.minLon, lte: bbox.maxLon }
    }
  })

  return candidates
    .map(venue => ({
      ...venue,
      distance: haversineDistance(
        center,
        { lat: venue.latitude, lon: venue.longitude },
        'miles'
      )
    }))
    .filter(venue => venue.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxResults)
}
```

## Implementation Details

### Haversine Formula

The haversine formula calculates the great-circle distance between two points on a sphere:

```
a = sin²(Δφ/2) + cos(φ1) × cos(φ2) × sin²(Δλ/2)
c = 2 × atan2(√a, √(1-a))
d = R × c
```

Where:
- φ = latitude in radians
- λ = longitude in radians
- R = Earth's radius (3959 miles or 6371 km)

### Accuracy

- **Haversine**: ±0.5% accuracy (assumes spherical Earth)
- **Earth**: Actually an oblate spheroid (equatorial bulge)
- **Good for**: Most practical applications at scale of 1-1000 miles
- **For higher accuracy**: Consider Vincenty formula (more complex)

### Earth's Radius

We use mean radius values:
- **Miles**: 3959 miles
- **Kilometers**: 6371 km

Actual radius varies from 3950 (poles) to 3963 miles (equator).

## Performance

### Benchmarks (approximate)

- **haversineDistance**: ~0.01ms per calculation
- **calculateBoundingBox**: ~0.005ms per calculation
- **isPointInBoundingBox**: ~0.001ms per check

### Optimization Tips

1. **Use bounding box first**: Filter candidates before haversine
2. **Index coordinates**: Add database indexes on lat/lon columns
3. **Batch processing**: Calculate distances in bulk when possible
4. **Cache results**: Store calculated distances if querying repeatedly

### Database Indexes

```sql
-- Prisma schema
model Venue {
  latitude  Float
  longitude Float

  @@index([latitude, longitude])
}
```

## Limitations

### Antimeridian Crossing

The bounding box calculation has simplified handling of the antimeridian (±180° longitude):
- Works correctly for most use cases
- May have issues for searches crossing the date line
- For production near ±180°, consider a geospatial library

### Polar Regions

Near the poles (lat > 89.9° or < -89.9°):
- Bounding box returns full longitude range
- Distances are still accurate
- Rare for speaker booking use cases

### Large Distances

The haversine formula assumes a spherical Earth:
- Accurate within ±0.5% for most distances
- Less accurate for very long distances (>1000 miles)
- For intercontinental accuracy, consider Vincenty formula

## Testing

Example calculations to verify implementation:

```typescript
// San Francisco to Los Angeles
const sf = { lat: 37.7749, lon: -122.4194 }
const la = { lat: 34.0522, lon: -118.2437 }
const distance = haversineDistance(sf, la, 'miles')
// Expected: ~347 miles

// New York to London
const nyc = { lat: 40.7128, lon: -74.0060 }
const london = { lat: 51.5074, lon: -0.1278 }
const transatlantic = haversineDistance(nyc, london, 'miles')
// Expected: ~3459 miles
```

## References

- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
- [Great-circle distance](https://en.wikipedia.org/wiki/Great-circle_distance)
- [Geographic coordinate system](https://en.wikipedia.org/wiki/Geographic_coordinate_system)
