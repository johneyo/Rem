CREATE TYPE "public"."action_kind" AS ENUM('message', 'ecard', 'giftcard', 'gift', 'postcard');--> statement-breakpoint
CREATE TYPE "public"."action_status" AS ENUM('planned', 'drafted', 'awaiting_approval', 'approved', 'scheduled', 'sending', 'sent', 'delivered', 'failed', 'skipped', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."channel" AS ENUM('email', 'sms', 'whatsapp', 'one_tap');--> statement-breakpoint
CREATE TYPE "public"."feb29_rule" AS ENUM('feb28', 'mar1');--> statement-breakpoint
CREATE TYPE "public"."field_source" AS ENUM('import', 'calendar', 'user', 'ask_link', 'ai_parse', 'discovery');--> statement-breakpoint
CREATE TYPE "public"."moment_status" AS ENUM('upcoming', 'done', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."occasion_type" AS ENUM('birthday', 'wedding_anniversary', 'dating_anniversary', 'work_anniversary', 'graduation', 'new_baby', 'new_job', 'retirement', 'housewarming', 'memorial', 'custom');--> statement-breakpoint
CREATE TYPE "public"."recurrence_kind" AS ENUM('yearly', 'once');--> statement-breakpoint
CREATE TYPE "public"."reminder_status" AS ENUM('pending', 'sent', 'snoozed', 'cancelled');--> statement-breakpoint
CREATE TABLE "actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"moment_id" uuid NOT NULL,
	"kind" "action_kind" NOT NULL,
	"channel" "channel",
	"status" "action_status" DEFAULT 'planned' NOT NULL,
	"scheduled_for" timestamp with time zone,
	"draft" jsonb,
	"approved_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"provider_ref" text,
	"cost_cents" integer,
	"error" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ask_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"person_id" uuid,
	"group_mode" boolean DEFAULT false NOT NULL,
	"token" text NOT NULL,
	"fields" text[] NOT NULL,
	"expires_at" timestamp with time zone,
	"opened_at" timestamp with time zone,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ask_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"entity" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"event" text NOT NULL,
	"data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "circles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"autopilot_level" smallint DEFAULT 1 NOT NULL,
	"keep_in_touch_days" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"occasion_id" uuid NOT NULL,
	"occurs_on" date NOT NULL,
	"status" "moment_status" DEFAULT 'upcoming' NOT NULL,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "moments_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "occasions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"type" "occasion_type" NOT NULL,
	"label" text,
	"recurrence" "recurrence_kind" DEFAULT 'yearly' NOT NULL,
	"month" smallint NOT NULL,
	"day" smallint NOT NULL,
	"year" smallint,
	"feb29_rule" "feb29_rule" DEFAULT 'feb28' NOT NULL,
	"sensitive" boolean DEFAULT false NOT NULL,
	"source" "field_source" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"nickname" text,
	"relationship" text,
	"email" text,
	"phone" text,
	"whatsapp" text,
	"address" jsonb,
	"timezone" text,
	"language" text,
	"preferred_channel" "channel",
	"autopilot_level" smallint,
	"notes" text,
	"interests" text[] DEFAULT '{}'::text[] NOT NULL,
	"do_not_contact" boolean DEFAULT false NOT NULL,
	"source_ref" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person_circles" (
	"person_id" uuid NOT NULL,
	"circle_id" uuid NOT NULL,
	CONSTRAINT "person_circles_person_id_circle_id_pk" PRIMARY KEY("person_id","circle_id")
);
--> statement-breakpoint
CREATE TABLE "reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"moment_id" uuid NOT NULL,
	"send_at" timestamp with time zone NOT NULL,
	"status" "reminder_status" DEFAULT 'pending' NOT NULL,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reminders_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"default_send_hour" smallint DEFAULT 9 NOT NULL,
	"autopilot_paused" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_moment_id_moments_id_fk" FOREIGN KEY ("moment_id") REFERENCES "public"."moments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ask_links" ADD CONSTRAINT "ask_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ask_links" ADD CONSTRAINT "ask_links_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circles" ADD CONSTRAINT "circles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moments" ADD CONSTRAINT "moments_occasion_id_occasions_id_fk" FOREIGN KEY ("occasion_id") REFERENCES "public"."occasions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occasions" ADD CONSTRAINT "occasions_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_circles" ADD CONSTRAINT "person_circles_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_circles" ADD CONSTRAINT "person_circles_circle_id_circles_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."circles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_moment_id_moments_id_fk" FOREIGN KEY ("moment_id") REFERENCES "public"."moments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "circles_user_name" ON "circles" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "moments_occurs_on" ON "moments" USING btree ("occurs_on");--> statement-breakpoint
CREATE INDEX "occasions_person" ON "occasions" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "people_user" ON "people" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "people_user_email" ON "people" USING btree ("user_id","email");--> statement-breakpoint
CREATE INDEX "people_user_phone" ON "people" USING btree ("user_id","phone");--> statement-breakpoint
CREATE INDEX "reminders_due" ON "reminders" USING btree ("status","send_at");