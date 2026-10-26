import { claimDueReminders, createDb, releaseReminder, runPlanner } from "@rem/db";
import { PgBoss } from "pg-boss";
import { consoleNotifier, type Notifier } from "./notifier";

const url = process.env.DATABASE_URL ?? "postgres://rem:rem@localhost:5432/rem";
const db = createDb(url);
const boss = new PgBoss(url);
const notifier: Notifier = consoleNotifier;

const PLAN = "plan-moments";
const REMIND = "send-reminders";

boss.on("error", (err) => console.error("[pg-boss]", err));

await boss.start();
await boss.createQueue(PLAN);
await boss.createQueue(REMIND);

// The planner is idempotent, so running it often only costs a query.
await boss.schedule(PLAN, "0 * * * *");
await boss.schedule(REMIND, "* * * * *");

await boss.work(PLAN, async () => {
  const result = await runPlanner(db);
  console.log("[planner]", result);
});

await boss.work(REMIND, async () => {
  for (const r of await claimDueReminders(db)) {
    try {
      await notifier.sendReminder(r);
    } catch (err) {
      console.error("[reminder] failed, will retry", r.reminderId, err);
      await releaseReminder(db, r.reminderId);
    }
  }
});

// Plan once at startup so a fresh deploy does not wait for the top of the hour.
await boss.send(PLAN, {});
console.log("Rem worker running");

for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, async () => {
    await boss.stop();
    await db.pool.end();
    process.exit(0);
  });
}
