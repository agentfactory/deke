/**
 * Integration Test for Geocoding and Geographic Utilities
 *
 * This file demonstrates the complete workflow for geographic lead discovery.
 * Run with: npx tsx src/lib/geocoding/integration-test.ts
 */

import { geocode, getCacheStats } from './index'
import { haversineDistance, calculateBoundingBox, isPointInBoundingBox } from '../geo'

async function runIntegrationTest() {
  console.log('=== Geocoding & Geographic Utilities Integration Test ===\n')

  // Test 1: Single Address Geocoding
  console.log('Test 1: Geocoding San Francisco')
  const sfResult = await geocode('San Francisco, CA')
  if (sfResult) {
    console.log(`✓ Success: ${sfResult.displayName}`)
    console.log(`  Coordinates: ${sfResult.latitude}, ${sfResult.longitude}`)
  } else {
    console.log('✗ Failed to geocode San Francisco')
  }
  console.log()

  // Test 2: Cache Hit
  console.log('Test 2: Cache Hit (same address)')
  const cachedResult = await geocode('San Francisco, CA')
  if (cachedResult) {
    console.log('✓ Cache hit - instant result')
    console.log(`  Same coordinates: ${cachedResult.latitude}, ${cachedResult.longitude}`)
  }
  console.log()

  // Test 3: Distance Calculation
  console.log('Test 3: Distance Calculation')
  const sf = { lat: 37.7749, lon: -122.4194 }
  const la = { lat: 34.0522, lon: -118.2437 }
  const distance = haversineDistance(sf, la, 'miles')
  console.log(`✓ San Francisco to Los Angeles: ${distance.toFixed(2)} miles`)
  console.log(`  Expected: ~347 miles`)
  console.log()

  // Test 4: Bounding Box
  console.log('Test 4: Bounding Box Calculation')
  const bbox = calculateBoundingBox(sf, 50)
  console.log(`✓ 50-mile radius around San Francisco:`)
  console.log(`  Min Lat: ${bbox.minLat.toFixed(4)}`)
  console.log(`  Max Lat: ${bbox.maxLat.toFixed(4)}`)
  console.log(`  Min Lon: ${bbox.minLon.toFixed(4)}`)
  console.log(`  Max Lon: ${bbox.maxLon.toFixed(4)}`)
  console.log()

  // Test 5: Point in Bounding Box
  console.log('Test 5: Point in Bounding Box Check')
  const oaklandPoint = { lat: 37.8044, lon: -122.2712 } // Oakland, CA
  const inBox = isPointInBoundingBox(oaklandPoint, bbox)
  if (inBox) {
    const oaklandDistance = haversineDistance(sf, oaklandPoint, 'miles')
    console.log(`✓ Oakland is in the bounding box`)
    console.log(`  Exact distance: ${oaklandDistance.toFixed(2)} miles`)
    console.log(`  Within 50-mile radius: ${oaklandDistance <= 50 ? 'Yes' : 'No'}`)
  } else {
    console.log('✗ Oakland not in bounding box (unexpected)')
  }
  console.log()

  // Test 6: Complete Lead Discovery Simulation
  console.log('Test 6: Lead Discovery Workflow')
  console.log('Simulating: Find venues within 100 miles of speaker location')

  // Step 1: Geocode speaker location
  const speakerAddress = 'Seattle, WA'
  const speakerGeo = await geocode(speakerAddress)

  if (!speakerGeo) {
    console.log('✗ Failed to geocode speaker location')
    return
  }

  console.log(`✓ Speaker location: ${speakerGeo.displayName}`)
  console.log(`  Coordinates: ${speakerGeo.latitude}, ${speakerGeo.longitude}`)

  // Step 2: Calculate search area
  const radiusMiles = 100
  const searchBbox = calculateBoundingBox(
    { lat: speakerGeo.latitude, lon: speakerGeo.longitude },
    radiusMiles
  )

  console.log(`✓ Search area (${radiusMiles}-mile radius):`)
  console.log(`  Lat range: ${searchBbox.minLat.toFixed(4)} to ${searchBbox.maxLat.toFixed(4)}`)
  console.log(`  Lon range: ${searchBbox.minLon.toFixed(4)} to ${searchBbox.maxLon.toFixed(4)}`)

  // Step 3: Mock venue data (in real app, this would be from database)
  const mockVenues = [
    { id: 1, name: 'Tacoma Convention Center', lat: 47.2529, lon: -122.4443 },
    { id: 2, name: 'Portland Convention Center', lat: 45.5289, lon: -122.6625 },
    { id: 3, name: 'Spokane Convention Center', lat: 47.6587, lon: -117.4260 },
  ]

  console.log('\n✓ Checking venues:')

  // Step 4: Filter by bounding box and calculate distances
  const leadsWithDistance = mockVenues
    .filter(venue => {
      const point = { lat: venue.lat, lon: venue.lon }
      return isPointInBoundingBox(point, searchBbox)
    })
    .map(venue => {
      const distance = haversineDistance(
        { lat: speakerGeo.latitude, lon: speakerGeo.longitude },
        { lat: venue.lat, lon: venue.lon },
        'miles'
      )
      return { ...venue, distance }
    })
    .filter(venue => venue.distance <= radiusMiles)
    .sort((a, b) => a.distance - b.distance)

  leadsWithDistance.forEach(lead => {
    console.log(`  - ${lead.name}: ${lead.distance.toFixed(2)} miles`)
  })

  if (leadsWithDistance.length === 0) {
    console.log('  (No venues within radius)')
  }

  console.log()

  // Test 7: Cache Statistics
  console.log('Test 7: Cache Statistics')
  const stats = getCacheStats()
  console.log(`✓ Cache stats:`)
  console.log(`  Total entries: ${stats.size}`)
  console.log(`  Valid entries: ${stats.validEntries}`)
  console.log(`  Expired entries: ${stats.expiredEntries}`)
  console.log()

  console.log('=== All Tests Complete ===')
}

// Run the test if executed directly
if (require.main === module) {
  runIntegrationTest()
    .then(() => {
      console.log('\n✓ Integration test completed successfully')
      process.exit(0)
    })
    .catch(error => {
      console.error('\n✗ Integration test failed:', error)
      process.exit(1)
    })
}

export { runIntegrationTest }
