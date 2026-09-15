# Analytics Dashboard Guide

## Phase 5: Analytics Dashboard

This document covers the analytics dashboard for visualizing pitch responses and engagement metrics.

## Overview

The analytics dashboard provides real-time insights into:

- **Response rates** by media outlet
- **Response time distribution** (by day and hour)
- **Reply type breakdown** (auto-replies vs. manual responses)
- **Pitch status distribution** (responded, no response, bounced)
- **Key performance indicators** (KPIs) at a glance

## Dashboard Access

Navigate to `/analytics` to view the dashboard. The analytics page is accessible from the main admin navigation.

## Key Metrics

### KPI Cards

**Total Pitches**
- Count of all pitches created or sent
- Shows both total and "sent" counts

**Response Rate**
- Percentage of sent pitches that received responses
- Calculated as: (pitchesResponded / pitchesSent) × 100

**Average Response Time**
- Mean time from pitch send to first response
- Displayed in hours and seconds
- Calculated from all responses with both sentAt and receivedAt timestamps

**Auto-Replies**
- Count of auto-reply responses
- Shows percentage of total responses that are auto-replies
- Useful for understanding inbox noise vs. genuine interest

### Visualizations

**Response Types (Pie Chart)**
- Distribution of auto-replies vs. manual replies
- Color-coded: blue for auto-replies, green for manual

**Pitch Status (Pie Chart)**
- Shows breakdown of all pitched outcomes
- Categories:
  - Responded (green)
  - No Response (amber)
  - Bounced (red)

**Responses by Hour (Bar Chart)**
- Response volume by hour of day (24-hour format)
- Identifies peak response times for follow-up scheduling
- Helps optimize outreach timing

**Responses Over Time (Line Chart)**
- Response volume trends over the last 30 days
- Shows engagement patterns and seasonality
- Updates automatically when new responses are synced

### Outlet Performance Table

**Response Rates by Outlet**
- Lists all media outlets by response rate (highest first)
- Shows:
  - Outlet name
  - Number of responses received
  - Total pitches sent to that outlet
  - Response rate as percentage
  - Visual progress bar

**Filtering**
- Click on an outlet row to filter all charts to that outlet only
- Click again to clear the filter
- Useful for deep-diving into specific outlet performance

## Usage

### Viewing Analytics

1. Navigate to `/analytics`
2. Dashboard loads with company-wide metrics
3. Optionally filter by outlet by clicking an outlet row

### Interpreting Results

**High Response Rate (>30%)**
- Outlet is receptive to pitches
- Consider increasing pitch volume to this outlet

**Low Response Rate (<10%)**
- May indicate:
  - Poorly targeted pitches
  - Wrong contact person
  - Saturated inbox
  - Consider adjusting pitch strategy or contact list

**High Auto-Reply Rate (>50%)**
- Many recipients are away or have auto-reply enabled
- May want to retry after a delay
- Indicates contact timing issues

**Response Time Trends**
- Consistent response times: predictable audience
- Increasing response times: audience engagement may be declining
- Bimodal distribution: mixed audience engagement levels

### Export & Reporting

The analytics data feeds from the `/api/responses/analytics` endpoint. To export data:

```bash
# Get all analytics
curl http://localhost:4682/api/responses/analytics

# Filter by outlet
curl http://localhost:4682/api/responses/analytics?outletId=outlet-123

# Filter by date range
curl "http://localhost:4682/api/responses/analytics?from=2026-01-01&to=2026-12-31"
```

## Real-Time Updates

The dashboard fetches fresh analytics on page load and when filtering by outlet. To get the latest data:

1. Sync responses using `/api/responses/sync` (Phase 4)
2. Refresh the analytics page
3. Charts and metrics update automatically

## Future Enhancements

### Campaign-Level Analytics

- Filter analytics by campaign
- Track campaign performance over time
- Compare campaigns side-by-side

### Advanced Segmentation

- Segment by outlet type (newspaper, magazine, blog, podcast)
- Segment by geographic region
- Segment by industry vertical

### Predictive Analytics

- Forecast response rates based on historical trends
- Identify high-value outlets before they're obvious
- Predict optimal send times per outlet

### Alert System

- Notify when response rates drop below threshold
- Alert on unusual response patterns (potential bounce)
- Notify when new high-performing outlets are identified

### Export Formats

- Export dashboard as PDF report
- Generate CSV of metrics for spreadsheet analysis
- Schedule automated reports via email

## Architecture

### Data Flow

```
/api/responses/sync (Phase 4)
         ↓
    Pitch Store
         ↓
/api/responses/analytics (Phase 4)
         ↓
    JSON Response
         ↓
/analytics (Page, Phase 5)
         ↓
    Recharts Visualizations
```

### Components

- **AnalyticsPage** (`src/app/analytics/page.tsx`) - Main dashboard component
- **Recharts** - Chart library for visualizations
- **Framer Motion** - Animations and transitions
- **UI Components** - Card, CardHeader, CardTitle, CardDescription from shadcn/ui

### API Dependencies

- `GET /api/responses/analytics` - Fetches aggregated analytics data
- Supports query parameters:
  - `?outletId=<id>` - Filter to specific outlet
  - `?from=<date>` - Start date filter (ISO 8601)
  - `?to=<date>` - End date filter (ISO 8601)

## Troubleshooting

### No Data Displayed

**Problem:** Dashboard shows 0 pitches and empty charts

**Solutions:**
1. Verify pitches exist: check `/pitches` page
2. Verify pitches were sent: check pitch status
3. Verify responses were synced: run `/api/responses/sync` POST
4. Check browser console for errors

### Incorrect Outlet Names

**Problem:** Outlet names show as IDs instead of human-readable names

**Cause:** The analytics endpoint returns outlet IDs as names by default
**Solution:** This is noted as a future enhancement in Phase 4 documentation

### Missing Charts

**Problem:** Some charts don't render

**Causes:**
- Insufficient data (need at least 1 response for charts to render)
- Browser console errors
- Recharts library issue

**Solutions:**
1. Check browser console for errors
2. Verify data in network tab (check `/api/responses/analytics` response)
3. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## Configuration

No configuration needed. The analytics dashboard works out of the box after Phase 4 (Response Tracking) is set up.

## Security

- Analytics page is currently public (accessible to anyone)
- Consider adding authentication in production
- Sensitive data: email addresses, contact information in response data
- Recommend:
  - Add user authentication to `/analytics` route
  - Implement role-based access control (admin only)
  - Add audit logging for analytics access

## Next Steps

- Monitor outlet performance regularly
- Use insights to refine pitch strategy
- Test different messaging by tracking response rates
- Consider Phase 5+ enhancements (campaign analytics, predictive insights)
