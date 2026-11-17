import { listPeople, listUpcoming, type UpcomingItem } from "@rem/db";
import Link from "next/link";
import { markDoneAction } from "./actions";
import { Avatar } from "@/components/avatar";
import { CheckIcon, OccasionIcon, PlusIcon, UploadIcon } from "@/components/icons";
import { db } from "@/lib/db";
import { dateParts, longDateIn, OCCASION_LABELS, ordinal, whenLabel } from "@/lib/labels";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

function title(m: UpcomingItem) {
  if (m.occasionType === "birthday" && m.years !== null) return `Turns ${m.years}`;
  if (m.years !== null && m.years > 0) return `${ordinal(m.years)} ${OCCASION_LABELS[m.occasionType].toLowerCase()}`;
  return m.label ?? OCCASION_LABELS[m.occasionType];
}

function groupOf(daysAway: number) {
  if (daysAway <= 7) return "This week";
  if (daysAway <= 31) return "Next 30 days";
  return "Later";
}

function StatusPill({ m }: { m: UpcomingItem }) {
  if (m.milestone) return <span className="rounded-lg bg-coral-tint px-2 py-1 text-xs font-semibold text-coral-ink">Milestone</span>;
  const tone = m.daysAway <= 7 ? "bg-apricot-tint text-apricot-ink" : "bg-sky-tint text-sky-ink";
  return <span className={`rounded-lg px-2 py-1 text-xs font-semibold whitespace-nowrap ${tone}`}>{whenLabel(m.daysAway)}</span>;
}

function MarkDone({ momentId, label, variant = "subtle" }: { momentId: string; label: string; variant?: "subtle" | "party" }) {
  return (
    <form action={markDoneAction}>
      <input type="hidden" name="momentId" value={momentId} />
      {variant === "party" ? (
        <button className="flex h-12 items-center gap-2 rounded-full bg-party-ink px-5 font-semibold text-party-paper hover:opacity-90">
          <CheckIcon size={18} /> Mark done
        </button>
      ) : (
        <button aria-label={label} title="Mark done" className="grid h-11 w-11 place-items-center rounded-xl text-muted hover:bg-subtle hover:text-ink">
          <CheckIcon />
        </button>
      )}
    </form>
  );
}

/** The next moment, in Confetti colours: the one place the app celebrates. */
function Hero({ m }: { m: UpcomingItem }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-coral p-5 text-party-ink md:p-7">
      <span aria-hidden className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-sunflower" />
      <span aria-hidden className="absolute top-6 right-32 h-7 w-2.5 rotate-[28deg] rounded-md bg-party-paper" />
      <span aria-hidden className="absolute top-28 right-8 h-3 w-3 rounded-full bg-party-ink" />
      <span aria-hidden className="absolute top-14 right-48 hidden h-3.5 w-3.5 rounded-full bg-lilac sm:block" />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-party-paper font-serif text-xl font-semibold">
            <OccasionIcon type={m.occasionType} size={26} />
          </span>
          <div>
            <p className="text-sm font-semibold">
              {dateParts(m.occursOn).weekdayLong} · {whenLabel(m.daysAway).toLowerCase()}
            </p>
            <h2 className="font-serif text-3xl leading-tight font-semibold">
              {m.personName}
              <span className="block font-normal italic sm:inline">
                <span className="hidden sm:inline"> · </span>
                {title(m).toLowerCase()}
              </span>
            </h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <MarkDone momentId={m.momentId} label={`Mark ${m.personName} done`} variant="party" />
        </div>
      </div>
    </section>
  );
}

function Row({ m }: { m: UpcomingItem }) {
  const d = dateParts(m.occursOn);
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="w-11 shrink-0 text-center">
        <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">{d.month}</p>
        <p className="text-xl leading-none font-extrabold">{d.day}</p>
      </div>
      <span className="hidden sm:block">
        <Avatar name={m.personName} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{m.personName}</p>
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <OccasionIcon type={m.occasionType} size={15} className="shrink-0" />
          <span className="truncate">{title(m)}</span>
        </p>
        <span className="mt-1 inline-block sm:hidden">
          <StatusPill m={m} />
        </span>
      </div>
      <span className="hidden sm:block">
        <StatusPill m={m} />
      </span>
      <MarkDone momentId={m.momentId} label={`Mark ${m.personName}'s ${OCCASION_LABELS[m.occasionType].toLowerCase()} done`} />
    </li>
  );
}

function Tile({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${strong ? "bg-pine text-on-pine" : "bg-card shadow-sm"}`}>
      <p className={`text-sm ${strong ? "opacity-80" : "text-muted"}`}>{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

export default async function UpcomingPage() {
  const user = await currentUser();
  const [items, people] = await Promise.all([listUpcoming(db, user.id), listPeople(db, user.id)]);
  const today = longDateIn(user.timezone);

  const header = (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm text-muted">{today}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">Coming up</h1>
      </div>
      <Link href="/people" aria-label="Add someone" className="flex h-11 items-center gap-2 rounded-xl bg-pine px-3 font-bold text-on-pine hover:bg-pine-hover sm:px-4">
        <PlusIcon size={20} /> <span className="hidden sm:inline">Add someone</span>
      </Link>
    </div>
  );

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        {header}
        <section className="rounded-3xl bg-card p-8 text-center shadow-sm md:p-12">
          <span aria-hidden className="mx-auto mb-4 flex w-fit gap-2">
            <span className="h-3 w-3 rounded-full bg-coral" />
            <span className="h-3 w-3 rounded-full bg-sunflower" />
            <span className="h-3 w-3 rounded-full bg-lilac" />
          </span>
          <h2 className="text-xl font-extrabold">Nothing coming up yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-body">Add the people you care about and Rem will remember their days for you.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/import" className="flex h-12 items-center gap-2 rounded-xl bg-pine px-5 font-bold text-on-pine hover:bg-pine-hover">
              <UploadIcon size={18} /> Import contacts
            </Link>
            <Link href="/people" className="flex h-12 items-center gap-2 rounded-xl bg-subtle px-5 font-bold hover:bg-line">
              <PlusIcon size={18} /> Add someone
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const [next, ...rest] = items;
  const groups = Object.groupBy(rest, (i) => groupOf(i.daysAway));
  const thisWeek = items.filter((i) => i.daysAway <= 7).length;
  const milestones = items.filter((i) => i.milestone).length;

  return (
    <div className="space-y-6">
      {header}
      <div className="grid grid-cols-3 gap-3">
        <Tile label="This week" value={thisWeek} strong />
        <Tile label="Milestones" value={milestones} />
        <Tile label="People" value={people.length} />
      </div>
      <Hero m={next!} />
      {(["This week", "Next 30 days", "Later"] as const).map((g) =>
        groups[g]?.length ? (
          <section key={g} className="space-y-2">
            <h2 className="text-sm font-bold">{g}</h2>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-card shadow-sm">
              {groups[g]!.map((m) => (
                <Row key={m.momentId} m={m} />
              ))}
            </ul>
          </section>
        ) : null,
      )}
    </div>
  );
}
