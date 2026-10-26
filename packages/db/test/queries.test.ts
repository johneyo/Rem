import { migrate } from "drizzle-orm/node-postgres/migrator";
import { sql } from "drizzle-orm";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { claimDueReminders, createDb, importContacts, listUpcoming, releaseReminder, runPlanner, users } from "../src/index.js";

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("queries (integration)", () => {
  const db = createDb(url);
  let userId: string;

  beforeAll(async () => {
    await db.execute(sql`drop schema if exists public cascade; drop schema if exists drizzle cascade; create schema public;`);
    await migrate(db, { migrationsFolder: fileURLToPath(new URL("../migrations", import.meta.url)) });
    const [u] = await db.insert(users).values({ name: "Test", email: "t@example.com", timezone: "Europe/London" }).returning();
    userId = u!.id;
  });
  afterAll(() => db.pool.end());

  const now = new Date("2027-03-01T12:00:00Z");

  it("imports contacts and skips duplicates by email or phone", async () => {
    const contacts = [
      { displayName: "Ada Obi", emails: ["Ada@Example.com"], phones: [], birthday: { year: 1987, month: 3, day: 14 }, labels: ["Family"] },
      { displayName: "Tunde", emails: [], phones: ["+44 7700 900123"], birthday: { month: 3, day: 20 }, labels: [] },
    ];
    expect(await importContacts(db, userId, contacts)).toEqual({ imported: 2, skipped: 0, birthdays: 2, anniversaries: 0 });
    const again = [
      { displayName: "Ada O.", emails: ["ada@example.com"], phones: [], labels: [] },
      { displayName: "T", emails: [], phones: ["+447700900123"], labels: [] },
    ];
    expect(await importContacts(db, userId, again)).toMatchObject({ imported: 0, skipped: 2 });
  });

  it("plans moments idempotently and lists them soonest first", async () => {
    expect(await runPlanner(db, { now, horizonDays: 30 })).toEqual({ occasions: 2, momentsCreated: 2 });
    expect(await runPlanner(db, { now, horizonDays: 30 })).toEqual({ occasions: 2, momentsCreated: 0 });

    const upcoming = await listUpcoming(db, userId, now);
    expect(upcoming.map((u) => [u.personName, u.occursOn, u.daysAway, u.years, u.milestone])).toEqual([
      ["Ada Obi", "2027-03-14", 13, 40, true],
      ["Tunde", "2027-03-20", 19, null, false],
    ]);
  });

  it("claims each due reminder once", async () => {
    // Ada's message reminder is on the day itself, 14 Mar at 08:00 London time.
    expect(await claimDueReminders(db, new Date("2027-03-14T07:59:00Z"))).toEqual([]);
    const due = await claimDueReminders(db, new Date("2027-03-14T08:00:00Z"));
    expect(due.map((d) => [d.personName, d.occasionType, d.occursOn])).toEqual([["Ada Obi", "birthday", "2027-03-14"]]);
    expect(await claimDueReminders(db, new Date("2027-03-14T08:00:00Z"))).toEqual([]);

    await releaseReminder(db, due[0]!.reminderId);
    expect(await claimDueReminders(db, new Date("2027-03-14T08:00:00Z"))).toHaveLength(1);
  });
});
