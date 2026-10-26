import {
  formatDate,
  isMilestone,
  matchKeys,
  normalizeEmail,
  normalizePhone,
  parseDate,
  planMoments,
  todayIn,
  yearsSince,
  type ImportedContact,
} from "@rem/core";
import { and, asc, eq, gte, inArray } from "drizzle-orm";
import type { CountryCode } from "libphonenumber-js";
import type { Db } from "./client.js";
import { toRecurrence } from "./mappers.js";
import { circles, moments, occasions, people, personCircles, reminders, users } from "./schema.js";

export type OccasionType = (typeof occasions.$inferInsert)["type"];

/**
 * Create moments and reminders for everything coming up within the horizon.
 * Safe to run any number of times: unique idempotency keys turn repeats into no-ops.
 */
export async function runPlanner(db: Db, opts: { now?: Date; horizonDays?: number } = {}) {
  const now = opts.now ?? new Date();
  const rows = await db
    .select({ occasion: occasions, personTz: people.timezone, userTz: users.timezone, userId: users.id })
    .from(occasions)
    .innerJoin(people, eq(occasions.personId, people.id))
    .innerJoin(users, eq(people.userId, users.id));

  let created = 0;
  for (const r of rows) {
    const userTz = r.userTz;
    const [planned] = planMoments(
      [{ id: r.occasion.id, recurrence: toRecurrence(r.occasion), timeZone: r.personTz ?? userTz, actionKinds: ["message"] }],
      { now, horizonDays: opts.horizonDays ?? 60, userTimeZone: userTz },
    );
    if (!planned) continue;

    await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(moments)
        .values({ occasionId: planned.occasionId, occursOn: formatDate(planned.occursOn), idempotencyKey: planned.idempotencyKey })
        .onConflictDoNothing({ target: moments.idempotencyKey })
        .returning({ id: moments.id });
      const momentId =
        inserted[0]?.id ??
        (await tx.select({ id: moments.id }).from(moments).where(eq(moments.idempotencyKey, planned.idempotencyKey)))[0]!.id;
      if (inserted[0]) created++;
      if (planned.reminders.length) {
        await tx
          .insert(reminders)
          .values(planned.reminders.map((rem) => ({ momentId, sendAt: rem.sendAt, idempotencyKey: rem.idempotencyKey })))
          .onConflictDoNothing({ target: reminders.idempotencyKey });
      }
    });
  }
  return { occasions: rows.length, momentsCreated: created };
}

export interface UpcomingItem {
  momentId: string;
  occursOn: string;
  daysAway: number;
  personId: string;
  personName: string;
  occasionType: OccasionType;
  label: string | null;
  years: number | null;
  milestone: boolean;
}

/** The home-screen timeline: moments from today onward, soonest first. */
export async function listUpcoming(db: Db, userId: string, now = new Date()): Promise<UpcomingItem[]> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return [];
  const today = todayIn(user.timezone, now);
  const rows = await db
    .select({ moment: moments, occasion: occasions, person: people })
    .from(moments)
    .innerJoin(occasions, eq(moments.occasionId, occasions.id))
    .innerJoin(people, eq(occasions.personId, people.id))
    .where(and(eq(people.userId, userId), eq(moments.status, "upcoming"), gte(moments.occursOn, formatDate(today))))
    .orderBy(asc(moments.occursOn));

  return rows.map(({ moment, occasion, person }) => {
    const on = parseDate(moment.occursOn);
    const years = occasion.recurrence === "yearly" ? yearsSince(occasion.year ?? undefined, on) : null;
    const kind = occasion.type === "birthday" ? "age" : "anniversary";
    return {
      momentId: moment.id,
      occursOn: moment.occursOn,
      daysAway: Math.round((Date.UTC(on.year, on.month - 1, on.day) - Date.UTC(today.year, today.month - 1, today.day)) / 86_400_000),
      personId: person.id,
      personName: person.nickname ?? person.displayName,
      occasionType: occasion.type,
      label: occasion.label,
      years,
      milestone: occasion.type !== "memorial" && isMilestone(years, kind),
    };
  });
}

/**
 * Import contacts, skipping people already present (matched by normalized email or phone),
 * creating birthday/anniversary occasions and Circles from source labels.
 */
export async function importContacts(
  db: Db,
  userId: string,
  contacts: ImportedContact[],
  defaultCountry?: CountryCode,
) {
  const existing = await db.select({ email: people.email, phone: people.phone }).from(people).where(eq(people.userId, userId));
  const seen = new Set(existing.flatMap((p) => matchKeys(p, defaultCountry)));
  const result = { imported: 0, skipped: 0, birthdays: 0, anniversaries: 0 };

  await db.transaction(async (tx) => {
    const circleIds = new Map<string, string>();
    const circleFor = async (name: string) => {
      const cached = circleIds.get(name);
      if (cached) return cached;
      await tx.insert(circles).values({ userId, name }).onConflictDoNothing();
      const [c] = await tx.select({ id: circles.id }).from(circles).where(and(eq(circles.userId, userId), eq(circles.name, name)));
      circleIds.set(name, c!.id);
      return c!.id;
    };

    for (const c of contacts) {
      const email = c.emails.map((e) => normalizeEmail(e)).find(Boolean) ?? null;
      const phone = c.phones.map((p) => normalizePhone(p, defaultCountry)).find(Boolean) ?? null;
      const keys = matchKeys({ email, phone });
      if (!c.displayName || keys.some((k) => seen.has(k))) {
        result.skipped++;
        continue;
      }
      keys.forEach((k) => seen.add(k));

      const [person] = await tx
        .insert(people)
        .values({ userId, displayName: c.displayName, email, phone, notes: c.notes, sourceRef: c.sourceRef })
        .returning({ id: people.id });
      const personId = person!.id;
      result.imported++;

      const dates: { type: OccasionType; d: ImportedContact["birthday"] }[] = [
        { type: "birthday", d: c.birthday },
        { type: "wedding_anniversary", d: c.anniversary },
      ];
      for (const { type, d } of dates) {
        if (!d) continue;
        await tx.insert(occasions).values({ personId, type, month: d.month, day: d.day, year: d.year ?? null, source: "import" });
        result[type === "birthday" ? "birthdays" : "anniversaries"]++;
      }
      for (const label of c.labels) {
        await tx.insert(personCircles).values({ personId, circleId: await circleFor(label) }).onConflictDoNothing();
      }
    }
  });
  return result;
}

export async function listPeople(db: Db, userId: string) {
  const ps = await db.select().from(people).where(eq(people.userId, userId)).orderBy(asc(people.displayName));
  const occ = ps.length
    ? await db.select().from(occasions).where(inArray(occasions.personId, ps.map((p) => p.id)))
    : [];
  return ps.map((p) => ({ ...p, occasions: occ.filter((o) => o.personId === p.id) }));
}
