import { listUpcoming, type UpcomingItem } from "@rem/db";
import Link from "next/link";
import { markDoneAction } from "./actions";
import { db } from "@/lib/db";
import { OCCASION_EMOJI, OCCASION_LABELS, ordinal, whenLabel } from "@/lib/labels";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

function groupOf(daysAway: number) {
  if (daysAway <= 7) return "This week";
  if (daysAway <= 31) return "This month";
  return "Later";
}

function title(m: UpcomingItem) {
  if (m.occasionType === "birthday" && m.years !== null) return `Turns ${m.years}`;
  if (m.years !== null && m.years > 0) return `${ordinal(m.years)} ${OCCASION_LABELS[m.occasionType].toLowerCase()}`;
  return m.label ?? OCCASION_LABELS[m.occasionType];
}

export default async function UpcomingPage() {
  const user = await currentUser();
  const items = await listUpcoming(db, user.id);

  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-line p-10 text-center">
        <p className="text-4xl">🎈</p>
        <h1 className="mt-3 text-xl font-semibold">Nothing coming up yet</h1>
        <p className="mt-1 text-muted">Add the people you care about and Rem will remember their days for you.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/import" className="rounded-full bg-brand px-5 py-2.5 font-medium text-white hover:bg-brand-dark">
            Import contacts
          </Link>
          <Link href="/people" className="rounded-full border border-line px-5 py-2.5 font-medium hover:bg-line">
            Add someone
          </Link>
        </div>
      </section>
    );
  }

  const groups = Object.groupBy(items, (i) => groupOf(i.daysAway));
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Upcoming</h1>
      {(["This week", "This month", "Later"] as const).map((g) =>
        groups[g]?.length ? (
          <section key={g}>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted">{g}</h2>
            <ul className="space-y-3">
              {groups[g]!.map((m) => (
                <li key={m.momentId} className="flex items-center gap-4 rounded-2xl border border-line bg-card p-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-paper text-2xl" aria-hidden>
                    {OCCASION_EMOJI[m.occasionType]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{m.personName}</p>
                    <p className="text-sm text-muted">
                      {title(m)} · {whenLabel(m.daysAway)}
                      {m.milestone && <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">Milestone</span>}
                    </p>
                  </div>
                  <form action={markDoneAction}>
                    <input type="hidden" name="momentId" value={m.momentId} />
                    <button className="rounded-full border border-line px-3 py-1.5 text-sm hover:bg-line">Mark done</button>
                  </form>
                </li>
              ))}
            </ul>
          </section>
        ) : null,
      )}
    </div>
  );
}
