"use client";

import { useActionState } from "react";
import { importAction, type FormState } from "../actions";

export function ImportForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(importAction, {});
  return (
    <form action={action} className="space-y-4 rounded-2xl border border-line bg-card p-4">
      <input
        name="file"
        type="file"
        accept=".vcf,.csv,text/vcard,text/csv"
        required
        className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-paper file:px-4 file:py-2 file:font-medium"
      />
      <button disabled={pending} className="rounded-full bg-brand px-5 py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-60">
        {pending ? "Importing…" : "Import"}
      </button>
      {state.message && (
        <p role="status" className={state.ok ? "text-sm text-green-700 dark:text-green-400" : "text-sm text-brand"}>
          {state.message}
        </p>
      )}
    </form>
  );
}
