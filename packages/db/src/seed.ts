import { eq } from "drizzle-orm";
import { createDb } from "./client";
import { importContacts, runPlanner } from "./queries";
import { users } from "./schema";

/** Development data: one user and a few people with dates spread over the next weeks. */
const db = createDb();
const email = "dev@rem.local";
await db.insert(users).values({ name: "Dev User", email, timezone: "Europe/London" }).onConflictDoNothing();
const [user] = await db.select().from(users).where(eq(users.email, email));

const soon = (days: number) => {
  const d = new Date(Date.now() + days * 86_400_000);
  return { month: d.getUTCMonth() + 1, day: d.getUTCDate() };
};
const result = await importContacts(db, user!.id, [
  { displayName: "Ada Obi", emails: ["ada@example.com"], phones: [], birthday: { ...soon(3), year: 1997 }, labels: ["Close friends"] },
  { displayName: "Mum", emails: ["mum@example.com"], phones: [], birthday: { ...soon(12), year: 1966 }, labels: ["Family"] },
  { displayName: "Tunde Bello", emails: ["tunde@example.com"], phones: [], birthday: soon(25), anniversary: { ...soon(40), year: 2016 }, labels: ["Close friends"] },
]);
console.log("Seeded", result, await runPlanner(db));
await db.pool.end();
