"use client";
import { useState } from "react";

const CONTRACT_TYPES = ["PERMANENT", "CONTRACT", "CONSULTANCY", "INTERNSHIP", "VOLUNTEER"];

type Posting = {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  contractType: string;
  status: string;
  deadline: Date | null;
  salary: string | null;
  description: string;
  requirements: string | null;
  mandatoryConditions: string[];
  requiredDocuments: string[];
  isPublishedToWebsite: boolean;
};

export default function EditPostingForm({ posting }: { posting: Posting }) {
  const [conditions, setConditions] = useState<string[]>(posting.mandatoryConditions);
  const [documents, setDocuments] = useState<string[]>(posting.requiredDocuments);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show stored UTC deadline as local time in the datetime-local input
  const deadlineDefault = posting.deadline
    ? (() => {
        const d = new Date(posting.deadline);
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      })()
    : "";

  function addCondition() { setConditions(prev => [...prev, ""]); }
  function removeCondition(i: number) { setConditions(prev => prev.filter((_, idx) => idx !== i)); }
  function updateCondition(i: number, val: string) { setConditions(prev => prev.map((c, idx) => idx === i ? val : c)); }

  function addDocument() { setDocuments(prev => [...prev, ""]); }
  function removeDocument(i: number) { setDocuments(prev => prev.filter((_, idx) => idx !== i)); }
  function updateDocument(i: number, val: string) { setDocuments(prev => prev.map((d, idx) => idx === i ? val : d)); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      // Convert deadline from local time to UTC ISO string before sending.
      const deadlineRaw = fd.get("deadline") as string;
      if (deadlineRaw) fd.set("deadline", new Date(deadlineRaw).toISOString());
      const res = await fetch(`/api/astelfin/recruitment/${posting.id}`, { method: "PATCH", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update posting.");
      }
      window.location.href = `/astelfin_26/recruitment/${posting.id}`;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
          <input type="text" name="title" required defaultValue={posting.title} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <input type="text" name="department" defaultValue={posting.department ?? ""} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input type="text" name="location" defaultValue={posting.location ?? ""} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type</label>
          <select name="contractType" defaultValue={posting.contractType} className="w-full border rounded-lg px-3 py-2 text-sm">
            {CONTRACT_TYPES.map(t => (
              <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select name="status" defaultValue={posting.status} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="DRAFT">Draft</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
            <option value="FILLED">Filled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
          <input type="datetime-local" name="deadline" defaultValue={deadlineDefault} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
          <input type="text" name="salary" defaultValue={posting.salary ?? ""} placeholder="e.g. MWK 800,000 – 1,200,000" className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
          <textarea name="description" required rows={5} defaultValue={posting.description} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (internal notes)</label>
          <textarea name="requirements" rows={4} defaultValue={posting.requirements ?? ""} placeholder="Qualifications, experience, skills..." className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>

        {/* Mandatory Conditions */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mandatory Conditions</label>
          <p className="text-xs text-gray-400 mb-2">Applicants must confirm each condition. Only those answering Yes to all will be forwarded.</p>
          <div className="space-y-2">
            {conditions.map((c, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  name="mandatoryConditions"
                  value={c}
                  onChange={e => updateCondition(i, e.target.value)}
                  placeholder={`Condition ${i + 1}`}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeCondition(i)}
                  className="text-red-500 hover:text-red-700 text-xs px-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addCondition} className="text-brand-navy text-sm hover:underline mt-1">
            + Add Condition
          </button>
        </div>

        {/* Required Documents */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Required Documents</label>
          <p className="text-xs text-gray-400 mb-2">Documents applicants must upload with their application.</p>
          <div className="space-y-2">
            {documents.map((d, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  name="requiredDocuments"
                  value={d}
                  onChange={e => updateDocument(i, e.target.value)}
                  placeholder={`Document ${i + 1} (e.g. CV / Resume)`}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeDocument(i)}
                  className="text-red-500 hover:text-red-700 text-xs px-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addDocument} className="text-brand-navy text-sm hover:underline mt-1">
            + Add Document
          </button>
        </div>

        {/* Publish to Website */}
        <div className="col-span-2 border border-brand-gold/30 bg-brand-gold/5 rounded-lg p-4 flex items-start gap-3">
          <input
            type="checkbox"
            name="isPublishedToWebsite"
            id="publish"
            defaultChecked={posting.isPublishedToWebsite}
            className="mt-0.5 h-4 w-4 accent-brand-gold"
          />
          <label htmlFor="publish" className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Publish to Website</span><br />
            <span className="text-gray-500">When checked and status is Open, this vacancy will appear on the public vacancies page.</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-brand-navy text-white px-6 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save Changes"}
        </button>
        <a href={`/astelfin_26/recruitment/${posting.id}`} className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm hover:bg-gray-50">
          Cancel
        </a>
      </div>
    </form>
  );
}
