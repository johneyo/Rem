"use client";

import { useActionState } from "react";
import { importAction, type FormState } from "../actions";

export function ImportForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(importAction, {});
  return (
    <form action={action} className="space-y-4 rounded-2xl bg-card p-5 shadow-sm">
      <input
        name="file"
        type="file"
        accept=".vcf,.csv,text/vcard,text/csv"
        required
        className="block w-full text-sm file:mr-4 file:h-11 file:rounded-xl file:border-0 file:bg-pine-tint file:px-4 file:font-bold file:text-pine-ink"
      />
      <button disabled={pending} className="h-12 rounded-xl bg-pine px-6 font-bold text-on-pine hover:bg-pine-hover disabled:opacity-60">
        {pending ? "Importing…" : "Import"}
      </button>
      {state.message && (
        <p role="status" className={state.ok ? "text-sm font-semibold text-pine-ink" : "text-sm font-semibold text-coral-ink"}>
          {state.message}
        </p>
      )}
    </form>
  );
}
