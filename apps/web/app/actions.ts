"use server";

import { isValidDate, parseContactsCsv, parseVCards } from "@rem/core";
import { addPerson, importContacts, markMomentDone, runPlanner } from "@rem/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/session";

export interface FormState {
  ok?: boolean;
  message?: string;
  /** Submitted values, returned on error so the form is not cleared (React resets forms after an action). */
  values?: Record<string, string>;
}

const optionalText = z
  .string()
  .trim()
  .transform((v) => v || null);

const personSchema = z
  .object({
    displayName: z.string().trim().min(1, "Please enter a name"),
    email: optionalText.pipe(z.email("That email doesn't look right").nullable()),
    phone: optionalText,
    month: z.coerce.number().int().min(0).max(12),
    day: z.coerce.number().int().min(0).max(31),
    year: optionalText
      .transform((v) => (v === null ? null : Number(v)))
      .pipe(z.number({ error: "Year should be a number" }).int().min(1900).max(2100).nullable()),
  })
  .refine((v) => (v.month === 0) === (v.day === 0), { message: "Pick both a day and a month" })
  .refine((v) => v.month === 0 || isValidDate({ year: v.year ?? 2000, month: v.month, day: v.day }), {
    message: "That date doesn't exist",
  });

export async function addPersonAction(_prev: FormState, form: FormData): Promise<FormState> {
  const raw = Object.fromEntries([...form].map(([k, v]) => [k, String(v)]));
  const parsed = personSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message, values: raw };
  const v = parsed.data;
  const user = await currentUser();
  await addPerson(db, user.id, {
    displayName: v.displayName,
    email: v.email,
    phone: v.phone,
    birthday: v.month ? { month: v.month, day: v.day, year: v.year } : null,
  });
  await runPlanner(db, { userId: user.id });
  revalidatePath("/", "layout");
  return { ok: true, message: `${v.displayName} added` };
}

export async function markDoneAction(form: FormData) {
  const user = await currentUser();
  await markMomentDone(db, user.id, String(form.get("momentId")));
  revalidatePath("/");
}

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

export async function importAction(_prev: FormState, form: FormData): Promise<FormState> {
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Choose a .vcf or .csv file" };
  if (file.size > MAX_IMPORT_BYTES) return { ok: false, message: "That file is over 5 MB" };

  const text = await file.text();
  const isVcf = file.name.toLowerCase().endsWith(".vcf") || text.trimStart().toUpperCase().startsWith("BEGIN:VCARD");
  const contacts = isVcf ? parseVCards(text) : parseContactsCsv(text);
  if (contacts.length === 0) return { ok: false, message: "No contacts found in that file" };

  const user = await currentUser();
  const r = await importContacts(db, user.id, contacts);
  await runPlanner(db, { userId: user.id });
  revalidatePath("/", "layout");
  return {
    ok: true,
    message: `Imported ${r.imported} people with ${r.birthdays} birthdays and ${r.anniversaries} anniversaries` +
      (r.skipped ? ` (${r.skipped} already here or unnamed, skipped)` : ""),
  };
}
