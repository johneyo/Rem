import { addDays, compareDates, nextOccurrence, type PlainDate, type Recurrence } from "./dates.js";
import { reminderAt, todayIn, type ActionKind } from "./schedule.js";

export interface PlannerOccasion {
  id: string;
  recurrence: Recurrence;
  /** The recipient's timezone; the moment's date is the date where they live. */
  timeZone: string;
  /** Kinds of action the occasion's plan contains; drives reminder timing. */
  actionKinds: ActionKind[];
}

export interface PlannedMoment {
  occasionId: string;
  occursOn: PlainDate;
  /** Unique per occasion per year, so running the planner twice never duplicates a moment. */
  idempotencyKey: string;
  reminders: { kind: ActionKind; sendAt: Date; idempotencyKey: string }[];
}

export function momentKey(occasionId: string, occursOn: PlainDate): string {
  return `${occasionId}:${occursOn.year}`;
}

/**
 * Moments that fall within `horizonDays` of today (in each recipient's timezone),
 * with the reminders the user should get. Pure: the caller upserts the result.
 */
export function planMoments(
  occasions: PlannerOccasion[],
  opts: { now: Date; horizonDays: number; userTimeZone: string; reminderHour?: number },
): PlannedMoment[] {
  const out: PlannedMoment[] = [];
  for (const o of occasions) {
    const today = todayIn(o.timeZone, opts.now);
    const next = nextOccurrence(o.recurrence, today);
    if (!next || compareDates(next, addDays(today, opts.horizonDays)) > 0) continue;
    const key = momentKey(o.id, next);
    const kinds = o.actionKinds.length ? [...new Set(o.actionKinds)] : (["message"] as ActionKind[]);
    out.push({
      occasionId: o.id,
      occursOn: next,
      idempotencyKey: key,
      reminders: kinds.map((kind) => ({
        kind,
        sendAt: reminderAt(next, kind, opts.userTimeZone, opts.reminderHour),
        idempotencyKey: `${key}:reminder:${kind}`,
      })),
    });
  }
  return out.sort((a, b) => compareDates(a.occursOn, b.occursOn));
}
