# Database Seeding Guide

This document explains how to seed the Yesbird database with initial data for campaigns, pitches, and outlets.

## Phase 2: Outlet Database Seeding

### Overview

The outlet seeding script populates the database with real media outlets and their contact information. This enables users to quickly create pitches to journalists and media contacts without manually entering all outlet details.

### Included Outlets

The default seed data includes 10 major media outlets across technology, business, and general news:

1. **The Verge** - Tech and science news
2. **TechCrunch** - Technology and startups
3. **Australian Financial Review** - Business and tech
4. **SBS News** - General Australian news
5. **ABC News** - Australian Broadcasting
6. **iTnews** - Technology news (Australia)
7. **ZDNet** - Technology and enterprise
8. **Wired** - Tech, culture, and innovation
9. **Ars Technica** - Science and technology
10. **CNBC** - Business and technology

Each outlet includes:
- Outlet name and website
- Multiple contacts (reporters, editors, correspondents)
- Contact details (name, email, role)
- Relevant news categories

### Running the Seed Script

#### Prerequisites

Ensure you have `tsx` installed (added to devDependencies in package.json):

```bash
npm install
```

#### Execute Seeding

```bash
npm run seed
```

This will:
1. Load the seed data from `scripts/seed-outlets-data.json`
2. Create each outlet using the `createOutlet()` function
3. Display progress for each outlet created
4. Report summary statistics

Example output:

```
🌱 Starting outlet database seeding...

📦 Found 10 outlets to seed

✅ Created: The Verge
   ID: abc123XYZ_-9
   Contacts: 3
   Categories: Tech, Science

✅ Created: TechCrunch
   ID: def456UVW_-8
   ...

✨ Seeding complete! Created 10/10 outlets
```

### Storage Backends

The seeding script respects the same storage backend configuration as the rest of the app:

- **Local Development**: Saves to `data/pitches/outlet-*.json` files
- **Production (Serverless)**: If `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set, saves to Redis

No additional configuration needed — the seed script automatically uses the configured backend.

### Customizing Seed Data

To add, modify, or remove outlets:

1. Edit `scripts/seed-outlets-data.json`
2. Follow the existing format for each outlet
3. Run `npm run seed` to populate

Structure for each outlet:

```json
{
  "name": "Outlet Name",
  "website": "https://example.com",
  "categories": ["Tech", "Business"],
  "contacts": [
    {
      "name": "Contact Name",
      "email": "contact@example.com",
      "role": "Job Title"
    }
  ]
}
```

### Verifying Seeded Data

After seeding, verify the data was saved correctly:

1. **UI Check**: Navigate to `/outlets` in the running app
2. **File Check** (local): View files in `data/pitches/outlet-*.json`
3. **Redis Check** (production): Query with `redis-cli` or Upstash dashboard

### Integration with the App

Once seeded, outlets are available:

- **Create Pitch**: Outlet dropdown in `/pitches/new` auto-populated with seeded outlets
- **View Outlets**: Complete list displayed on `/outlets`
- **Contact Management**: Add/edit/remove contacts via the UI

### Re-seeding

To clear and re-seed the entire database:

```bash
# Remove all outlet files (local development)
rm data/pitches/outlet-*.json

# Re-run seeding
npm run seed
```

For production with Redis, delete the keys manually or use Upstash dashboard.

### Next Steps

- Phase 3: Testing & Verification
- Phase 4: Response Tracking (Gmail API integration)
- Phase 5: Analytics Dashboard
