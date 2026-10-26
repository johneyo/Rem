import { daysInMonth } from "../dates";
import type { PartialDate } from "./types";

function valid(year: number | undefined, month: number, day: number): PartialDate | undefined {
  if (month < 1 || month > 12 || day < 1) return undefined;
  // Without a year, allow 29 February.
  if (day > daysInMonth(year ?? 2000, month)) return undefined;
  return year === undefined ? { month, day } : { year, month, day };
}

/**
 * Parse the date formats found in contact exports:
 * 1990-03-14, 19900314, --0314, --03-14, 1990-03-14T00:00:00Z, 03/14/1990 (US), 14.03.1990.
 */
export function parsePartialDate(raw: string): PartialDate | undefined {
  const s = raw.trim();
  if (!s) return undefined;
  let m: RegExpExecArray | null;
  if ((m = /^--(\d{2})-?(\d{2})$/.exec(s))) return valid(undefined, +m[1]!, +m[2]!);
  if ((m = /^(\d{4})-?(\d{2})-?(\d{2})(?:T.*)?$/.exec(s))) {
    // Apple uses 1604 as "no year".
    const y = +m[1]! === 1604 ? undefined : +m[1]!;
    return valid(y, +m[2]!, +m[3]!);
  }
  if ((m = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/.exec(s))) return valid(m[3] ? +m[3] : undefined, +m[1]!, +m[2]!);
  if ((m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})?$/.exec(s))) return valid(m[3] ? +m[3] : undefined, +m[2]!, +m[1]!);
  return undefined;
}
