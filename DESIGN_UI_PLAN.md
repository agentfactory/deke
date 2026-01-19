# Coach OS - Design UI Plan for Demo

**Created:** January 19, 2026
**Status:** Ready for Tomorrow's Demo
**Target:** Deke Sharon Demo
**Branch:** `claude/design-ui-plan-jqqmg`

---

## Executive Summary

This document consolidates all backend and frontend designs into a comprehensive UI plan for the Coach OS demo. The system is a dual-purpose platform for traveling coaches, featuring business automation (trip management, lead discovery, outreach) and community services (Find a Singing Group, Harmony AI chat).

---

## Design System

### Colors
| Role | Color | Usage |
|------|-------|-------|
| Primary | **Lime** | CTAs, active states, highlights |
| Secondary | **Lime** | Hover states, accents |
| Neutral | **Stone** | Backgrounds, borders, text |

### Typography
| Role | Font | Usage |
|------|------|-------|
| Heading | **DM Sans** | All headings, titles |
| Body | **DM Sans** | Paragraph text, labels |
| Mono | **IBM Plex Mono** | Code, data, metrics |

### Design Principles
- Mobile-first, responsive design
- Light and dark mode support
- Minimal aesthetic with gradient accents
- Consistent spacing and card-based layouts

---

## Navigation Structure

### Public Navigation (Visitors)
```
Logo → Home
├── Find a Singing Group  → /find-group (NEW - needs public form)
├── Services              → /services
│   ├── Speaking          → /speaking
│   ├── Coaching          → /coaching
│   ├── Workshops         → /workshops
│   ├── Masterclass       → /masterclass
│   └── Arrangements      → /arrangements
├── Artwork               → /artwork
└── Login/Sign Up         → /login
```

### Dashboard Navigation (Authenticated)
```
Logo → Dashboard
├── Dashboard             → /dashboard (Trip Management)
├── Campaigns             → /dashboard/campaigns (Lead Discovery)
├── Outreach              → /dashboard/outreach (Automation)
├── Groups                → /dashboard/groups (Find a Group Admin)
└── User Menu (Avatar)
    ├── Profile
    ├── Settings
    └── Logout
```

---

## Feature Sections

### Section 1: Dashboard & Trip Management
**Location:** `/dashboard`
**Status:** ✅ Implemented

#### Current Features
- Trip list with profitability tracking
- Booking management (create, edit, view)
- Expense tracking with travel costs
- Participant management
- Revenue split calculations

#### UI Components
| Component | File | Status |
|-----------|------|--------|
| TripList | `src/components/trips/trip-list.tsx` | ✅ Done |
| TripCard | `src/components/trips/trip-card.tsx` | ✅ Done |
| BookingForm | `src/components/bookings/booking-form.tsx` | ✅ Done |
| BookingTable | `src/components/bookings/booking-table.tsx` | ✅ Done |

#### Demo Flow
1. View all trips with dates, location, revenue summary
2. Click trip → see full breakdown with bookings
3. Add/edit bookings with participants
4. Track expenses and profitability

---

### Section 2: Campaign & Lead Discovery
**Location:** `/dashboard/campaigns`
**Status:** ✅ Implemented

#### Current Features
- Campaign creation with location/radius
- Multi-source lead discovery
- Lead scoring (0-100 scale)
- Lead filtering by score/source
- Bulk outreach actions

#### UI Components
| Component | File | Status |
|-----------|------|--------|
| CampaignForm | `src/components/campaigns/campaign-form.tsx` | ✅ Done |
| CampaignTable | `src/components/campaigns/dashboard-campaign-table.tsx` | ✅ Done |
| LeadsTable | `src/components/campaigns/leads-table-selectable.tsx` | ✅ Done |
| BulkActionsToolbar | `src/components/campaigns/bulk-actions-toolbar.tsx` | ✅ Done |

#### Demo Flow
1. View all campaigns with lead counts
2. Create new campaign: specify location + radius
3. Launch discovery → view scored leads
4. Select leads → bulk approve for outreach

---

### Section 3: Outreach & Automation
**Location:** `/dashboard/outreach`
**Status:** ⚠️ Partial (needs sequence UI)

#### Current Features
- Message templates library
- Email/SMS sending via Resend/Twilio
- Outreach logging and tracking
- Follow-up automation (cron job)

#### UI Components Needed
| Component | Purpose | Status |
|-----------|---------|--------|
| SequenceList | View all email sequences | ⏳ Needed |
| SequenceCard | Display sequence metrics | ⏳ Needed |
| TemplateLibrary | Browse/edit templates | ⏳ Needed |
| MessageTimeline | View sent messages | ⏳ Needed |

#### Demo Flow
1. View email sequences with engagement metrics
2. Browse template library
3. Track message delivery/opens/clicks
4. Pause/resume sequences

---

### Section 4: Find a Singing Group ⭐ PRIORITY
**Location:**
- Public form: `/find-group` (NEW)
- Admin dashboard: `/dashboard/groups`

**Status:** ⚠️ Needs Public Form + Enhanced Admin

#### Overview
This is a **key community feature** where visitors request help finding local singing groups. Deke personally matches them with groups - building goodwill and positioning as a servant leader.

#### User Flow: Visitor (Public)
```
1. Visitor lands on /find-group
2. Fills intake form:
   - Name, Email
   - Location (city/zip)
   - Age range preference
   - Music preferences (style, genre)
   - Experience level
   - Additional notes
3. Submits → receives confirmation
4. Deke reviews and personally responds
```

#### User Flow: Admin (Dashboard)
```
1. View all requests in list/card view
2. Filter by location, age, preferences, status
3. Search by name or location
4. View request details
5. Match with local groups (manual or suggested)
6. Update status: New → In Progress → Matched → Responded
7. Send personal response email
```

#### UI Components Needed

**Public Form (`/find-group`)**
| Component | Purpose | Status |
|-----------|---------|--------|
| GroupFinderPage | Landing page with form | ⏳ NEW |
| GroupRequestForm | Multi-step intake form | ⏳ NEW |
| LocationAutocomplete | City/zip input with geo | ⏳ NEW |
| MusicPreferenceSelector | Style/genre picker | ⏳ NEW |
| ConfirmationMessage | Success state | ⏳ NEW |

**Admin Dashboard (`/dashboard/groups`)**
| Component | Purpose | Status |
|-----------|---------|--------|
| RequestList | List/grid of requests | ⚠️ Exists (placeholder) |
| RequestCard | Individual request card | ⏳ NEW |
| RequestFilters | Filter by location/age/prefs | ⏳ NEW |
| RequestDetail | Full request view + actions | ⏳ NEW |
| MatchSuggestions | AI-suggested group matches | ⏳ Future |
| StatusBadge | Request status indicator | ⏳ NEW |

#### Database Model (Already in Design)
```prisma
model GroupRequest {
  id                String   @id @default(cuid())
  name              String
  email             String
  location          String
  latitude          Float?
  longitude         Float?
  ageRange          String   // "youth", "adult", "senior", "all"
  musicPreferences  String?  // JSON array of preferences
  experienceLevel   String?  // "beginner", "intermediate", "advanced"
  notes             String?
  status            String   @default("NEW") // NEW, IN_PROGRESS, MATCHED, RESPONDED
  matchedGroups     String?  // JSON array of matched venue IDs
  matchScore        Int?     // Overall match quality 0-100
  respondedAt       DateTime?
  responseNotes     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

#### API Endpoints Needed
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/group-requests` | Submit new request |
| GET | `/api/group-requests` | List all (admin) |
| GET | `/api/group-requests/[id]` | Get single request |
| PATCH | `/api/group-requests/[id]` | Update status/match |
| DELETE | `/api/group-requests/[id]` | Remove request |

---

### Section 5: Service Offerings
**Location:** `/services`, `/speaking`, `/coaching`, etc.
**Status:** ✅ Implemented

#### Current Features
- Service cards on homepage
- Individual service pages
- Pricing display
- Booking CTAs

#### Demo Flow
1. Browse services overview
2. Click service → detailed page
3. View pricing, features, testimonials
4. Request booking

---

### Section 6: Harmony AI Chat
**Location:** Floating widget on all pages
**Status:** ✅ Implemented

#### Current Features
- AI-powered chat assistant
- Lead qualification
- Service recommendations
- Booking guidance

#### Demo Flow
1. Click chat bubble → opens Harmony
2. Ask about services
3. Harmony guides to appropriate action
4. Can trigger group finder flow

---

## Demo Priority Implementation Plan

### Phase 1: Core Demo (Tomorrow)

#### 1.1 Public "Find a Singing Group" Form
**Priority:** HIGH
**Effort:** Medium

Create `/src/app/find-group/page.tsx`:
- Hero section explaining the service
- Multi-step form with validation
- Location input with geocoding
- Age and music preference selectors
- Submit → confirmation screen
- Store in database

#### 1.2 Enhanced Groups Admin Dashboard
**Priority:** HIGH
**Effort:** Medium

Update `/src/app/dashboard/groups/page.tsx`:
- Replace placeholder with real data
- Request cards with key info
- Filter/search controls
- Status management
- Expandable detail view

#### 1.3 GroupRequest Prisma Model
**Priority:** HIGH
**Effort:** Low

Add to `prisma/schema.prisma`:
```prisma
model GroupRequest {
  id                String   @id @default(cuid())
  name              String
  email             String
  location          String
  latitude          Float?
  longitude         Float?
  ageRange          String
  musicPreferences  String?
  experienceLevel   String?
  notes             String?
  status            String   @default("NEW")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### Phase 2: Polish (Post-Demo)

- Sequence management UI
- Enhanced outreach tracking
- Match suggestion algorithm
- Email response integration
- Analytics dashboard

---

## Demo Script

### 1. Landing Experience (2 min)
- Show homepage with services
- Highlight credentials and testimonials
- Point out Harmony chat widget

### 2. Find a Singing Group - Public (3 min)
- Navigate to `/find-group`
- Fill out form as a demo visitor
- Show confirmation message
- Explain the value proposition

### 3. Dashboard - Trip Management (3 min)
- Log in to dashboard
- Show trip list with profitability
- Drill into a trip
- Show bookings and expenses

### 4. Dashboard - Campaigns (3 min)
- Navigate to Campaigns
- Show existing campaigns with leads
- Demonstrate lead scoring
- Show bulk selection for outreach

### 5. Dashboard - Groups Admin (3 min)
- Navigate to Groups
- Show the request that was just submitted
- Update status to "In Progress"
- Show how Deke would respond

### 6. Harmony Chat (2 min)
- Open Harmony widget
- Ask about services
- Show AI-guided conversation

---

## Technical Architecture

### Frontend Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui
- **State:** React Server Components + minimal client state

### Backend Stack
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma 7
- **Email:** Resend
- **SMS:** Twilio
- **AI:** Claude API

### File Structure
```
src/
├── app/
│   ├── (public)/           # Public pages
│   │   ├── find-group/     # NEW: Group finder form
│   │   ├── services/
│   │   └── ...
│   ├── dashboard/
│   │   ├── groups/         # ENHANCE: Admin view
│   │   ├── campaigns/
│   │   ├── outreach/
│   │   └── ...
│   └── api/
│       ├── group-requests/ # NEW: Group request API
│       ├── campaigns/
│       └── ...
├── components/
│   ├── groups/             # NEW: Group finder components
│   │   ├── request-form.tsx
│   │   ├── request-card.tsx
│   │   ├── request-list.tsx
│   │   └── status-badge.tsx
│   ├── campaigns/
│   ├── trips/
│   └── ui/
└── lib/
    ├── validations/
    │   └── group-request.ts # NEW: Form validation
    └── ...
```

---

## Implementation Checklist

### Database
- [ ] Add GroupRequest model to Prisma schema
- [ ] Run migration: `npx prisma migrate dev`
- [ ] Add seed data for demo

### API Routes
- [ ] Create `/api/group-requests/route.ts` (POST, GET)
- [ ] Create `/api/group-requests/[id]/route.ts` (GET, PATCH, DELETE)
- [ ] Add validation with Zod

### Public Pages
- [ ] Create `/find-group/page.tsx` with form
- [ ] Add location autocomplete
- [ ] Add form validation
- [ ] Add success confirmation

### Dashboard
- [ ] Update `/dashboard/groups/page.tsx`
- [ ] Create request list component
- [ ] Create request card component
- [ ] Add filter controls
- [ ] Add status management

### Navigation
- [ ] Add "Find a Singing Group" to public nav
- [ ] Ensure dashboard nav is complete

### Testing
- [ ] Test form submission
- [ ] Test admin view
- [ ] Test status updates
- [ ] Mobile responsive check

---

## Existing API Endpoints Reference

### Campaigns
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST/GET | `/api/campaigns` | Create/list campaigns |
| GET/PATCH/DELETE | `/api/campaigns/[id]` | Campaign operations |
| POST | `/api/campaigns/[id]/discover` | Launch discovery |
| POST | `/api/campaigns/[id]/approve` | Approve campaign |
| POST | `/api/campaigns/[id]/launch` | Launch outreach |
| POST | `/api/campaigns/[id]/send-bulk` | Bulk send |

### Bookings
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST/GET | `/api/bookings` | Create/list bookings |
| GET/PATCH/DELETE | `/api/bookings/[id]` | Booking operations |
| POST | `/api/bookings/[id]/calculate-split` | Revenue split |

### Leads
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST/GET | `/api/leads` | Create/list leads |
| GET/PATCH/DELETE | `/api/leads/[id]` | Lead operations |

### Templates
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST/GET | `/api/templates` | Message templates |

### Chat (Harmony)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/chat` | Send message |
| GET | `/api/chat/history` | Get history |

---

## Data Model Reference

### Core Entities (14 total)
1. **Trip** - Travel grouping bookings
2. **Booking** - Confirmed gigs
3. **Expense** - Trip costs
4. **Participant** - Booking attendees
5. **Campaign** - Lead discovery efforts
6. **Lead** - Discovered opportunities
7. **Venue** - Groups/organizations
8. **Contact** - People at venues
9. **EmailSequence** - Automated flows
10. **Message** - Individual communications
11. **Template** - Reusable messages
12. **GroupRequest** - "Find a Group" submissions ⭐
13. **ServiceOffering** - Public services
14. **ChatConversation** - Harmony sessions

---

## Success Metrics for Demo

### Must Have
- [ ] Public form submits and stores data
- [ ] Admin can view submitted requests
- [ ] Admin can update request status
- [ ] Mobile-responsive on all pages
- [ ] Dark/light mode works

### Nice to Have
- [ ] Location autocomplete working
- [ ] Match suggestions displayed
- [ ] Email notification on submit
- [ ] Bulk actions in admin

---

## Appendix: Design OS Reference

The full design specifications are located in `/deke-design/`:

```
deke-design/
├── product/
│   ├── product-overview.md       # Vision & problems
│   ├── product-roadmap.md        # Feature sections
│   ├── data-model/
│   │   └── data-model.md         # 14 entities
│   ├── design-system/
│   │   ├── colors.json           # lime/stone
│   │   └── typography.json       # DM Sans
│   ├── shell/
│   │   └── spec.md               # Navigation
│   └── sections/
│       ├── dashboard-and-trip-management/
│       ├── campaign-and-lead-discovery/
│       ├── outreach-and-automation/
│       ├── find-a-singing-group/  # ⭐ Key section
│       └── service-offerings/
└── src/sections/                  # Preview components
```

---

**End of Design UI Plan**

*Ready for Deke Demo - January 20, 2026*
