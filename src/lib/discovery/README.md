# Lead Discovery Engine

Complete lead discovery system for opportunity finder campaigns. This module discovers, scores, deduplicates, and organizes leads from multiple sources.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Discovery Orchestrator                    │
│                                                              │
│  Coordinates all sources, deduplication, and scoring        │
└──────────────────┬──────────────────────────────────────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
       ▼                       ▼
┌──────────────┐      ┌──────────────┐
│   Discovery  │      │   Scoring &  │
│   Sources    │      │ Deduplication│
└──────────────┘      └──────────────┘
       │                       │
       ├─ Past Clients         ├─ Score Calculator
       ├─ Dormant Leads        ├─ Deduplicator
       ├─ Similar Orgs         └─ Org Classifier
       └─ AI Research (stub)
```

## Discovery Sources

### 1. Past Clients (`past-clients.ts`)
Discovers leads from completed bookings within the campaign radius.

**Strategy:**
- Query leads with status `WON` or `COMPLETED`
- Use bounding box + haversine distance filtering
- Include booking history for scoring

**Score Base:** 70 points (highest priority)

### 2. Dormant Leads (`dormant-leads.ts`)
Finds leads that have gone dormant (no contact in 6+ months).

**Strategy:**
- Leads not contacted in 6+ months
- Leads with `DECLINED` or `EXPIRED` inquiries
- Excludes already won/completed leads

**Score Base:** 50 points

### 3. Similar Organizations (`similar-orgs.ts`)
Discovers leads from organizations similar to the booking location.

**Strategy:**
- Classify booking location organization type
- Search for similar organization keywords
- Match within geographic radius

**Score Base:** 40 points

**Supported Organization Types:**
- Educational: University, College, High School, Middle School, Elementary
- Arts: Conservatory, Music School, Theatre, Performing Arts
- Religious: Church, Synagogue, Mosque
- Events: Festival, Conference, Convention
- Community: Community Center, Arts Center
- Other: Corporate, Nonprofit

### 4. AI Research (`ai-research.ts`)
Future feature for AI-powered web research.

**Status:** Stubbed for MVP (returns empty array)

**Future Implementation:**
- Web scraping for local events and organizations
- Social media monitoring
- News article analysis
- Business directory searches
- AI-powered contact enrichment

## Scoring Algorithm

Leads are scored 0-100 based on multiple factors:

### Base Score by Source (0-70 points)
- **Past Client:** 70 - Proven relationship
- **Dormant:** 50 - Had interest before
- **Similar Org:** 40 - Similar profile
- **AI Research:** 30 - Cold lead

### Proximity Bonus (0-15 points)
Distance from campaign center:
- **0-25% of radius:** +15 points
- **25-50% of radius:** +10 points
- **50-75% of radius:** +5 points
- **75-100% of radius:** 0 points

### Recency Bonus (0-10 points)
Based on last contact date:
- **Within 12 months:** +10 points
- **12-24 months:** +5 points
- **Over 24 months:** 0 points

### Relationship Strength (0-5 points)
Based on booking history:
- **2+ bookings:** +5 points
- **1 booking:** +3 points
- **Inquiry only:** +1 point
- **None:** 0 points

## Deduplication

Leads discovered by multiple sources are deduplicated by email address.

**Strategy:**
- Group by email
- Keep the highest-scoring instance
- Preserve source information

**Example:**
```typescript
// John found in 2 sources
[
  { email: 'john@example.com', score: 70, source: 'PAST_CLIENT' },
  { email: 'john@example.com', score: 50, source: 'DORMANT' }
]

// After deduplication
[
  { email: 'john@example.com', score: 70, source: 'PAST_CLIENT' }
]
```

## Usage

### Basic Discovery

```typescript
import { discoverLeads } from '@/lib/discovery'

// Discover all leads for a campaign
const result = await discoverLeads(campaignId)

console.log(`Discovered ${result.total} leads`)
console.log(`Past Clients: ${result.bySource.PAST_CLIENT}`)
console.log(`Avg Score: ${result.avgScore}`)
```

### Get Statistics

```typescript
import { getDiscoveryStats } from '@/lib/discovery'

// Get current statistics for a campaign
const stats = await getDiscoveryStats(campaignId)

console.log(`Total leads: ${stats.total}`)
console.log(`By status: ${stats.byStatus.PENDING} pending`)
console.log(`Score distribution:`, stats.scoreStats.distribution)
```

### Clear Leads

```typescript
import { clearDiscoveredLeads } from '@/lib/discovery'

// Clear all discovered leads (for re-discovery)
const removed = await clearDiscoveredLeads(campaignId)
console.log(`Removed ${removed} leads`)
```

### Advanced Usage

```typescript
import {
  discoverPastClients,
  discoverDormantLeads,
  calculateScore,
  classifyOrganization
} from '@/lib/discovery'

// Use individual discovery sources
const pastClients = await discoverPastClients(campaign)
const dormant = await discoverDormantLeads(campaign)

// Classify organizations
const orgType = classifyOrganization('UCLA University')
// Returns: 'UNIVERSITY'

// Calculate custom scores
const score = calculateScore(lead, campaign)
```

## API Endpoint

### POST `/api/campaigns/[id]/discover`

Runs discovery for a campaign and returns statistics.

**Response:**
```json
{
  "message": "Lead discovery completed successfully",
  "campaignId": "...",
  "campaignName": "Los Angeles Campaign",
  "discovered": {
    "total": 45,
    "bySource": {
      "pastClients": 12,
      "dormantLeads": 18,
      "similarOrgs": 15,
      "aiResearch": 0
    }
  },
  "scoring": {
    "avgScore": 62.3,
    "scoreDistribution": {
      "excellent": 8,
      "good": 22,
      "fair": 12,
      "poor": 3
    },
    "min": 32,
    "max": 85,
    "median": 63
  },
  "deduplication": {
    "originalCount": 52,
    "duplicatesRemoved": 7,
    "deduplicationRate": 13.5
  },
  "performance": {
    "duration": 1245,
    "leadsPerSecond": 36
  }
}
```

## Database Schema

### CampaignLead
```typescript
{
  id: string
  campaignId: string
  leadId: string
  score: number         // 0-100
  distance: number      // miles from campaign center
  source: string        // PAST_CLIENT, DORMANT, SIMILAR_ORG, AI_RESEARCH
  status: string        // PENDING, CONTACTED, OPENED, etc.
  createdAt: DateTime
  updatedAt: DateTime
}
```

## Performance Optimization

### Parallel Execution
All discovery sources run in parallel for maximum performance:
```typescript
const [pastClients, dormant, similar, aiResearch] = await Promise.all([
  discoverPastClients(campaign),
  discoverDormantLeads(campaign),
  discoverSimilarOrgs(campaign),
  discoverAIResearch(),
])
```

### Bounding Box Optimization
Geographic queries use bounding box filtering before haversine distance:
```typescript
// 1. Fast: Filter by bounding box (indexed)
WHERE latitude >= minLat AND latitude <= maxLat
  AND longitude >= minLon AND longitude <= maxLon

// 2. Precise: Apply haversine distance
const distance = haversineDistance(point1, point2)
if (distance <= radius) { /* include */ }
```

### SQLite Compatibility
Handles duplicate prevention without `skipDuplicates` (not supported in SQLite):
```typescript
// Check for existing leads first
const existing = await prisma.campaignLead.findMany({...})
const existingIds = new Set(existing.map(e => e.leadId))

// Filter and insert only new leads
const newLeads = leads.filter(l => !existingIds.has(l.id))
await prisma.campaignLead.createMany({ data: newLeads })
```

## Testing

### Unit Tests
```typescript
// Test scoring algorithm
const score = calculateScore(lead, campaign)
expect(score).toBeGreaterThanOrEqual(0)
expect(score).toBeLessThanOrEqual(100)

// Test deduplication
const deduped = deduplicate(leads)
expect(deduped.length).toBeLessThanOrEqual(leads.length)

// Test organization classification
const orgType = classifyOrganization('Harvard University')
expect(orgType).toBe('UNIVERSITY')
```

### Integration Tests
```typescript
// Test full discovery flow
const result = await discoverLeads(campaignId)
expect(result.total).toBeGreaterThan(0)
expect(result.bySource.PAST_CLIENT).toBeGreaterThan(0)

// Verify database records
const campaignLeads = await prisma.campaignLead.findMany({
  where: { campaignId }
})
expect(campaignLeads.length).toBe(result.total)
```

## Error Handling

All functions throw descriptive errors:

```typescript
try {
  await discoverLeads(campaignId)
} catch (error) {
  if (error.message === 'Campaign not found') {
    // Handle missing campaign
  }
  // Handle other errors
}
```

## Future Enhancements

1. **AI Research Source**
   - Web scraping for local organizations
   - Social media monitoring
   - AI-powered lead enrichment

2. **Machine Learning Scoring**
   - Train on historical campaign success
   - Personalized scoring per campaign type
   - A/B testing for score weights

3. **Real-time Discovery**
   - Webhook-based lead discovery
   - Continuous background discovery
   - Auto-discovery on booking creation

4. **Advanced Deduplication**
   - Fuzzy email matching
   - Phone number deduplication
   - Cross-source identity resolution

5. **Geographic Enhancements**
   - Drive time instead of radius
   - Regional preferences
   - Multi-location campaigns

## Contributing

When adding new discovery sources:

1. Create source file in `src/lib/discovery/`
2. Implement async function returning array of leads
3. Add source to orchestrator parallel execution
4. Update scoring base score map
5. Add source to `bySource` statistics
6. Update documentation

Example template:
```typescript
// src/lib/discovery/new-source.ts
export async function discoverNewSource(campaign: Campaign) {
  // 1. Calculate bounding box
  const bbox = calculateBoundingBox(...)

  // 2. Query database with geographic filter
  const leads = await prisma.lead.findMany({...})

  // 3. Apply haversine distance filter
  return leads
    .map(lead => ({
      ...lead,
      distance: haversineDistance(...),
      source: 'NEW_SOURCE' as const
    }))
    .filter(lead => lead.distance <= campaign.radius)
}
```

## License

Proprietary - Deke Sharon AI Agent Ecosystem
