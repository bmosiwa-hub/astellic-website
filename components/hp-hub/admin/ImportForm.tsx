"use client";

import { useKeepValuesSubmit } from "../useKeepValuesSubmit";
import Link from "next/link";
import { useActionState } from "react";
import { importCsv, type ImportState } from "@/lib/hp-hub/admin/import-actions";

export default function ImportForm() {
  const [state, action, pending] = useActionState<ImportState, FormData>(importCsv, { stage: "idle" });
  const submit = useKeepValuesSubmit(action);
  const valid = state.rows?.filter((r) => !r.duplicate) ?? [];

  return (
    <div className="space-y-6">
      {state.stage !== "preview" && (
        <form action={action} onSubmit={submit} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <input type="hidden" name="intent" value="preview" />
          <div>
            <label htmlFor="file" className="block text-sm font-semibold text-brand-navy mb-1">
              CSV file (max 900 KB, 1,000 rows)
            </label>
            <input id="file" name="file" type="file" accept=".csv,text/csv" required className="block text-sm" />
          </div>
          <button disabled={pending} className="h-10 px-4 rounded bg-brand-navy text-white text-sm font-semibold disabled:opacity-60">
            {pending ? "Checking…" : "Check file"}
          </button>
          {state.message && state.stage === "idle" && (
            <p role="alert" className="text-sm text-red-700">
              {state.message}
            </p>
          )}
        </form>
      )}

      {state.stage === "done" && (
        <div role="status" className="border border-green-200 bg-green-50 rounded px-4 py-3 text-sm text-green-900">
          {state.message} {state.skipped ? `${state.skipped} duplicates skipped.` : ""}{" "}
          <Link href="/hp-hub/admin/documents?status=DRAFT" className="font-semibold underline">
            View drafts
          </Link>
        </div>
      )}

      {state.errors && state.errors.length > 0 && (
        <div className="bg-white border border-red-200 rounded-lg p-5">
          <h2 className="text-sm font-bold text-red-800 mb-2">
            {state.errors.length} {state.errors.length === 1 ? "row" : "rows"} can&rsquo;t be imported
          </h2>
          <ul className="text-sm text-gray-700 space-y-1 max-h-64 overflow-y-auto">
            {state.errors.map((e) => (
              <li key={`${e.row}-${e.message}`}>
                <span className="font-semibold">Row {e.row}:</span> {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {state.stage === "preview" && state.rows && (
        <div className="space-y-4">
          <p className="text-sm text-brand-navy">
            <strong>{valid.length}</strong> of {state.total} rows ready to import as drafts
            {state.rows.length - valid.length > 0 && <>, {state.rows.length - valid.length} possible duplicates will be skipped</>}.
          </p>
          <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto max-h-[28rem]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="text-left text-xs uppercase tracking-wider text-brand-muted border-b border-gray-100">
                  {["Row", "Title", "Country", "Type", "Publisher", "Year", ""].map((h) => (
                    <th key={h} className="px-3 py-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {state.rows.map((r) => (
                  <tr key={r.row} className={r.duplicate ? "bg-amber-50" : ""}>
                    <td className="px-3 py-2 tabular-nums">{r.row}</td>
                    <td className="px-3 py-2">{r.title}</td>
                    <td className="px-3 py-2">{r.country}</td>
                    <td className="px-3 py-2">{r.type}</td>
                    <td className="px-3 py-2">
                      {r.publisher}
                      {r.newPublisher && <span className="ml-1 text-xs text-brand-teal">(new)</span>}
                    </td>
                    <td className="px-3 py-2">{r.year ?? "—"}</td>
                    <td className="px-3 py-2 text-xs text-amber-800">{r.duplicate ? "Already exists, will skip" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form action={action} onSubmit={submit} className="flex flex-wrap gap-3">
            <input type="hidden" name="intent" value="commit" />
            <textarea name="csv" defaultValue={state.csv} hidden readOnly />
            <button disabled={pending || valid.length === 0} className="h-10 px-4 rounded bg-brand-navy text-white text-sm font-semibold disabled:opacity-60">
              {pending ? "Importing…" : `Import ${valid.length} as drafts`}
            </button>
            <a href="/hp-hub/admin/import" className="h-10 px-4 rounded border border-gray-300 text-sm font-semibold text-brand-navy inline-flex items-center">
              Start over
            </a>
          </form>
        </div>
      )}
    </div>
  );
}
