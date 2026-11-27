"use client";

import { useKeepValuesSubmit } from "../useKeepValuesSubmit";
import { useActionState } from "react";
import { createHpOnlyAccount, type CreateAccountState } from "@/lib/hp-hub/admin/settings-actions";
import { ROLE_LABELS } from "@/lib/hp-hub/constants";

const input =
  "w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-brand-navy focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/15 outline-none";

export default function CreateAccountForm() {
  const [state, action, pending] = useActionState<CreateAccountState, FormData>(createHpOnlyAccount, {});
  const submit = useKeepValuesSubmit(action);
  if (state.created) {
    return (
      <div role="status" className="border border-amber-200 bg-amber-50 rounded px-4 py-3 text-sm text-amber-900 space-y-2">
        <p>
          Account created for <strong>{state.created.email}</strong>.
        </p>
        <p>
          Temporary password: <code className="font-mono font-semibold select-all bg-white px-1.5 py-0.5 rounded">{state.created.tempPassword}</code>
        </p>
        <p className="text-xs">
          Share it securely, separately from the email address. It&rsquo;s shown only this once; the user must change it at first sign-in at
          /hp-hub/admin/login.
        </p>
      </div>
    );
  }
  return (
    <form action={action} onSubmit={submit} className="space-y-3">
      <input name="name" required placeholder="Full name" maxLength={200} className={input} aria-label="Full name" />
      <input name="email" type="email" required placeholder="Email" className={input} aria-label="Email" />
      <select name="role" defaultValue="CONTRIBUTOR" className={input} aria-label="Role">
        {Object.entries(ROLE_LABELS).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button disabled={pending} className="h-10 px-4 rounded bg-brand-navy text-white text-sm font-semibold disabled:opacity-60">
        {pending ? "Creating…" : "Create account"}
      </button>
      <p className="text-xs text-brand-muted">For external contributors and reviewers. The account can&rsquo;t sign in to Astelfin.</p>
    </form>
  );
}
