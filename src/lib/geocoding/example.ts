/**
 * Example Usage of Geocoding and Geographic Utilities
 *
 * This file demonstrates how to use the geocoding service
 * and geographic utilities for lead discovery.
 */

import { geocode, batchGeocode } from './index'
import { haversineDistance, calculateBoundingBox } from '../geo'

/**
 * Example: Geocode a single address
 */
export async function exampleSingleGeocode() {
  const address = '1600 Amphitheatre Parkway, Mountain View, CA'
  const result = await geocode(address)

  if (result) {
    console.log(`Geocoded: ${result.displayName}`)
    console.log(`Coordinates: ${result.latitude}, ${result.longitude}`)
  } else {
    console.log('Failed to geocode address')
  }

  return result
}

/**
 * Example: Geocode multiple addresses with progress tracking
 */
export async function exampleBatchGeocode() {
  const addresses = [
    '1 Apple Park Way, Cupertino, CA',
    '1 Microsoft Way, Redmond, WA',
    '1 Amazon Way, Seattle, WA',
  ]

  const results = await batchGeocode(addresses, (current, total) => {
    console.log(`Geocoding progress: ${current}/${total}`)
  })

  results.forEach((result, index) => {
    if (result) {
      console.log(`${addresses[index]}: ${result.latitude}, ${result.longitude}`)
    } else {
      console.log(`${addresses[index]}: Failed to geocode`)
    }
  })

  return results
}

/**
 * Example: Calculate distance between two locations
 */
export async function exampleDistanceCalculation() {
  // San Francisco and Los Angeles
  const sanFrancisco = { lat: 37.7749, lon: -122.4194 }
  const losAngeles = { lat: 34.0522, lon: -118.2437 }

  const distanceMiles = haversineDistance(sanFrancisco, losAngeles, 'miles')
  const distanceKm = haversineDistance(sanFrancisco, losAngeles, 'km')

  console.log(`Distance: ${distanceMiles.toFixed(2)} miles (${distanceKm.toFixed(2)} km)`)

  return { miles: distanceMiles, km: distanceKm }
}

/**
 * Example: Find venues within radius using bounding box optimization
 */
export async function exampleRadiusSearch() {
  // Speaker's location (e.g., their home)
  const speakerLocation = { lat: 37.7749, lon: -122.4194 }
  const radiusMiles = 50

  // Step 1: Calculate bounding box for efficient database query
  const bbox = calculateBoundingBox(speakerLocation, radiusMiles)

  console.log('Bounding Box:', bbox)
  console.log(
    'Database query would be:',
    `WHERE lat >= ${bbox.minLat} AND lat <= ${bbox.maxLat}`,
    `AND lon >= ${bbox.minLon} AND lon <= ${bbox.maxLon}`
  )

  // Step 2: In real usage, you would:
  // - Query database for venues within bounding box
  // - Then apply haversineDistance to get exact distances
  // - Filter by exact radius and sort by distance

  // Example mock venue
  const venue = { lat: 37.8, lon: -122.4 }
  const distance = haversineDistance(speakerLocation, venue, 'miles')

  if (distance <= radiusMiles) {
    console.log(`Venue is ${distance.toFixed(2)} miles away - within radius!`)
  } else {
    console.log(`Venue is ${distance.toFixed(2)} miles away - outside radius`)
  }

  return { bbox, distance }
}

/**
 * Example: Complete lead discovery workflow
 */
export async function exampleLeadDiscoveryWorkflow() {
  // 1. Geocode speaker's location
  const speakerAddress = 'San Francisco, CA'
  const speakerGeo = await geocode(speakerAddress)

  if (!speakerGeo) {
    console.error('Failed to geocode speaker location')
    return
  }

  console.log(`Speaker location: ${speakerGeo.displayName}`)

  // 2. Set search radius
  const radiusMiles = 100

  // 3. Calculate bounding box for database query
  const bbox = calculateBoundingBox(
    { lat: speakerGeo.latitude, lon: speakerGeo.longitude },
    radiusMiles
  )

  console.log(`Searching within ${radiusMiles} miles...`)

  // 4. In real implementation, query database:
  // const venues = await db.venue.findMany({
  //   where: {
  //     latitude: { gte: bbox.minLat, lte: bbox.maxLat },
  //     longitude: { gte: bbox.minLon, lte: bbox.maxLon }
  //   }
  // })

  // 5. Calculate exact distances and filter
  // const leadsWithDistance = venues.map(venue => ({
  //   ...venue,
  //   distance: haversineDistance(
  //     { lat: speakerGeo.latitude, lon: speakerGeo.longitude },
  //     { lat: venue.latitude, lon: venue.longitude },
  //     'miles'
  //   )
  // }))
  // .filter(lead => lead.distance <= radiusMiles)
  // .sort((a, b) => a.distance - b.distance)

  console.log('Lead discovery complete!')
}
