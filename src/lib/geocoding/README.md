# Geocoding Service

Complete geocoding infrastructure for geographic lead discovery using OpenStreetMap's Nominatim API.

## Features

- **Free Geocoding**: Uses Nominatim (OpenStreetMap) - no API key required
- **Automatic Caching**: 24-hour TTL to minimize API calls
- **Rate Limiting**: Respects 1 request/second limit
- **Retry Logic**: Exponential backoff for failed requests
- **Type Safe**: Full TypeScript support
- **Batch Processing**: Geocode multiple addresses efficiently

## Quick Start

```typescript
import { geocode } from '@/lib/geocoding'

// Geocode a single address
const result = await geocode('1600 Amphitheatre Parkway, Mountain View, CA')

if (result) {
  console.log(`Lat: ${result.latitude}, Lon: ${result.longitude}`)
  console.log(`Full address: ${result.displayName}`)
}
```

## API Reference

### Main Functions

#### `geocode(address: string)`

Geocode a single address with automatic caching.

**Parameters:**
- `address` - The address to geocode

**Returns:**
- `GeocodeResult | null` - Result with coordinates or null if failed

**Example:**
```typescript
const result = await geocode('San Francisco, CA')
if (result) {
  console.log(result.latitude, result.longitude)
}
```

#### `batchGeocode(addresses: string[], onProgress?)`

Geocode multiple addresses with progress tracking.

**Parameters:**
- `addresses` - Array of addresses to geocode
- `onProgress` - Optional callback: `(current, total) => void`

**Returns:**
- `Array<GeocodeResult | null>` - Results in same order as input

**Example:**
```typescript
const addresses = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL']
const results = await batchGeocode(addresses, (current, total) => {
  console.log(`Progress: ${current}/${total}`)
})
```

### Cache Management

#### `clearCache()`

Clear the entire geocoding cache.

```typescript
import { clearCache } from '@/lib/geocoding'
clearCache()
```

#### `cleanupCache()`

Remove expired entries from cache to free memory.

```typescript
import { cleanupCache } from '@/lib/geocoding'
cleanupCache()
```

#### `getCacheStats()`

Get cache statistics for monitoring.

```typescript
import { getCacheStats } from '@/lib/geocoding'
const stats = getCacheStats()
console.log(`Cache size: ${stats.size}`)
console.log(`Valid entries: ${stats.validEntries}`)
console.log(`Expired entries: ${stats.expiredEntries}`)
```

## Types

```typescript
interface GeocodeResult {
  latitude: number
  longitude: number
  displayName: string
}
```

## Implementation Details

### Rate Limiting

The service automatically enforces Nominatim's 1 request/second rate limit:
- Tracks last request timestamp
- Adds delays between requests as needed
- No manual throttling required

### Caching

The cache uses an in-memory Map with 24-hour TTL:
- Keys are normalized (lowercase, trimmed)
- Both successes and failures are cached
- Automatic expiration on access
- Can be cleared manually if needed

### Error Handling

The service handles several error cases:
- **Empty addresses**: Returns null immediately
- **Network errors**: Retries with exponential backoff (3 attempts)
- **Rate limiting (429)**: Automatic retry with backoff
- **Invalid responses**: Validates coordinates and returns null
- **No results**: Returns null for addresses that can't be geocoded

### Retry Strategy

Failed requests are retried up to 3 times with exponential backoff:
- Attempt 1: Immediate
- Attempt 2: 1 second delay
- Attempt 3: 2 second delay
- Attempt 4: 4 second delay

## Performance Considerations

### Rate Limits
- **Max requests**: 1 per second (Nominatim free tier)
- **Daily limit**: No official limit, but fair use expected
- **Recommendation**: Cache aggressively, use batch operations

### Optimization Tips

1. **Use batch operations**: Geocode multiple addresses in one call
2. **Cache results**: The 24-hour TTL minimizes API calls
3. **Geocode once**: Store results in database for venues/leads
4. **Pre-geocode**: Geocode venue addresses during data import

### Memory Usage

The in-memory cache grows with usage:
- Each entry: ~200 bytes
- 10,000 cached addresses: ~2 MB
- Use `cleanupCache()` periodically if memory is a concern
- Consider Redis for larger deployments

## Usage in Lead Discovery

```typescript
import { geocode } from '@/lib/geocoding'
import { calculateBoundingBox, haversineDistance } from '@/lib/geo'

// 1. Geocode speaker's location
const speakerGeo = await geocode('San Francisco, CA')
if (!speakerGeo) throw new Error('Failed to geocode speaker location')

// 2. Calculate search area
const radiusMiles = 100
const bbox = calculateBoundingBox(
  { lat: speakerGeo.latitude, lon: speakerGeo.longitude },
  radiusMiles
)

// 3. Query database with bounding box
const venues = await db.venue.findMany({
  where: {
    latitude: { gte: bbox.minLat, lte: bbox.maxLat },
    longitude: { gte: bbox.minLon, lte: bbox.maxLon }
  }
})

// 4. Calculate exact distances
const leads = venues
  .map(venue => ({
    ...venue,
    distance: haversineDistance(
      { lat: speakerGeo.latitude, lon: speakerGeo.longitude },
      { lat: venue.latitude, lon: venue.longitude },
      'miles'
    )
  }))
  .filter(lead => lead.distance <= radiusMiles)
  .sort((a, b) => a.distance - b.distance)
```

## Testing

The service includes example usage in `example.ts`:

```bash
# Run examples (after implementing database integration)
npx tsx src/lib/geocoding/example.ts
```

## Nominatim API

This service uses OpenStreetMap's Nominatim API:
- **Endpoint**: https://nominatim.openstreetmap.org/search
- **Documentation**: https://nominatim.org/release-docs/develop/api/Search/
- **Usage Policy**: https://operations.osmfoundation.org/policies/nominatim/

### Fair Use Guidelines

1. Provide a valid User-Agent header (implemented)
2. Respect rate limits (1 req/sec)
3. Cache results (24-hour TTL)
4. Don't use for high-volume commercial applications without permission

## Alternatives

For production at scale, consider:

- **Google Maps Geocoding API**: More accurate, requires API key, paid
- **Mapbox Geocoding**: Good accuracy, generous free tier, requires API key
- **Here Geocoding**: Enterprise option, requires API key
- **Self-hosted Nominatim**: Full control, no rate limits, requires server

## License

Uses OpenStreetMap data under ODbL license.
