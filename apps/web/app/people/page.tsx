import { completenessScore } from "@rem/core";
import { listPeople } from "@rem/db";
import { db } from "@/lib/db";
import { OCCASION_EMOJI, shortDate } from "@/lib/labels";
import { currentUser } from "@/lib/session";
import { AddPersonForm } from "./add-person-form";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const user = await currentUser();
  const people = await listPeople(db, user.id);
  const missingBirthday = people.filter((p) => !p.occasions.some((o) => o.type === "birthday")).length;

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">People</h1>
        <p className="text-sm text-muted">
          {people.length} people{missingBirthday > 0 && ` · ${missingBirthday} missing a birthday`}
        </p>
      </div>
      <AddPersonForm />
      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
        {people.map((p) => {
          const score = completenessScore({ ...p, hasBirthday: p.occasions.some((o) => o.type === "birthday") });
          return (
            <li key={p.id} className="flex items-center gap-3 px-4 py-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-paper font-medium">
                {p.displayName.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.displayName}</p>
                <p className="truncate text-sm text-muted">
                  {p.occasions.length
                    ? p.occasions.map((o) => `${OCCASION_EMOJI[o.type]} ${shortDate(o.month, o.day)}`).join("  ")
                    : "No dates yet"}
                </p>
              </div>
              <span className="text-xs text-muted" title="Profile completeness">{score}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
