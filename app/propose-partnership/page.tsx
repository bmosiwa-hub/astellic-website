"use client";

import { useRef, useState } from "react";
import Image from "next/image";

const MAX_MB = 20;
const MAX_BYTES = MAX_MB * 1024 * 1024;

interface FileState {
  file: File | null;
  error: string;
}

const emptyFile = (): FileState => ({ file: null, error: "" });

function FileUpload({
  id,
  label,
  value,
  onChange,
  optional,
}: {
  id: string;
  label: string;
  value: FileState;
  onChange: (state: FileState) => void;
  optional?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return onChange({ file: null, error: "" });
    if (file.size > MAX_BYTES)
      return onChange({
        file: null,
        error: `File exceeds ${MAX_MB} MB. Please upload a smaller file.`,
      });
    onChange({ file, error: "" });
  };

  return (
    <div>
      <label className="block text-base font-medium mb-1" htmlFor={id}>
        {label}{" "}
        {optional ? (
          <span className="text-brand-muted font-normal">(optional)</span>
        ) : (
          <span className="text-red-500">*</span>
        )}
      </label>
      <div
        className={`border-2 border-dashed rounded-lg px-4 py-5 cursor-pointer transition-colors ${
          value.error
            ? "border-red-400 bg-red-50"
            : value.file
            ? "border-brand-gold bg-brand-gold/5"
            : "border-gray-200 hover:border-brand-gold/60"
        }`}
        onClick={() => ref.current?.click()}
      >
        <input
          ref={ref}
          id={id}
          name={id}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={handleChange}
        />
        {value.file ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-brand-gold text-xl shrink-0">ðŸ“„</span>
              <span className="text-base font-medium text-brand-navy truncate">
                {value.file.name}
              </span>
            </div>
            <span className="text-base text-brand-muted shrink-0">
              {(value.file.size / 1024 / 1024).toFixed(1)} MB
            </span>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-base text-brand-muted">
              Click to upload{" "}
              <span className="text-brand-navy font-medium">{label}</span>
            </p>
            <p className="text-base text-brand-muted mt-1">
              PDF, DOC, DOCX — max {MAX_MB} MB
            </p>
          </div>
        )}
      </div>
      {value.error && (
        <p className="text-red-500 text-base mt-1">{value.error}</p>
      )}
    </div>
  );
}

export default function ProposePartnershipPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [proposal, setProposal] = useState("");
  const [doc1, setDoc1] = useState<FileState>(emptyFile());
  const [doc2, setDoc2] = useState<FileState>(emptyFile());

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [touched, setTouched] = useState(false);

  const allFilled =
    name.trim() && email.trim() && organisation.trim() && proposal.trim();

  const missing: string[] = [];
  if (!name.trim()) missing.push("Name");
  if (!email.trim()) missing.push("Email Address");
  if (!organisation.trim()) missing.push("Organisation / Institution");
  if (!proposal.trim()) missing.push("Proposed Partnership");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!allFilled) return;

    setSubmitting(true);
    setServerError("");

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("email", email.trim());
    formData.append("organisation", organisation.trim());
    formData.append("proposal", proposal.trim());
    if (doc1.file) formData.append("doc1", doc1.file);
    if (doc2.file) formData.append("doc2", doc2.file);

    try {
      const res = await fetch("/api/partnership", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed.");
      setSubmitted(true);
    } catch (err: unknown) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-20">
        <div className="max-w-lg text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h1 className="text-3xl font-bold text-brand-navy mb-4">
            Proposal Received
          </h1>
          <p className="text-brand-muted text-lg leading-relaxed">
            Thank you, <strong>{name}</strong>. Your partnership proposal from{" "}
            <strong>{organisation}</strong> has been submitted successfully. Our
            team will review your proposal and be in touch.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-work.jpg"
          alt="Propose a partnership with Astellic"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Propose a Partnership
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Astellic is open to strategic partnerships with organisations that
            share our commitment to evidence-based policy and development.
            Tell us about your organisation and the collaboration you have in mind.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">

          {/* Incomplete warning */}
          {touched && missing.length > 0 && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-xl px-6 py-4">
              <p className="text-base font-semibold text-red-700 mb-2">
                Please complete the following before submitting:
              </p>
              <ul className="list-disc list-inside text-base text-red-600 space-y-1">
                {missing.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          {serverError && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-xl px-6 py-4">
              <p className="text-base text-red-700">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-8">

            {/* Contact details */}
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-brand-navy">
                Contact Details
              </h2>

              <div>
                <label className="block text-base font-medium mb-1" htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className={`w-full border rounded-lg px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-gold ${
                    touched && !name.trim() ? "border-red-400" : "border-gray-200"
                  }`}
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-1" htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@organisation.org"
                  className={`w-full border rounded-lg px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-gold ${
                    touched && !email.trim() ? "border-red-400" : "border-gray-200"
                  }`}
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-1" htmlFor="organisation">
                  Organisation / Institution <span className="text-red-500">*</span>
                </label>
                <input
                  id="organisation"
                  type="text"
                  required
                  value={organisation}
                  onChange={(e) => setOrganisation(e.target.value)}
                  placeholder="e.g. Ministry of Health, UNDP, XYZ Foundation"
                  className={`w-full border rounded-lg px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-gold ${
                    touched && !organisation.trim() ? "border-red-400" : "border-gray-200"
                  }`}
                />
              </div>
            </div>

            {/* Partnership proposal */}
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-brand-navy">
                Partnership Proposal
              </h2>

              <div>
                <label className="block text-base font-medium mb-1" htmlFor="proposal">
                  Describe the Proposed Partnership <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="proposal"
                  required
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  rows={8}
                  placeholder="Please describe the nature of the proposed collaboration, your organisation's role, expected outcomes, and how you see Astellic contributing..."
                  className={`w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-gold resize-y leading-relaxed ${
                    touched && !proposal.trim() ? "border-red-400" : "border-gray-200"
                  }`}
                />
              </div>
            </div>

            {/* Supporting documents */}
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-brand-navy">
                Supporting Documents
              </h2>
              <p className="text-base text-brand-muted">
                Attach any documents that support your proposal (e.g. concept note,
                MoU draft, terms of reference). Maximum{" "}
                <strong>{MAX_MB} MB</strong> per file. Accepted formats: PDF, DOC, DOCX.
              </p>

              <FileUpload
                id="doc1"
                label="Supporting Document 1"
                value={doc1}
                onChange={setDoc1}
                optional
              />
              <FileUpload
                id="doc2"
                label="Supporting Document 2"
                value={doc2}
                onChange={setDoc2}
                optional
              />
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={submitting}
                onClick={() => setTouched(true)}
                className={`w-full py-3.5 rounded-lg font-medium text-lg transition-colors ${
                  allFilled
                    ? "bg-brand-gold hover:bg-brand-gold/90 text-white cursor-pointer"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {submitting ? "Submitting…" : "Submit Proposal"}
              </button>
              {touched && missing.length > 0 && (
                <p className="text-base text-red-500 text-center mt-2">
                  Please fill in all required fields before submitting.
                </p>
              )}
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
