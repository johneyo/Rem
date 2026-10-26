import type { ActionKind } from "./schedule";

export type Channel = "email" | "sms" | "whatsapp" | "one_tap";

export interface PersonContactInfo {
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: unknown | null;
  timezone?: string | null;
}

export type PersonField = "email" | "phone" | "whatsapp" | "address" | "timezone";

const CHANNEL_FIELD: Record<Channel, PersonField> = {
  email: "email",
  sms: "phone",
  whatsapp: "whatsapp",
  one_tap: "phone",
};

/** Data an action needs before it can run without the user's help. */
export function requiredFields(kind: ActionKind, channel: Channel): PersonField[] {
  const fields: PersonField[] = ["timezone"];
  if (kind === "postcard") fields.push("address");
  // Physical gifts use recipient-picks-address, so they only need a way to reach the person.
  if (kind !== "postcard") fields.push(CHANNEL_FIELD[channel]);
  return fields;
}

export function missingFields(person: PersonContactInfo, kind: ActionKind, channel: Channel): PersonField[] {
  return requiredFields(kind, channel).filter((f) => {
    const v = person[f];
    return v === undefined || v === null || v === "";
  });
}

/** 0-100 score of how complete a profile is, shown on the person's page. */
export function completenessScore(p: PersonContactInfo & { hasBirthday: boolean }): number {
  const checks = [p.hasBirthday, !!(p.email || p.phone), !!p.timezone, !!p.address];
  const weights = [40, 30, 15, 15];
  return checks.reduce((sum, ok, i) => sum + (ok ? weights[i]! : 0), 0);
}
