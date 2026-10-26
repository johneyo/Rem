/** A calendar date with no time or timezone. Months are 1-12. */
export interface PlainDate {
  year: number;
  month: number;
  day: number;
}

/** What to do with a 29 February date in years that have no 29 February. */
export type Feb29Rule = "feb28" | "mar1";

export type Recurrence =
  | { kind: "yearly"; month: number; day: number; startYear?: number; feb29Rule?: Feb29Rule }
  | { kind: "once"; date: PlainDate };

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function isValidDate(d: PlainDate): boolean {
  return (
    Number.isInteger(d.year) &&
    d.month >= 1 &&
    d.month <= 12 &&
    d.day >= 1 &&
    d.day <= daysInMonth(d.year, d.month)
  );
}

export function compareDates(a: PlainDate, b: PlainDate): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

export function addDays(d: PlainDate, days: number): PlainDate {
  const t = new Date(Date.UTC(d.year, d.month - 1, d.day + days));
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() };
}

export function daysBetween(from: PlainDate, to: PlainDate): number {
  const a = Date.UTC(from.year, from.month - 1, from.day);
  const b = Date.UTC(to.year, to.month - 1, to.day);
  return Math.round((b - a) / 86_400_000);
}

export function formatDate(d: PlainDate): string {
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${pad(d.year, 4)}-${pad(d.month)}-${pad(d.day)}`;
}

export function parseDate(s: string): PlainDate {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) throw new Error(`Invalid date: ${s}`);
  const d = { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
  if (!isValidDate(d)) throw new Error(`Invalid date: ${s}`);
  return d;
}

/** The date a yearly occasion falls on in a given year (handles 29 February). */
export function yearlyDateIn(
  year: number,
  month: number,
  day: number,
  feb29Rule: Feb29Rule = "feb28",
): PlainDate {
  if (month === 2 && day === 29 && !isLeapYear(year)) {
    return feb29Rule === "mar1" ? { year, month: 3, day: 1 } : { year, month: 2, day: 28 };
  }
  return { year, month, day };
}

/**
 * The first occurrence on or after `from`, or null when there is none
 * (a one-off date in the past, or a yearly occasion before its start year).
 */
export function nextOccurrence(r: Recurrence, from: PlainDate): PlainDate | null {
  if (r.kind === "once") return compareDates(r.date, from) >= 0 ? r.date : null;

  let year = Math.max(from.year, r.startYear ?? from.year);
  for (;;) {
    const d = yearlyDateIn(year, r.month, r.day, r.feb29Rule);
    if (compareDates(d, from) >= 0) return d;
    year++;
  }
}

/** All occurrences in the inclusive range [from, to]. */
export function occurrencesBetween(r: Recurrence, from: PlainDate, to: PlainDate): PlainDate[] {
  const out: PlainDate[] = [];
  let cursor: PlainDate | null = from;
  while (cursor) {
    const next = nextOccurrence(r, cursor);
    if (!next || compareDates(next, to) > 0) break;
    out.push(next);
    cursor = addDays(next, 1);
  }
  return out;
}

/** Age turned (birthday) or years reached (anniversary) on `on`; null when the start year is unknown. */
export function yearsSince(startYear: number | undefined, on: PlainDate): number | null {
  return startYear === undefined ? null : on.year - startYear;
}

/** Big numbers that deserve something special: 18, 21, every 10 for ages; 1, 5, 10, 25... for anniversaries. */
export function isMilestone(years: number | null, kind: "age" | "anniversary"): boolean {
  if (years === null || years <= 0) return false;
  if (kind === "age") return years === 1 || years === 18 || years === 21 || years % 10 === 0;
  return years === 1 || years % 5 === 0;
}
