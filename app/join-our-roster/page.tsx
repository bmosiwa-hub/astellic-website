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
}: {
  id: string;
  label: string;
  value: FileState;
  onChange: (state: FileState) => void;
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
        {label} <span className="text-red-500">*</span>
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
              Click to upload <span className="text-brand-navy font-medium">{label}</span>
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

export default function JoinOurRosterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [cv, setCv] = useState<FileState>(emptyFile());
  const [statement, setStatement] = useState<FileState>(emptyFile());
  const [doc1, setDoc1] = useState<FileState>(emptyFile());
  const [doc2, setDoc2] = useState<FileState>(emptyFile());

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [touched, setTouched] = useState(false);

  const allFilled =
    name.trim() &&
    email.trim() &&
    position.trim() &&
    cv.file &&
    statement.file &&
    doc1.file &&
    doc2.file;

  const missing: string[] = [];
  if (!name.trim()) missing.push("Name");
  if (!email.trim()) missing.push("Email Address");
  if (!position.trim()) missing.push("Position Applied For");
  if (!cv.file) missing.push("CV");
  if (!statement.file) missing.push("Statement of Interest");
  if (!doc1.file) missing.push("Sample of Work / Reference 1");
  if (!doc2.file) missing.push("Sample of Work / Reference 2");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!allFilled) return;

    setSubmitting(true);
    setServerError("");

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("email", email.trim());
    formData.append("position", position.trim());
    formData.append("cv", cv.file!);
    formData.append("statement", statement.file!);
    formData.append("doc1", doc1.file!);
    formData.append("doc2", doc2.file!);

    try {
      const res = await fetch("/api/apply", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed.");
      setSubmitted(true);
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-20">
        <div className="max-w-lg text-center">
          <div className="text-5xl mb-6">âœ…</div>
          <h1 className="text-3xl font-bold text-brand-navy mb-4">
            Application Received
          </h1>
          <p className="text-brand-muted text-lg leading-relaxed">
            Thank you, <strong>{name}</strong>. Your application for{" "}
            <strong>{position}</strong> has been submitted successfully. We will
            review your documents and be in touch.
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
          alt="Join the Astellic roster"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Join Our Roster
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Astellic maintains a roster of senior consultants and associates
            across our thematic areas. Complete the form below to be considered
            for current and future engagements.
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

            {/* Personal details */}
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-brand-navy">
                Personal Details
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
                <label className="block text-base font-medium mb-1" htmlFor="position">
                  Position Applied For <span className="text-red-500">*</span>
                </label>
                <input
                  id="position"
                  type="text"
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Senior Consultant"
                  className={`w-full border rounded-lg px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-gold ${
                    touched && !position.trim() ? "border-red-400" : "border-gray-200"
                  }`}
                />
                <p className="text-base text-brand-muted mt-1.5 leading-relaxed">
                  Write <strong>Senior Consultant</strong> if you have 8+ years
                  of experience, or <strong>Associate Consultant</strong> if you
                  have 5 – 8 years&apos; experience.
                </p>
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-brand-navy">Documents</h2>
              <p className="text-base text-brand-muted">
                All four documents are required. For each of the two slots below,
                upload either a <strong>sample of work</strong> or a{" "}
                <strong>reference letter from a previous engagement</strong> —
                whichever is most relevant to your field. Maximum{" "}
                <strong>{MAX_MB} MB</strong> per file. Accepted formats: PDF, DOC, DOCX.
              </p>

              <FileUpload id="cv" label="CV" value={cv} onChange={setCv} />
              <FileUpload
                id="statement"
                label="Statement of Interest"
                value={statement}
                onChange={setStatement}
              />
              <FileUpload
                id="doc1"
                label="Sample of Work or Reference from Previous Engagement (1)"
                value={doc1}
                onChange={setDoc1}
              />
              <FileUpload
                id="doc2"
                label="Sample of Work or Reference from Previous Engagement (2)"
                value={doc2}
                onChange={setDoc2}
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
                {submitting ? "Submitting…" : "Submit Application"}
              </button>
              {touched && missing.length > 0 && (
                <p className="text-base text-red-500 text-center mt-2">
                  Please fill in all required fields and upload all documents.
                </p>
              )}
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
