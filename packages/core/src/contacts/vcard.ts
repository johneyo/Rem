import { parsePartialDate } from "./partial-date.js";
import type { ImportedContact } from "./types.js";

/** Undo line folding (RFC 6350 §3.2): a line starting with a space or tab continues the previous one. */
function unfold(text: string): string[] {
  return text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "").split("\n");
}

function unescape(v: string): string {
  return v.replace(/\\n/gi, "\n").replace(/\\([,;\\])/g, "$1");
}

/** Parse a .vcf file (vCard 2.1/3.0/4.0) as exported by iCloud, Google, Outlook and Android. */
export function parseVCards(text: string): ImportedContact[] {
  const contacts: ImportedContact[] = [];
  let cur: (ImportedContact & { n?: string }) | null = null;

  for (const line of unfold(text)) {
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const head = line.slice(0, idx);
    const value = line.slice(idx + 1).trim();
    // Drop the "item1." group prefix Apple adds, and parameters like ";TYPE=CELL".
    const name = head.split(";")[0]!.replace(/^[^.]+\./, "").toUpperCase();

    if (name === "BEGIN" && value.toUpperCase() === "VCARD") {
      cur = { displayName: "", emails: [], phones: [], labels: [] };
      continue;
    }
    if (!cur) continue;

    switch (name) {
      case "END":
        if (!cur.displayName && cur.n) {
          const [last = "", first = ""] = cur.n.split(";");
          cur.displayName = `${first} ${last}`.trim();
        }
        if (cur.displayName || cur.emails.length || cur.phones.length) {
          delete cur.n;
          contacts.push(cur);
        }
        cur = null;
        break;
      case "FN":
        cur.displayName = unescape(value);
        break;
      case "N":
        cur.n = unescape(value);
        break;
      case "EMAIL":
        if (value) cur.emails.push(value);
        break;
      case "TEL":
        if (value) cur.phones.push(value.replace(/^tel:/i, ""));
        break;
      case "BDAY":
        cur.birthday = parsePartialDate(value);
        break;
      case "ANNIVERSARY":
      case "X-ANNIVERSARY":
      case "X-MS-ANNIVERSARY":
        cur.anniversary = parsePartialDate(value);
        break;
      case "NOTE":
        cur.notes = unescape(value);
        break;
      case "CATEGORIES":
        cur.labels.push(...unescape(value).split(",").map((s) => s.trim()).filter(Boolean));
        break;
      case "UID":
        cur.sourceRef = value;
        break;
    }
  }
  return contacts;
}
