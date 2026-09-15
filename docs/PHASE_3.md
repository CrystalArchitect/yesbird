# Phase 3: Email Sending via SMTP

**Status:** ✅ Implemented  
**Delivery:** Resend REST API (primary) + SMTP relay (secondary) + Webhook fallback  
**Files:**
- `src/lib/smtp-config.ts` — SMTP configuration and connection pooling
- `src/lib/notify.ts` — Email sending logic with provider fallback chain

---

## Overview

Phase 3 implements email delivery for the news/media emailing system. It supports multiple email providers in a priority order:

1. **Resend REST API** (https://resend.com) — Recommended for cloud deployments
2. **SMTP Relay** — Self-hosted or relay server (Gmail, SendGrid relay, Mailgun, etc.)
3. **Webhook** — External service integration (Zapier, Make, n8n, custom endpoints)
4. **Console Log** — Local development only

This architecture allows switching providers without code changes—just update environment variables.

---

## Email Services Supported

### Resend (REST API)

**Best for:** SaaS deployments, minimal configuration  
**Setup time:** ~2 minutes

```bash
# 1. Sign up at https://resend.com
# 2. Get API key from https://resend.com/api-keys
# 3. Verify a sender domain (or use onboarding@resend.dev for testing)
# 4. Set environment variables:
export RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
export EMAIL_FROM="Yesbird <hello@yourdomain.com>"
```

**Advantages:**
- No infrastructure setup needed
- Built-in analytics and webhook delivery tracking
- Excellent deliverability
- Free tier: 100 emails/day

**Disadvantages:**
- Requires internet connection
- Cost: $0.10–$0.75 per 1,000 emails
- No relay option for incoming mail

### SMTP Relay

**Best for:** Self-hosted, on-premise, or relay scenarios  
**Setup time:** ~5–10 minutes

```bash
# Common providers:
# Gmail (2FA App Password)
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USER=your-email@gmail.com
export SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx
export SMTP_TLS=true

# SendGrid Relay
export SMTP_HOST=smtp.sendgrid.net
export SMTP_PORT=587
export SMTP_USER=apikey
export SMTP_PASSWORD=SG.xxxxxxxxxxxx
export SMTP_TLS=true

# Mailgun Relay
export SMTP_HOST=smtp.mailgun.org
export SMTP_PORT=587
export SMTP_USER=postmaster@yourdomain
export SMTP_PASSWORD=xxxxxxxxxxxx
export SMTP_TLS=true

# Postmark
export SMTP_HOST=smtp.postmarkapp.com
export SMTP_PORT=587
export SMTP_USER=your-account-token
export SMTP_PASSWORD=your-account-token
export SMTP_TLS=true

# Amazon SES
export SMTP_HOST=email-smtp.region.amazonaws.com
export SMTP_PORT=587
export SMTP_USER=AKIA...
export SMTP_PASSWORD=xxxx...
export SMTP_TLS=true

# Optional: Override "From" name
export SMTP_FROM_NAME="Yesbird Newsroom"
```

**Advantages:**
- Works with any SMTP server
- Relay options available (no outbound SMTP rules)
- Self-hosted control
- Often included in existing services

**Disadvantages:**
- Requires credential management
- Relay server availability dependent on provider uptime
- Authentication failures block sends

### Webhook Fallback

**Best for:** Zapier, Make, n8n, or custom API endpoints  
**Setup time:** ~5 minutes

```bash
export NOTIFY_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/12345/xyz/
# or
export NOTIFY_WEBHOOK_URL=https://your-make.com/webhook/abc123
```

**Payload format:**
```json
{
  "event": "pitch.sent",
  "pitchId": "pitch_123",
  "outletId": "outlet_456",
  "outletName": "TechCrunch",
  "toEmail": "journalist@techcrunch.com",
  "toName": "John Doe",
  "subject": "Breaking: New AI Research",
  "text": "Email body as plain text",
  "html": "<p>Email body as HTML</p>"
}
```

**Advantages:**
- No credentials needed in-app
- Integration with automation platforms
- Logging and retry logic in Zapier/Make

**Disadvantages:**
- External service dependency
- Additional cost per webhook call
- Rate limiting depends on platform

---

## Configuration

### Environment Variables

```bash
# Primary: Resend (REST API)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="Yesbird <hello@yourdomain.com>"

# Secondary: SMTP Relay (used if RESEND_API_KEY not set)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=yesbird@example.com
SMTP_PASSWORD=secret_password
SMTP_FROM_NAME=Yesbird
SMTP_TLS=true

# Fallback: Webhook
NOTIFY_WEBHOOK_URL=https://hooks.example.com/yesbird

# Required for all
NEXT_PUBLIC_APP_URL=https://yesbird.example.com
```

### .env.local Example

```bash
# Resend (recommended for development)
RESEND_API_KEY=re_test_only_xxxxx
EMAIL_FROM="Yesbird <onboarding@resend.dev>"
NEXT_PUBLIC_APP_URL=http://localhost:4682

# SMTP fallback (optional, for testing SMTP)
# SMTP_HOST=localhost
# SMTP_PORT=1025
# SMTP_USER=test
# SMTP_PASSWORD=test

# Webhook (optional, for testing webhook)
# NOTIFY_WEBHOOK_URL=http://localhost:3000/webhook
```

### Production Deployment Checklist

- [ ] `RESEND_API_KEY` configured in secrets manager (preferred)
- [ ] `EMAIL_FROM` set to verified domain/address
- [ ] If using SMTP: credentials stored in secrets (never committed)
- [ ] If using webhook: URL validated and accessible from production
- [ ] Test send succeeds with real email address
- [ ] Email appears in inbox (check spam folder)
- [ ] Links in email work correctly
- [ ] Unsubscribe link (campaigns) is functional

---

## Usage

### Sending a Pitch

```typescript
import { sendPitch } from "@/lib/notify";
import type { Pitch, Outlet } from "@/lib/pitch-schemas";

const pitch: Pitch = {
  id: "pitch_123",
  subject: "Breaking: AI Researcher Discovers New Pattern",
  body: "Dear Editor, ...",
  contactEmail: "journalist@outlet.com",
  contactName: "Jane Doe",
  // ... other fields
};

const outlet: Outlet = {
  id: "outlet_456",
  name: "TechCrunch",
  // ... other fields
};

await sendPitch(pitch, outlet, "https://yesbird.example.com");
// No return value; failures are logged but don't throw
```

### Sending a Campaign

```typescript
import { sendCampaign, type CampaignSendResult } from "@/lib/notify";
import type { Campaign } from "@/lib/campaign-schemas";

const campaign: Campaign = {
  id: "campaign_123",
  name: "Q4 Press Release",
  subject: "Announcement",
  textBody: "...",
  htmlBody: "<p>...</p>",
  recipientList: {
    recipients: [
      { name: "Jane Doe", email: "jane@example.com" },
      { name: "John Smith", email: "john@example.com" },
    ],
  },
  tracking: { linkTracking: true },
  // ... other fields
};

const result: CampaignSendResult = await sendCampaign(campaign, "https://yesbird.example.com");
console.log(`Sent: ${result.sent}, Failed: ${result.failed}`);
if (result.errors.length > 0) {
  console.error("Errors:", result.errors);
}
```

### Sending a Yes Notification

```typescript
import { notifyAskerOfYes } from "@/lib/notify";
import type { Invite } from "@/lib/schemas";

const invite: Invite = {
  // ... invite data with response attached
  response: {
    contactMethod: "phone",
    phone: "+1-555-0123",
    // ... response fields
  },
};

await notifyAskerOfYes(invite, "https://yesbird.example.com");
// Never throws; failures are logged only
```

---

## Delivery Flow

### Request Flow

```
UI Form → API Endpoint → buildPayload() → sendPitch/sendCampaign/notifyAskerOfYes()
                                            ↓
                                    Try Resend (if RESEND_API_KEY)
                                            ↓
                                    Try SMTP (if SMTP_HOST configured)
                                            ↓
                                    Try Webhook (if NOTIFY_WEBHOOK_URL)
                                            ↓
                                    Console Log (dev fallback)
```

### Error Handling

- **Resend errors:** Logged; falls back to SMTP or webhook
- **SMTP errors:** Logged; falls back to webhook or console
- **Webhook errors:** Logged; falls back to console
- **Console:** Always succeeds (logs to stdout)

All delivery methods have **10-second timeout**. If a method times out or fails, the next method is tried automatically.

---

## SMTP Configuration Details

### Connection Pooling

The SMTP client maintains a connection pool to prevent exhausting server resources:

```typescript
pool: {
  maxConnections: 5,        // Max simultaneous connections
  maxMessages: 100,         // Messages per connection before recycling
  rateDelta: 4000,          // Time window for rate limiting (ms)
  rateLimit: 14,            // Max messages per rate window
}
```

### TLS / Secure Connection

- **Port 587 (STARTTLS):** Recommended
  - Unencrypted initial connection, upgrades to TLS
  - Works on most networks (firewalls, proxies)
  - `SMTP_TLS=true` (default)

- **Port 465 (Implicit TLS):** Alternative
  - Encrypted from first byte
  - More restrictive firewalls may block it
  - Automatically detected when `port=465` and `tls=true`

- **Port 25 (No TLS):** Deprecated
  - Only for internal/relay scenarios
  - Avoid in production
  - Set `SMTP_TLS=false` if required

### Troubleshooting SMTP

**"Authentication failed"**
- Verify `SMTP_USER` and `SMTP_PASSWORD` (case-sensitive)
- Check for special characters; escape if needed
- Some providers require app-specific passwords (Gmail, Microsoft)
- Verify account has SMTP relay enabled

**"Connection refused"**
- Confirm `SMTP_HOST` and `SMTP_PORT` are correct
- Test with: `telnet smtp.example.com 587`
- Check firewall rules allow outbound on that port
- Verify no rate limiting by provider

**"TLS negotiation failed"**
- Ensure `SMTP_TLS=true` for port 587
- For port 465, system should auto-detect
- Try `SMTP_TLS=false` if provider doesn't support TLS (rare)

**"Rate limited"**
- Reduce sending rate or batch size
- Spread sends across time
- Contact provider for rate limit increase

**"Sender address rejected"**
- Some SMTP servers restrict `MAIL FROM` to authenticated user
- Set `SMTP_FROM_NAME` but SMTP_USER email stays in headers
- Check provider's sender policy

---

## Resend Configuration Details

### Sender Domain Verification

1. Go to https://resend.com/domains
2. Add your domain (e.g., `hello.example.com`)
3. Add DNS records (CNAME, MX, TXT)
4. Mark as verified
5. Use in `EMAIL_FROM`: `Yesbird <hello@example.com>`

### Testing with Onboarding Domain

For testing without domain verification:

```bash
RESEND_API_KEY=re_xxxxx
EMAIL_FROM="Yesbird <onboarding@resend.dev>"
```

This works but emails say "via sendgrid.net" in recipient's mail client.

### Resend Webhooks

Resend can notify your app of delivery status:

1. Go to https://resend.com/webhooks
2. Add webhook endpoint: `https://yourdomain.com/api/webhooks/resend`
3. Subscribe to events: `email.sent`, `email.bounced`, `email.opened`, `email.clicked`
4. Implement webhook handler (optional)

---

## Monitoring & Debugging

### Enable Debug Logging

```typescript
// In notify.ts, add before sending:
console.debug("[notify] Sending via provider:", {
  provider: "resend" | "smtp" | "webhook",
  to: recipientEmail,
  timestamp: new Date().toISOString(),
});
```

### Check Sent Emails

**Resend:**
- View in dashboard: https://resend.com/emails
- Filter by date, recipient, status
- Click email to see full headers and content

**SMTP:**
- Depends on provider (Gmail, SendGrid, etc.)
- Check inbox, spam, and bounces

**Webhook:**
- Check your integration logs (Zapier, Make, n8n)
- Look for incoming POST requests with email data

### Common Issues

| Issue | Check | Fix |
|-------|-------|-----|
| "Email not received" | Spam folder, bounce logs | Verify sender domain, check DKIM/SPF |
| "Wrong sender name" | `EMAIL_FROM` or `SMTP_FROM_NAME` | Update env var, redeploy |
| "Personalization not working" | Payload built correctly? | Verify recipient name/email in template |
| "Attachment not included" | Only text/HTML supported currently | Add attachment support to types |
| "HTML formatting broken" | Email client CSS support | Test in multiple clients (Outlook, Gmail, etc.) |

---

## Phase Integration

### With Phase 1 (UI)

- Campaign builder calls `sendCampaign()` on submit
- Pitch creation calls `sendPitch()` after save
- Both use the same delivery chain in notify.ts

### With Phase 2 (Outlet Database)

- Outlet email addresses stored in `outlet.contactEmail`
- Outlet name used in pitch salutation
- Email validation on outlet creation

### With Phase 4 (Response Tracking)

- Sent email details logged for correlation
- Gmail API tracks replies from known outlet addresses
- Dashboard shows "sent" events linked to pitches

### With Phase 5 (Analytics)

- "Emails sent" metric counts successful sends
- Sent/failed breakdown shown in dashboard
- Response time calculated from send timestamp to reply

---

## Future Enhancements

- [ ] Attachment support (PDF case studies, media kits)
- [ ] Email templates editor in UI
- [ ] A/B subject line testing
- [ ] Scheduled sends (send at optimal time per outlet)
- [ ] Bounce/complaint handling (auto-disable bad emails)
- [ ] Unsubscribe list management
- [ ] DKIM/SPF/DMARC configuration wizard
- [ ] Multi-language template support

---

## Support

- **Resend docs:** https://resend.com/docs
- **Nodemailer docs:** https://nodemailer.com/
- **SMTP debugging:** Use `SMTP_DEBUG=true` to see SMTP protocol details
- **Issues:** Check GitHub issues or email support@yesbird.example.com
