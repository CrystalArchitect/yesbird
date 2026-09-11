# Yesbird

**The cutest way to ask someone out.**

Yesbird turns "so… are you free sometime?" into a tiny, adorable invitation. You write the ask, pick a mascot, list the days you're free, and send one link. They open a little letter, get asked properly, and try to press No — but the No button runs away, shrinks, and pleads until Yes is the only option left. When they say yes, hearts rain down and they answer four short questions (a time that works, what they're craving, little things they love, and how to reach them). You see all of it on a private page only you can open.

K-drama pastel vibes, hand-drawn SVG mascots, falling petals, heart confetti.

## The flow

| Who | Page | What happens |
| --- | --- | --- |
| Asker | `/` | Landing page with a live demo of the runaway No button. |
| Asker | `/create` | Names, an optional email for yourself, mascot (Mochi the bunny, Boba the bear, Dumpling the kitty, Peach the duckling, or the lovebirds), a sweet message, date vibe, and availability as day + time-of-day slots. The draft auto-saves in the browser, so a reload never loses what was typed. |
| Asker | `/nest/<key>` | Private page: the share link (copy / WhatsApp / SMS / email), a "waiting" state that polls, and the full answer once it lands. The key is the only way to see the answer — bookmark it. If you left an email, the answer is emailed to you too. |
| Sweetheart | `/to/<id>` | Sealed letter → the question with Yes/No → celebration → 4-step wizard → "It's a date" card. Re-opening the link after answering shows a "you already said yes" card. |

The mascots have moods: `idle`, `shy`, `sad` (first pokes at No), `cry` (keep poking: tears, wobbly lip, drooping ears, a tiny rain cloud), `happy`, and `love` (hover Yes and they recover instantly).

## Tech

- [Next.js](https://nextjs.org) 16 (App Router, TypeScript), Tailwind CSS 4, [shadcn/ui](https://ui.shadcn.com)
- [Framer Motion](https://www.framer.com/motion/) for the mascots, envelope, and step transitions; [canvas-confetti](https://github.com/catdad/canvas-confetti) for heart showers
- [zod](https://zod.dev) schemas shared by the forms and the API routes
- Storage is a tiny JSON-file store (`data/invites/<id>.json`, git-ignored) by default, or Upstash Redis when `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are set (for serverless hosts). No accounts. The public invite id is derived from the asker's private key with SHA-256, so a key always resolves to its invite while the id alone can never be turned back into the key.
- Notifications: when the answer lands, `src/lib/notify.ts` emails the asker via [Resend](https://resend.com) (`RESEND_API_KEY`), or POSTs to `NOTIFY_WEBHOOK_URL`, or logs to the console when nothing is configured. See [`docs/HANDOFF.md`](docs/HANDOFF.md).
- A soft Buy Me a Coffee nudge appears on the asker's pages only (`NEXT_PUBLIC_TIP_URL`). The recipient's page stays ad-free.

### API

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/invites` | Create an invitation. Returns `{ id, manageKey }`. |
| `GET` | `/api/invites/:id` | Public view of an invitation (never includes the answer's contact details). |
| `POST` | `/api/invites/:id/response` | Submit the sweetheart's answer. One answer per invitation (`409` afterwards). |
| `GET` | `/api/nest/:key` | Full invitation + answer for the asker. Polled by the nest page. |

## Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:4682](http://localhost:4682).

Other scripts: `npm run build`, `npm start` (production server on port 4682), `npm run lint`.

For trying the app with someone (rather than editing code), prefer `npm run build && npm start`: the dev server's hot reloading can refresh a page mid-typing, the production server never will.

Set `YESBIRD_DATA_DIR` to change where invitation JSON files are written (defaults to `./data/invites`). All environment variables are listed in [`.env.example`](.env.example).

## Deploying and wiring email

Everything needed to deploy (Vercel, Render, a VPS), switch storage, and send the asker an email with the chosen dates and details is in [`docs/HANDOFF.md`](docs/HANDOFF.md). It is written so that a coding agent can follow it end to end.

## Project layout

```
src/
  app/
    page.tsx                 landing
    create/page.tsx          invitation builder
    to/[id]/page.tsx         the invitation the sweetheart opens
    nest/[key]/page.tsx      the asker's private page
    api/...                  route handlers
  components/
    mascots/                 SVG bunny, bear, kitty, duckling, lovebirds with moods (idle, shy, sad, cry, happy, love)
    invite/                  envelope, runaway-No question, celebration, details wizard, "it's a date"
    availability-picker.tsx  21-day grid + time-of-day chips
    tip-jar.tsx              Buy Me a Coffee nudge (asker pages only)
    create-form.tsx, nest-view.tsx, landing-demo.tsx, petals.tsx, sparkles.tsx, floating-hearts.tsx, chip.tsx, brand.tsx
  lib/
    options.ts               mascots, times of day, foods, interests, contact methods, No-button lines
    schemas.ts               zod schemas + shared types
    store.ts                 persistence (JSON files or Upstash Redis)
    notify.ts                "they said yes" email / webhook / console notification
    motion.ts                shared slow, soft transitions
    confetti.ts, dates.ts, use-is-client.ts
docs/
  HANDOFF.md                 deploy + email wiring guide
```

## Ideas for what's next

- SMS to the asker when the answer lands (Twilio), next to the existing email.
- "Add to calendar" (.ics) once a final time is chosen, and a way for the asker to confirm one slot back.
- Seasonal themes (cherry blossom, first snow) and a short music loop toggle.
- A "date planner" that turns their cravings + interests into a suggested itinerary.
