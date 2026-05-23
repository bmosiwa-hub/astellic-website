"use client";
import { useState, useRef } from "react";

interface Props {
  postingId: string;
  postingTitle: string;
  mandatoryConditions: string[];
  requiredDocuments: string[];
}

export default function ApplyForm({ postingId, postingTitle, mandatoryConditions, requiredDocuments }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData(formRef.current!);
      const res = await fetch("/api/apply-vacancy", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Submission failed. Please try again.");
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-brand-navy mb-3">Application Submitted</h2>
        <p className="text-brand-muted max-w-md mx-auto leading-relaxed mb-8">
          Thank you for applying for the <strong>{postingTitle}</strong> position.
          Your application has been received and will be reviewed by our team.
          We will be in touch if your profile is a match.
        </p>
        <a href="/vacancies" className="text-brand-navy font-semibold text-sm hover:underline">← View all vacancies</a>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      <input type="hidden" name="postingId" value={postingId} />

      {/* Personal Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-bold text-brand-navy text-lg">Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input type="text" name="applicantName" required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input type="email" name="applicantEmail" required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input type="tel" name="applicantPhone" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
      </div>

      {/* Mandatory Conditions */}
      {mandatoryConditions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <h2 className="font-bold text-brand-navy text-lg">Eligibility Conditions</h2>
            <p className="text-sm text-brand-muted mt-1">
              Please confirm whether you meet each of the following mandatory requirements. You must answer honestly — all conditions must be met to be considered.
            </p>
          </div>
          <div className="space-y-4">
            {mandatoryConditions.map((condition, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-800 mb-3">
                  <span className="text-brand-gold font-bold mr-2">{i + 1}.</span>
                  {condition}
                </p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name={`condition_${i}`} value="yes" required className="accent-green-600 h-4 w-4" />
                    <span className="text-sm font-medium text-green-700">Yes, I meet this requirement</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name={`condition_${i}`} value="no" required className="accent-red-500 h-4 w-4" />
                    <span className="text-sm font-medium text-red-600">No, I do not meet this requirement</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Required Documents */}
      {requiredDocuments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <h2 className="font-bold text-brand-navy text-lg">Required Documents</h2>
            <p className="text-sm text-brand-muted mt-1">Upload the following documents. Accepted formats: PDF, Word, JPG, PNG. Maximum 10 MB per file.</p>
          </div>
          <div className="space-y-4">
            {requiredDocuments.map((docName, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {docName} *
                </label>
                <input
                  type="file"
                  name={`document_${i}`}
                  required
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-navy file:text-white hover:file:bg-brand-navy/90 cursor-pointer"
                />
                <input type="hidden" name={`document_label_${i}`} value={docName} />
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="bg-brand-navy hover:bg-brand-navy/90 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-lg transition-colors text-sm"
        >
          {submitting ? "Submitting…" : "Submit Application"}
        </button>
        <p className="text-xs text-brand-muted">All fields marked * are required.</p>
      </div>
    </form>
  );
}
