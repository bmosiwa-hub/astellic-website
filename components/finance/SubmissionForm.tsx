"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSubmission, resubmitSubmission } from "@/lib/submission-actions";

interface Project { id: string; name: string }
interface LineItem { item: string; description: string; activityDate: string; amount: string }

interface Props {
  projects: Project[];
  budgetLines: string[];           // ["Admin", "Project A", ...]
  mode?: "create" | "resubmit";
  submissionId?: string;
  defaultValues?: {
    type?: "INVOICE" | "REQUEST";
    projectId?: string;
    milestone?: string;
    purpose?: string;
    requestDate?: string;
    activityDate?: string;
    budgetLine?: string;
    currency?: string;
    totalAmount?: number;
    notes?: string;
    lineItems?: LineItem[];
  };
}

const EMPTY_ITEM: LineItem = { item: "", description: "", activityDate: "", amount: "" };

export default function SubmissionForm({
  projects,
  budgetLines,
  mode = "create",
  submissionId,
  defaultValues = {},
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const [type, setType] = useState<"INVOICE" | "REQUEST">(
    defaultValues.type ?? "INVOICE"
  );
  const [lineItems, setLineItems] = useState<LineItem[]>(
    defaultValues.lineItems?.length
      ? defaultValues.lineItems
      : [{ ...EMPTY_ITEM }]
  );

  const total = lineItems.reduce((s, li) => s + (parseFloat(li.amount) || 0), 0);

  const addItem = () => setLineItems((p) => [...p, { ...EMPTY_ITEM }]);
  const removeItem = (i: number) =>
    setLineItems((p) => p.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof LineItem, value: string) =>
    setLineItems((p) =>
      p.map((li, idx) => (idx === i ? { ...li, [field]: value } : li))
    );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (type === "INVOICE") {
      fd.set("lineItems", JSON.stringify(lineItems));
    }

    startTransition(async () => {
      if (mode === "resubmit" && submissionId) {
        await resubmitSubmission(submissionId, fd);
      } else {
        await createSubmission(fd);
      }
      router.refresh();
    });
  };

  const INPUT =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold";
  const LABEL = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* Hidden */}
      <input type="hidden" name="type" value={type} />

      {/* Type selector */}
      {mode === "create" && (
        <div className="flex gap-3">
          {(["INVOICE", "REQUEST"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-colors ${
                type === t
                  ? "border-brand-gold bg-brand-gold/10 text-brand-navy"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
              }`}
            >
              {t === "INVOICE" ? "📄 Invoice" : "📋 Expense Request"}
            </button>
          ))}
        </div>
      )}

      {/* ── INVOICE fields ──────────────────────────────── */}
      {type === "INVOICE" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={LABEL}>Project <span className="text-red-500">*</span></label>
              <select name="projectId" required defaultValue={defaultValues.projectId ?? ""} className={INPUT}>
                <option value="">— Select project —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL}>Milestone Delivered <span className="text-red-500">*</span></label>
              <input name="milestone" required defaultValue={defaultValues.milestone ?? ""} className={INPUT}
                placeholder="e.g. Deliverable 2 — Training report" />
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={LABEL + " mb-0"}>Line Items</label>
              <button type="button" onClick={addItem}
                className="text-xs text-brand-gold font-semibold hover:underline">
                + Add item
              </button>
            </div>

            <div className="space-y-3">
              {lineItems.map((li, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-start bg-gray-50 rounded-xl p-3">
                  <div className="col-span-3">
                    <input value={li.item} onChange={(e) => updateItem(i, "item", e.target.value)}
                      placeholder="Item *" required className={INPUT} />
                  </div>
                  <div className="col-span-4">
                    <input value={li.description} onChange={(e) => updateItem(i, "description", e.target.value)}
                      placeholder="Description" className={INPUT} />
                  </div>
                  <div className="col-span-3">
                    <input type="date" value={li.activityDate} onChange={(e) => updateItem(i, "activityDate", e.target.value)}
                      className={INPUT} />
                  </div>
                  <div className="col-span-1">
                    <input type="number" min="0" step="0.01" value={li.amount}
                      onChange={(e) => updateItem(i, "amount", e.target.value)}
                      placeholder="0.00" required className={INPUT} />
                  </div>
                  <div className="col-span-1 flex justify-center pt-2">
                    {lineItems.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)}
                        className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 text-right">
              <span className="text-sm text-gray-500 mr-2">Total:</span>
              <span className="font-bold text-brand-navy text-lg">
                {total.toLocaleString()} {defaultValues.currency ?? "MWK"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── REQUEST fields ───────────────────────────────── */}
      {type === "REQUEST" && (
        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-2">
            <label className={LABEL}>Purpose <span className="text-red-500">*</span></label>
            <textarea name="purpose" required rows={3} defaultValue={defaultValues.purpose ?? ""}
              className={INPUT} placeholder="Describe what the funds will be used for…" />
          </div>
          <div>
            <label className={LABEL}>Date of Request <span className="text-red-500">*</span></label>
            <input name="requestDate" type="date" required
              defaultValue={defaultValues.requestDate ?? new Date().toISOString().split("T")[0]}
              className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Date of Activity <span className="text-red-500">*</span></label>
            <input name="activityDate" type="date" required defaultValue={defaultValues.activityDate ?? ""}
              className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Budget Line <span className="text-red-500">*</span></label>
            <select name="budgetLine" required defaultValue={defaultValues.budgetLine ?? ""} className={INPUT}>
              <option value="">— Select budget line —</option>
              {budgetLines.map((bl) => (
                <option key={bl} value={bl}>{bl}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>Amount Requested <span className="text-red-500">*</span></label>
            <input name="amount" type="number" min="0" step="0.01" required
              defaultValue={defaultValues.totalAmount ?? ""}
              className={INPUT} placeholder="0.00" />
          </div>
        </div>
      )}

      {/* Common fields */}
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className={LABEL}>Currency</label>
          <select name="currency" defaultValue={defaultValues.currency ?? "MWK"} className={INPUT}>
            <option value="MWK">MWK — Malawian Kwacha</option>
            <option value="USD">USD — US Dollar</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="EUR">EUR — Euro</option>
            <option value="ZAR">ZAR — South African Rand</option>
          </select>
        </div>
        <div className="col-span-1">
          <label className={LABEL}>Notes (optional)</label>
          <textarea name="notes" rows={2} defaultValue={defaultValues.notes ?? ""}
            className={INPUT} placeholder="Any additional context…" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending}
          className="bg-brand-gold hover:bg-brand-gold/90 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
          {isPending ? "Submitting…" : mode === "resubmit" ? "Resubmit" : "Submit"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
