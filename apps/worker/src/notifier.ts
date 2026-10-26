import type { DueReminder } from "@rem/db";

/** Delivers reminders to the user. Email (Resend) and web push implementations come next. */
export interface Notifier {
  sendReminder(r: DueReminder): Promise<void>;
}

const OCCASION_LABEL: Record<DueReminder["occasionType"], string> = {
  birthday: "birthday",
  wedding_anniversary: "wedding anniversary",
  dating_anniversary: "anniversary",
  work_anniversary: "work anniversary",
  graduation: "graduation",
  new_baby: "new baby",
  new_job: "new job",
  retirement: "retirement",
  housewarming: "housewarming",
  memorial: "remembrance day",
  custom: "special day",
};

export function reminderText(r: DueReminder): string {
  return `${r.personName}'s ${OCCASION_LABEL[r.occasionType]} is on ${r.occursOn}.`;
}

export const consoleNotifier: Notifier = {
  async sendReminder(r) {
    console.log(`[reminder] to ${r.userEmail}: ${reminderText(r)}`);
  },
};
