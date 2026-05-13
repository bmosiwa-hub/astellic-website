"use client";

import { useState, useTransition } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProjectMember {
  id: string;
  name: string;
  email: string | null;
  budgetedFee: number | null;
}

interface ProjectMilestone {
  id: string;
  title: string;
  feePercentage: number | null;
  order: number;
}

export interface ConsultancyProject {
  id: string;
  name: string;
  currency: string;
  projectLead: string | null;
  projectLeadFee: number | null;
  members: ProjectMember[];
  milestones: ProjectMilestone[];
}

interface Supervisor {
  id: string;
  name: string;
  position?: string | null;
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (formData: FormData) => Promise<any>;
  consultancyProjects: ConsultancyProject[];
  supervisors?: Supervisor[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-MW", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ConsultantForm({ action, consultancyProjects, supervisors = [] }: Props) {
  const [isPending, startTransition] = useTransition();
  const [projectId,         setProjectId]         = useState("");
  const [selectedName,      setSelectedName]      = useState("");
  const [profFeesRaw,       setProfFeesRaw]       = useState("");
  const [otherFeesRaw,      setOtherFeesRaw]      = useState("");

  const project = consultancyProjects.find((p) => p.id === projectId);

  // Build name list: project lead (if any) + all members
  type PersonOption = { name: string; email: string | null; budgetedFee: number | null };
  const nameOptions: PersonOption[] = [];
  if (project) {
    if (project.projectLead) {
      nameOptions.push({
        name: project.projectLead,
        email: null,
        budgetedFee: project.projectLeadFee,
      });
    }
    project.members.forEach((m) =>
      nameOptions.push({ name: m.name, email: m.email, budgetedFee: m.budgetedFee })
    );
  }

  const selectedPerson = nameOptions.find((n) => n.name === selectedName);
  const budgetedFee    = selectedPerson?.budgetedFee ?? 0;
  const consultantFee  = budgetedFee * 0.75;
  const orgIncome      = budgetedFee * 0.25;
  const milestones     = project?.milestones ?? [];
  const cur            = project?.currency ?? "MWK";

  const profFees = parseFloat(profFeesRaw) || 0;
  const otherFees = parseFloat(otherFeesRaw) || 0;
  const whtAmount = profFees * 0.20;
  const totalFees = profFees + otherFees;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => { await action(fd); });
  }

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold";
  const lbl = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Project Assignment ────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-brand-navy text-sm uppercase tracking-wide">
          Project Assignment
        </h2>

        <div>
          <label className={lbl}>
            Consultancy Project <span className="text-red-500">*</span>
          </label>
          <select
            name="projectId"
            value={projectId}
            onChange={(e) => { setProjectId(e.target.value); setSelectedName(""); }}
            required
            className={inp}
          >
            <option value="">— Select project —</option>
            {consultancyProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {consultancyProjects.length === 0 && (
            <p className="text-xs text-amber-600 mt-1.5">
              No active consultancy projects found.
              <a href="/astelfin_26/projects/new" className="ml-1 underline">Create one first.</a>
            </p>
          )}
        </div>

        {project && (
          <div>
            <label className={lbl}>
              Consultant Name <span className="text-red-500">*</span>
            </label>
            <select
              name="name"
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              required
              className={inp}
            >
              <option value="">— Select name —</option>
              {nameOptions.map((n) => (
                <option key={n.name} value={n.name}>{n.name}</option>
              ))}
            </select>
            {nameOptions.length === 0 && (
              <p className="text-xs text-amber-600 mt-1.5">
                No members found on this project. Add members when editing the project.
              </p>
            )}
          </div>
        )}

        {/* Hidden fields passed to server action */}
        <input type="hidden" name="budgetedFee" value={budgetedFee > 0 ? budgetedFee : ""} />
        <input type="hidden" name="currency"    value={cur} />
      </div>

      {/* ── Consultancy Fee Breakdown ─────────────────────────── */}
      {selectedPerson && budgetedFee > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-brand-navy text-sm uppercase tracking-wide">
              Consultancy Fee Breakdown
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Consultant receives 75% of the budgeted fee, split across deliverables by their fee percentage.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <span>Deliverable</span>
              <span className="text-center">Fee %</span>
              <span className="text-right">Consultant Fee</span>
            </div>

            <div className="divide-y divide-gray-100 text-sm">
              {milestones.length > 0 ? (
                milestones.map((ms) => {
                  const pct = ms.feePercentage ?? 0;
                  const fee = consultantFee * (pct / 100);
                  return (
                    <div key={ms.id} className="grid grid-cols-3 px-4 py-2.5 items-center">
                      <span className="text-xs font-medium text-gray-700">{ms.title}</span>
                      <span className="text-xs text-gray-500 text-center">{pct}%</span>
                      <span className="text-xs font-semibold text-brand-navy tabular-nums text-right">
                        {cur} {fmt(fee)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-3 text-xs text-gray-400 italic">
                  No milestones defined for this project yet.
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="border-t-2 border-gray-200">
              <div className="flex items-center justify-between px-4 py-3 bg-brand-navy/5">
                <div>
                  <p className="text-xs text-gray-500">Budgeted Fee</p>
                  <p className="text-sm font-bold text-brand-navy">{cur} {fmt(budgetedFee)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Total Consultant Fee (75%)</p>
                  <p className="text-sm font-bold text-brand-navy tabular-nums">{cur} {fmt(consultantFee)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 bg-amber-50/60 border-t border-amber-100">
                <span className="text-xs text-amber-700">Organisation income (25%)</span>
                <span className="text-xs font-semibold text-amber-700 tabular-nums">
                  {cur} {fmt(orgIncome)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Professional Fee & Tax Details ───────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-brand-navy text-sm uppercase tracking-wide">
            Professional Fee &amp; Tax Details
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Used to calculate withholding tax (WHT at 20% of professional fees).
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Total Professional Fees ({cur})</label>
            <input
              name="totalProfessionalFees"
              type="number"
              min="0"
              step="0.01"
              value={profFeesRaw}
              onChange={(e) => setProfFeesRaw(e.target.value)}
              className={inp}
              placeholder="0.00"
            />
            <p className="text-xs text-gray-400 mt-1">
              Subject to 20% withholding tax
            </p>
          </div>
          <div>
            <label className={lbl}>Other Fees ({cur})</label>
            <input
              name="otherFees"
              type="number"
              min="0"
              step="0.01"
              value={otherFeesRaw}
              onChange={(e) => setOtherFeesRaw(e.target.value)}
              className={inp}
              placeholder="0.00"
            />
            <p className="text-xs text-gray-400 mt-1">
              Reimbursables etc. — not subject to WHT
            </p>
          </div>
        </div>

        {/* WHT calculation display */}
        {profFees > 0 && (
          <div className="rounded-xl border border-orange-100 bg-orange-50/60 overflow-hidden">
            <div className="grid grid-cols-3 divide-x divide-orange-100 text-sm">
              <div className="px-4 py-3 text-center">
                <p className="text-xs text-gray-500 mb-0.5">Professional Fees</p>
                <p className="font-bold text-brand-navy">{cur} {fmt(profFees)}</p>
              </div>
              <div className="px-4 py-3 text-center">
                <p className="text-xs text-gray-500 mb-0.5">WHT (20%)</p>
                <p className="font-bold text-orange-600">− {cur} {fmt(whtAmount)}</p>
              </div>
              <div className="px-4 py-3 text-center">
                <p className="text-xs text-gray-500 mb-0.5">Total Fees (incl. other)</p>
                <p className="font-bold text-brand-navy">{cur} {fmt(totalFees)}</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-orange-100/50 border-t border-orange-100">
              <p className="text-xs text-orange-700">
                Net to consultant after WHT:{" "}
                <strong>{cur} {fmt(profFees - whtAmount + otherFees)}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Hidden field for withholdingTaxRate */}
        <input type="hidden" name="withholdingTaxRate" value="20" />
      </div>

      {/* ── Personal Details ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-brand-navy text-sm uppercase tracking-wide">
          Personal Details
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Email</label>
            {/* key forces re-render (and value reset) when the selected name changes */}
            <input
              key={selectedName}
              name="email"
              type="email"
              defaultValue={selectedPerson?.email ?? ""}
              className={inp}
            />
          </div>
          <div>
            <label className={lbl}>Phone</label>
            <input name="phone" className={inp} placeholder="+265 …" />
          </div>
          <div className="col-span-2">
            <label className={lbl}>Specialisation</label>
            <input name="specialisation" className={inp}
              placeholder="e.g. Health Systems, M&E, Public Finance" />
          </div>
          <div>
            <label className={lbl}>MRA Tax PIN</label>
            <input name="taxPin" className={inp} placeholder="e.g. 1234567890" />
          </div>
          {supervisors.length > 0 && (
            <div className="col-span-2">
              <label className={lbl}>Direct Supervisor</label>
              <select name="supervisorId" defaultValue="" className={inp + " bg-white"}>
                <option value="">— No supervisor —</option>
                {supervisors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}{s.position ? ` (${s.position})` : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                The supervisor receives performance objective approval requests and timesheet reviews.
              </p>
            </div>
          )}
          <div className="col-span-2">
            <label className={lbl}>Notes</label>
            <textarea name="notes" rows={2} className={inp + " resize-none"} />
          </div>
        </div>
      </div>

      {/* ── Actions ───────────────────────────────────────────── */}
      <div className="flex justify-end gap-3">
        <a href="/astelfin_26/consultants"
          className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
          Cancel
        </a>
        <button
          type="submit"
          disabled={isPending || !projectId || !selectedName}
          className="px-6 py-2.5 bg-brand-gold hover:bg-brand-gold/90 text-white rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors"
        >
          {isPending ? "Saving…" : "Save Consultant"}
        </button>
      </div>
    </form>
  );
}
