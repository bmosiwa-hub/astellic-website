"use client";

import { useState } from "react";
import { addActivity } from "@/lib/hp-hub/admin/tracker-actions";
import { ADMIN_ACCEPT, ADMIN_MIME_TYPES, EVIDENCE_MAX_BYTES } from "@/lib/hp-hub/files";
import FileUploader from "../FileUploader";

const input =
  "w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-brand-navy focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/15 outline-none";

/** Adds a note, evidence (with optional file), outreach attempt or follow-up task. */
export default function ActivityForm({ itemId, upload }: { itemId: string; upload: { prefix: string; access: "private" | "public" } | null }) {
  const [kind, setKind] = useState("NOTE");
  return (
    <form action={addActivity} className="space-y-3">
      <input type="hidden" name="itemId" value={itemId} />
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Activity type">
        {[
          ["NOTE", "Note"],
          ["OUTREACH", "Outreach attempt"],
          ["EVIDENCE", "Evidence"],
          ["TASK", "Follow-up task"],
        ].map(([k, l]) => (
          <label key={k} className={`cursor-pointer text-sm rounded border px-3 py-1.5 ${kind === k ? "border-brand-navy bg-brand-navy text-white" : "border-gray-300 text-brand-navy"}`}>
            <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
            {l}
          </label>
        ))}
      </div>
      <textarea
        name="body"
        rows={3}
        required
        maxLength={10000}
        aria-label="Details"
        placeholder={
          kind === "TASK"
            ? "What needs to happen next?"
            : kind === "OUTREACH"
              ? "Who did you contact, how, and what did they say?"
              : kind === "EVIDENCE"
                ? "What shows this document exists (citation, reference, screenshot)?"
                : "Add a note"
        }
        className={`${input} h-auto py-2`}
      />
      {kind === "TASK" && (
        <div className="max-w-48">
          <label htmlFor="dueAt" className="block text-xs font-semibold text-brand-muted mb-1">
            Due date
          </label>
          <input id="dueAt" name="dueAt" type="date" required className={input} />
        </div>
      )}
      {kind === "EVIDENCE" && upload && (
        <FileUploader
          area="evidence"
          prefix={upload.prefix}
          access={upload.access}
          allowedTypes={ADMIN_MIME_TYPES}
          accept={ADMIN_ACCEPT}
          maxBytes={EVIDENCE_MAX_BYTES}
          label="Attach evidence (optional)"
          inputPrefix="evidence"
        />
      )}
      <button className="h-10 px-4 rounded bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy/90">Add</button>
    </form>
  );
}
