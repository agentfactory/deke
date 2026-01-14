# Outreach Engine Implementation Summary

## Overview
Built the complete outreach infrastructure for the Opportunity Finder MVP, enabling campaigns to send emails and SMS messages to discovered leads with full tracking and webhook support.

## What Was Built

### 1. Email Provider (Resend)
**File:** `src/lib/outreach/providers/resend.ts`

- Integrated Resend API for email delivery
- HTML email support with subject personalization
- Campaign tracking via tags (campaignId, leadId, channel)
- Lazy client initialization to prevent build-time errors
- Standardized response interface

**Key Features:**
- Type-safe email sending with `SendEmailParams` interface
- Error handling with detailed error messages
- Campaign and lead ID tagging for webhook correlation

### 2. SMS Provider (Twilio)
**File:** `src/lib/outreach/providers/twilio.ts`

- Integrated Twilio API for SMS delivery
- Auto-appended opt-out message ("Reply STOP to unsubscribe")
- Lazy client initialization to prevent build-time errors
- Standardized response interface matching email provider

**Key Features:**
- Type-safe SMS sending with `SendSMSParams` interface
- Regulatory compliance with opt-out messaging
- Delivery status tracking via webhook

### 3. Template Renderer
**File:** `src/lib/outreach/template-renderer.ts`

Simple yet powerful template system using `{{variable}}` syntax:

**Functions:**
- `renderTemplate(template, vars)` - Render template with variable substitution
- `extractTemplateVariables(template)` - Get list of variables in template
- `validateTemplateVariables(template, vars)` - Validate all required variables present

**Features:**
- Preserves placeholders for missing variables
- Handles multiple occurrences of same variable
- Type-safe variable substitution

### 4. Outreach Queue System
**File:** `src/lib/outreach/queue.ts`

Core orchestration engine that processes outreach jobs:

**Main Function: `processOutreachQueue(jobs)`**
1. Fetches campaign lead with related data (lead, campaign)
2. Renders template with lead variables
3. Sends via appropriate provider (EMAIL or SMS)
4. Creates `OutreachLog` entry with status
5. Updates `CampaignLead` status to CONTACTED

**Helper Function: `getDefaultTemplate(serviceType, channel)`**
- Fetches default message template from database
- Supports service-specific templates
- Falls back to generic templates

**Automatic Variable Injection:**
- firstName, lastName, email, phone
- organization
- baseLocation (from campaign)
- Custom variables from job parameters

### 5. Campaign Launch API
**File:** `src/app/api/campaigns/[id]/launch/route.ts`

**Updated from stub to full implementation:**

**Request:**
```typescript
POST /api/campaigns/{id}/launch
{
  "channel": "EMAIL" | "SMS",
  "templateId": "optional-template-id"
}
```

**Workflow:**
1. Validates campaign status (must be APPROVED)
2. Fetches all PENDING leads
3. Loads message template (custom, default, or fallback)
4. Creates outreach jobs for all leads
5. Processes queue with real email/SMS delivery
6. Updates campaign status to ACTIVE
7. Returns detailed results

**Response:**
```json
{
  "message": "Campaign launched successfully",
  "campaign": { ... },
  "outreach": {
    "queued": 50,
    "sent": 48,
    "failed": 2,
    "channel": "EMAIL"
  },
  "results": [...]
}
```

### 6. Resend Webhook Handler
**File:** `src/app/api/webhooks/resend/route.ts`

Handles email delivery events:

**Event Types:**
- `email.delivered` → Updates OutreachLog status to DELIVERED
- `email.opened` → Status to OPENED, sets openedAt timestamp
- `email.clicked` → Status to CLICKED, sets clickedAt timestamp
- `email.bounced` → Adds to Suppression table
- `email.complained` → Adds to Suppression table (spam complaints)

**Features:**
- Correlates events via campaignId/leadId tags
- Updates both OutreachLog and CampaignLead status
- Automatic suppression list management
- Error logging for debugging

**TODO:** Webhook signature verification for security

### 7. Twilio Webhook Handler
**File:** `src/app/api/webhooks/twilio/route.ts`

Handles SMS delivery and reply events:

**Status Callbacks:**
- `delivered` → Updates status to DELIVERED
- `undelivered` → Updates status to FAILED
- `failed` → Updates status to FAILED with error

**Incoming Messages:**
- Detects STOP command → Adds to suppression list
- Detects replies → Updates status to RESPONDED
- Updates CampaignLead status automatically

**Features:**
- TwiML response for incoming messages
- Phone number normalization
- Automatic opt-out handling
- Lead matching by phone number

**TODO:** Twilio signature verification for security

### 8. Environment Variables
**File:** `.env` (updated)

Added required provider credentials:

```bash
# Resend (Email Provider)
RESEND_API_KEY=your_key_here
RESEND_FROM_EMAIL=deke@dekesharon.com

# Twilio (SMS Provider)
TWILIO_ACCOUNT_SID=your_sid_here
TWILIO_AUTH_TOKEN=your_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### 9. Documentation
**File:** `src/lib/outreach/README.md`

Comprehensive documentation covering:
- Architecture overview
- Core features and usage
- API endpoints
- Template variables
- Database schema
- Rate limits
- Error handling
- Security considerations
- Future enhancements

## Dependencies Installed

```bash
npm install resend twilio
```

**Added packages:**
- `resend` - Email delivery via Resend API
- `twilio` - SMS delivery via Twilio API
- 35 total packages added with dependencies

## Architecture Decisions

### 1. Lazy Client Initialization
Both Resend and Twilio clients are initialized lazily (on first use) rather than at module import time. This prevents build-time errors when environment variables are not set.

### 2. Standardized Response Interface
Both email and SMS providers return consistent response structure:
```typescript
{
  id: string        // Provider message ID
  success: boolean  // Delivery success
  error?: string    // Error message if failed
}
```

### 3. Simple Template System
Used `{{variable}}` syntax for simplicity and clarity. More sophisticated templating (loops, conditionals) can be added later if needed.

### 4. Database-Driven Templates
Templates stored in `MessageTemplate` table allow:
- Service-specific templates (WORKSHOP, SPEAKING, etc.)
- Channel-specific templates (EMAIL vs SMS)
- Easy updates without code changes
- Fallback to hardcoded templates if none exist

### 5. Automatic Status Updates
Webhook handlers automatically update:
- `OutreachLog` status (SENT → DELIVERED → OPENED → CLICKED)
- `CampaignLead` status (PENDING → CONTACTED → OPENED → CLICKED → RESPONDED)
- `Suppression` table for bounces and opt-outs

## Type Safety

All code is fully typed with TypeScript:
- Interface definitions for all parameters and responses
- Type-safe database queries via Prisma
- Strict null checks
- No `any` types

**Build verification:**
```bash
✓ TypeScript compilation successful
✓ Next.js build successful
✓ All API routes compiled
```

## Database Integration

Leverages existing Prisma schema:
- `OutreachLog` - Tracks every outreach attempt
- `CampaignLead` - Campaign-specific lead status
- `MessageTemplate` - Customizable message templates
- `Suppression` - Opt-outs and bounces

No schema changes required - all tables already existed.

## Error Handling

Comprehensive error handling throughout:
- Provider errors caught and logged
- Failed deliveries tracked in OutreachLog
- Validation errors before sending
- Webhook errors logged but don't break requests
- Missing environment variables handled gracefully

## Security Considerations

**Implemented:**
- Environment variable validation
- Opt-out message auto-appended to SMS
- Suppression list for bounces and complaints
- Error messages sanitized

**TODO for Production:**
- Webhook signature verification (Resend & Twilio)
- Rate limiting on API endpoints
- Email address validation before sending
- Check suppression list before queuing
- Encrypt sensitive data in logs

## Testing

Manual testing approach:
1. Set up Resend account and API key
2. Set up Twilio account and credentials
3. Create test campaign with leads
4. Approve campaign
5. Launch campaign via API
6. Verify emails/SMS received
7. Test webhooks by triggering events
8. Verify database updates

**TODO:** Add automated tests when Jest is configured

## Webhook Configuration

**Resend Webhook URL:**
```
POST https://yourdomain.com/api/webhooks/resend
```

**Twilio Webhook URLs:**
```
Status Callback: https://yourdomain.com/api/webhooks/twilio
SMS Webhook: https://yourdomain.com/api/webhooks/twilio
```

## Default Templates

Email template (if no MessageTemplate exists):
```
Subject: Exploring Performance Opportunities in Your Area

Hi {{firstName}},

I'm Deke Sharon, and I'll be in your area near {{organization}} soon.
I wanted to reach out about potential performance or workshop opportunities.

With over 30 years of experience in vocal performance and arranging,
I'd love to explore how we might work together.

Would you be interested in discussing this further?

Best regards,
Deke Sharon
```

SMS template (if no MessageTemplate exists):
```
Hi {{firstName}}, Deke Sharon here. I'll be in your area near {{organization}}
soon. Interested in discussing performance opportunities? Let me know!

Reply STOP to unsubscribe
```

## Rate Limits

**Recommended for Production:**
- Email: 1000/day (Resend default tier)
- SMS: 50/day (cost consideration)

**TODO:** Implement queue throttling in `processOutreachQueue`

## Future Enhancements

Documented in README.md:
- LinkedIn outreach integration
- Rate limiting implementation
- Scheduled send times
- A/B testing templates
- Webhook signature verification
- Retry logic for failed sends
- Analytics dashboard
- Cost tracking per campaign

## Files Created/Modified

**Created:**
1. `src/lib/outreach/providers/resend.ts` (84 lines)
2. `src/lib/outreach/providers/twilio.ts` (65 lines)
3. `src/lib/outreach/template-renderer.ts` (40 lines)
4. `src/lib/outreach/queue.ts` (160 lines)
5. `src/lib/outreach/README.md` (320 lines)
6. `src/app/api/webhooks/resend/route.ts` (150 lines)
7. `src/app/api/webhooks/twilio/route.ts` (160 lines)

**Modified:**
1. `src/app/api/campaigns/[id]/launch/route.ts` (178 lines) - Updated from stub to real implementation
2. `.env` - Added Resend and Twilio credentials
3. `package.json` - Added resend and twilio dependencies

**Total:** 7 new files, 3 modified files, ~1,157 lines of code

## Status

✅ Core outreach infrastructure complete
✅ Email delivery via Resend integrated
✅ SMS delivery via Twilio integrated
✅ Template rendering system built
✅ Queue processing system built
✅ Campaign launch API updated
✅ Webhook handlers implemented
✅ Environment variables configured
✅ Documentation created
✅ Type checking passing
✅ Build successful

**Ready for MVP testing with real credentials!**

## Next Steps

1. Set up Resend account and get API key
2. Set up Twilio account and get credentials
3. Update `.env` with real credentials
4. Configure webhook URLs in provider dashboards
5. Test with small campaign (5-10 leads)
6. Monitor OutreachLog entries
7. Verify webhook events received
8. Add rate limiting if needed
9. Implement webhook signature verification
10. Deploy to production

## Usage Example

```bash
# 1. Create campaign and discover leads
POST /api/campaigns
POST /api/campaigns/{id}/discover

# 2. Approve campaign
POST /api/campaigns/{id}/approve

# 3. Launch campaign with email outreach
POST /api/campaigns/{id}/launch
{
  "channel": "EMAIL",
  "templateId": "optional-template-id"
}

# 4. Monitor results
GET /api/campaigns/{id}

# 5. Webhook events automatically update statuses
# - OutreachLog: SENT → DELIVERED → OPENED → CLICKED
# - CampaignLead: PENDING → CONTACTED → OPENED → CLICKED → RESPONDED
```

## Success Metrics

Campaigns can now:
- ✅ Send emails to discovered leads via Resend
- ✅ Send SMS to discovered leads via Twilio
- ✅ Track delivery, opens, clicks, and responses
- ✅ Handle opt-outs and bounces automatically
- ✅ Use customizable templates with variable substitution
- ✅ Update lead status based on engagement
- ✅ Maintain suppression list for compliance

**The Opportunity Finder MVP now has a fully functional outreach engine!**
