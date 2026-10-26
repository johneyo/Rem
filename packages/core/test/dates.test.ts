import { describe, expect, it } from "vitest";
import {
  addDays,
  isMilestone,
  nextOccurrence,
  occurrencesBetween,
  yearlyDateIn,
  yearsSince,
  type PlainDate,
} from "../src/index.js";

const d = (year: number, month: number, day: number): PlainDate => ({ year, month, day });

describe("nextOccurrence", () => {
  const bday = { kind: "yearly", month: 3, day: 14 } as const;

  it.each([
    ["before the date this year", d(2027, 1, 10), d(2027, 3, 14)],
    ["on the date", d(2027, 3, 14), d(2027, 3, 14)],
    ["after the date", d(2027, 3, 15), d(2028, 3, 14)],
    ["at the end of the year", d(2027, 12, 31), d(2028, 3, 14)],
  ])("yearly, %s", (_name, from, expected) => {
    expect(nextOccurrence(bday, from)).toEqual(expected);
  });

  it.each([
    ["leap year keeps 29 Feb", "feb28", d(2028, 1, 1), d(2028, 2, 29)],
    ["non-leap year, feb28 rule", "feb28", d(2027, 1, 1), d(2027, 2, 28)],
    ["non-leap year, mar1 rule", "mar1", d(2027, 1, 1), d(2027, 3, 1)],
    ["1 Mar already passed moves to next year", "mar1", d(2027, 3, 2), d(2028, 2, 29)],
  ] as const)("29 February: %s", (_name, feb29Rule, from, expected) => {
    expect(nextOccurrence({ kind: "yearly", month: 2, day: 29, feb29Rule }, from)).toEqual(expected);
  });

  it("century years are not leap years unless divisible by 400", () => {
    expect(yearlyDateIn(2100, 2, 29)).toEqual(d(2100, 2, 28));
    expect(yearlyDateIn(2000, 2, 29)).toEqual(d(2000, 2, 29));
  });

  it("respects the start year", () => {
    expect(nextOccurrence({ kind: "yearly", month: 6, day: 1, startYear: 2030 }, d(2027, 1, 1))).toEqual(d(2030, 6, 1));
  });

  it("one-off occasions", () => {
    const grad = { kind: "once", date: d(2027, 6, 2) } as const;
    expect(nextOccurrence(grad, d(2027, 6, 1))).toEqual(d(2027, 6, 2));
    expect(nextOccurrence(grad, d(2027, 6, 3))).toBeNull();
  });
});

describe("occurrencesBetween", () => {
  it("lists every yearly occurrence in range", () => {
    const r = { kind: "yearly", month: 1, day: 1 } as const;
    expect(occurrencesBetween(r, d(2027, 1, 1), d(2029, 1, 1))).toEqual([d(2027, 1, 1), d(2028, 1, 1), d(2029, 1, 1)]);
  });
});

describe("helpers", () => {
  it("addDays crosses months and years", () => {
    expect(addDays(d(2027, 1, 3), -5)).toEqual(d(2026, 12, 29));
    expect(addDays(d(2028, 2, 28), 1)).toEqual(d(2028, 2, 29));
  });

  it("age and milestones", () => {
    expect(yearsSince(1987, d(2027, 3, 14))).toBe(40);
    expect(yearsSince(undefined, d(2027, 3, 14))).toBeNull();
    expect(isMilestone(40, "age")).toBe(true);
    expect(isMilestone(41, "age")).toBe(false);
    expect(isMilestone(25, "anniversary")).toBe(true);
    expect(isMilestone(null, "age")).toBe(false);
  });
});
