import { describe, expect, it } from "vitest";
import { actionSendAt, planMoments, reminderAt, todayIn, zonedInstant } from "../src/index.js";

describe("timezones", () => {
  it("today depends on where the recipient lives", () => {
    const now = new Date("2027-03-13T23:30:00Z");
    expect(todayIn("Europe/London", now)).toEqual({ year: 2027, month: 3, day: 13 });
    expect(todayIn("Africa/Lagos", now)).toEqual({ year: 2027, month: 3, day: 14 });
    expect(todayIn("America/Los_Angeles", now)).toEqual({ year: 2027, month: 3, day: 13 });
  });

  it("sends at 9:00 local time on both sides of a DST change", () => {
    // US DST starts 14 Mar 2027.
    expect(zonedInstant({ year: 2027, month: 3, day: 13 }, 9, "America/New_York").toISOString()).toBe("2027-03-13T14:00:00.000Z");
    expect(zonedInstant({ year: 2027, month: 3, day: 14 }, 9, "America/New_York").toISOString()).toBe("2027-03-14T13:00:00.000Z");
  });

  it("physical gifts start 12 days early, messages on the day", () => {
    const moment = { year: 2027, month: 3, day: 14 };
    expect(actionSendAt(moment, "message", "Africa/Lagos").toISOString()).toBe("2027-03-14T08:00:00.000Z");
    expect(actionSendAt(moment, "gift", "Africa/Lagos").toISOString()).toBe("2027-03-02T08:00:00.000Z");
    expect(reminderAt(moment, "gift", "Europe/London").toISOString()).toBe("2027-02-28T08:00:00.000Z");
  });
});

describe("planMoments", () => {
  const now = new Date("2027-03-01T12:00:00Z");
  const opts = { now, horizonDays: 30, userTimeZone: "Europe/London" };

  it("plans moments inside the horizon only, sorted by date", () => {
    const plan = planMoments(
      [
        { id: "a", recurrence: { kind: "yearly", month: 3, day: 20 }, timeZone: "Europe/London", actionKinds: ["message"] },
        { id: "b", recurrence: { kind: "yearly", month: 3, day: 5 }, timeZone: "Europe/London", actionKinds: [] },
        { id: "c", recurrence: { kind: "yearly", month: 9, day: 1 }, timeZone: "Europe/London", actionKinds: ["message"] },
      ],
      opts,
    );
    expect(plan.map((m) => m.idempotencyKey)).toEqual(["b:2027", "a:2027"]);
    expect(plan[0]!.reminders).toHaveLength(1);
  });

  it("is deterministic, so re-running produces the same keys", () => {
    const occ = [{ id: "a", recurrence: { kind: "yearly", month: 3, day: 20 } as const, timeZone: "UTC", actionKinds: ["gift", "message"] as const }];
    const one = planMoments(occ.map((o) => ({ ...o, actionKinds: [...o.actionKinds] })), opts);
    const two = planMoments(occ.map((o) => ({ ...o, actionKinds: [...o.actionKinds] })), opts);
    expect(one).toEqual(two);
    expect(one[0]!.reminders.map((r) => r.idempotencyKey)).toEqual(["a:2027:reminder:gift", "a:2027:reminder:message"]);
  });
});
