import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

/** Normalize a phone number to E.164 (+15551234567); null when it is not a valid number. */
export function normalizePhone(raw: string, defaultCountry?: CountryCode): string | null {
  const p = parsePhoneNumberFromString(raw.trim(), defaultCountry);
  return p?.isValid() ? p.number : null;
}

export function normalizeEmail(raw: string): string | null {
  const e = raw.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
}

/** Keys used to recognize the same person across sources (contacts, ask links, group links). */
export function matchKeys(p: { email?: string | null; phone?: string | null }, defaultCountry?: CountryCode): string[] {
  const keys: string[] = [];
  const e = p.email ? normalizeEmail(p.email) : null;
  const ph = p.phone ? normalizePhone(p.phone, defaultCountry) : null;
  if (e) keys.push(`email:${e}`);
  if (ph) keys.push(`phone:${ph}`);
  return keys;
}
