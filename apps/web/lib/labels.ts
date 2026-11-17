import type { OccasionType } from "@rem/db";

export const OCCASION_LABELS: Record<OccasionType, string> = {
  birthday: "Birthday",
  wedding_anniversary: "Wedding anniversary",
  dating_anniversary: "Anniversary",
  work_anniversary: "Work anniversary",
  graduation: "Graduation",
  new_baby: "New baby",
  new_job: "New job",
  retirement: "Retirement",
  housewarming: "Housewarming",
  memorial: "Remembrance",
  custom: "Special day",
};


const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function shortDate(month: number, day: number): string {
  return `${day} ${MONTHS[month - 1]}`;
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]!);
}

export function whenLabel(daysAway: number): string {
  if (daysAway === 0) return "Today";
  if (daysAway === 1) return "Tomorrow";
  return `In ${daysAway} days`;
}

const WEEKDAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Parts of a YYYY-MM-DD date for date blocks ("NOV" / "21" / "Friday"). */
export function dateParts(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number) as [number, number, number];
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { day: d, month: MONTHS[m - 1]!.toUpperCase(), weekdayLong: WEEKDAYS_LONG[weekday]! };
}

/** "Sunday 16 November" in the user's timezone. */
export function longDateIn(timeZone: string, now = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "long", day: "numeric", month: "long" }).format(now);
}
