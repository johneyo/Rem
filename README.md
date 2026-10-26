# Rem

**Remember the people who matter, automatically.**

Rem sends personalized messages and gifts to the people in your life on their birthdays,
anniversaries and other life events, with reminders that come early enough to actually do something.

- Plan: [docs/PLAN.md](docs/PLAN.md)
- Status: Phase 0 done, Phase 1 in progress (see "What works today")

## Repository layout

| Path | What it is |
|---|---|
| `apps/web` | Next.js web app (installable PWA): Upcoming timeline, People, contact import |
| `apps/worker` | Background worker (pg-boss): hourly planner, reminder sender |
| `packages/core` | Pure domain logic: recurrence, 29 Feb rules, timezones, autopilot, contact parsing |
| `packages/db` | Drizzle schema, migrations and queries |

## Getting started

Requirements: Node 22, pnpm 10, PostgreSQL 16 (or Docker).

```bash
pnpm install
cp .env.example .env                # DATABASE_URL
docker compose up -d db             # or use your own Postgres
export $(cat .env)                  # make DATABASE_URL available
pnpm db:migrate
pnpm db:seed                        # optional demo data
pnpm --filter @rem/web dev          # http://localhost:3000
pnpm --filter @rem/worker dev       # planner + reminders
```

Tests: `pnpm test` (set `TEST_DATABASE_URL` to an empty database to include the DB integration tests),
`pnpm typecheck`, `pnpm build`. After changing `packages/db/src/schema.ts`, run `pnpm db:generate`.

## What works today
- Add people with a birthday (day + month; year optional)
- Import Google / Outlook CSV and iCloud / Android vCard files; duplicates are skipped by email or phone
- Upcoming timeline grouped by this week / this month / later, with ages and milestones
- "Mark done" (cancels that moment's pending reminders)
- Worker: idempotent planner and reminder jobs (reminders are logged to the console for now)

## Next up (Phase 1)
- Authentication (Better Auth: Google, Apple, email magic link); replace the dev user in `apps/web/lib/session.ts`
- Email reminders (Resend + React Email) and web push
- Person page: edit, more occasion types, notes
- Google Contacts OAuth import, ICS calendar feed, weekly digest
- AI message drafts + approve and send by email; one-tap SMS/WhatsApp links
