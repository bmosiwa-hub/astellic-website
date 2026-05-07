"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/lib/project-actions";

// ── Constants ─────────────────────────────────────────────────────────────────

const THEMATIC_AREAS = [
  { value: "ECONOMIC_DEVELOPMENT", label: "Economic Development" },
  { value: "GOVERNANCE",           label: "Governance" },
  { value: "SOCIAL_DEVELOPMENT",   label: "Social Development" },
  { value: "HEALTH",               label: "Health" },
];

const CURRENCIES = ["MWK", "USD", "EUR", "GBP", "ZAR"];

// ── Types ──────────────────────────────────────────────────────────────────────

type Member = {
  name: string;
  email: string;
  role: string;
  budgetedFee: string;
};

type Milestone = {
  title: string;
  description: string;
  deliveryDate: string;
  paymentExpected: string;
  currency: string;
  feePercentage: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-MW", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pf(v: string) { return parseFloat(v) || 0; }

// ── Component ─────────────────────────────────────────────────────────────────

interface ProjectFormProps {
  defaultCurrency?: string;
  // Pre-fill from a won opportunity
  oppId?:      string;
  oppName?:    string;
  oppClient?:  string;
  oppThematic?: string;
  oppType?:    string; // "CONSULTANCY" | "ADVISORY" | "IMPLEMENTATION"
}

export default function ProjectForm({
  defaultCurrency = "MWK",
  oppId,
  oppName,
  oppClient,
  oppThematic,
  oppType,
}: ProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  // Core state — pre-fill from opportunity if provided
  const defaultCategory: "REGULAR" | "CONSULTANCY" =
    oppType === "CONSULTANCY" ? "CONSULTANCY" : "REGULAR";

  const [category,       setCategory]       = useState<"REGULAR" | "CONSULTANCY">(defaultCategory);
  const [currency,       setCurrency]       = useState(defaultCurrency);
  const [members,        setMembers]        = useState<Member[]>([]);
  const [milestones,     setMilestones]     = useState<Milestone[]>([]);

  // Budget breakdown state
  const [projectLeadFee, setProjectLeadFee] = useState("");
  const [managementFee,  setManagementFee]  = useState("");
  const [personnelCosts, setPersonnelCosts] = useState(""); // manual input for REGULAR
  const [fieldworkCosts, setFieldworkCosts] = useState("");

  const isConsultancy = category === "CONSULTANCY";

  // ── Derived totals ────────────────────────────────────────────────────────

  // For consultancy: sum of all individual budgeted fees
  const totalMemberFees   = members.map((m) => pf(m.budgetedFee)).reduce((a, b) => a + b, 0);
  const totalPersonnelFees = isConsultancy
    ? pf(projectLeadFee) + totalMemberFees
    : pf(personnelCosts);

  const mgmtFee     = pf(managementFee);
  const fwCosts     = pf(fieldworkCosts);
  const totalBudget = totalPersonnelFees + mgmtFee + fwCosts;

  // Org income from consultancy (25% of personnel + management fee)
  const orgIncome = isConsultancy
    ? totalPersonnelFees * 0.25 + mgmtFee
    : 0;

  // Milestone fee % validation
  const totalFeePercentage = milestones.map((m) => pf(m.feePercentage)).reduce((a, b) => a + b, 0);
  const percentageOk = !isConsultancy || milestones.length === 0 || Math.abs(totalFeePercentage - 100) < 0.01;

  // ── Member helpers ────────────────────────────────────────────────────────

  function addMember() {
    setMembers((p) => [...p, { name: "", email: "", role: "", budgetedFee: "" }]);
  }
  function updateMember(i: number, field: keyof Member, val: string) {
    setMembers((p) => p.map((m, j) => j === i ? { ...m, [field]: val } : m));
  }

  // ── Milestone helpers ─────────────────────────────────────────────────────

  function addMilestone() {
    setMilestones((p) => [
      ...p,
      { title: "", description: "", deliveryDate: "", paymentExpected: "", currency, feePercentage: "" },
    ]);
  }
  function updateMilestone(i: number, field: keyof Milestone, val: string) {
    setMilestones((p) => p.map((m, j) => j === i ? { ...m, [field]: val } : m));
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("members",    JSON.stringify(members.filter((m) => m.name.trim())));
    fd.set("milestones", JSON.stringify(milestones.filter((m) => m.title.trim() && m.deliveryDate)));
    // Pass derived personnelCosts for consultancy
    if (isConsultancy) fd.set("personnelCosts", String(totalPersonnelFees));
    startTransition(async () => {
      await createProject(fd);
      router.push("/astelfin_26/projects");
    });
  }

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold";
  const lbl = "block text-sm font-semibold text-gray-700 mb-1";
  const xlbl = "block text-xs font-semibold text-gray-500 mb-1";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">

      {/* ── Opportunity pre-fill banner ───────────────────────── */}
      {oppId && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
          </svg>
          <span>
            Pre-filled from won opportunity: <strong>{oppName}</strong>.
            Review the details below and complete any missing fields before saving.
          </span>
        </div>
      )}
      {oppId && <input type="hidden" name="oppId" value={oppId} />}

      {/* ── Project Details ───────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-brand-navy">Project Details</h2>
        <div className="grid grid-cols-2 gap-4">

          {/* Category */}
          <div>
            <label className={lbl}>Project Category <span className="text-red-500">*</span></label>
            <select
              name="category"
              value={category}

              onChange={(e) => {
                setCategory(e.target.value as "REGULAR" | "CONSULTANCY");
                // Reset per-person fees when switching
                setProjectLeadFee("");
                setMembers((p) => p.map((m) => ({ ...m, budgetedFee: "" })));
                setMilestones((p) => p.map((m) => ({ ...m, feePercentage: "" })));
              }}
              className={inp}
            >
              <option value="REGULAR">Regular</option>
              <option value="CONSULTANCY">Consultancy</option>
            </select>
          </div>

          <div>
            <label className={lbl}>Thematic Area</label>
            <select name="thematicArea" className={inp} defaultValue={oppThematic ?? ""}>
              <option value="">— Select —</option>
              {THEMATIC_AREAS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>

          <div>
            <label className={lbl}>Project Type</label>
            <select name="projectType" className={inp}>
              <option value="">— Select —</option>
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className={lbl}>Project Name <span className="text-red-500">*</span></label>
            <input name="name" required className={inp}
              defaultValue={oppName ?? ""}
              placeholder="e.g. Health Systems Strengthening — Phase II" />
          </div>

          <div className="col-span-2">
            <label className={lbl}>Client / Funder <span className="text-red-500">*</span></label>
            <input name="client" required className={inp}
              defaultValue={oppClient ?? ""}
              placeholder="e.g. Ministry of Health, UNICEF" />
          </div>

          {/* Project Lead — with budgeted fee for consultancy */}
          {isConsultancy ? (
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Project Lead</label>
                <input name="projectLead" className={inp}
                  placeholder="Full name of project lead" />
              </div>
              <div>
                <label className={lbl}>Project Lead — Budgeted Fee ({currency})</label>
                <input
                  name="projectLeadFee"
                  type="number" min="0" step="0.01"
                  value={projectLeadFee}
                  onChange={(e) => setProjectLeadFee(e.target.value)}
                  className={inp}
                  placeholder="0.00"
                />
                {pf(projectLeadFee) > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Consultant fee (75%): {fmt(pf(projectLeadFee) * 0.75)} &nbsp;·&nbsp;
                    Org income (25%): {fmt(pf(projectLeadFee) * 0.25)}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="col-span-2">
                <label className={lbl}>Project Lead</label>
                <input name="projectLead" className={inp}
                  placeholder="Full name of project lead" />
              </div>
              <input type="hidden" name="projectLeadFee" value="" />
            </>
          )}

          <div className="col-span-2">
            <label className={lbl}>Description</label>
            <textarea name="description" rows={2} className={inp + " resize-none"} />
          </div>

          <div>
            <label className={lbl}>Start Date <span className="text-red-500">*</span></label>
            <input name="startDate" type="date" required className={inp} />
          </div>

          <div>
            <label className={lbl}>End Date</label>
            <input name="endDate" type="date" className={inp} />
          </div>

          <div>
            <label className={lbl}>Overall Budget ({currency})</label>
            <input name="budget" type="number" step="0.01" min="0" className={inp} placeholder="0.00" />
          </div>

          <div>
            <label className={lbl}>Currency</label>
            <select name="currency" value={currency}
              onChange={(e) => setCurrency(e.target.value)} className={inp}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className={lbl}>Status</label>
            <select name="status" className={inp}>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── Budget Breakdown ──────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-brand-navy">Budget Breakdown</h2>
        <div className="grid grid-cols-3 gap-4">

          {/* Personnel Costs */}
          <div>
            <label className={lbl}>Personnel Costs ({currency})</label>
            {isConsultancy ? (
              <>
                <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600 tabular-nums">
                  {fmt(totalPersonnelFees)}
                  <span className="ml-1 text-xs text-gray-400">auto</span>
                </div>
                <input type="hidden" name="personnelCosts" value={totalPersonnelFees} />
                <p className="text-xs text-gray-400 mt-1">Sum of all budgeted fees</p>
              </>
            ) : (
              <input
                name="personnelCosts"
                type="number" min="0" step="0.01"
                value={personnelCosts}
                onChange={(e) => setPersonnelCosts(e.target.value)}
                className={inp} placeholder="0.00"
              />
            )}
          </div>

          {/* Management Fee */}
          <div>
            <label className={lbl}>Management Fee ({currency})</label>
            <input
              name="managementFee"
              type="number" min="0" step="0.01"
              value={managementFee}
              onChange={(e) => setManagementFee(e.target.value)}
              className={inp} placeholder="0.00"
            />
          </div>

          {/* Fieldwork Costs */}
          <div>
            <label className={lbl}>Fieldwork Costs ({currency})</label>
            <input
              name="fieldworkCosts"
              type="number" min="0" step="0.01"
              value={fieldworkCosts}
              onChange={(e) => setFieldworkCosts(e.target.value)}
              className={inp} placeholder="0.00"
            />
          </div>
        </div>

        {/* Summary card */}
        {totalBudget > 0 && (
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2">
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
              <span>Personnel: <span className="font-semibold text-gray-700">{fmt(totalPersonnelFees)}</span></span>
              <span>Management: <span className="font-semibold text-gray-700">{fmt(mgmtFee)}</span></span>
              <span>Fieldwork: <span className="font-semibold text-gray-700">{fmt(fwCosts)}</span></span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-gray-200">
              <span className="text-sm font-bold text-brand-navy">Total: {currency} {fmt(totalBudget)}</span>
              {isConsultancy && totalPersonnelFees > 0 && (
                <span className="text-xs text-amber-700 font-medium">
                  Org income: {currency} {fmt(orgIncome)}
                  <span className="ml-1 text-gray-400">(25% personnel + mgmt fee)</span>
                </span>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Project Members ───────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-brand-navy">Project Members</h2>
          <button type="button" onClick={addMember}
            className="text-xs bg-brand-navy text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-brand-navy/80">
            + Add Member
          </button>
        </div>
        {members.length === 0 && (
          <p className="text-sm text-gray-400 italic">No members added yet.</p>
        )}
        {members.map((m, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-3 bg-gray-50 space-y-2">
            <div className={`grid gap-2 items-end ${isConsultancy ? "grid-cols-12" : "grid-cols-12"}`}>
              <div className={isConsultancy ? "col-span-3" : "col-span-4"}>
                <label className={xlbl}>Name</label>
                <input value={m.name} onChange={(e) => updateMember(i, "name", e.target.value)}
                  className={inp} placeholder="Full name" />
              </div>
              <div className={isConsultancy ? "col-span-3" : "col-span-4"}>
                <label className={xlbl}>Email</label>
                <input value={m.email} onChange={(e) => updateMember(i, "email", e.target.value)}
                  className={inp} placeholder="email@example.com" />
              </div>
              <div className={isConsultancy ? "col-span-2" : "col-span-3"}>
                <label className={xlbl}>Role</label>
                <input value={m.role} onChange={(e) => updateMember(i, "role", e.target.value)}
                  className={inp} placeholder="e.g. Data Analyst" />
              </div>
              {isConsultancy && (
                <div className="col-span-3">
                  <label className={xlbl}>Budgeted Fee ({currency})</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={m.budgetedFee}
                    onChange={(e) => updateMember(i, "budgetedFee", e.target.value)}
                    className={inp} placeholder="0.00"
                  />
                </div>
              )}
              <div className="col-span-1 flex justify-center pb-1">
                <button type="button"
                  onClick={() => setMembers((p) => p.filter((_, j) => j !== i))}
                  className="text-red-400 hover:text-red-600 text-xl font-bold leading-none">×</button>
              </div>
            </div>
            {isConsultancy && pf(m.budgetedFee) > 0 && (
              <div className="flex gap-6 text-xs pl-1">
                <span className="text-gray-500">
                  Consultant fee (75%):&nbsp;
                  <span className="font-semibold text-brand-navy">{currency} {fmt(pf(m.budgetedFee) * 0.75)}</span>
                </span>
                <span className="text-gray-500">
                  Org income (25%):&nbsp;
                  <span className="font-semibold text-amber-600">{currency} {fmt(pf(m.budgetedFee) * 0.25)}</span>
                </span>
              </div>
            )}
          </div>
        ))}
        {isConsultancy && members.length > 0 && (
          <p className="text-xs text-gray-500 pt-1">
            Total member fees: <span className="font-semibold">{currency} {fmt(totalMemberFees)}</span>
            {pf(projectLeadFee) > 0 && (
              <> &nbsp;+ project lead: <span className="font-semibold">{currency} {fmt(pf(projectLeadFee))}</span>
              &nbsp;= <span className="font-semibold text-brand-navy">{currency} {fmt(totalPersonnelFees)}</span></>
            )}
          </p>
        )}
      </section>

      {/* ── Milestones / Deliverables ─────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-brand-navy">Milestones / Deliverables</h2>
            {isConsultancy && milestones.length > 0 && (
              <p className={`text-xs mt-0.5 ${percentageOk ? "text-gray-400" : "text-red-500 font-semibold"}`}>
                Fee % total: {fmt(totalFeePercentage)}%
                {percentageOk ? " ✓" : " — must equal 100%"}
              </p>
            )}
          </div>
          <button type="button" onClick={addMilestone}
            className="text-xs bg-brand-navy text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-brand-navy/80">
            + Add Milestone
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Add milestones in order. The first pending one will appear on the Deliverables board.
        </p>
        {milestones.length === 0 && (
          <p className="text-sm text-gray-400 italic">No milestones added yet.</p>
        )}
        {milestones.map((m, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Milestone {i + 1}
              </span>
              <button type="button"
                onClick={() => setMilestones((p) => p.filter((_, j) => j !== i))}
                className="text-red-400 hover:text-red-600 text-sm font-bold">
                × Remove
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={xlbl}>Title <span className="text-red-400">*</span></label>
                <input value={m.title} onChange={(e) => updateMilestone(i, "title", e.target.value)}
                  className={inp} placeholder="e.g. Inception Report, Baseline Survey…" />
              </div>
              <div className="col-span-2">
                <label className={xlbl}>Description</label>
                <input value={m.description} onChange={(e) => updateMilestone(i, "description", e.target.value)}
                  className={inp} placeholder="Brief description of the deliverable" />
              </div>
              <div>
                <label className={xlbl}>Anticipated Completion <span className="text-red-400">*</span></label>
                <input type="date" value={m.deliveryDate}
                  onChange={(e) => updateMilestone(i, "deliveryDate", e.target.value)}
                  className={inp} />
              </div>

              {/* Consultancy: fee percentage; Regular: payment expected */}
              {isConsultancy ? (
                <div>
                  <label className={xlbl}>
                    Fee Percentage (% of total) <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min="0" max="100" step="0.1"
                      value={m.feePercentage}
                      onChange={(e) => updateMilestone(i, "feePercentage", e.target.value)}
                      className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      placeholder="0"
                    />
                    <span className="text-xs text-gray-500">%</span>
                  </div>
                  {pf(m.feePercentage) > 0 && totalPersonnelFees > 0 && (
                    <div className="mt-1 text-xs space-y-0.5">
                      <p className="text-gray-500">
                        Total client payment: <span className="font-semibold text-gray-700">
                          {currency} {fmt(totalPersonnelFees * pf(m.feePercentage) / 100)}
                        </span>
                      </p>
                      <p className="text-gray-500">
                        Consultant portion (75%): <span className="font-semibold text-brand-navy">
                          {currency} {fmt(totalPersonnelFees * pf(m.feePercentage) / 100 * 0.75)}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className={xlbl}>Payment Expected</label>
                  <div className="flex gap-2">
                    <select value={m.currency}
                      onChange={(e) => updateMilestone(i, "currency", e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold w-24">
                      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="number" step="0.01" min="0" value={m.paymentExpected}
                      onChange={(e) => updateMilestone(i, "paymentExpected", e.target.value)}
                      className={inp} placeholder="0.00" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      <div className="flex justify-end gap-3">
        <a href="/astelfin_26/projects"
          className="px-6 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium">
          Cancel
        </a>
        <button type="submit"
          disabled={isPending || (isConsultancy && milestones.length > 0 && !percentageOk)}
          className="bg-brand-gold hover:bg-brand-gold/90 disabled:opacity-60 text-white px-8 py-2.5 rounded-lg text-sm font-semibold transition-colors">
          {isPending ? "Saving…" : "Save Project"}
        </button>
      </div>
    </form>
  );
}
