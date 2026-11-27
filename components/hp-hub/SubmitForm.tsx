"use client";

import { useKeepValuesSubmit } from "./useKeepValuesSubmit";
import { useActionState } from "react";
import Link from "next/link";
import { submitDocument, type FormState } from "@/lib/hp-hub/public-actions";
import FileUploader from "./FileUploader";

const input =
  "w-full rounded border border-gray-300 px-3 h-11 text-[15px] text-brand-navy focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/15 outline-none aria-[invalid=true]:border-red-400";

function Field({
  id,
  label,
  optional,
  error,
  children,
  hint,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-brand-navy mb-1.5">
        {label} {optional && <span className="font-normal text-brand-muted">(optional)</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-brand-muted mt-1">{hint}</p>}
      {error && (
        <p id={`${id}-err`} className="text-sm text-red-700 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

export default function SubmitForm({
  countries,
  documentTypes,
  startedAt,
  upload,
}: {
  countries: { id: string; name: string }[];
  documentTypes: string[];
  startedAt: number;
  upload: { prefix: string; access: "private" | "public"; allowed: string[]; accept: string; maxBytes: number } | null;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitDocument, { ok: false });
  const submit = useKeepValuesSubmit(action);
  const e = state.errors ?? {};
  const invalid = (k: string) => ({ "aria-invalid": !!e[k], "aria-describedby": e[k] ? `${k}-err` : undefined });

  if (state.ok) {
    return (
      <div role="status" className="border-l-2 border-brand-green bg-green-50 px-6 py-5">
        <p className="font-semibold text-brand-navy mb-1">Submission received</p>
        <p className="text-[15px] text-gray-700 leading-relaxed">{state.message}</p>
        <Link href="/hp-hub" className="inline-block mt-4 text-sm font-semibold text-brand-teal hover:underline">
          Back to HP-Hub
        </Link>
      </div>
    );
  }

  return (
    <form action={action} onSubmit={submit} className="space-y-6" noValidate>
      <input type="hidden" name="startedAt" value={startedAt} />
      <div className="hidden" aria-hidden>
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <fieldset className="space-y-5">
        <legend className="text-lg font-bold text-brand-navy mb-1">The document</legend>
        <Field id="title" label="Document title" error={e.title}>
          <input id="title" name="title" required maxLength={500} className={input} {...invalid("title")} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field id="countryId" label="Country" optional error={e.countryId}>
            <select id="countryId" name="countryId" className={input} defaultValue="" {...invalid("countryId")}>
              <option value="">Select a country</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field id="year" label="Year" optional error={e.year}>
            <input id="year" name="year" inputMode="numeric" maxLength={4} className={input} {...invalid("year")} />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field id="publisherName" label="Publisher or institution" optional error={e.publisherName}>
            <input id="publisherName" name="publisherName" maxLength={300} className={input} />
          </Field>
          <Field id="documentTypeName" label="Document type" optional>
            <select id="documentTypeName" name="documentTypeName" className={input} defaultValue="">
              <option value="">Select a type</option>
              {documentTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field id="sourceUrl" label="Source URL" optional error={e.sourceUrl} hint="Where the document can be found online, if anywhere.">
          <input id="sourceUrl" name="sourceUrl" type="url" inputMode="url" maxLength={2000} placeholder="https://" className={input} {...invalid("sourceUrl")} />
        </Field>
        {upload && (
          <FileUploader
            area="submissions"
            prefix={upload.prefix}
            access={upload.access}
            allowedTypes={upload.allowed}
            accept={upload.accept}
            maxBytes={upload.maxBytes}
            label="Attach the file (optional)"
            hint="PDF or Word, up to 25 MB. Only share files you're allowed to share."
            error={e.file}
          />
        )}
        <Field id="info" label="Additional information" optional error={e.info}>
          <textarea id="info" name="info" rows={4} maxLength={5000} className={`${input} h-auto py-2.5`} />
        </Field>
      </fieldset>

      <fieldset className="space-y-5 pt-2">
        <legend className="text-lg font-bold text-brand-navy mb-1">About you</legend>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field id="submitterName" label="Your name" error={e.submitterName}>
            <input id="submitterName" name="submitterName" required maxLength={200} autoComplete="name" className={input} {...invalid("submitterName")} />
          </Field>
          <Field id="submitterEmail" label="Email" error={e.submitterEmail}>
            <input id="submitterEmail" name="submitterEmail" type="email" required maxLength={254} autoComplete="email" className={input} {...invalid("submitterEmail")} />
          </Field>
        </div>
        <div>
          <label className="flex items-start gap-3 text-[15px] text-gray-700">
            <input type="checkbox" name="consent" className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-navy" {...invalid("consent")} />
            <span>
              I understand this submission will be reviewed before anything is published, and that any file I attach may
              only be hosted if the rights holder permits it.
            </span>
          </label>
          {e.consent && (
            <p id="consent-err" className="text-sm text-red-700 mt-1">
              {e.consent}
            </p>
          )}
        </div>
      </fieldset>

      {state.message && (
        <p role="alert" className="text-sm text-red-700">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="h-12 px-8 rounded bg-brand-gold hover:bg-[#b8973f] text-white font-semibold disabled:opacity-60">
        {pending ? "Submitting…" : "Submit for review"}
      </button>
      <p className="text-xs text-brand-muted">
        We use your name and email only to follow up on this submission. See our{" "}
        <Link href="/privacy" className="underline">
          privacy notice
        </Link>
        .
      </p>
    </form>
  );
}
