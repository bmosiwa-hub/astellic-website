"use client";

import { useKeepValuesSubmit } from "./useKeepValuesSubmit";
import { useActionState, useState } from "react";
import { submitFeedback, type FormState } from "@/lib/hp-hub/public-actions";

const TYPES = [
  { value: "CORRECTION", label: "Correct the record details" },
  { value: "BROKEN_LINK", label: "Report a broken link or file" },
  { value: "ACCESS_REQUEST", label: "Request access to this document" },
  { value: "TAKEDOWN", label: "Rights holder: request removal" },
  { value: "OTHER", label: "Something else" },
] as const;

export const inputCls =
  "w-full rounded border border-gray-300 px-3 h-11 text-[15px] text-brand-navy focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/15 outline-none";

/** Report-an-issue / request-access / takedown form shown on document pages. */
export default function FeedbackForm({
  documentId,
  defaultType = "CORRECTION",
  startedAt,
}: {
  documentId: string;
  defaultType?: (typeof TYPES)[number]["value"];
  startedAt: number;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitFeedback, { ok: false });
  const submit = useKeepValuesSubmit(action);
  const [type, setType] = useState<string>(defaultType);
  const needsEmail = type === "ACCESS_REQUEST" || type === "TAKEDOWN";

  if (state.ok) {
    return (
      <p role="status" className="text-[15px] text-brand-green font-medium">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} onSubmit={submit} className="space-y-4" noValidate>
      <input type="hidden" name="documentId" value={documentId} />
      <input type="hidden" name="startedAt" value={startedAt} />
      <div className="hidden" aria-hidden>
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label htmlFor="fb-type" className="block text-sm font-semibold text-brand-navy mb-1.5">
          What would you like to do?
        </label>
        <select id="fb-type" name="type" value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="fb-message" className="block text-sm font-semibold text-brand-navy mb-1.5">
          Details
        </label>
        <textarea
          id="fb-message"
          name="message"
          rows={4}
          required
          maxLength={5000}
          aria-invalid={!!state.errors?.message}
          aria-describedby={state.errors?.message ? "fb-message-err" : undefined}
          className={`${inputCls} h-auto py-2.5`}
        />
        {state.errors?.message && <p id="fb-message-err" className="text-sm text-red-700 mt-1">{state.errors.message}</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fb-name" className="block text-sm font-semibold text-brand-navy mb-1.5">
            Name <span className="font-normal text-brand-muted">(optional)</span>
          </label>
          <input id="fb-name" name="name" maxLength={200} autoComplete="name" className={inputCls} />
        </div>
        <div>
          <label htmlFor="fb-email" className="block text-sm font-semibold text-brand-navy mb-1.5">
            Email {!needsEmail && <span className="font-normal text-brand-muted">(optional)</span>}
          </label>
          <input
            id="fb-email"
            name="email"
            type="email"
            maxLength={254}
            autoComplete="email"
            required={needsEmail}
            aria-invalid={!!state.errors?.email}
            aria-describedby={state.errors?.email ? "fb-email-err" : undefined}
            className={inputCls}
          />
          {state.errors?.email && <p id="fb-email-err" className="text-sm text-red-700 mt-1">{state.errors.email}</p>}
        </div>
      </div>
      {needsEmail && (
        <div>
          <label htmlFor="fb-org" className="block text-sm font-semibold text-brand-navy mb-1.5">
            Organisation <span className="font-normal text-brand-muted">(optional)</span>
          </label>
          <input id="fb-org" name="organisation" maxLength={300} autoComplete="organization" className={inputCls} />
        </div>
      )}

      {state.message && !state.ok && (
        <p role="alert" className="text-sm text-red-700">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-11 px-6 rounded bg-brand-navy text-white font-semibold text-sm hover:bg-brand-navy/90 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send"}
      </button>
      <p className="text-xs text-brand-muted">We use your details only to respond to this message.</p>
    </form>
  );
}
