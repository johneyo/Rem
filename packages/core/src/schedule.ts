import { TZDate } from "@date-fns/tz";
import { addDays, type PlainDate } from "./dates.js";

export type ActionKind = "message" | "ecard" | "giftcard" | "gift" | "postcard";

/** How many days before the moment each action needs to start (see PLAN.md 3.3). */
export const LEAD_DAYS: Record<ActionKind, number> = {
  message: 0,
  ecard: 0,
  giftcard: 0,
  gift: 12,
  postcard: 10,
};

/** How many days before the moment the user is reminded, so there is time to act. */
export const REMINDER_LEAD_DAYS: Record<ActionKind, number> = {
  message: 0,
  ecard: 1,
  giftcard: 3,
  gift: 14,
  postcard: 12,
};

/** Today's calendar date in a timezone. */
export function todayIn(timeZone: string, now: Date = new Date()): PlainDate {
  const z = new TZDate(now.getTime(), timeZone);
  return { year: z.getFullYear(), month: z.getMonth() + 1, day: z.getDate() };
}

/** The instant at which it is `hour:minute` on `date` in `timeZone` (DST-safe). */
export function zonedInstant(date: PlainDate, hour: number, timeZone: string, minute = 0): Date {
  const z = new TZDate(date.year, date.month - 1, date.day, hour, minute, 0, timeZone);
  return new Date(z.getTime());
}

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** When an action should go out: the moment's date minus the lead time, at `sendHour` in the recipient's timezone. */
export function actionSendAt(
  moment: PlainDate,
  kind: ActionKind,
  recipientTimeZone: string,
  sendHour = 9,
): Date {
  return zonedInstant(addDays(moment, -LEAD_DAYS[kind]), sendHour, recipientTimeZone);
}

/** When the user is reminded about a moment, at `hour` in the user's own timezone. */
export function reminderAt(moment: PlainDate, kind: ActionKind, userTimeZone: string, hour = 8): Date {
  return zonedInstant(addDays(moment, -REMINDER_LEAD_DAYS[kind]), hour, userTimeZone);
}
