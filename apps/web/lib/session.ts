import { users } from "@rem/db";
import { eq } from "drizzle-orm";
import { db } from "./db";

const DEV_EMAIL = "dev@rem.local";

/**
 * The signed-in user. Until authentication lands this is a single development user,
 * so every page goes through this one function and nothing else needs changing later.
 */
export async function currentUser() {
  const [existing] = await db.select().from(users).where(eq(users.email, DEV_EMAIL));
  if (existing) return existing;
  const [created] = await db
    .insert(users)
    .values({ name: "Dev User", email: DEV_EMAIL, timezone: "Europe/London" })
    .onConflictDoNothing()
    .returning();
  return created ?? (await db.select().from(users).where(eq(users.email, DEV_EMAIL)))[0]!;
}
