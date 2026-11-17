import { listPeople, listUpcoming } from "@rem/db";
import { json, preflight } from "@/lib/api";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

export async function GET() {
  const user = await currentUser();
  const [items, people] = await Promise.all([listUpcoming(db, user.id), listPeople(db, user.id)]);
  return json({ timezone: user.timezone, peopleCount: people.length, items });
}
