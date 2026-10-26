import type { Recurrence } from "@rem/core";
import type { occasions } from "./schema";

type OccasionRow = Pick<typeof occasions.$inferSelect, "recurrence" | "month" | "day" | "year" | "feb29Rule">;

export function toRecurrence(o: OccasionRow): Recurrence {
  if (o.recurrence === "once") {
    if (o.year === null) throw new Error("One-off occasion needs a year");
    return { kind: "once", date: { year: o.year, month: o.month, day: o.day } };
  }
  return { kind: "yearly", month: o.month, day: o.day, feb29Rule: o.feb29Rule };
}
