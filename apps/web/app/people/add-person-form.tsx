"use client";

import { useActionState } from "react";
import { addPersonAction, type FormState } from "../actions";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const input = "w-full rounded-xl border border-line bg-paper px-3 py-2 outline-none focus:border-brand";

export function AddPersonForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(addPersonAction, {});
  const v = state.values ?? {};
  return (
    <form action={action} className="space-y-3 rounded-2xl border border-line bg-card p-4">
      <h2 className="font-medium">Add someone</h2>
      <input name="displayName" placeholder="Name" required defaultValue={v.displayName} className={input} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="email" type="email" placeholder="Email (optional)" defaultValue={v.email} className={input} />
        <input name="phone" type="tel" placeholder="Phone (optional)" defaultValue={v.phone} className={input} />
      </div>
      <fieldset>
        <legend className="mb-1 text-sm text-muted">Birthday</legend>
        <div className="grid grid-cols-[5.5rem_1fr_6rem] gap-2">
          <select name="day" className={input} defaultValue={v.day ?? "0"} aria-label="Day">
            <option value="0">Day</option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i} value={i + 1}>{i + 1}</option>
            ))}
          </select>
          <select name="month" className={input} defaultValue={v.month ?? "0"} aria-label="Month">
            <option value="0">Month</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <input name="year" inputMode="numeric" placeholder="Year" defaultValue={v.year} className={input} aria-label="Year" />
        </div>
      </fieldset>
      <div className="flex items-center gap-3">
        <button disabled={pending} className="rounded-full bg-brand px-5 py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-60">
          {pending ? "Adding…" : "Add"}
        </button>
        {state.message && (
          <p role="status" className={state.ok ? "text-sm text-green-700 dark:text-green-400" : "text-sm text-brand"}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
