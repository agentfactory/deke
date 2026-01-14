# Deke Sharon Lead Generation System - API Documentation

## Overview

Complete backend API infrastructure for the Local Opportunity Finder system built with Next.js 16, Prisma 7, TypeScript, and Zod validation.

## File Structure

```
src/
├── lib/
│   ├── db.ts                          # Prisma client singleton
│   ├── api-error.ts                   # Error handling utilities
│   └── validations/
│       ├── campaign.ts                # Campaign validation schemas
│       ├── booking.ts                 # Booking validation schemas
│       └── template.ts                # Template validation schemas
└── app/api/
    ├── health/route.ts                # Health check endpoint
    ├── campaigns/
    │   ├── route.ts                   # GET (list), POST (create)
    │   └── [id]/
    │       ├── route.ts               # GET, PATCH, DELETE
    │       ├── discover/route.ts      # POST (Phase 2 stub)
    │       ├── approve/route.ts       # POST (workflow control)
    │       └── launch/route.ts        # POST (Phase 5 stub)
    ├── bookings/route.ts              # GET, POST
    └── templates/route.ts             # GET (filtered)
```

## Core Libraries

### Database Client (`src/lib/db.ts`)

Singleton Prisma client with environment-based configuration.

```typescript
import { prisma } from '@/lib/db'

// Usage in API routes
const campaigns = await prisma.campaign.findMany()
```

**Configuration:** Requires `DATABASE_URL` in `.env` file

### Error Handler (`src/lib/api-error.ts`)

Centralized error handling with proper HTTP status codes.

```typescript
import { handleApiError, ApiError } from '@/lib/api-error'

// Throw custom errors
throw new ApiError(404, 'Campaign not found', 'CAMPAIGN_NOT_FOUND')

// Handle in try/catch
try {
  // ... API logic
} catch (error) {
  return handleApiError(error) // Automatically handles ApiError, ZodError, etc.
}
```

## API Endpoints

### Health Check

**GET `/api/health`**

Returns system health status and database connectivity.

**Response (200)**
```json
{
  "status": "ok",
  "timestamp": "2026-01-14T12:00:00.000Z",
  "database": "connected"
}
```

**Error Response (503)**
```json
{
  "status": "error",
  "timestamp": "2026-01-14T12:00:00.000Z",
  "database": "disconnected",
  "error": "Connection failed"
}
```

---

### Campaigns

#### List Campaigns
**GET `/api/campaigns`**

Retrieve paginated list of campaigns with optional filtering.

**Query Parameters**
- `status` (optional): Filter by CampaignStatus enum
- `limit` (optional): Number of results (1-100, default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response (200)**
```json
{
  "campaigns": [
    {
      "id": "clx123abc",
      "name": "Los Angeles Workshop Tour",
      "baseLocation": "Los Angeles, CA",
      "latitude": 34.0522,
      "longitude": -118.2437,
      "radius": 100,
      "status": "DRAFT",
      "startDate": "2026-02-01T00:00:00.000Z",
      "endDate": null,
      "createdAt": "2026-01-14T12:00:00.000Z",
      "updatedAt": "2026-01-14T12:00:00.000Z",
      "approvedAt": null,
      "launchedAt": null,
      "booking": {
        "id": "clx456def",
        "serviceType": "WORKSHOP",
        "startDate": "2026-02-15T00:00:00.000Z",
        "location": "Los Angeles Convention Center"
      },
      "bookingId": "clx456def",
      "_count": {
        "leads": 0,
        "outreachLogs": 0
      }
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

#### Create Campaign
**POST `/api/campaigns`**

Create a new campaign.

**Request Body**
```json
{
  "name": "Los Angeles Workshop Tour",
  "baseLocation": "Los Angeles, CA",
  "latitude": 34.0522,
  "longitude": -118.2437,
  "radius": 100,
  "startDate": "2026-02-01T00:00:00.000Z",
  "endDate": null,
  "bookingId": "clx456def"
}
```

**Validation Rules**
- `name`: Required, 1-255 characters
- `baseLocation`: Required
- `latitude`: -90 to 90
- `longitude`: -180 to 180
- `radius`: 1-1000 miles (default: 100)
- `startDate`, `endDate`: Optional ISO 8601 datetime strings
- `bookingId`: Optional, must exist and not already have a campaign

**Response (201)**
```json
{
  "id": "clx123abc",
  "name": "Los Angeles Workshop Tour",
  ... // full campaign object
}
```

**Error Response (400)**
```json
{
  "error": "Campaign already exists for this booking",
  "code": "CAMPAIGN_EXISTS"
}
```

#### Get Campaign
**GET `/api/campaigns/[id]`**

Retrieve a single campaign with full details including leads.

**Response (200)**
```json
{
  "id": "clx123abc",
  "name": "Los Angeles Workshop Tour",
  ... // basic campaign fields
  "leads": [
    {
      "id": "clx789ghi",
      "campaignId": "clx123abc",
      "leadId": "clx999jkl",
      "score": 85,
      "distance": 25.5,
      "source": "PAST_CLIENT",
      "status": "PENDING",
      "createdAt": "2026-01-14T12:00:00.000Z",
      "lead": {
        "id": "clx999jkl",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1-555-1234",
        "organization": "Sample University"
      },
      "outreachLogs": []
    }
  ],
  "_count": {
    "leads": 1,
    "outreachLogs": 0
  }
}
```

**Error Response (404)**
```json
{
  "error": "Campaign not found",
  "code": "CAMPAIGN_NOT_FOUND"
}
```

#### Update Campaign
**PATCH `/api/campaigns/[id]`**

Update campaign fields (partial update).

**Request Body** (all fields optional)
```json
{
  "name": "Updated Campaign Name",
  "radius": 150,
  "status": "APPROVED"
}
```

**Validation Rules**
- Cannot modify `baseLocation`, `latitude`, `longitude` if campaign is ACTIVE
- `status` must be valid CampaignStatus enum value

**Response (200)** - Returns updated campaign object

**Error Response (400)**
```json
{
  "error": "Cannot modify location of active campaign",
  "code": "CAMPAIGN_ACTIVE"
}
```

#### Delete Campaign
**DELETE `/api/campaigns/[id]`**

Delete a campaign. Cannot delete active campaigns.

**Response (200)**
```json
{
  "message": "Campaign deleted successfully"
}
```

**Error Response (400)**
```json
{
  "error": "Cannot delete active campaign. Pause or cancel it first.",
  "code": "CAMPAIGN_ACTIVE"
}
```

#### Discover Leads (Phase 2 Stub)
**POST `/api/campaigns/[id]/discover`**

Trigger lead discovery for a campaign. Currently returns mock data.

**Response (200)**
```json
{
  "message": "Lead discovery initiated (stub implementation)",
  "campaignId": "clx123abc",
  "status": "pending",
  "discovered": {
    "pastClients": 0,
    "dormantLeads": 0,
    "similarOrgs": 0,
    "aiResearch": 0,
    "total": 0
  },
  "mockLeads": [...],
  "note": "This is a stub endpoint. Full discovery engine will be implemented in Phase 2."
}
```

#### Approve Campaign
**POST `/api/campaigns/[id]/approve`**

Approve a draft campaign for launch.

**Validation**
- Campaign must be in DRAFT status
- Campaign must have at least one lead

**Response (200)**
```json
{
  "message": "Campaign approved successfully",
  "campaign": {
    "id": "clx123abc",
    "status": "APPROVED",
    "approvedAt": "2026-01-14T12:30:00.000Z",
    ...
  }
}
```

**Error Response (400)**
```json
{
  "error": "Only draft campaigns can be approved",
  "code": "INVALID_STATUS"
}
```

#### Launch Campaign (Phase 5 Stub)
**POST `/api/campaigns/[id]/launch`**

Launch an approved campaign. Currently returns stub response.

**Validation**
- Campaign must be APPROVED
- Must have `approvedAt` timestamp
- Must have at least one lead

**Response (200)**
```json
{
  "message": "Campaign launched successfully (stub implementation)",
  "campaign": {
    "id": "clx123abc",
    "status": "ACTIVE",
    "launchedAt": "2026-01-14T12:45:00.000Z",
    ...
  },
  "outreach": {
    "queued": 0,
    "sent": 0,
    "failed": 0
  },
  "note": "This is a stub endpoint. Full outreach engine will be implemented in Phase 5."
}
```

---

### Bookings

#### List Bookings
**GET `/api/bookings`**

Retrieve paginated list of bookings with optional filtering.

**Query Parameters**
- `status` (optional): Filter by BookingStatus enum
- `serviceType` (optional): Filter by ServiceType enum
- `leadId` (optional): Filter by specific lead
- `limit` (optional): 1-100, default 50
- `offset` (optional): default 0

**Response (200)**
```json
{
  "bookings": [
    {
      "id": "clx456def",
      "leadId": "clx999jkl",
      "inquiryId": null,
      "serviceType": "WORKSHOP",
      "status": "CONFIRMED",
      "startDate": "2026-02-15T00:00:00.000Z",
      "endDate": "2026-02-15T23:59:59.000Z",
      "timezone": "America/Los_Angeles",
      "location": "Los Angeles Convention Center",
      "latitude": 34.0407,
      "longitude": -118.2468,
      "amount": 5000,
      "depositPaid": 1500,
      "balanceDue": 3500,
      "paymentStatus": "DEPOSIT_PAID",
      "internalNotes": "VIP client, extra setup needed",
      "clientNotes": "Prefer afternoon sessions",
      "createdAt": "2026-01-10T10:00:00.000Z",
      "updatedAt": "2026-01-12T14:30:00.000Z",
      "lead": {
        "id": "clx999jkl",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1-555-1234",
        "organization": "Sample University"
      },
      "inquiry": null,
      "campaigns": []
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

#### Create Booking
**POST `/api/bookings`**

Create a new booking.

**Request Body**
```json
{
  "leadId": "clx999jkl",
  "inquiryId": "clxabc123",
  "serviceType": "WORKSHOP",
  "startDate": "2026-02-15T10:00:00.000Z",
  "endDate": "2026-02-15T17:00:00.000Z",
  "timezone": "America/Los_Angeles",
  "location": "Los Angeles Convention Center",
  "latitude": 34.0407,
  "longitude": -118.2468,
  "amount": 5000,
  "depositPaid": 1500,
  "balanceDue": 3500,
  "internalNotes": "VIP client",
  "clientNotes": "Prefer afternoon"
}
```

**Validation Rules**
- `leadId`: Required, must exist
- `inquiryId`: Optional, must exist and not already have a booking
- `serviceType`: Required, one of: ARRANGEMENT, GROUP_COACHING, INDIVIDUAL_COACHING, WORKSHOP, SPEAKING, MASTERCLASS, CONSULTATION
- Dates: ISO 8601 datetime strings
- `latitude`: -90 to 90
- `longitude`: -180 to 180
- Amounts: Must be >= 0

**Response (201)** - Returns created booking object

**Error Response (404)**
```json
{
  "error": "Lead not found",
  "code": "LEAD_NOT_FOUND"
}
```

---

### Templates

#### List Templates
**GET `/api/templates`**

Retrieve message templates with optional filtering.

**Query Parameters**
- `serviceType` (optional): Filter by ServiceType enum
- `channel` (optional): Filter by OutreachChannel enum (EMAIL, SMS, LINKEDIN)

**Response (200)**
```json
{
  "templates": [
    {
      "id": "clxtempl1",
      "name": "Workshop Invitation - Past Client",
      "serviceType": "WORKSHOP",
      "subject": "{{firstName}}, join me in {{location}}!",
      "body": "Hi {{firstName}},\n\nI'll be running a workshop in {{location}} on {{dates}}...",
      "channel": "EMAIL",
      "variables": "[\"firstName\",\"location\",\"dates\"]",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Validation Schemas

All API endpoints use Zod for runtime validation.

### Campaign Validation (`src/lib/validations/campaign.ts`)

```typescript
import {
  createCampaignSchema,
  updateCampaignSchema,
  campaignFiltersSchema
} from '@/lib/validations/campaign'

// Type exports
type CreateCampaignInput = z.infer<typeof createCampaignSchema>
type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>
type CampaignFilters = z.infer<typeof campaignFiltersSchema>
```

### Booking Validation (`src/lib/validations/booking.ts`)

```typescript
import {
  createBookingSchema,
  bookingFiltersSchema
} from '@/lib/validations/booking'

// Type exports
type CreateBookingInput = z.infer<typeof createBookingSchema>
type BookingFilters = z.infer<typeof bookingFiltersSchema>
```

### Template Validation (`src/lib/validations/template.ts`)

```typescript
import { templateFiltersSchema } from '@/lib/validations/template'

type TemplateFilters = z.infer<typeof templateFiltersSchema>
```

---

## Error Handling

All endpoints use consistent error format:

**Client Errors (400-499)**
```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

**Validation Errors (400)**
```json
{
  "error": "Validation failed",
  "issues": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "inclusive": true,
      "message": "Campaign name is required",
      "path": ["name"]
    }
  ]
}
```

**Server Errors (500)**
```json
{
  "error": "Internal server error"
}
```

---

## Enums Reference

### CampaignStatus
- `DRAFT` - Initial state, being configured
- `APPROVED` - Ready to launch
- `ACTIVE` - Currently running
- `PAUSED` - Temporarily stopped
- `COMPLETED` - Finished successfully
- `CANCELLED` - Terminated early

### ServiceType
- `ARRANGEMENT` - Custom arrangement service
- `GROUP_COACHING` - Group coaching session
- `INDIVIDUAL_COACHING` - One-on-one coaching
- `WORKSHOP` - Workshop event
- `SPEAKING` - Speaking engagement
- `MASTERCLASS` - Masterclass event
- `CONSULTATION` - Consultation service

### BookingStatus
- `PENDING` - Awaiting confirmation
- `CONFIRMED` - Confirmed
- `IN_PROGRESS` - Currently happening
- `COMPLETED` - Successfully completed
- `CANCELLED` - Cancelled
- `RESCHEDULED` - Moved to different date

### LeadSource
- `PAST_CLIENT` - Previous client
- `DORMANT` - Inactive lead being re-engaged
- `SIMILAR_ORG` - Similar organization pattern match
- `AI_RESEARCH` - Discovered via AI research
- `MANUAL_IMPORT` - Manually imported

### OutreachChannel
- `EMAIL` - Email outreach
- `SMS` - SMS/text message
- `LINKEDIN` - LinkedIn message

---

## Development Setup

### Prerequisites
- Node.js 20+
- Next.js 16+
- Prisma 7+
- TypeScript 5+
- Zod 4+

### Environment Variables

Create `.env` file:
```env
DATABASE_URL="file:./prisma/dev.db"
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (if needed)
npx prisma migrate dev

# Seed database (if seed file exists)
npx prisma db seed
```

### Running Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

---

## Next Steps (Phase 2+)

### Phase 2: Lead Discovery
- Implement `/api/campaigns/[id]/discover` endpoint
- Past clients discovery (Haversine distance formula)
- Dormant leads re-engagement
- Similar organizations pattern matching
- AI web research integration

### Phase 5: Multi-Channel Outreach
- Implement `/api/campaigns/[id]/launch` endpoint
- Email provider integration (Resend)
- SMS provider integration (Twilio)
- Rate limiting
- Webhook handlers for delivery/open/click tracking
- Compliance (unsubscribe links, opt-out handling)

---

## Testing

### Manual Testing with curl

**Health Check**
```bash
curl http://localhost:3000/api/health
```

**Create Campaign**
```bash
curl -X POST http://localhost:3000/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Campaign",
    "baseLocation": "Los Angeles, CA",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "radius": 100
  }'
```

**List Campaigns**
```bash
curl "http://localhost:3000/api/campaigns?status=DRAFT&limit=10"
```

---

## Notes

- All API routes use Next.js 16+ App Router (`app/api`)
- TypeScript strict mode enabled
- Prisma 7 requires DATABASE_URL environment variable
- All timestamps use ISO 8601 format
- Geographic coordinates use decimal degrees
- Distance measurements in miles by default
- Cascading deletes configured for campaign leads and outreach logs

---

**Last Updated:** 2026-01-14
**API Version:** 1.0.0 (Phase 1)
