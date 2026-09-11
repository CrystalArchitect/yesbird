# Yesbird — handoff for deployment and email wiring

This document is written for whoever (or whatever) picks the project up next — a person, or an AI coding
agent such as Grok Build, Cursor, or Claude Code. It explains what the app is, how it is structured, what
already works, and exactly what must be configured to deploy it and to email the asker when their
person says yes.

Read this file fully before changing code. Everything referenced here exists in the repo today.

---

## 1. What Yesbird is (30 seconds)

Yesbird is a Next.js 16 app for asking someone on a date.

1. The **asker** fills out `/create`: their name, the other person's name, an optional email for
   themselves, a mascot, a message, a date vibe, and the days/times they are free.
2. They get two links: a **public link** `/to/<id>` to send, and a **private link** `/nest/<key>` to
   watch for the answer.
3. The **recipient** opens `/to/<id>`, opens a letter, is asked. The No button runs away; the mascot
   cries when No is hovered. On Yes: celebration, then a 4-step wizard (times that work, food cravings,
   interests, phone/email/contact method), then an "It's a date" card.
4. The **asker** sees everything on `/nest/<key>` (auto-refreshes) and, if configured, receives an email.

There are no accounts and no database by default. Storage is one JSON record per invitation.

---

## 2. Repo map (what lives where)

```
src/app/
  page.tsx                         landing page (asker-facing)
  create/page.tsx                  invitation builder (asker-facing)
  nest/[key]/page.tsx              asker's private page
  to/[id]/page.tsx                 the recipient's page — NEVER show tips/ads here
  api/invites/route.ts             POST  create invitation → { id, manageKey }
  api/invites/[id]/route.ts        GET   public invitation (no answer, no asker email/key)
  api/invites/[id]/response/route.ts
                                   POST  recipient's answer → saves, then calls notifyAskerOfYes()
  api/nest/[key]/route.ts          GET   full invitation + answer for the asker (polled)

src/lib/
  schemas.ts      zod schemas + types. `Invite` (server) vs `PublicInvite` (what the recipient may see).
  store.ts        persistence. Picks Upstash Redis if env vars exist, else JSON files.
  notify.ts       "they said yes" notification. Picks Resend → webhook → console log.
  options.ts      mascots, time-of-day slots, foods, interests, contact methods, copy.
  motion.ts       shared framer-motion transitions (keep animations slow and soft).

src/components/
  create-form.tsx        the builder; drafts autosave to localStorage.
  nest-view.tsx          asker's page; polls /api/nest/<key> every 8s.
  tip-jar.tsx            Buy Me a Coffee nudge. Asker pages only.
  invite/                envelope, runaway-No question, celebration, wizard, "it's a date".
  mascots/               five SVG mascots with moods (idle, shy, sad, cry, happy, love).
```

Product rules that must hold after any change:

- `/to/*` (the recipient's experience) never shows donations, ads, the asker's email, or the private key.
  `toPublicInvite()` in `schemas.ts` strips `senderEmail`, `manageKey`, and the response — keep it that way.
- One answer per invitation (`409` on a second submit).
- Animations stay slow and soft: reuse `gentle`, `gentleSlow`, `springy`, `bouncy` from `src/lib/motion.ts`.
  Do not add `layout` animations to lists that change on click; they cause flashes.

---

## 3. Run locally

```bash
npm install
cp .env.example .env.local     # optional; everything runs with no env vars
npm run dev                    # http://localhost:4682
```

Checks that must pass before shipping: `npx tsc --noEmit`, `npm run lint`, `npm run build`.

---

## 4. Email the asker when the recipient finishes (the important part)

### What already exists

- The create form has an optional **"Your email"** field (`senderEmail`). It is validated in
  `createInviteSchema`, stored with the invitation, and never sent to the recipient.
- `POST /api/invites/[id]/response` saves the answer and then **awaits**
  `notifyAskerOfYes(invite, baseUrl)` from `src/lib/notify.ts`.
- `notifyAskerOfYes` builds a complete summary — chosen dates and times, phone, email, preferred contact
  method + handle, food cravings, place ideas, interests, notes, number of No attempts, and a button
  linking to the asker's private `/nest/<key>` page — as both **HTML** and **plain text**, then delivers
  it through the first configured channel:

| Priority | Condition | What happens |
| --- | --- | --- |
| 1 | `RESEND_API_KEY` set **and** the asker gave an email | `POST https://api.resend.com/emails` from `EMAIL_FROM` |
| 2 | `NOTIFY_WEBHOOK_URL` set | `POST` the JSON payload (below) to that URL |
| 3 | nothing set | Print the text summary to the server log |

Failures are caught and logged; the recipient still sees "It's a date". Nothing else needs to change in
the UI for email to work — **it is purely environment configuration**.

### Path A — Resend (recommended)

1. Create a free account at https://resend.com, add an API key.
2. Either verify a domain you own (Resend → Domains) and set `EMAIL_FROM="Yesbird <hello@yourdomain.com>"`,
   or, for testing only, leave `EMAIL_FROM` unset to use `onboarding@resend.dev` (delivers only to the
   account owner's address).
3. Set the env vars on the host:
   ```
   RESEND_API_KEY=re_...
   EMAIL_FROM=Yesbird <hello@yourdomain.com>
   NEXT_PUBLIC_APP_URL=https://your-deployed-url
   ```
4. Deploy, create an invitation with your own email, answer it from the public link, check your inbox.

No SDK is required; `notify.ts` uses `fetch` against Resend's REST API. If you prefer another provider
(SendGrid, Postmark, Mailgun, SES), replace only `sendWithResend()` in `src/lib/notify.ts`; keep the
function signature and the `NotificationPayload` shape.

### Path B — Webhook (Zapier / Make / n8n / custom)

Set `NOTIFY_WEBHOOK_URL`. On every completed invitation the app POSTs this JSON:

```json
{
  "event": "invite.answered",
  "inviteId": "abc123XYZ_-9",
  "senderName": "Minho",
  "senderEmail": "minho@example.com",
  "recipientName": "Ji-woo",
  "nestUrl": "https://yesbird.example.com/nest/<private-key>",
  "subject": "Ji-woo said yes! 💗",
  "text": "…plain-text summary…",
  "html": "<!doctype html>…styled summary…",
  "response": {
    "chosenSlots": [{ "date": "2026-09-19", "times": ["dinner", "sunset"] }],
    "foods": ["Korean BBQ", "Ramen"],
    "placeIdeas": "That rooftop place downtown",
    "interests": ["Movies", "Bookstores"],
    "notes": "I'm free after 6 most days",
    "phone": "+1 555 010 2030",
    "email": "jiwoo@example.com",
    "contactMethod": "text",
    "contactHandle": "",
    "noAttempts": 3,
    "respondedAt": "2026-09-11T10:15:00.000Z"
  }
}
```

Map `senderEmail` → recipient, `subject` → subject, `html`/`text` → body in your automation tool.

### Where to extend

- Send a confirmation to the **recipient** too (they may leave an `email`): add a second send in
  `notifyAskerOfYes` using `response.email`. Keep it opt-in.
- SMS to the asker: add `senderPhone` to `createInviteSchema` + create form, then a Twilio call in `notify.ts`.
- `.ics` calendar attachment: build from `response.chosenSlots` and `TIME_BY_ID[...].hint` in `options.ts`.

---

## 5. Storage for hosting

`src/lib/store.ts` chooses a backend at startup:

| Backend | When | Notes |
| --- | --- | --- |
| JSON files in `YESBIRD_DATA_DIR` (default `./data/invites`) | default | Fine for local dev and any single long-running server (Render, Railway, Fly, a VPS). Mount a persistent disk. |
| Upstash Redis REST | `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` set | Required on serverless hosts (Vercel, Netlify) where the filesystem is ephemeral. Free tier is plenty. |

Records are keyed `yesbird:invite:<id>`. To use Postgres/SQLite instead, implement the two-method
`Backend` interface (`read`, `write`) in `store.ts`; nothing else in the app touches storage.

---

## 6. Deploy

### Vercel (fastest)

1. Push the repo to GitHub and import it in Vercel. Framework preset: Next.js. No build overrides needed.
2. Create an Upstash Redis database (Vercel Marketplace → Upstash, or upstash.com) and add
   `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
3. Add the email vars from section 4 and `NEXT_PUBLIC_APP_URL=https://<your-project>.vercel.app`.
4. Deploy. Verify: create → open public link in another browser → answer → check `/nest/<key>` and inbox.

Note: `package.json` pins the dev/start port to 4682. Vercel ignores `npm start`, so this is harmless.
On hosts that run `npm start`, either keep 4682 or change the `start` script to `next start -p $PORT`.

### Render / Railway / Fly / VPS

- Build: `npm ci && npm run build`. Start: `next start -p $PORT` (edit the `start` script accordingly).
- Attach a persistent disk and set `YESBIRD_DATA_DIR` to a path on it, **or** use Upstash as above.
- Set the email vars and `NEXT_PUBLIC_APP_URL`.

### After deploying, smoke test in this order

1. `/` loads, mascots animate, no console errors.
2. `/create` → fill everything including your email → "Create my invitation" → lands on `/nest/<key>?fresh=1`.
3. Open the public link in a private window → open letter → hover No (mascot cries) → Yes → wizard → "It's a date".
4. `/nest/<key>` shows the answer within ~8s; the email arrives (or the webhook fires / server log shows it).
5. Re-open the public link → "already said yes" card, no second submit possible.

---

## 7. Donations

The Buy Me a Coffee nudge lives in `src/components/tip-jar.tsx` and is rendered on `/create` (above the
form), `/nest/<key>` (bottom), and the landing footer. The URL is `NEXT_PUBLIC_TIP_URL`
(default `https://buymeacoffee.com/xfreeze`). Do not add it to `/to/*`.

---

## 8. Environment variables (complete list)

| Variable | Required | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | for email | Resend API key |
| `EMAIL_FROM` | with Resend | Verified sender, e.g. `Yesbird <hello@domain.com>` |
| `NOTIFY_WEBHOOK_URL` | alt. to Resend | POST target for the JSON payload |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | on serverless | Persistent storage |
| `YESBIRD_DATA_DIR` | no | File-store directory (default `./data/invites`) |
| `NEXT_PUBLIC_APP_URL` | recommended | Absolute URL used in email links |
| `NEXT_PUBLIC_TIP_URL` | no | Donation link (default Buy Me a Coffee) |
