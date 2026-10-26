import { parsePartialDate } from "./partial-date";
import type { ImportedContact } from "./types";

/** RFC 4180 CSV parser: quoted fields, escaped quotes, newlines inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");

  for (let i = 0; i < src.length; i++) {
    const c = src[i]!;
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

const norm = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Parse a contacts CSV: Google Contacts and Outlook exports, or a simple sheet with
 * columns like "Name, Email, Phone, Birthday, Anniversary".
 */
export function parseContactsCsv(text: string): ImportedContact[] {
  const [header, ...rows] = parseCsv(text);
  if (!header) return [];
  const cols = header.map(norm);
  const find = (pred: (h: string) => boolean) => cols.flatMap((h, i) => (pred(h) ? [i] : []));

  const nameCol = find((h) => h === "name" || h === "fullname" || h === "displayname");
  const firstCol = find((h) => h === "firstname" || h === "givenname");
  const middleCol = find((h) => h === "middlename" || h === "additionalname");
  const lastCol = find((h) => h === "lastname" || h === "familyname" || h === "surname");
  const emailCols = find((h) => h.includes("email") && !h.includes("label") && !h.includes("type"));
  const phoneCols = find((h) => (h.includes("phone") || h === "mobile") && !h.includes("label") && !h.includes("type"));
  const bdayCol = find((h) => h === "birthday" || h === "dateofbirth" || h === "dob");
  const annivCol = find((h) => h === "anniversary" || h === "weddinganniversary");
  const notesCol = find((h) => h === "notes" || h === "note");
  const labelsCol = find((h) => h === "labels" || h === "groupmembership" || h === "categories");

  return rows.flatMap((r) => {
    const get = (idx: number[]) => (idx[0] === undefined ? "" : (r[idx[0]] ?? "").trim());
    const many = (idx: number[]) =>
      idx.flatMap((i) => (r[i] ?? "").split(":::")).map((s) => s.trim()).filter(Boolean);

    const displayName =
      get(nameCol) || [get(firstCol), get(middleCol), get(lastCol)].filter(Boolean).join(" ");
    const contact: ImportedContact = {
      displayName,
      emails: many(emailCols),
      phones: many(phoneCols),
      birthday: parsePartialDate(get(bdayCol)),
      anniversary: parsePartialDate(get(annivCol)),
      notes: get(notesCol) || undefined,
      labels: many(labelsCol)
        .flatMap((l) => l.split(/\s*,\s*/))
        .map((l) => l.replace(/^\* /, ""))
        .filter((l) => l && l !== "myContacts"),
    };
    return contact.displayName || contact.emails.length || contact.phones.length ? [contact] : [];
  });
}
