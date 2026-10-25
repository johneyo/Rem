# Rem: Product & Technical Plan

> Goal: automatically send customized messages or gifts to people you know on their birthdays,
> anniversaries and other life events, with reminders, while staying dead simple to use.
> Start as a web app (installable PWA), then ship native iOS/Android apps from the same codebase.

---

## 1. Product principles

1. **Set it once, then forget it.** Add a person and a date once. Rem handles every year after that.
2. **You stay in control.** Every person gets an *autopilot level* (see 3.4). Nothing that costs
   money is sent without a rule you set yourself.
3. **Personal, not robotic.** Messages use what you know about the person: notes, shared memories,
   how you usually talk to them. Recipients should never feel they got a mass message.
4. **Early enough to matter.** Physical gifts need lead time, so reminders are based on how long
   the chosen action takes, not on a fixed "1 day before".
5. **Reliable.** No missed birthday, no duplicate sends, no messages at 3 a.m. in the recipient's
   timezone.

---

## 2. Core concepts (the mental model the UI uses)

| Concept | Meaning | Example |
|---|---|---|
| **Person** | Someone you care about | "Mum", "Ada (college)" |
| **Occasion** | A date that repeats, or happens once | Birthday on 14 Mar, wedding anniversary, graduation on 2 Jun 2027 |
| **Plan** | What should happen for an occasion | "Send a WhatsApp message + a $25 gift card" |
| **Moment** | One occurrence of an occasion in a given year | "Ada's birthday 2027" |
| **Circle** | A group of people with shared defaults | Family, Close friends, Work, Clients |

Users mostly deal with **People** and the **Upcoming** timeline. Plans come from Circle defaults,
so most people need no setup at all.

---

## 3. Features

### 3.1 People & contacts
- **Import:** Google Contacts (OAuth), Apple/iCloud and Outlook via vCard (.vcf), CSV upload,
  and later native phone contacts in the mobile app (`expo-contacts`).
- **Automatic date detection:** read birthdays and anniversaries already stored in contacts.
- **"Ask them" link:** send someone a short link where they fill in their own birthday, shipping
  address, gift preferences and wishlist. This fixes missing data and wrong addresses.
- **Profile:** nickname, relationship, partner/kids (linked people), notes, interests, sizes,
  dietary needs, dislikes, preferred channel, language, timezone, address.
- **Households:** link a couple or family so one card can go to "The Okafors", or so an
  anniversary appears on both people.
- **Duplicate merge** and periodic re-sync with the source.

### 3.2 Occasions
- Built-in types: birthday, wedding anniversary, dating anniversary, work anniversary,
  graduation, new baby, new job, retirement, housewarming, memorial / remembrance day
  (handled gently: reminder only, never auto-sent), get-well, recovery milestones.
- Public holidays & cultural dates: Mother's/Father's Day, Christmas, Eid, Diwali, Lunar New Year,
  Valentine's, Thanksgiving, Hanukkah. Enable per Circle.
- **Custom occasions**, one-off or recurring (yearly, monthly, every N years).
- Edge cases: **29 February** (user picks 28 Feb or 1 Mar), birthday with unknown year,
  milestone detection ("turning 40", "10th anniversary") for special treatment,
  later: lunar or Hebrew calendar dates.

### 3.3 Reminders
- **Smart lead time** per action: message = same day; e-card = 1 day before;
  gift card = 3 days before; physical gift = 10-14 days (from the carrier's estimate).
- Channels: push (web push / mobile), email, optional SMS, in-app.
- **Weekly digest** ("3 moments coming up this week") and a **monthly preview**.
- **Snooze** and "Mark done" (when you called them or gave a gift in person).
- **Calendar feed:** private ICS URL that you can subscribe to in Google/Apple/Outlook calendar.
- **Quiet hours** for your own notifications.

### 3.4 Autopilot levels (the key to "simple but powerful")
Set per Circle, override per person:

| Level | What Rem does |
|---|---|
| **0 · Remind me** | Only reminds you. |
| **1 · Draft for me** *(default)* | Writes the message / picks a gift idea, then you approve with one tap. |
| **2 · Auto-send unless I stop it** | Shows you what it will send 48 h before, then sends it unless you cancel. |
| **3 · Full autopilot** | Sends on the day, within your budget rules. You get a receipt afterwards. |

**Fail-safe:** if an auto-send fails or data is missing (no phone number, no address), Rem drops
back to level 1 and asks you. It never skips silently.

### 3.5 Messages
- **AI-written drafts** using the person's profile, your notes, past messages (so it never repeats
  itself) and a **tone** (warm, funny, formal, short, poetic). Regenerate, shorten, or "make it more me".
- **Your voice:** learn your style from messages you approved or edited.
- **Templates** with variables (`{{nickname}}`, `{{age}}`, `{{years_married}}`).
- **Multi-language** drafts and the recipient's preferred language.
- **Media:** photo memories (attach a photo of you two), voice notes, short video messages,
  animated e-cards.
- **Send at the right time:** default 9:00 in the *recipient's* timezone, configurable.

### 3.6 Delivery channels
| Channel | How | Notes |
|---|---|---|
| Email | Your own Gmail/Outlook (OAuth, sent *as you*) or Rem's domain | Sending as you feels more personal |
| SMS | Twilio | Needs consent rules and US A2P 10DLC registration |
| WhatsApp | WhatsApp Business Platform (Twilio) | Template approval needed for first contact |
| **One-tap send** | Opens your phone's SMS/WhatsApp/iMessage with the text already written | Most personal option. iMessage cannot be automated, so this is the fallback |
| E-card | Rem-hosted card page with an animation, a message and an optional gift reveal | Great for "wow" at low cost |
| Postcard / letter | Lob API | Real paper mail, printed and posted |
| Social | Copy and deep-link only | Platforms do not allow automated posting to others' walls |

### 3.7 Gifts
- **Gift cards / digital gifts:** Tremendous or Tango Card APIs (Amazon, Starbucks, Uber Eats,
  charity donations, etc.).
- **Physical gifts:** gifting APIs where the **recipient picks the address and can swap the gift**
  (e.g. Goody). This removes the "I don't have their address" problem.
- **Postcards / letters / flowers:** Lob for mail; flower/food partners by region (later).
- **Gift ideas:** AI suggestions from interests, age, budget, past gifts (never the same twice)
  and their wishlist.
- **Wishlists:** recipients can keep a wishlist through their "Ask them" link.
- **Budgets:** per person, per occasion type, per month or year, plus a **hard monthly spending cap**.
- **Group gifts:** invite friends to chip in for one bigger gift, with automatic collection and a
  shared card everyone signs.
- **Gift history** and "they loved it / meh" feedback.

### 3.8 Relationship extras (ideas that make Rem sticky)
- **"Keep in touch" nudges:** "You haven't spoken to Tunde in 4 months", with a cadence per Circle.
- **Thank-you tracker:** remember who sent *you* something, and draft a thank-you.
- **Memory journal:** save a moment or photo with someone, and Rem uses it in next year's message.
- **Milestone boosts:** for big birthdays and anniversaries, suggest something bigger weeks ahead.
- **Life-event capture:** forward an email or type "Ada got engaged!" and Rem creates the occasion
  and suggests a congrats message.
- **Kids' birthdays of friends**, pets' birthdays.
- **Business mode (later):** clients and employees, company budget, CSV export for accounting.

### 3.9 Simplicity checklist (UX)
- **3-minute onboarding:** connect contacts → Rem finds birthdays → choose your top people
  → choose an autopilot level → done.
- **Home = Upcoming timeline** (next 30 days) with one primary action on each card.
- **Everything doable in ≤ 2 taps** from a notification: *Approve*, *Edit*, *Skip*.
- Good empty states, sensible defaults, no setup required per person.

---

## 4. Technical architecture (JavaScript / TypeScript)

### 4.1 Stack
| Layer | Choice | Why |
|---|---|---|
| Language | **TypeScript** everywhere | One language for web, server, mobile and shared logic |
| Monorepo | **Turborepo + pnpm workspaces** | Share code between web and mobile |
| Web app | **Next.js (App Router)** + React | SSR, API routes, easy deploy; becomes a PWA |
| UI | **Tailwind CSS + shadcn/ui** | Fast, accessible components |
| Mobile (phase 4) | **Expo (React Native) + Expo Router** | Same React skills, native contacts, push, widgets |
| API | **tRPC** (or REST route handlers) with **Zod** validation | Type-safe end to end; the same client works on Expo |
| Database | **PostgreSQL** (Neon or Supabase) | Relational data, reliable |
| ORM | **Drizzle ORM** (Prisma also fine) | Typed schema, simple migrations |
| Auth | **Better Auth** or **Auth.js** (Google, Apple, email magic link, passkeys) | Works for web + mobile |
| Jobs & scheduling | **pg-boss** (queue in Postgres) at first; **Inngest / Trigger.dev** if we outgrow it | Durable, retried, idempotent jobs with no extra infrastructure |
| Email | **Resend + React Email**; Gmail/Microsoft Graph APIs for "send as me" | Good templates and deliverability |
| SMS / WhatsApp | **Twilio** | One provider for both |
| Push | **Web Push (VAPID)** now, **Expo Notifications** later | |
| Payments | **Stripe** (saved card, off-session charges, wallet top-ups) | Needed for gifts on autopilot |
| Gifts | Tremendous / Tango Card, Goody, Lob | See 3.7 |
| AI | **Claude API** (`@anthropic-ai/sdk`) | Message drafts, gift ideas, parsing life events |
| Files | S3-compatible storage (Cloudflare R2) | Photos, voice notes, e-card media |
| Dates | **date-fns + date-fns-tz** (or Temporal polyfill) | Timezone-safe recurrence |
| Observability | Sentry, PostHog (product analytics), structured logs | |
| Hosting | Vercel (web) + Railway/Fly/Render (worker) + Neon (DB) | Long-running worker kept separate from serverless |
| Testing | Vitest (unit), Playwright (e2e) | |

### 4.2 Repository layout
```
rem/
├─ apps/
│  ├─ web/            # Next.js app (PWA)
│  ├─ worker/         # Node worker: scheduler + job handlers (pg-boss)
│  └─ mobile/         # Expo app (phase 4)
├─ packages/
│  ├─ core/           # domain logic: recurrence, lead times, autopilot rules (pure TS, heavily tested)
│  ├─ db/             # Drizzle schema, migrations, queries
│  ├─ api/            # tRPC routers (used by web + mobile)
│  ├─ integrations/   # email, sms, whatsapp, gifts, payments, AI adapters (one interface per kind)
│  ├─ emails/         # React Email templates
│  └─ ui/             # shared design tokens / components
└─ docs/
```

### 4.3 Data model (first version)
```
User(id, name, email, timezone, defaultSendHour, plan, createdAt)
Circle(id, userId, name, autopilotLevel, defaultPlanId, keepInTouchDays)
Person(id, userId, displayName, nickname, relationship, email, phone, whatsapp,
       address(json), timezone, language, preferredChannel, notes, interests[],
       doNotContact, sourceRef, householdId)
PersonCircle(personId, circleId)
Occasion(id, personId|householdId, type, label, month, day, year?, recurrence,
         feb29Rule, isSensitive, planId?)
Plan(id, userId, name, steps[]: {kind: message|ecard|giftcard|gift|postcard,
     channel, tone, templateId?, budgetCents?, leadDays})
Moment(id, occasionId, occursOn(date), status, idempotencyKey UNIQUE)   -- one per occasion per year
Action(id, momentId, kind, channel, status, scheduledFor(timestamptz),
       draft(json), approvedAt, sentAt, providerRef, costCents, error, attempts)
Reminder(id, momentId, sendAt, channel, status)
Budget(id, userId, scope(person|circle|global), period, limitCents)
GiftHistory(id, personId, momentId, description, costCents, reaction)
Memory(id, personId, text, mediaUrl, date)
Integration(id, userId, provider, encryptedTokens, scopes)
AuditLog(id, userId, entity, entityId, event, data, createdAt)
```

### 4.4 Scheduling engine (the most important piece to get right)
1. **Planner (runs every hour):** for each occasion, compute the next occurrence in the
   *recipient's* timezone and **upsert a `Moment`** with
   `idempotencyKey = occasionId + year`. Running it twice never creates duplicates.
2. **Materialize actions:** from the Plan, create `Action` rows with
   `scheduledFor = occursOn @ sendHour(recipient tz) - leadDays`, and create `Reminder` rows
   based on the autopilot level.
3. **State machine per Action:**
   `planned → drafted → awaiting_approval → approved → scheduled → sending → sent → delivered`
   with `failed`, `skipped` and `cancelled`. Every transition is written to `AuditLog`.
4. **Executor:** pg-boss jobs with `singletonKey = actionId`, exponential backoff retries,
   a dead-letter queue, and provider idempotency keys (Stripe, gift APIs) so a retry can never
   charge twice.
5. **Guards before every send:** budget check, `doNotContact`, missing data, user's global
   **pause switch**, and "is this moment still valid?" (the person or occasion may have been edited).
6. **Delivery webhooks** (Twilio, Resend, gift providers) update the status and notify the user
   of failures, which fall back to autopilot level 1.
7. **All recurrence and timezone logic lives in `packages/core`** as pure functions with
   table-driven tests (leap years, DST changes, timezone changes, edits after scheduling).

### 4.5 AI usage
- **Draft message:** input = person profile + occasion + tone + last 3 messages sent to them +
  user's style samples. Output = 3 variants (JSON with Zod validation).
- **Gift ideas:** input = interests, age band, budget, past gifts, wishlist. Output = ranked ideas,
  each mapped to a catalog item when possible.
- **Parse free text** ("Ada got engaged on Saturday") into a structured occasion.
- Guardrails: never invent facts (only use profile data), a length limit per channel, a safety
  filter, and caching of drafts per moment. Send only the fields the prompt needs.

### 4.6 Security, privacy & compliance
- Encrypt OAuth tokens and sensitive personal data at the application level; least-privilege OAuth scopes.
- Row-level authorization (every query scoped by `userId`), rate limits, audit log.
- **Recipients are not users:** honor opt-out links in every SMS/email ("STOP"), keep a global
  suppression list, and identify the sender in messages.
- SMS: TCPA / A2P 10DLC registration (US); WhatsApp template approval.
- Email: CAN-SPAM, SPF/DKIM/DMARC on the sending domain.
- GDPR/CCPA: data export, account deletion, and a privacy policy that covers third-party contact data.
- Payments: Stripe only (no card data touches our servers), spending caps, 2FA for autopilot gifts.

---

## 5. Web → mobile path
1. **Phase 1-3: responsive PWA.** Installable on the home screen, web push (iOS 16.4+ supports it
   for installed PWAs), offline read of the Upcoming list.
2. **All business logic in `packages/core` + `packages/api`**, so the mobile app is mainly UI.
3. **Phase 4: Expo app** reusing the tRPC client, Zod schemas and core logic. Native extras:
   reading phone contacts, rich push notifications with **Approve / Edit** buttons, home-screen
   widget "Next birthday", share sheet ("Add this to Rem"), and one-tap send through native SMS/WhatsApp.
4. Ship through EAS Build/Submit; over-the-air updates through EAS Update.

---

## 6. Roadmap

### Phase 0: Foundations (week 1)
- [ ] Turborepo + pnpm, Next.js, Tailwind/shadcn, Drizzle + Postgres, auth
- [ ] CI (lint, typecheck, Vitest, Playwright), preview deploys, Sentry
- [ ] `packages/core` recurrence + timezone engine with tests

### Phase 1: MVP: "Never forget" (weeks 2-5)
- [ ] People CRUD, Circles, CSV/vCard import, Google Contacts import
- [ ] Occasions (birthday, anniversary, custom) with automatic detection from contacts
- [ ] Upcoming timeline (home screen)
- [ ] Planner + reminders by email and web push, weekly digest, ICS calendar feed
- [ ] AI message drafts + approve-and-send **by email** (autopilot levels 0-1)
- [ ] One-tap send links (SMS/WhatsApp prefilled text)
- [ ] Onboarding flow, PWA install

### Phase 2: "It sends for me" (weeks 6-9)
- [ ] Autopilot levels 2-3 with preview and cancel window
- [ ] SMS + WhatsApp through Twilio, delivery webhooks, opt-out handling
- [ ] Send email as the user through the Gmail / Microsoft Graph APIs
- [ ] E-cards (hosted card page with message, photo and animation)
- [ ] "Ask them" link (birthday, address, preferences)
- [ ] Holidays & cultural dates per Circle

### Phase 3: Gifts (weeks 10-14)
- [ ] Stripe billing + wallet / saved card, budgets & caps
- [ ] Gift cards (Tremendous / Tango), postcards (Lob), recipient-picks gifts (Goody-style)
- [ ] AI gift ideas, gift history, wishlists
- [ ] Group gifts & shared signed cards

### Phase 4: Mobile app (weeks 15-20)
- [ ] Expo app: auth, Upcoming, People, approve from notification
- [ ] Native contacts import, widgets, share sheet
- [ ] App Store / Play Store release

### Phase 5: Delight & growth (ongoing)
- [ ] Keep-in-touch nudges, memory journal, thank-you tracker
- [ ] "Your voice" style learning, voice/video messages
- [ ] Referral loop: every e-card has a subtle "Sent with Rem"
- [ ] Business mode (clients/employees)

---

## 7. Monetization (optional)
- **Free:** up to 50 people, reminders, AI drafts, email + one-tap send.
- **Plus (~$4-6/mo):** unlimited people, autopilot, SMS/WhatsApp, e-cards, calendar sync.
- **Gifts:** small service fee per gift or a margin through partner APIs.
- **Business:** per seat, with company budgets and reports.

---

## 8. Success metrics
- % of upcoming moments that get an action (target > 80%)
- Missed moments (target ≈ 0) and duplicate sends (target = 0)
- Time to approve a draft (target < 10 s)
- Onboarding completion and number of people added in the first session
- Recipient replies / reactions to e-cards (a proxy for "it felt personal")

## 9. Open questions
- Default sender: Rem's domain or the user's own email? (Proposal: the user's own email when connected.)
- Which countries come first? This decides gift partners, SMS rules and holidays.
- Do we hold gift money in a wallet (top-up) or charge per gift? (A wallet makes autopilot safer.)
- How much of a person's data do we send to the AI provider? (Proposal: only the fields the
  prompt needs, never addresses or phone numbers.)
