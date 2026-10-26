import { describe, expect, it } from "vitest";
import { completenessScore, decideMode, missingFields } from "../src/index.js";

describe("decideMode", () => {
  const base = { kind: "message", missing: [] } as const;

  it.each([
    [0, "remind"],
    [1, "draft"],
    [2, "preview_then_send"],
    [3, "send"],
  ] as const)("level %i -> %s", (level, mode) => {
    expect(decideMode({ ...base, level }).mode).toBe(mode);
  });

  it.each([
    ["missing data", { missing: ["phone"] }, "draft"],
    ["discovered online", { discovered: true }, "draft"],
    ["paused", { paused: true }, "draft"],
    ["over budget", { costCents: 2500, budgetRemainingCents: 1000 }, "draft"],
    ["no budget set for a paid action", { costCents: 2500 }, "draft"],
    ["sensitive occasion", { sensitive: true }, "remind"],
    ["do not contact", { doNotContact: true }, "remind"],
  ] as const)("full autopilot falls back when %s", (_name, extra, mode) => {
    const d = decideMode({ ...base, level: 3, ...extra });
    expect(d.mode).toBe(mode);
    expect(d.reason).toBeTruthy();
  });

  it("sends a paid action within budget", () => {
    expect(decideMode({ ...base, kind: "giftcard", level: 3, costCents: 2500, budgetRemainingCents: 5000 }).mode).toBe("send");
  });
});

describe("completeness", () => {
  it("postcards need an address, messages need the channel", () => {
    expect(missingFields({ timezone: "UTC" }, "postcard", "email")).toEqual(["address"]);
    expect(missingFields({ timezone: "UTC", email: "a@b.co" }, "message", "whatsapp")).toEqual(["whatsapp"]);
    expect(missingFields({ phone: "+2348012345678" }, "gift", "sms")).toEqual(["timezone"]);
  });

  it("scores profiles", () => {
    expect(completenessScore({ hasBirthday: false })).toBe(0);
    expect(completenessScore({ hasBirthday: true, email: "a@b.co", timezone: "UTC", address: {} })).toBe(100);
  });
});
