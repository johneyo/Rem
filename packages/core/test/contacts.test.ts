import { describe, expect, it } from "vitest";
import { matchKeys, normalizePhone, parseContactsCsv, parsePartialDate, parseVCards } from "../src/index.js";

describe("parsePartialDate", () => {
  it.each([
    ["1990-03-14", { year: 1990, month: 3, day: 14 }],
    ["19900314", { year: 1990, month: 3, day: 14 }],
    ["--0314", { month: 3, day: 14 }],
    ["--03-14", { month: 3, day: 14 }],
    ["1604-03-14", { month: 3, day: 14 }],
    ["--0229", { month: 2, day: 29 }],
    ["03/14/1990", { year: 1990, month: 3, day: 14 }],
    ["14.03.1990", { year: 1990, month: 3, day: 14 }],
    ["1990-03-14T00:00:00Z", { year: 1990, month: 3, day: 14 }],
  ])("%s", (raw, expected) => {
    expect(parsePartialDate(raw)).toEqual(expected);
  });

  it.each(["", "not a date", "1990-02-30", "--1301"])("rejects %j", (raw) => {
    expect(parsePartialDate(raw)).toBeUndefined();
  });
});

describe("parseVCards", () => {
  it("reads iCloud-style cards with folding, groups and missing year", () => {
    const vcf = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:Obi;Ada;;;",
      "FN:Ada Obi",
      "item1.EMAIL;type=INTERNET;type=pref:ada@example.com",
      "TEL;type=CELL:+234 801 234 5678",
      "BDAY;VALUE=date:--0314",
      "X-ANNIVERSARY:2015-06-20",
      "NOTE:Loves jollof\\, jazz and ",
      " running",
      "CATEGORIES:Family,Close friends",
      "END:VCARD",
      "BEGIN:VCARD",
      "VERSION:4.0",
      "N:Bello;Tunde;;;",
      "TEL:tel:+447700900123",
      "BDAY:19870503",
      "END:VCARD",
    ].join("\r\n");

    const [ada, tunde] = parseVCards(vcf);
    expect(ada).toMatchObject({
      displayName: "Ada Obi",
      emails: ["ada@example.com"],
      phones: ["+234 801 234 5678"],
      birthday: { month: 3, day: 14 },
      anniversary: { year: 2015, month: 6, day: 20 },
      notes: "Loves jollof, jazz and running",
      labels: ["Family", "Close friends"],
    });
    expect(tunde).toMatchObject({ displayName: "Tunde Bello", phones: ["+447700900123"], birthday: { year: 1987, month: 5, day: 3 } });
  });
});

describe("parseContactsCsv", () => {
  it("reads a Google Contacts export", () => {
    const csv = [
      "First Name,Middle Name,Last Name,Birthday,Notes,Labels,E-mail 1 - Label,E-mail 1 - Value,Phone 1 - Label,Phone 1 - Value",
      'Ada,,Obi,--03-14,"Loves jazz, ""really""",* myContacts ::: Family,* Home,ada@example.com ::: ada@work.com,Mobile,+2348012345678',
      "Tunde,,Bello,1987-05-03,,* myContacts,,,,",
    ].join("\n");
    const [ada, tunde] = parseContactsCsv(csv);
    expect(ada).toMatchObject({
      displayName: "Ada Obi",
      emails: ["ada@example.com", "ada@work.com"],
      phones: ["+2348012345678"],
      birthday: { month: 3, day: 14 },
      notes: 'Loves jazz, "really"',
      labels: ["Family"],
    });
    expect(tunde).toMatchObject({ displayName: "Tunde Bello", birthday: { year: 1987, month: 5, day: 3 }, labels: [] });
  });

  it("reads a simple sheet", () => {
    const [p] = parseContactsCsv("Name,Email,Birthday\nMum,mum@example.com,03/14/1960");
    expect(p).toMatchObject({ displayName: "Mum", emails: ["mum@example.com"], birthday: { year: 1960, month: 3, day: 14 } });
  });
});

describe("matching", () => {
  it("normalizes phones and emails into match keys", () => {
    expect(normalizePhone("0801 234 5678", "NG")).toBe("+2348012345678");
    expect(normalizePhone("123")).toBeNull();
    expect(matchKeys({ email: " Ada@Example.com ", phone: "+234 801 234 5678" })).toEqual([
      "email:ada@example.com",
      "phone:+2348012345678",
    ]);
  });
});
