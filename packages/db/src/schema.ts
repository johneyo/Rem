import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().default(sql`gen_random_uuid()`);
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date());

export const occasionType = pgEnum("occasion_type", [
  "birthday",
  "wedding_anniversary",
  "dating_anniversary",
  "work_anniversary",
  "graduation",
  "new_baby",
  "new_job",
  "retirement",
  "housewarming",
  "memorial",
  "custom",
]);
export const recurrenceKind = pgEnum("recurrence_kind", ["yearly", "once"]);
export const feb29Rule = pgEnum("feb29_rule", ["feb28", "mar1"]);
export const actionKind = pgEnum("action_kind", ["message", "ecard", "giftcard", "gift", "postcard"]);
export const channel = pgEnum("channel", ["email", "sms", "whatsapp", "one_tap"]);
export const momentStatus = pgEnum("moment_status", ["upcoming", "done", "skipped"]);
export const actionStatus = pgEnum("action_status", [
  "planned",
  "drafted",
  "awaiting_approval",
  "approved",
  "scheduled",
  "sending",
  "sent",
  "delivered",
  "failed",
  "skipped",
  "cancelled",
]);
export const reminderStatus = pgEnum("reminder_status", ["pending", "sent", "snoozed", "cancelled"]);
export const fieldSource = pgEnum("field_source", ["import", "calendar", "user", "ask_link", "ai_parse", "discovery"]);

export const users = pgTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  timezone: text("timezone").notNull().default("UTC"),
  defaultSendHour: smallint("default_send_hour").notNull().default(9),
  autopilotPaused: boolean("autopilot_paused").notNull().default(false),
  createdAt: createdAt(),
});

export const circles = pgTable(
  "circles",
  {
    id: id(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    autopilotLevel: smallint("autopilot_level").notNull().default(1),
    keepInTouchDays: integer("keep_in_touch_days"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("circles_user_name").on(t.userId, t.name)],
);

export const people = pgTable(
  "people",
  {
    id: id(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    nickname: text("nickname"),
    relationship: text("relationship"),
    email: text("email"),
    phone: text("phone"),
    whatsapp: text("whatsapp"),
    address: jsonb("address"),
    timezone: text("timezone"),
    language: text("language"),
    preferredChannel: channel("preferred_channel"),
    /** Overrides the Circle's level when set. */
    autopilotLevel: smallint("autopilot_level"),
    notes: text("notes"),
    interests: text("interests").array().notNull().default(sql`'{}'::text[]`),
    doNotContact: boolean("do_not_contact").notNull().default(false),
    sourceRef: text("source_ref"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("people_user").on(t.userId),
    index("people_user_email").on(t.userId, t.email),
    index("people_user_phone").on(t.userId, t.phone),
  ],
);

export const personCircles = pgTable(
  "person_circles",
  {
    personId: uuid("person_id").notNull().references(() => people.id, { onDelete: "cascade" }),
    circleId: uuid("circle_id").notNull().references(() => circles.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.personId, t.circleId] })],
);

export const occasions = pgTable(
  "occasions",
  {
    id: id(),
    personId: uuid("person_id").notNull().references(() => people.id, { onDelete: "cascade" }),
    type: occasionType("type").notNull(),
    label: text("label"),
    recurrence: recurrenceKind("recurrence").notNull().default("yearly"),
    month: smallint("month").notNull(),
    day: smallint("day").notNull(),
    /** Birth or start year when known; the date's year for one-off occasions. */
    year: smallint("year"),
    feb29Rule: feb29Rule("feb29_rule").notNull().default("feb28"),
    sensitive: boolean("sensitive").notNull().default(false),
    source: fieldSource("source").notNull().default("user"),
    createdAt: createdAt(),
  },
  (t) => [index("occasions_person").on(t.personId)],
);

export const moments = pgTable(
  "moments",
  {
    id: id(),
    occasionId: uuid("occasion_id").notNull().references(() => occasions.id, { onDelete: "cascade" }),
    occursOn: date("occurs_on").notNull(),
    status: momentStatus("status").notNull().default("upcoming"),
    idempotencyKey: text("idempotency_key").notNull().unique(),
    createdAt: createdAt(),
  },
  (t) => [index("moments_occurs_on").on(t.occursOn)],
);

export const actions = pgTable("actions", {
  id: id(),
  momentId: uuid("moment_id").notNull().references(() => moments.id, { onDelete: "cascade" }),
  kind: actionKind("kind").notNull(),
  channel: channel("channel"),
  status: actionStatus("status").notNull().default("planned"),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  draft: jsonb("draft"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  providerRef: text("provider_ref"),
  costCents: integer("cost_cents"),
  error: text("error"),
  attempts: integer("attempts").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const reminders = pgTable(
  "reminders",
  {
    id: id(),
    momentId: uuid("moment_id").notNull().references(() => moments.id, { onDelete: "cascade" }),
    sendAt: timestamp("send_at", { withTimezone: true }).notNull(),
    status: reminderStatus("status").notNull().default("pending"),
    idempotencyKey: text("idempotency_key").notNull().unique(),
    createdAt: createdAt(),
  },
  (t) => [index("reminders_due").on(t.status, t.sendAt)],
);

export const askLinks = pgTable("ask_links", {
  id: id(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  personId: uuid("person_id").references(() => people.id, { onDelete: "cascade" }),
  groupMode: boolean("group_mode").notNull().default(false),
  token: text("token").notNull().unique(),
  fields: text("fields").array().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  openedAt: timestamp("opened_at", { withTimezone: true }),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export const auditLog = pgTable("audit_log", {
  id: id(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  entity: text("entity").notNull(),
  entityId: uuid("entity_id").notNull(),
  event: text("event").notNull(),
  data: jsonb("data"),
  createdAt: createdAt(),
});
