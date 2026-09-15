# Response Tracking Guide

## Phase 4: Response Tracking (Gmail API Integration)

This document explains how to set up automatic response tracking for pitches sent to journalists and media contacts.

## Overview

The response tracking system uses the Gmail API to automatically detect and log responses from journalists to your pitches. It:

- Searches Gmail for incoming responses from pitch recipients
- Detects auto-replies (vacation responders, out-of-office, auto-reply)
- Categorizes responses as auto-reply, manual replies, or email thread participation
- Updates pitch status from "sent" to "responded" when replies are found
- Stores response content for analysis and follow-up

## Setup

### Prerequisites

1. Google Cloud Project with Gmail API enabled
2. Either:
   - **API Key** (for public data read-only access)
   - **OAuth 2.0 credentials** (for user account access)

### Google Cloud Setup

1. Create a project at [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Gmail API
3. For API Key: Create an API key in Credentials
4. For OAuth: Create a Web Application credential type
   - Authorized redirect URIs: `https://yourdomain.com/api/auth/callback`

### Environment Variables

Set one of the following:

```bash
# Option 1: API Key (simpler, read-only)
GMAIL_API_KEY=your_api_key_here

# Option 2: OAuth Access Token (requires more setup, user-specific)
GMAIL_ACCESS_TOKEN=your_access_token_here
```

## How It Works

### Manual Response Sync

Trigger a manual sync of all pitch responses:

```bash
curl -X POST http://localhost:4682/api/responses/sync
```

Response:
```json
{
  "message": "Response sync complete",
  "synced": 5,
  "updated": 2,
  "results": [
    {
      "pitchId": "pitch-123",
      "contactEmail": "reporter@example.com",
      "responsesFound": 1
    }
  ]
}
```

### Sync Specific Pitch

```bash
curl -X POST "http://localhost:4682/api/responses/sync?pitchId=pitch-123"
```

### Get Sync Status

```bash
curl "http://localhost:4682/api/responses/sync?pitchId=pitch-123"
```

## Response Detection

The system searches for emails matching:

1. **From/To**: The pitcher's email and the recipient's email
2. **Time**: After the pitch was sent (sentAt timestamp)
3. **Content**: Subject line matching pitch subject or "RE:" replies

### Response Types

Responses are categorized as:

- **auto_reply**: Vacation responder, out-of-office, auto-reply
- **gmail_thread**: Manual reply from the contact
- **manual** (future): User manually logged response

### Auto-Reply Detection

Common auto-reply indicators:

- "Out of office" in subject or headers
- Vacation responder headers (X-Autoresponse-Suppress, Precedence)
- OOO, vacation, auto-reply subject keywords

## Data Storage

Responses are stored in the pitch object:

```typescript
{
  id: "pitch-123",
  contactEmail: "reporter@example.com",
  subject: "Story Pitch: New Climate Tech",
  status: "responded",
  responses: [
    {
      receivedAt: "2026-09-15T10:30:00Z",
      type: "auto_reply",
      content: "Thank you for your email. I am out of office...",
      responder: "reporter@example.com",
      sentiment: undefined // Future: AI sentiment analysis
    },
    {
      receivedAt: "2026-09-16T08:15:00Z",
      type: "gmail_thread",
      content: "This looks interesting. Can you send me more details?",
      responder: "reporter@example.com",
      sentiment: "positive"
    }
  ]
}
```

## Pitch Status Flow

```
draft
  ↓
sent (→ sentAt timestamp set)
  ↓
responded (when responses detected)
  ├→ bounced (undeliverable)
  └→ no_response (after timeout)
```

## Response Analytics

### Response Rate by Outlet

Aggregate response rates by media outlet:

```
outlet-1: 3/5 pitches responded (60%)
outlet-2: 1/4 pitches responded (25%)
outlet-3: 0/2 pitches responded (0%)
```

### Response Time Distribution

Measure time from send to first response:

```
< 1 hour: 10 responses (quick responders)
1-24 hours: 15 responses (next day)
1-7 days: 20 responses (slow
)
> 7 days: 5 responses (very slow)
```

### Auto-Reply Detection

Track auto-replies separately:

```
Total responses: 50
Auto-replies: 12 (24%)
Manual replies: 38 (76%)
```

## Advanced Features (Future)

### Scheduled Sync

Set up automated daily/hourly response syncing:

```typescript
// Scheduled via cron job or serverless function
import { syncAllResponses } from '@/lib/response-sync';

export async function scheduledSync() {
  const result = await syncAllResponses();
  console.log(`Synced ${result.updated} pitch responses`);
}
```

### Sentiment Analysis

Automatically analyze response sentiment:

```typescript
// Update response objects with sentiment
sentiment: "positive" | "neutral" | "negative"
```

### Email Thread Reconstruction

Build full conversation threads:

```typescript
{
  type: "gmail_thread",
  threadId: "thread-abc123",
  messages: [
    { direction: "outbound", content: "Original pitch..." },
    { direction: "inbound", content: "Thanks for reaching out..." }
  ]
}
```

### Follow-Up Automation

Automatic follow-ups for non-responders after N days:

```typescript
if (daysSinceSent > 7 && !hasResponded) {
  await sendFollowUp(pitch);
  pitch.followUpCount++;
  pitch.nextFollowUpAt = addDays(now, 7);
}
```

## Troubleshooting

### "Gmail API key or access token not configured"

**Solution**: Set GMAIL_API_KEY or GMAIL_ACCESS_TOKEN environment variable

### "Gmail API error: 401 Unauthorized"

**Solution**: Verify the API key/token is valid and hasn't expired

### "Gmail API error: 403 Forbidden"

**Solution**: 
- Ensure Gmail API is enabled in Google Cloud Console
- Check that the API key has proper permissions
- For OAuth, re-authenticate to refresh the access token

### Responses not detected

**Possible causes**:
1. Pitch subject doesn't match response subject line
2. Response time filtering (sentAfter date)
3. Response in a different thread (forwarded, etc.)
4. Gmail account not connected or authorized

**Solution**: Manually check Gmail for matching threads, verify API configuration

## Integration with Campaigns

### Campaign Response Tracking

Campaigns can track aggregate responses across all recipients:

```typescript
campaign.stats.opens // Requires email open tracking
campaign.stats.clicks // Requires link tracking
```

### Response Attribution

Link responses to campaigns for campaign-level analytics:

```typescript
pitch.campaignId = "campaign-123"
// Then aggregate pitch.responses by campaignId
```

## Rate Limiting

Gmail API has rate limits:

- Standard: 100M requests per day per project
- Per-user: ~1M requests per user per day

The response sync endpoint processes pitches in batches (default: 50) to stay within limits.

## Next Steps

- **Phase 5**: Analytics Dashboard — visualize response rates, times, and trends
- Email forwarding setup for better reply detection
- OAuth token refresh for sustained access
- Sentiment analysis AI model integration
