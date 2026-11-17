import { completenessScore } from "@rem/core";
import { listPeople } from "@rem/db";
import { Avatar } from "@/components/avatar";
import { OccasionIcon } from "@/components/icons";
import { db } from "@/lib/db";
import { OCCASION_LABELS, shortDate } from "@/lib/labels";
import { currentUser } from "@/lib/session";
import { AddPersonForm } from "./add-person-form";

export const dynamic = "force-dynamic";

function CompletenessRing({ score }: { score: number }) {
  return (
    <span
      role="img"
      aria-label={`Profile ${score}% complete`}
      title="Profile completeness"
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(var(--color-pine) 0 ${score}%, var(--color-pine-tint) ${score}% 100%)` }}
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-card text-[10px] font-bold">{score}%</span>
    </span>
  );
}

export default async function PeoplePage() {
  const user = await currentUser();
  const people = await listPeople(db, user.id);
  const missingBirthday = people.filter((p) => !p.occasions.some((o) => o.type === "birthday")).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">People</h1>
        <p className="text-sm text-muted">
          {people.length} {people.length === 1 ? "person" : "people"}
          {missingBirthday > 0 && ` · ${missingBirthday} missing a birthday`}
        </p>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="order-2 lg:order-1">
          {people.length === 0 ? (
            <p className="rounded-2xl bg-card p-6 text-center text-body shadow-sm">No one here yet. Add someone, or import your contacts.</p>
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-card shadow-sm">
              {people.map((p) => {
                const score = completenessScore({ ...p, hasBirthday: p.occasions.some((o) => o.type === "birthday") });
                return (
                  <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                    <Avatar name={p.displayName} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{p.displayName}</p>
                      {p.occasions.length ? (
                        <p className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted">
                          {p.occasions.map((o) => (
                            <span key={o.id} className="flex items-center gap-1" title={OCCASION_LABELS[o.type]}>
                              <OccasionIcon type={o.type} size={14} />
                              <span className="sr-only">{OCCASION_LABELS[o.type]}:</span>
                              {shortDate(o.month, o.day)}
                            </span>
                          ))}
                        </p>
                      ) : (
                        <p className="text-sm text-apricot-ink">No dates yet</p>
                      )}
                    </div>
                    <CompletenessRing score={score} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <div className="order-1 lg:order-2">
          <AddPersonForm />
        </div>
      </div>
    </div>
  );
}
