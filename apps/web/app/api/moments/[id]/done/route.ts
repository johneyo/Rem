import { markMomentDone } from "@rem/db";
import { json, preflight } from "@/lib/api";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const OPTIONS = preflight;

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await currentUser();
  const ok = await markMomentDone(db, user.id, id);
  return ok ? json({ ok: true }) : json({ error: "Not found" }, { status: 404 });
}
