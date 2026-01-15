# Google Places API Setup Guide

Complete guide to setting up geographic lead discovery using Google Places API.

## Overview

The lead discovery engine now **scrapes real organizations** from Google Places API within your campaign radius, including:

- 🏫 Schools & Universities
- ⛪ Churches & Places of Worship
- 🎭 Theaters & Performance Venues
- 🎨 Art Galleries & Museums
- 🏛️ Community Centers & Event Venues
- 🎵 Concert Halls & Music Venues

---

## Step 1: Get Your API Key

### 1.1 Create/Select Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Name it something like "Deke Lead Discovery"

### 1.2 Enable Places API

1. Go to [Places API Library](https://console.cloud.google.com/apis/library/places-backend.googleapis.com)
2. Click **"Enable"**
3. Wait for confirmation

### 1.3 Create API Key

1. Go to [API Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **"Create Credentials"** → **"API Key"**
3. Copy your API key (starts with `AIza...`)

### 1.4 (Optional) Restrict API Key

For security, restrict your key:

1. Click **"Edit API key"**
2. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Check **"Places API"**
3. Under **"Application restrictions"**:
   - Select **"HTTP referrers"** or **"IP addresses"**
   - Add your domains/IPs
4. Click **"Save"**

---

## Step 2: Add API Key to .env

Open `.env` and add your key:

```bash
GOOGLE_PLACES_API_KEY=AIzaSyD...your_actual_key_here
```

---

## Step 3: Restart Dev Server

```bash
# Kill existing server
Ctrl+C

# Restart
npm run dev
```

---

## Step 4: Test Geographic Discovery

### Create a Test Campaign

1. Go to http://localhost:3002/dashboard/campaigns/new
2. Fill in campaign details:
   - **Name:** "San Francisco Outreach Test"
   - **Location:** "San Francisco, CA"
   - **Radius:** 25 miles
   - **Dates:** Any future dates
3. Click **"Create & Discover Leads"**

### What Happens Next

The discovery engine will:

```
1. Search existing database (dormant leads, past clients)
   └─ Finds: ~5-10 leads from seed data

2. Scrape Google Places API (NEW!)
   ├─ Searches 17 place types (schools, churches, venues, etc.)
   ├─ Within 25-mile radius of San Francisco
   └─ Finds: ~50-200 real organizations

3. Deduplicate & Score
   ├─ Removes duplicates by organization name
   ├─ Scores based on proximity & relevance
   └─ Inserts into campaign

Result: 60-210 total leads discovered! 🎉
```

---

## Pricing & Usage

### Google Places API Costs

**Nearby Search:** $0.032 per request

**Typical Campaign Discovery:**
- 17 place types searched
- 1 request per place type
- **Cost per campaign:** ~$0.54 (17 × $0.032)

**Monthly Estimates:**
- 10 campaigns/month: ~$5.40
- 50 campaigns/month: ~$27
- 100 campaigns/month: ~$54

**Free Tier:**
- $200 credit per month
- ~370 campaign discoveries free

### Monitoring Usage

Check usage at: https://console.cloud.google.com/apis/dashboard

Set billing alerts:
1. Go to [Billing](https://console.cloud.google.com/billing)
2. Click **"Budgets & alerts"**
3. Create alert at $40/month

---

## How It Works (Technical Details)

### Place Types Searched

```typescript
const PLACE_TYPES = [
  'school',
  'university',
  'secondary_school',
  'primary_school',
  'church',
  'synagogue',
  'mosque',
  'hindu_temple',
  'place_of_worship',
  'performing_arts_theater',
  'art_gallery',
  'museum',
  'community_center',
  'event_venue',
  'convention_center',
  'night_club',
  'concert_hall',
]
```

### API Request Format

```
GET https://maps.googleapis.com/maps/api/place/nearbysearch/json
  ?location=37.7749,-122.4194
  &radius=40234  (25 miles in meters)
  &type=university
  &key=AIza...
```

### Lead Generation

For each place found:

1. **Check if organization exists in database**
   - If yes: Use existing contact info
   - If no: Generate synthetic contact

2. **Synthetic Contact Format:**
   - Name: "Contact at [Organization Name]"
   - Email: `contact@[org-domain].com`
   - Phone: null (requires manual enrichment)

3. **Lead Scoring:**
   - Base score: 30 points (AI Research)
   - Proximity bonus: +0-15 points
   - **Note:** Lower than existing leads (70 for past clients)

### Deduplication

- Groups by organization name (case-insensitive)
- If multiple locations found, keeps closest to campaign center
- Example: "Stanford University" appears 3 times → keeps only 1

---

## Graceful Degradation

**If no API key is set:**
- Discovery continues with database-only sources
- Logs warning: "GOOGLE_PLACES_API_KEY not set - skipping AI research discovery"
- Campaign still works, just fewer leads

**If API quota exceeded:**
- Discovery returns whatever it found before hitting limit
- Other sources (dormant, past clients) still work
- Campaign creation succeeds

---

## Troubleshooting

### "Places API not enabled"

**Error:**
```
Places API error: This API project is not authorized to use this API
```

**Fix:**
1. Go to [Places API Library](https://console.cloud.google.com/apis/library/places-backend.googleapis.com)
2. Click **"Enable"**
3. Wait 1-2 minutes for propagation

---

### "API key not valid"

**Error:**
```
Places API status: REQUEST_DENIED
```

**Fix:**
1. Check `.env` has correct key
2. Restart dev server
3. Verify key at [API Credentials](https://console.cloud.google.com/apis/credentials)

---

### "Quota exceeded"

**Error:**
```
Places API status: OVER_QUERY_LIMIT
```

**Fix:**
1. Check usage at [API Dashboard](https://console.cloud.google.com/apis/dashboard)
2. Enable billing if needed
3. Wait for quota reset (daily)

---

### "Zero results found"

**Not an error** - API works but no places in radius

**Possible reasons:**
1. Rural area with few organizations
2. Radius too small (try 50+ miles)
3. Place types don't match area (e.g., universities in residential zone)

---

## Rate Limiting & Best Practices

### Current Implementation

- **No rate limiting** (makes all 17 requests in parallel)
- **No caching** (every discovery hits API)

### Recommended Improvements (Future)

1. **Cache results by location:**
   ```typescript
   // Cache for 7 days
   const cacheKey = `places_${lat}_${lng}_${radius}`
   const cached = await redis.get(cacheKey)
   ```

2. **Rate limit requests:**
   ```typescript
   // Max 10 req/sec
   await sleep(100) // 100ms between requests
   ```

3. **Batch campaigns:**
   - Group nearby campaigns
   - Share discovery results
   - Reduces API calls

---

## Alternative: Free OpenStreetMap

If you want **free, unlimited** geographic data:

Replace Google Places with **OpenStreetMap Overpass API**:

```typescript
// src/lib/discovery/ai-research.ts
const url = `https://overpass-api.de/api/interpreter?data=
  [out:json];
  (
    node["amenity"~"school|university|place_of_worship"](around:${radiusMeters},${lat},${lng});
    way["amenity"~"school|university|place_of_worship"](around:${radiusMeters},${lat},${lng});
  );
  out center;
`
```

**Pros:**
- 100% free
- No API key needed
- Open data

**Cons:**
- Less comprehensive than Google
- No contact information
- Slower response times

---

## Next Steps

1. ✅ Get Google Places API key
2. ✅ Add to `.env`
3. ✅ Restart server
4. ✅ Test campaign creation
5. 🔜 Add contact enrichment (find actual emails/phones)
6. 🔜 Implement caching
7. 🔜 Add rate limiting

---

## Support

**Google Places API Docs:**
- https://developers.google.com/maps/documentation/places/web-service/overview

**Pricing:**
- https://mapsplatform.google.com/pricing/

**Console:**
- https://console.cloud.google.com/

**Questions?**
Open an issue or contact support.
