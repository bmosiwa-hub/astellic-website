"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/lib/project-actions";

const THEMATIC_AREAS = [
  { value: "ECONOMIC_DEVELOPMENT", label: "Economic Development" },
  { value: "GOVERNANCE",           label: "Governance" },
  { value: "SOCIAL_DEVELOPMENT",   label: "Social Development" },
  { value: "HEALTH",               label: "Health" },
];

type Member    = { name: string; email: string; role: string };
type Milestone = { title: string; description: string; deliveryDate: string; paymentExpected: string; currency: string };

export default function ProjectForm({ defaultCurrency = "MWK" }: { defaultCurrency?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const [members,    setMembers]    = useState<Member[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  function addMember()    { setMembers((p)    => [...p, { name: "", email: "", role: "" }]); }
  function addMilestone() { setMilestones((p) => [...p, { title: "", description: "", deliveryDate: "", paymentExpected: "", currency: defaultCurrency }]); }

  function updateMember(i: number, field: keyof Member, val: string) {
    setMembers((p) => p.map((m, j) => j === i ? { ...m, [field]: val } : m));
  }
  function updateMilestone(i: number, field: keyof Milestone, val: string) {
    setMilestones((p) => p.map((m, j) => j === i ? { ...m, [field]: val } : m));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("members",    JSON.stringify(members.filter((m) => m.name.trim())));
    fd.set("milestones", JSON.stringify(milestones.filter((m) => m.title.trim() && m.deliveryDate)));
    startTransition(async () => {
      await createProject(fd);
      router.push("/astelfin_26/projects");
    });
  }

  const input = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold";
  const label = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">

      {/* ── Core fields ─────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-brand-navy">Project Details</h2>
        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className={label}>Thematic Area</label>
            <select name="thematicArea" className={input}>
              <option value="">— Select —</option>
              {THEMATIC_AREAS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>

          <div>
            <label className={label}>Project Type</label>
            <select name="projectType" className={input}>
              <option value="">— Select —</option>
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className={label}>Project Name <span className="text-red-500">*</span></label>
            <input name="name" required className={input} placeholder="e.g. Health Systems Strengthening — Phase II" />
          </div>

          <div className="col-span-2">
            <label className={label}>Client / Funder <span className="text-red-500">*</span></label>
            <input name="client" required className={input} placeholder="e.g. Ministry of Health, UNICEF" />
          </div>

          <div className="col-span-2">
            <label className={label}>Project Lead</label>
            <input name="projectLead" className={input} placeholder="Full name of project lead" />
          </div>

          <div className="col-span-2">
            <label className={label}>Description</label>
            <textarea name="description" rows={2} className={input + " resize-none"} />
          </div>

          <div>
            <label className={label}>Start Date <span className="text-red-500">*</span></label>
            <input name="startDate" type="date" required className={input} />
          </div>

          <div>
            <label className={label}>End Date</label>
            <input name="endDate" type="date" className={input} />
          </div>

          <div>
            <label className={label}>Budget</label>
            <input name="budget" type="number" step="0.01" min="0" className={input} placeholder="0.00" />
          </div>

          <div>
            <label className={label}>Currency</label>
            <select name="currency" defaultValue={defaultCurrency} className={input}>
              {["MWK","USD","EUR","GBP","ZAR"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className={label}>Status</label>
            <select name="status" className={input}>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── Members ─────────────────────────────────────────── */}
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
          <div key={i} className="grid grid-cols-12 gap-2 items-end border border-gray-100 rounded-xl p-3 bg-gray-50">
            <div className="col-span-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
              <input value={m.name} onChange={(e) => updateMember(i, "name", e.target.value)}
                className={input} placeholder="Full name" />
            </div>
            <div className="col-span-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
              <input value={m.email} onChange={(e) => updateMember(i, "email", e.target.value)}
                className={input} placeholder="email@example.com" />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Role</label>
              <input value={m.role} onChange={(e) => updateMember(i, "role", e.target.value)}
                className={input} placeholder="e.g. Data Analyst" />
            </div>
            <div className="col-span-1 flex justify-center">
              <button type="button" onClick={() => setMembers((p) => p.filter((_, j) => j !== i))}
                className="text-red-400 hover:text-red-600 text-lg font-bold">×</button>
            </div>
          </div>
        ))}
      </section>

      {/* ── Milestones / Deliverables ────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-brand-navy">Milestones / Deliverables</h2>
          <button type="button" onClick={addMilestone}
            className="text-xs bg-brand-navy text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-brand-navy/80">
            + Add Milestone
          </button>
        </div>
        <p className="text-xs text-gray-400">Add milestones in order. The first pending one will appear on the Deliverables board.</p>
        {milestones.length === 0 && (
          <p className="text-sm text-gray-400 italic">No milestones added yet.</p>
        )}
        {milestones.map((m, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Milestone {i + 1}</span>
              <button type="button" onClick={() => setMilestones((p) => p.filter((_, j) => j !== i))}
                className="text-red-400 hover:text-red-600 text-sm font-bold">× Remove</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Title <span className="text-red-400">*</span></label>
                <input value={m.title} onChange={(e) => updateMilestone(i, "title", e.target.value)}
                  className={input} placeholder="e.g. Inception Report, Baseline Survey…" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                <input value={m.description} onChange={(e) => updateMilestone(i, "description", e.target.value)}
                  className={input} placeholder="Brief description of the deliverable" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Anticipated Completion <span className="text-red-400">*</span></label>
                <input type="date" value={m.deliveryDate} onChange={(e) => updateMilestone(i, "deliveryDate", e.target.value)}
                  className={input} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Payment Expected</label>
                <div className="flex gap-2">
                  <select value={m.currency} onChange={(e) => updateMilestone(i, "currency", e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold w-24">
                    {["MWK","USD","EUR","GBP","ZAR"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="number" step="0.01" min="0" value={m.paymentExpected}
                    onChange={(e) => updateMilestone(i, "paymentExpected", e.target.value)}
                    className={input} placeholder="0.00" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="flex justify-end gap-3">
        <a href="/astelfin_26/projects"
          className="px-6 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium">
          Cancel
        </a>
        <button type="submit" disabled={isPending}
          className="bg-brand-gold hover:bg-brand-gold/90 disabled:opacity-60 text-white px-8 py-2.5 rounded-lg text-sm font-semibold transition-colors">
          {isPending ? "Saving…" : "Save Project"}
        </button>
      </div>
    </form>
  );
}
