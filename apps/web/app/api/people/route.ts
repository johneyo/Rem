import { completenessScore } from "@rem/core";
import { addPerson, listPeople, runPlanner } from "@rem/db";
import { json, preflight } from "@/lib/api";
import { db } from "@/lib/db";
import { personSchema } from "@/lib/person-schema";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

export async function GET() {
  const user = await currentUser();
  const people = await listPeople(db, user.id);
  return json({
    people: people.map((p) => ({
      id: p.id,
      displayName: p.displayName,
      completeness: completenessScore({ ...p, hasBirthday: p.occasions.some((o) => o.type === "birthday") }),
      occasions: p.occasions.map((o) => ({ id: o.id, type: o.type, month: o.month, day: o.day, year: o.year })),
    })),
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const raw = Object.fromEntries(Object.entries(body ?? {}).map(([k, v]) => [k, v == null ? "" : String(v)]));
  const parsed = personSchema.safeParse(raw);
  if (!parsed.success) return json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  const v = parsed.data;
  const user = await currentUser();
  const person = await addPerson(db, user.id, {
    displayName: v.displayName,
    email: v.email,
    phone: v.phone,
    birthday: v.month ? { month: v.month, day: v.day, year: v.year } : null,
  });
  await runPlanner(db, { userId: user.id });
  return json({ id: person.id, displayName: person.displayName }, { status: 201 });
}
