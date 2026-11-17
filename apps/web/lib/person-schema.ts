import { isValidDate } from "@rem/core";
import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((v) => v || null);

export const personSchema = z
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
