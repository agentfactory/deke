# Outreach Engine Flow Diagram

## Campaign Launch Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Campaign Launch Request                       │
│  POST /api/campaigns/{id}/launch                                │
│  { channel: "EMAIL" | "SMS", templateId?: string }              │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Validate Campaign   │
          │  - Status = APPROVED │
          │  - Has pending leads │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Load Template       │
          │  1. Custom template  │
          │  2. Default template │
          │  3. Fallback         │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Create Jobs         │
          │  For each PENDING    │
          │  CampaignLead        │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Process Queue       │
          │  processOutreachQueue│
          └──────────┬───────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼────┐            ┌────▼────┐
    │  EMAIL  │            │   SMS   │
    └────┬────┘            └────┬────┘
         │                       │
         ▼                       ▼
 ┌───────────────┐      ┌───────────────┐
 │ Resend API    │      │ Twilio API    │
 │ sendEmail()   │      │ sendSMS()     │
 └───────┬───────┘      └───────┬───────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Create OutreachLog  │
          │  - channel           │
          │  - status: SENT      │
          │  - sentAt            │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Update CampaignLead │
          │  status: CONTACTED   │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Update Campaign     │
          │  status: ACTIVE      │
          │  launchedAt: now()   │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Return Results      │
          │  { sent, failed }    │
          └──────────────────────┘
```

## Template Rendering Flow

```
┌─────────────────────────────────────────────┐
│         Template + Variables                 │
│  "Hi {{firstName}} from {{organization}}"   │
│  { firstName: "John", organization: "Acme" }│
└────────────────────┬────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  renderTemplate()    │
          │  Replace {{key}}     │
          │  with vars[key]      │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Rendered Message    │
          │  "Hi John from Acme" │
          └──────────────────────┘
```

## Webhook Event Flow (Email)

```
┌─────────────────────────────────────────────┐
│          Email Sent via Resend              │
│  Tags: { campaignId, leadId, channel }      │
└────────────────────┬────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼────┐            ┌────▼────┐
    │DELIVERED│            │ BOUNCED │
    └────┬────┘            └────┬────┘
         │                      │
         ▼                      ▼
    ┌─────────┐         ┌──────────────┐
    │ OPENED  │         │ Suppression  │
    └────┬────┘         │ List         │
         │              └──────────────┘
         ▼
    ┌─────────┐
    │ CLICKED │
    └─────────┘

Each event:
1. POST /api/webhooks/resend
2. Find OutreachLog by campaignId + leadId
3. Update OutreachLog status
4. Update CampaignLead status
5. Add to Suppression if bounce/complaint
```

## Webhook Event Flow (SMS)

```
┌─────────────────────────────────────────────┐
│           SMS Sent via Twilio               │
│  To: lead.phone, From: TWILIO_PHONE_NUMBER  │
└────────────────────┬────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼────┐            ┌────▼────┐
    │DELIVERED│            │ FAILED  │
    └────┬────┘            └─────────┘
         │
         ▼
    ┌─────────────┐
    │ User Reply  │
    └──────┬──────┘
           │
     ┌─────┴─────┐
     │           │
┌────▼────┐ ┌───▼─────┐
│  STOP   │ │ Message │
└────┬────┘ └───┬─────┘
     │          │
     ▼          ▼
┌────────────┐ ┌──────────┐
│Suppression │ │RESPONDED │
│List        │ └──────────┘
└────────────┘

Each event:
1. POST /api/webhooks/twilio
2. Find Lead by phone number
3. Find OutreachLog for lead
4. Update OutreachLog status
5. Update CampaignLead status
6. Handle STOP → Suppression
```

## Database State Transitions

```
Campaign Status Flow:
DRAFT → APPROVED → ACTIVE → COMPLETED
                      ↓
                   PAUSED
                      ↓
                   ACTIVE

CampaignLead Status Flow:
PENDING → CONTACTED → OPENED → CLICKED → RESPONDED → BOOKED
                                    ↓
                                 DECLINED
                                    ↓
                                 REMOVED

OutreachLog Status Flow:
PENDING → SENT → DELIVERED → OPENED → CLICKED
            ↓         ↓
         FAILED    BOUNCED
                      ↓
                 RESPONDED
```

## Queue Processing Detail

```
processOutreachQueue(jobs[])
│
├─► For each job:
│   │
│   ├─► Fetch CampaignLead + Lead + Campaign
│   │
│   ├─► Render template with variables:
│   │   - firstName, lastName, email, phone
│   │   - organization
│   │   - baseLocation
│   │   - Custom variables
│   │
│   ├─► Send via provider:
│   │   ├─► EMAIL → sendEmail()
│   │   │   - to, subject, html
│   │   │   - tags: campaignId, leadId
│   │   │
│   │   └─► SMS → sendSMS()
│   │       - to, body (+ opt-out)
│   │       - campaignId, leadId in params
│   │
│   ├─► Create OutreachLog:
│   │   - campaignLeadId
│   │   - campaignId
│   │   - channel
│   │   - status: SENT or FAILED
│   │   - sentAt (if successful)
│   │   - errorMessage (if failed)
│   │
│   └─► Update CampaignLead:
│       - status: CONTACTED (if successful)
│
└─► Return results[]
    - { success, jobId, error?, provider? }
```

## Provider Integration

```
┌────────────────────────────────────────────────┐
│              Application Layer                  │
│  /api/campaigns/[id]/launch                    │
└──────────────────────┬─────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────┐
│              Queue System                       │
│  src/lib/outreach/queue.ts                     │
│  - processOutreachQueue()                      │
│  - Job orchestration                           │
└──────────────────────┬─────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
┌────────▼───────┐         ┌─────────▼────────┐
│ Email Provider │         │  SMS Provider    │
│ resend.ts      │         │  twilio.ts       │
│ - sendEmail()  │         │  - sendSMS()     │
└────────┬───────┘         └─────────┬────────┘
         │                           │
┌────────▼───────┐         ┌─────────▼────────┐
│  Resend API    │         │   Twilio API     │
│  External SaaS │         │  External SaaS   │
└────────┬───────┘         └─────────┬────────┘
         │                           │
         └─────────────┬─────────────┘
                       │
         ┌─────────────▼─────────────┐
         │      Webhook Events        │
         │  /api/webhooks/resend      │
         │  /api/webhooks/twilio      │
         └─────────────┬──────────────┘
                       │
         ┌─────────────▼─────────────┐
         │     Database Updates       │
         │  - OutreachLog             │
         │  - CampaignLead            │
         │  - Suppression             │
         └────────────────────────────┘
```

## Error Handling

```
Try {
  ┌─────────────────┐
  │ Send Message    │
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ Success?        │
  └────┬────────┬───┘
       │YES     │NO
       ▼        ▼
  ┌────────┐  ┌──────────────┐
  │Outreach│  │ OutreachLog  │
  │Log     │  │ status:FAILED│
  │SENT    │  │ errorMessage │
  └────────┘  └──────────────┘
       │
       ▼
  ┌──────────────┐
  │CampaignLead  │
  │status:       │
  │CONTACTED     │
  └──────────────┘
}
Catch {
  ┌──────────────┐
  │ Log Error    │
  │ Continue     │
  │ Next Job     │
  └──────────────┘
}
```

## Template Example

```
Template in Database:
┌────────────────────────────────────────────┐
│ MessageTemplate                             │
│ - name: "Workshop Opportunity"             │
│ - serviceType: "WORKSHOP"                  │
│ - channel: "EMAIL"                         │
│ - subject: "Workshop Opportunity in        │
│            {{baseLocation}}"               │
│ - body: "<p>Hi {{firstName}},</p>          │
│         <p>I'll be in {{baseLocation}}     │
│         and wanted to reach out about      │
│         workshop opportunities with        │
│         {{organization}}.</p>              │
│         <p>Best, Deke</p>"                 │
└────────────────────────────────────────────┘
                    │
                    ▼
         renderTemplate(body, vars)
                    │
                    ▼
Rendered Message:
┌────────────────────────────────────────────┐
│ <p>Hi John,</p>                            │
│ <p>I'll be in Los Angeles, CA and wanted  │
│ to reach out about workshop opportunities  │
│ with Acme Choir.</p>                       │
│ <p>Best, Deke</p>                          │
└────────────────────────────────────────────┘
```

## Suppression List Flow

```
Bounce/Complaint/OptOut Event
         │
         ▼
┌────────────────────┐
│ Upsert Suppression │
│ - email/phone      │
│ - reason           │
│ - source           │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Find Lead          │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Update             │
│ CampaignLead       │
│ status: REMOVED    │
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ Future campaigns   │
│ will skip this     │
│ lead (TODO)        │
└────────────────────┘
```

## Summary

The Outreach Engine orchestrates multi-channel outreach with:

1. **Queue System** - Batch processing with error handling
2. **Provider Abstraction** - Unified interface for email/SMS
3. **Template Rendering** - Dynamic variable substitution
4. **Webhook Integration** - Real-time event tracking
5. **Status Management** - Automatic state transitions
6. **Suppression List** - Compliance and opt-out handling

All flows are:
- ✅ Type-safe (TypeScript)
- ✅ Database-backed (Prisma)
- ✅ Error-tolerant (Try-catch all operations)
- ✅ Auditable (OutreachLog tracks everything)
- ✅ Compliant (Opt-out handling, suppression)
