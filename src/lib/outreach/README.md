# Outreach Engine

The Outreach Engine powers the Opportunity Finder's campaign execution, handling email and SMS delivery with provider integrations, template rendering, and webhook processing.

## Architecture

```
src/lib/outreach/
├── providers/
│   ├── resend.ts       # Email via Resend
│   └── twilio.ts       # SMS via Twilio
├── queue.ts            # Job processing & delivery
├── template-renderer.ts # {{variable}} substitution
└── __tests__/          # Unit tests
```

## Core Features

### 1. Multi-Channel Delivery

**Email (Resend)**
- HTML email support
- Subject line personalization
- Campaign tracking tags
- Webhook events (delivered, opened, clicked, bounced)

**SMS (Twilio)**
- Text message delivery
- Auto-appended opt-out message
- Delivery status tracking
- Reply handling (including STOP)

### 2. Template Rendering

Simple variable substitution using `{{variable}}` syntax:

```typescript
import { renderTemplate } from '@/lib/outreach/template-renderer'

const template = 'Hi {{firstName}}, I\'ll be near {{organization}} soon!'
const rendered = renderTemplate(template, {
  firstName: 'John',
  organization: 'Acme Choir'
})
// Result: "Hi John, I'll be near Acme Choir soon!"
```

**Available Functions:**
- `renderTemplate(template, vars)` - Render template with variables
- `extractTemplateVariables(template)` - Get list of variables in template
- `validateTemplateVariables(template, vars)` - Check if all variables provided

### 3. Outreach Queue

Process batches of outreach jobs with automatic logging:

```typescript
import { processOutreachQueue } from '@/lib/outreach/queue'

const jobs = [
  {
    campaignLeadId: 'lead-123',
    channel: 'EMAIL',
    template: 'Hi {{firstName}}, ...',
    variables: { subject: 'Opportunity' }
  }
]

const results = await processOutreachQueue(jobs)
// Returns: [{ success: true, jobId: 'lead-123', provider: 'email' }]
```

**What it does:**
1. Fetches campaign lead with related data
2. Renders template with lead variables
3. Sends via appropriate provider (Resend or Twilio)
4. Creates `OutreachLog` entry
5. Updates `CampaignLead` status to CONTACTED

### 4. Webhook Handlers

**Resend Webhook** (`/api/webhooks/resend`)
Handles email events:
- `email.delivered` - Updates status to DELIVERED
- `email.opened` - Updates status to OPENED, sets openedAt
- `email.clicked` - Updates status to CLICKED, sets clickedAt
- `email.bounced` - Adds to suppression list
- `email.complained` - Adds to suppression list

**Twilio Webhook** (`/api/webhooks/twilio`)
Handles SMS events:
- Delivery status updates
- Reply detection
- STOP command (auto-suppression)
- Updates campaign lead status on response

## Usage

### Launching a Campaign

```bash
POST /api/campaigns/{id}/launch
Content-Type: application/json

{
  "channel": "EMAIL",
  "templateId": "optional-template-id"
}
```

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
  }
}
```

### Template Variables

Lead data automatically available in templates:
- `{{firstName}}` - Lead first name
- `{{lastName}}` - Lead last name
- `{{email}}` - Lead email address
- `{{phone}}` - Lead phone number
- `{{organization}}` - Lead organization name
- `{{baseLocation}}` - Campaign base location

Custom variables can be passed in the `variables` object.

## Environment Variables

Required for production:

```bash
# Resend (Email)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=deke@dekesharon.com

# Twilio (SMS)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+15551234567
```

## Database Schema

### OutreachLog
Tracks every outreach attempt:
- `channel` - EMAIL, SMS, LINKEDIN
- `status` - PENDING, SENT, DELIVERED, OPENED, CLICKED, RESPONDED, FAILED, BOUNCED
- `sentAt`, `openedAt`, `clickedAt`, `respondedAt` - Event timestamps
- `errorMessage` - Error details if failed

### CampaignLead
Campaign-specific lead status:
- `status` - PENDING, CONTACTED, OPENED, CLICKED, RESPONDED, BOOKED, DECLINED, REMOVED
- Updated automatically by webhook events

### Suppression
Opt-outs and bounces:
- `email` or `phone` - Contact to suppress
- `reason` - opt_out, bounce, complaint, manual
- `source` - Which campaign triggered suppression

## Rate Limits

**Recommended limits:**
- Email: 1000/day (Resend default)
- SMS: 50/day (cost consideration)

Implement in queue processor for production:
```typescript
// TODO: Add rate limiting
if (sentToday >= dailyLimit) {
  // Queue for tomorrow
}
```

## Error Handling

All providers return standardized response:
```typescript
{
  id: string        // Provider message ID
  success: boolean  // True if sent successfully
  error?: string    // Error message if failed
}
```

Failed deliveries:
- Create OutreachLog with status FAILED
- Store error message
- Don't update CampaignLead status
- Return in results array for retry logic

## Testing

Run unit tests:
```bash
npm test src/lib/outreach/__tests__
```

Test template rendering:
```bash
npm test src/lib/outreach/__tests__/template-renderer.test.ts
```

## Future Enhancements

- [ ] LinkedIn outreach via API
- [ ] Rate limiting implementation
- [ ] Scheduled send times
- [ ] A/B testing templates
- [ ] Webhook signature verification
- [ ] Retry logic for failed sends
- [ ] Analytics dashboard
- [ ] Cost tracking per campaign

## Security

**TODO for production:**
1. Verify webhook signatures (Resend & Twilio)
2. Validate all email addresses before sending
3. Check suppression list before queuing
4. Rate limit API endpoints
5. Encrypt sensitive data in OutreachLog
6. Audit log for all suppressions

## Support

For issues or questions:
- Check webhook logs in database
- Verify environment variables set
- Test provider credentials
- Review OutreachLog error messages
