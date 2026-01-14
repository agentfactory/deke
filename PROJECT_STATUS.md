# Local Opportunity Finder - Project Status

**Project Start Date:** 2026-01-09
**Estimated Completion:** 2026-04-09 (13 weeks)
**Current Phase:** Not Started

---

## 📊 Overall Progress: 0% Complete

```
Phase 1: ░░░░░░░░░░ 0%
Phase 2: ░░░░░░░░░░ 0%
Phase 3: ░░░░░░░░░░ 0%
Phase 4: ░░░░░░░░░░ 0%
Phase 5: ░░░░░░░░░░ 0%
Phase 6: ░░░░░░░░░░ 0%
Phase 7: ░░░░░░░░░░ 0%
Phase 8: ░░░░░░░░░░ 0%
Phase 9: ░░░░░░░░░░ 0%
```

---

## PHASE 1: Foundation & Manual Campaign Creation (Week 1-2)

**Status:** ⏸️ Not Started
**Progress:** 0/3 tasks complete

### Tasks

- [ ] **1.1 Database Migration**
  - [ ] Add new models to `prisma/schema.prisma`:
    - [ ] Campaign model
    - [ ] CampaignLead model
    - [ ] OutreachLog model
    - [ ] GeoPreference model
    - [ ] MessageTemplate model
  - [ ] Extend Lead model (latitude, longitude, lastContactedAt, campaignLeads)
  - [ ] Extend Booking model (latitude, longitude, campaigns)
  - [ ] Run `npx prisma migrate dev --name add_opportunity_finder`
  - [ ] Seed GeoPreference table with initial countries (USA, Japan, UK, etc.)

- [ ] **1.2 Basic Campaign API**
  - [ ] Create `src/app/api/campaigns/route.ts` (POST create, GET list)
  - [ ] Create `src/app/api/campaigns/[id]/route.ts` (GET single, PATCH update, DELETE)
  - [ ] Test API endpoints with curl/Postman

- [ ] **1.3 Campaign List Dashboard**
  - [ ] Create `src/app/dashboard/opportunities/campaigns/page.tsx`
  - [ ] Create `src/components/campaigns/campaign-card.tsx`
  - [ ] Implement filter by status (DRAFT, ACTIVE, COMPLETED)
  - [ ] Add "Create Campaign" button with modal/form
  - [ ] Test: Create manual campaign, view in dashboard

**Files Created:**
- None yet

**Blockers:** None

---

## PHASE 2: Lead Discovery Engine (Week 3-4)

**Status:** ⏸️ Not Started
**Progress:** 0/7 tasks complete

### Tasks

- [ ] **2.1 Past Clients Discovery**
  - [ ] Create `src/lib/discovery/past-clients.ts`
  - [ ] Implement Haversine distance formula
  - [ ] Query Lead + Booking tables (status = WON, within radius)
  - [ ] Test with sample data

- [ ] **2.2 Dormant Leads Discovery**
  - [ ] Create `src/lib/discovery/dormant-leads.ts`
  - [ ] Query Inquiry table (status = DECLINED/EXPIRED, >6 months old)
  - [ ] Filter by geographic radius
  - [ ] Test with sample data

- [ ] **2.3 Similar Organizations Pattern Matching**
  - [ ] Create `src/lib/discovery/similar-orgs.ts`
  - [ ] Extract organization type from booking venue
  - [ ] Search Lead database for similar patterns
  - [ ] (Optional) Integrate Google Places API
  - [ ] Test with sample data

- [ ] **2.4 AI Web Research Agent**
  - [ ] Create `src/lib/discovery/ai-research.ts`
  - [ ] Integrate web search API (SerpAPI or Bing API)
  - [ ] Extract contact information from search results
  - [ ] Validate email formats
  - [ ] Test with sample searches

- [ ] **2.5 Opportunity Scoring**
  - [ ] Create `src/lib/discovery/scorer.ts`
  - [ ] Implement scoring algorithm (0-100 scale)
  - [ ] Factors: lead type, recency, distance, organization match
  - [ ] Test scoring accuracy

- [ ] **2.6 Lead Deduplication**
  - [ ] Create `src/lib/discovery/deduplicator.ts`
  - [ ] Merge leads with same email across sources
  - [ ] Prioritize highest-scoring source
  - [ ] Test with duplicate data

- [ ] **2.7 Discovery API**
  - [ ] Create `src/app/api/campaigns/[id]/discover/route.ts`
  - [ ] Run all 4 discovery sources in parallel
  - [ ] Deduplicate and score leads
  - [ ] Store in CampaignLead table
  - [ ] Test full discovery flow

**Files Created:**
- None yet

**Blockers:** None

---

## PHASE 3: Service Recommendation Engine (Week 5)

**Status:** ⏸️ Not Started
**Progress:** 0/3 tasks complete

### Tasks

- [ ] **3.1 Recommendation Logic**
  - [ ] Create `src/lib/recommendations/service-matcher.ts`
  - [ ] Implement service-to-service recommendations (SPEAKING → WORKSHOP, etc.)
  - [ ] Implement org-specific recommendations (UNIVERSITY → WORKSHOP, etc.)
  - [ ] Test recommendation accuracy

- [ ] **3.2 Message Templates**
  - [ ] Create seed script `prisma/seeds/message-templates.ts`
  - [ ] Write templates for each service + lead type combo
  - [ ] Include variables: {{firstName}}, {{location}}, {{dates}}, {{services}}
  - [ ] Seed database with templates

- [ ] **3.3 Recommendations API**
  - [ ] Create `src/app/api/recommendations/[serviceType]/route.ts`
  - [ ] Return recommended services for given service type
  - [ ] Test API endpoint

**Files Created:**
- None yet

**Blockers:** None

---

## PHASE 4: Campaign Review Dashboard (Week 6-7)

**Status:** ⏸️ Not Started
**Progress:** 0/9 tasks complete

### Tasks

- [ ] **4.1 Install Dependencies**
  - [ ] Run `npm install react-leaflet leaflet`
  - [ ] Run `npm install @tanstack/react-table` (if needed)
  - [ ] Install types: `npm install -D @types/leaflet`

- [ ] **4.2 Campaign Detail Page**
  - [ ] Create `src/app/dashboard/opportunities/campaigns/[id]/page.tsx`
  - [ ] Campaign overview card (dates, location, metrics)
  - [ ] Status badge

- [ ] **4.3 Interactive Map Component**
  - [ ] Create `src/components/campaigns/campaign-map.tsx`
  - [ ] Display base location pin
  - [ ] Draw radius circle (editable)
  - [ ] Show lead markers (color by type)
  - [ ] Add radius slider
  - [ ] Real-time lead count update on radius change

- [ ] **4.4 Lead Table Component**
  - [ ] Create `src/components/campaigns/lead-table.tsx`
  - [ ] Columns: Name, Org, Type, Score, Distance, Status
  - [ ] Sortable columns
  - [ ] Filter by lead type
  - [ ] Bulk actions: Remove, Export CSV
  - [ ] Row click for details

- [ ] **4.5 Message Editor Component**
  - [ ] Create `src/components/campaigns/message-editor.tsx`
  - [ ] Template selector dropdown
  - [ ] Preview with real lead data
  - [ ] Edit subject/body fields
  - [ ] Variable hints display

- [ ] **4.6 Approval Controls Component**
  - [ ] Create `src/components/campaigns/approval-controls.tsx`
  - [ ] "Save Draft" button
  - [ ] "Approve & Schedule" button with date picker
  - [ ] "Launch Now" button with confirmation
  - [ ] "Cancel Campaign" button

- [ ] **4.7 Approval API**
  - [ ] Create `src/app/api/campaigns/[id]/approve/route.ts`
  - [ ] Update campaign status to APPROVED
  - [ ] Set approvedAt, approvedBy

- [ ] **4.8 Launch API**
  - [ ] Create `src/app/api/campaigns/[id]/launch/route.ts`
  - [ ] Update status to ACTIVE
  - [ ] Queue outreach for all leads

- [ ] **4.9 User Acceptance Testing**
  - [ ] Test with Deke: Create campaign, adjust radius, review leads
  - [ ] Test: Customize messages, approve campaign
  - [ ] Collect feedback and iterate

**Files Created:**
- None yet

**Blockers:** None

---

## PHASE 5: Multi-Channel Outreach Engine (Week 8-9)

**Status:** ⏸️ Not Started
**Progress:** 0/8 tasks complete

### Tasks

- [ ] **5.1 Install Dependencies**
  - [ ] Run `npm install resend`
  - [ ] Run `npm install twilio`
  - [ ] Set up environment variables

- [ ] **5.2 Email Provider**
  - [ ] Create `src/lib/outreach/email-provider.ts`
  - [ ] Resend integration (send email, track open/click)
  - [ ] Test with sample email

- [ ] **5.3 SMS Provider**
  - [ ] Create `src/lib/outreach/sms-provider.ts`
  - [ ] Twilio integration (send SMS, handle STOP keyword)
  - [ ] Test with sample SMS

- [ ] **5.4 Outreach Queue**
  - [ ] Create `src/lib/outreach/queue.ts`
  - [ ] Simple queue implementation (later: Redis Bull)
  - [ ] Process outreach jobs

- [ ] **5.5 Rate Limiter**
  - [ ] Create `src/lib/outreach/rate-limiter.ts`
  - [ ] Email: 1,000/day initially
  - [ ] SMS: 50/day
  - [ ] Test rate limiting

- [ ] **5.6 Outreach API**
  - [ ] Create `src/app/api/outreach/send/route.ts`
  - [ ] Send to single lead (internal use)
  - [ ] Create OutreachLog record
  - [ ] Handle errors

- [ ] **5.7 Webhook Handlers**
  - [ ] Create `src/app/api/webhooks/email/route.ts` (Resend webhooks)
  - [ ] Create `src/app/api/webhooks/sms/route.ts` (Twilio webhooks)
  - [ ] Update OutreachLog on delivery/open/click
  - [ ] Test webhook reception

- [ ] **5.8 Compliance**
  - [ ] Add unsubscribe link to email templates
  - [ ] Implement opt-out handling (emails, SMS STOP)
  - [ ] Create suppression list table/logic
  - [ ] Test opt-out flows

**Files Created:**
- None yet

**Blockers:** Need API keys (RESEND_API_KEY, TWILIO credentials)

**Environment Variables Needed:**
```env
RESEND_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

---

## PHASE 6: Smart Follow-Up Automation (Week 10)

**Status:** ⏸️ Not Started
**Progress:** 0/4 tasks complete

### Tasks

- [ ] **6.1 Cadence Rules Engine**
  - [ ] Create `src/lib/follow-up/cadence.ts`
  - [ ] Define follow-up rules by lead type
  - [ ] Warm: 1 follow-up @ day 7
  - [ ] Dormant: 2 follow-ups @ days 5, 12
  - [ ] Cold: 0 follow-ups

- [ ] **6.2 Follow-Up Scheduler**
  - [ ] Create `src/lib/follow-up/scheduler.ts`
  - [ ] Calculate next follow-up date based on lead type
  - [ ] Queue follow-up outreach
  - [ ] Implement pause logic (if lead responds)

- [ ] **6.3 Follow-Up Cron Job**
  - [ ] Create `src/app/api/cron/follow-up/route.ts`
  - [ ] Run daily (check for due follow-ups)
  - [ ] Queue follow-ups via outreach queue
  - [ ] Test cron execution

- [ ] **6.4 Manual Pause API**
  - [ ] Create `src/app/api/campaigns/[id]/leads/[leadId]/pause/route.ts`
  - [ ] Allow manual pause of follow-ups
  - [ ] Test pause functionality

**Files Created:**
- None yet

**Blockers:** None

---

## PHASE 7: Performance Tracking & Analytics (Week 11)

**Status:** ⏸️ Not Started
**Progress:** 0/6 tasks complete

### Tasks

- [ ] **7.1 Install Dependencies**
  - [ ] Run `npm install recharts`

- [ ] **7.2 Analytics API**
  - [ ] Create `src/app/api/analytics/campaigns/[id]/route.ts`
  - [ ] Calculate campaign metrics (opens, clicks, responses, bookings)
  - [ ] Calculate conversion rates
  - [ ] Test metrics accuracy

- [ ] **7.3 Analytics Page**
  - [ ] Create `src/app/dashboard/opportunities/campaigns/[id]/analytics/page.tsx`
  - [ ] Display key metrics cards
  - [ ] Campaign timeline

- [ ] **7.4 Funnel Chart**
  - [ ] Create `src/components/analytics/funnel-chart.tsx`
  - [ ] Visualize: sent → opened → clicked → responded → booked
  - [ ] Test with sample data

- [ ] **7.5 Channel Comparison Chart**
  - [ ] Create `src/components/analytics/channel-comparison.tsx`
  - [ ] Compare email vs SMS vs LinkedIn performance
  - [ ] Test with sample data

- [ ] **7.6 Export Report**
  - [ ] Create `src/app/api/analytics/export/route.ts`
  - [ ] Generate CSV report
  - [ ] Include all campaign metrics and lead data
  - [ ] Test CSV generation

**Files Created:**
- None yet

**Blockers:** None

---

## PHASE 8: CSV Import & Manual Lead Management (Week 12)

**Status:** ⏸️ Not Started
**Progress:** 0/5 tasks complete

### Tasks

- [ ] **8.1 Install Dependencies**
  - [ ] Run `npm install papaparse`
  - [ ] Run `npm install -D @types/papaparse`

- [ ] **8.2 CSV Parser**
  - [ ] Create `src/lib/import/csv-parser.ts`
  - [ ] Parse CSV file
  - [ ] Validate required fields (email, firstName, lastName)
  - [ ] Test with various CSV formats

- [ ] **8.3 Geocoder**
  - [ ] Create `src/lib/import/geocoder.ts`
  - [ ] Convert addresses to lat/lon
  - [ ] Use free service (OpenStreetMap Nominatim)
  - [ ] Test geocoding accuracy

- [ ] **8.4 Import UI**
  - [ ] Create `src/app/dashboard/opportunities/campaigns/[id]/import/page.tsx`
  - [ ] Create `src/components/campaigns/csv-uploader.tsx` (drag-and-drop)
  - [ ] Create `src/components/campaigns/column-mapper.tsx` (map CSV columns)
  - [ ] Preview leads before import
  - [ ] Test full import flow

- [ ] **8.5 Import API**
  - [ ] Create `src/app/api/campaigns/[id]/leads/import/route.ts`
  - [ ] Parse CSV
  - [ ] Validate and deduplicate
  - [ ] Geocode addresses
  - [ ] Insert CampaignLead records
  - [ ] Test with sample CSV files

**Files Created:**
- None yet

**Blockers:** None

---

## PHASE 9: Auto-Trigger from Bookings (Week 13)

**Status:** ⏸️ Not Started
**Progress:** 0/4 tasks complete

### Tasks

- [ ] **9.1 Booking Monitor**
  - [ ] Create `src/lib/triggers/booking-monitor.ts`
  - [ ] Detect new/updated bookings
  - [ ] Check: startDate > NOW() + 2 weeks
  - [ ] Check: no existing campaign for booking

- [ ] **9.2 Check Bookings Cron Job**
  - [ ] Create `src/app/api/cron/check-bookings/route.ts`
  - [ ] Run daily
  - [ ] For each qualifying booking: create draft campaign
  - [ ] Trigger lead discovery
  - [ ] Send notification to Deke

- [ ] **9.3 Campaign Notification**
  - [ ] Create `src/app/api/notifications/campaign-ready/route.ts`
  - [ ] Send email to Deke: "Campaign ready for [location]"
  - [ ] Create dashboard notification/alert
  - [ ] Test notification delivery

- [ ] **9.4 End-to-End Testing**
  - [ ] Create test booking with future date
  - [ ] Run cron job manually
  - [ ] Verify campaign auto-created
  - [ ] Verify notification received
  - [ ] Test full flow: auto-generate → review → approve → launch

**Files Created:**
- None yet

**Blockers:** Need to set up cron job runner (Vercel Cron or similar)

---

## 📝 Pre-Development Checklist

- [ ] **Questions for Deke Answered**
  - [ ] Geographic preferences (default radius by country)
  - [ ] Outreach timing (X weeks before trip)
  - [ ] Lead prioritization (show all or top N?)
  - [ ] Response handling (which inbox?)
  - [ ] Budget constraints (max emails/SMS per campaign)
  - [ ] Brand voice (example outreach messages)

- [ ] **Environment Setup**
  - [ ] Database URL configured
  - [ ] Resend API key obtained
  - [ ] Twilio account set up
  - [ ] Cal.com integration planned
  - [ ] Geocoding service chosen

- [ ] **Design Assets**
  - [ ] Example outreach email templates
  - [ ] SMS message templates
  - [ ] LinkedIn message templates

---

## 🚀 Next Actions

1. **Review plan with client** - Get sign-off on approach
2. **Answer Deke's questions** - See "Pre-Development Checklist" above
3. **Set up development environment** - API keys, database access
4. **Start Phase 1** - Database migration and basic campaign API

---

## 📊 Velocity Tracking

| Week | Phase | Tasks Completed | Tasks Remaining | Notes |
|------|-------|-----------------|-----------------|-------|
| 1    | -     | 0               | 47              | Project kickoff |
| 2    | -     | -               | -               | -     |
| 3    | -     | -               | -               | -     |
| 4    | -     | -               | -               | -     |
| 5    | -     | -               | -               | -     |

---

## 🐛 Known Issues

None yet

---

## 💡 Ideas / Future Enhancements

- AI Response Handler (auto-detect positive responses)
- Predictive lead scoring (ML model)
- Multi-touch attribution
- CRM integration (HubSpot, Salesforce)
- Mobile app for campaign approval

---

**Last Updated:** 2026-01-09
**Updated By:** Claude
