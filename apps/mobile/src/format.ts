import type { OccasionType, UpcomingItem } from "./api";

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

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

export function dateParts(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number) as [number, number, number];
  return { day: d, month: MONTHS[m - 1]!.toUpperCase(), weekday: WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]! };
}

export function momentTitle(m: UpcomingItem): string {
  if (m.occasionType === "birthday" && m.years !== null) return `Turns ${m.years}`;
  if (m.years !== null && m.years > 0) return `${ordinal(m.years)} ${OCCASION_LABELS[m.occasionType].toLowerCase()}`;
  return m.label ?? OCCASION_LABELS[m.occasionType];
}

export function longDate(timeZone: string, now = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "long", day: "numeric", month: "long" }).format(now);
  } catch {
    return now.toDateString();
  }
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0]![0]! + parts[parts.length - 1]![0]! : (parts[0] ?? "?").slice(0, 1);
  return letters.toUpperCase();
}
