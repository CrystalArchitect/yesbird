<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Yesbird

Start with [`docs/HANDOFF.md`](docs/HANDOFF.md). It covers the product rules, repo map, how email
notifications to the asker are wired (`src/lib/notify.ts` — configure `RESEND_API_KEY` or
`NOTIFY_WEBHOOK_URL`), storage options for hosting (`src/lib/store.ts` — JSON files or Upstash Redis),
deployment steps, and the post-deploy smoke test.

Hard rules:

- `/to/*` is the recipient's page. Never show donations, ads, the asker's email, or the private key there.
- Keep animations slow and soft; reuse the transitions in `src/lib/motion.ts`.
- Before finishing: `npx tsc --noEmit && npm run lint && npm run build`.
