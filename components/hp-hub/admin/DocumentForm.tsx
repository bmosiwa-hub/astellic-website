"use client";

import { useKeepValuesSubmit } from "../useKeepValuesSubmit";
import { useActionState, useState } from "react";
import { saveDocument, type DocFormState } from "@/lib/hp-hub/admin/document-actions";
import { ADMIN_ACCEPT, ADMIN_MAX_BYTES, ADMIN_MIME_TYPES } from "@/lib/hp-hub/files";
import { formatFileSize } from "@/lib/hp-hub/text";
import FileUploader from "../FileUploader";

const input =
  "w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-brand-navy focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/15 outline-none aria-[invalid=true]:border-red-400";

export interface DocumentFormValues {
  id?: string;
  title?: string;
  countryId?: string;
  documentTypeId?: string;
  publisherId?: string;
  publicationYear?: number | null;
  publicationDate?: string;
  startYear?: number | null;
  endYear?: number | null;
  authors?: string;
  description?: string | null;
  abstract?: string | null;
  language?: string;
  version?: string | null;
  edition?: string | null;
  themeIds?: string[];
  primaryThemeId?: string | null;
  keywords?: string;
  sourceUrl?: string | null;
  citationText?: string | null;
  notes?: string | null;
  accessType?: string;
  permissionStatus?: string;
  rightsHolder?: string | null;
  rightsStatement?: string | null;
  verificationStatus?: string;
  verificationNotes?: string | null;
  isFeatured?: boolean;
  currentFile?: { name: string; size: number | null; previewHref: string } | null;
}

interface Option {
  id: string;
  name: string;
}

function Field({ id, label, error, hint, required, children, className = "" }: { id: string; label: string; error?: string; hint?: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold text-brand-navy mb-1">
        {label}
        {required && <span className="text-red-700"> *</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} className="text-xs text-red-700 mt-1">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-brand-muted mt-1">{hint}</p>
      ) : null}
    </div>
  );
}

function Section({ title, children, description }: { title: string; children: React.ReactNode; description?: string }) {
  return (
    <fieldset className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <h2 className="text-sm font-bold text-brand-navy" aria-hidden>
        {title}
      </h2>
      {description && <p className="text-xs text-brand-muted mt-0.5">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </fieldset>
  );
}

export default function DocumentForm({
  values,
  countries,
  types,
  publishers,
  themes,
  canVerify,
  canFeature,
  upload,
  fromSubmission,
}: {
  fromSubmission?: { id: string; fileName: string | null };
  values: DocumentFormValues;
  countries: Option[];
  types: Option[];
  publishers: (Option & { acronym: string | null })[];
  themes: Option[];
  canVerify: boolean;
  canFeature: boolean;
  upload: { prefix: string; access: "private" | "public" } | null;
}) {
  const [state, action, pending] = useActionState<DocFormState, FormData>(saveDocument, { ok: false });
  const submit = useKeepValuesSubmit(action);
  const e = state.errors ?? {};
  const inv = (k: string) => ({ "aria-invalid": !!e[k], "aria-describedby": e[k] ? `${k}-err` : undefined });

  const [publisherId, setPublisherId] = useState(values.publisherId ?? "");
  const [accessType, setAccessType] = useState(values.accessType ?? "EXTERNAL");
  const [themeIds, setThemeIds] = useState<string[]>(values.themeIds ?? []);
  const [removeFile, setRemoveFile] = useState(false);
  const [hasNewFile, setHasNewFile] = useState(false);

  const toggleTheme = (id: string) => setThemeIds((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  return (
    <form action={action} onSubmit={submit} className="space-y-5" noValidate>
      {values.id && <input type="hidden" name="id" value={values.id} />}
      {fromSubmission && <input type="hidden" name="submissionId" value={fromSubmission.id} />}

      {state.message && !state.ok && (
        <div role="alert" className="border border-red-200 bg-red-50 text-red-900 rounded px-4 py-3 text-sm">
          {state.message}
        </div>
      )}

      <Section title="Core details" description="Required fields are marked *">
        <Field id="title" label="Title" required error={e.title}>
          <input id="title" name="title" defaultValue={values.title} required maxLength={500} className={input} {...inv("title")} />
        </Field>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field id="countryId" label="Country" required error={e.countryId}>
            <select id="countryId" name="countryId" defaultValue={values.countryId ?? ""} className={input} {...inv("countryId")}>
              <option value="">Select…</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field id="documentTypeId" label="Document type" required error={e.documentTypeId}>
            <select id="documentTypeId" name="documentTypeId" defaultValue={values.documentTypeId ?? ""} className={input} {...inv("documentTypeId")}>
              <option value="">Select…</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field id="publicationYear" label="Publication year" error={e.publicationYear} hint="When known">
            <input id="publicationYear" name="publicationYear" inputMode="numeric" maxLength={4} defaultValue={values.publicationYear ?? ""} className={input} {...inv("publicationYear")} />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field id="publisherId" label="Publisher" required error={e.publisherId}>
            <select id="publisherId" name="publisherId" value={publisherId} onChange={(ev) => setPublisherId(ev.target.value)} className={input} {...inv("publisherId")}>
              <option value="">Select…</option>
              <option value="__new">+ Add a new publisher</option>
              {publishers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.acronym ? ` (${p.acronym})` : ""}
                </option>
              ))}
            </select>
          </Field>
          {publisherId === "__new" && (
            <Field id="newPublisherName" label="New publisher name" required error={e.newPublisherName}>
              <input id="newPublisherName" name="newPublisherName" maxLength={300} className={input} placeholder="e.g. Ministry of Health, Malawi" />
            </Field>
          )}
        </div>
        <Field id="authors" label="Authors" hint="Separate with semicolons. Leave blank for institutional authorship.">
          <input id="authors" name="authors" defaultValue={values.authors} className={input} />
        </Field>
      </Section>

      <Section title="File and source" description="Upload the file and/or give the original source URL.">
        {values.currentFile && !removeFile && !hasNewFile && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-gray-200 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-brand-navy">{values.currentFile.name}</p>
              <p className="text-xs text-brand-muted">{formatFileSize(values.currentFile.size)} · current file</p>
            </div>
            <div className="flex gap-4 text-sm">
              <a href={values.currentFile.previewHref} target="_blank" rel="noopener" className="font-semibold text-brand-teal">
                Preview
              </a>
              <label className="flex items-center gap-1.5 text-red-700 font-semibold cursor-pointer">
                <input type="checkbox" name="removeFile" checked={removeFile} onChange={(ev) => setRemoveFile(ev.target.checked)} /> Remove
              </label>
            </div>
          </div>
        )}
        {removeFile && <input type="hidden" name="removeFile" value="on" />}
        {fromSubmission?.fileName && !hasNewFile && (
          <label className="flex items-center gap-2 rounded border border-gray-200 px-4 py-3 text-sm text-gray-700">
            <input type="checkbox" name="useSubmissionFile" defaultChecked className="h-4 w-4 rounded border-gray-300" />
            Use the submitted file: <span className="font-semibold text-brand-navy">{fromSubmission.fileName}</span>
          </label>
        )}
        {upload ? (
          <FileUploader
            area="documents"
            prefix={upload.prefix}
            access={upload.access}
            allowedTypes={ADMIN_MIME_TYPES}
            accept={ADMIN_ACCEPT}
            maxBytes={ADMIN_MAX_BYTES}
            label={values.currentFile ? "Replace file" : "Upload file"}
            hint="PDF, Word, Excel or PowerPoint, up to 100 MB. Replaced files are kept as earlier versions."
            onChange={(f) => setHasNewFile(!!f)}
            error={e.file}
          />
        ) : (
          <p className="text-sm text-amber-800">File storage is not configured; you can still catalogue external-source records.</p>
        )}
        {values.id && hasNewFile && (
          <Field id="versionNote" label="Note about this replacement" hint="Stored with the previous version, e.g. 'Final signed version'">
            <input id="versionNote" name="versionNote" maxLength={500} className={input} />
          </Field>
        )}
        <Field id="sourceUrl" label="Original source URL" error={e.sourceUrl}>
          <input id="sourceUrl" name="sourceUrl" type="url" defaultValue={values.sourceUrl ?? ""} placeholder="https://" className={input} {...inv("sourceUrl")} />
        </Field>
      </Section>

      <Section title="Rights and access" description="Don't host a file just because it's online: record the permission basis.">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field id="accessType" label="Access type" required error={e.accessType}>
            <select id="accessType" name="accessType" value={accessType} onChange={(ev) => setAccessType(ev.target.value)} className={input} {...inv("accessType")}>
              <option value="EXTERNAL">External source (metadata only)</option>
              <option value="HOSTED">Hosted download</option>
              <option value="RESTRICTED">Restricted (request access)</option>
            </select>
          </Field>
          <Field id="permissionStatus" label="Rights / permission status" required error={e.permissionStatus}>
            <select id="permissionStatus" name="permissionStatus" defaultValue={values.permissionStatus ?? "NOT_REQUIRED"} className={input} {...inv("permissionStatus")}>
              <option value="NOT_REQUIRED">Not required (metadata only)</option>
              <option value="UNKNOWN">Unknown</option>
              <option value="REQUESTED">Permission requested</option>
              <option value="GRANTED">Permission granted</option>
              <option value="OPEN_LICENSE">Open licence</option>
              <option value="DENIED">Permission denied</option>
            </select>
          </Field>
        </div>
        {accessType === "HOSTED" && (
          <p className="text-xs text-brand-muted -mt-1">Hosted downloads need a file, permission granted or an open licence, and a rights holder or statement.</p>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          <Field id="rightsHolder" label="Rights holder" error={e.rightsHolder}>
            <input id="rightsHolder" name="rightsHolder" defaultValue={values.rightsHolder ?? ""} maxLength={300} className={input} />
          </Field>
          <Field id="rightsStatement" label="Rights statement / source attribution" error={e.rightsStatement}>
            <input id="rightsStatement" name="rightsStatement" defaultValue={values.rightsStatement ?? ""} maxLength={2000} className={input} {...inv("rightsStatement")} placeholder="e.g. Shared with permission of MoH, email of 3 May 2026" />
          </Field>
        </div>
      </Section>

      <Section title="Themes and keywords">
        <div>
          <p className="text-sm font-semibold text-brand-navy mb-2">Themes</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1.5">
            {themes.map((t) => (
              <label key={t.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" name="themeIds" value={t.id} checked={themeIds.includes(t.id)} onChange={() => toggleTheme(t.id)} className="h-4 w-4 rounded border-gray-300" />
                {t.name}
              </label>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field id="primaryThemeId" label="Primary theme" error={e.primaryThemeId} hint="Optional; must be one of the selected themes">
            <select id="primaryThemeId" name="primaryThemeId" defaultValue={values.primaryThemeId ?? ""} className={input}>
              <option value="">None</option>
              {themes
                .filter((t) => themeIds.includes(t.id))
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field id="keywords" label="Keywords" hint="Separate with commas">
            <input id="keywords" name="keywords" defaultValue={values.keywords} className={input} placeholder="uhc, district health, equity" />
          </Field>
        </div>
      </Section>

      <Section title="Description">
        <Field id="description" label="Short description" error={e.description} hint="Shown in listings and search results.">
          <textarea id="description" name="description" rows={3} defaultValue={values.description ?? ""} maxLength={5000} className={`${input} h-auto py-2`} />
        </Field>
        <Field id="abstract" label="Abstract" error={e.abstract}>
          <textarea id="abstract" name="abstract" rows={6} defaultValue={values.abstract ?? ""} maxLength={20000} className={`${input} h-auto py-2`} />
        </Field>
      </Section>

      <Section title="Publication details">
        <div className="grid sm:grid-cols-4 gap-4">
          <Field id="publicationDate" label="Publication date" error={e.publicationDate}>
            <input id="publicationDate" name="publicationDate" type="date" defaultValue={values.publicationDate} className={input} />
          </Field>
          <Field id="startYear" label="Period from" error={e.startYear}>
            <input id="startYear" name="startYear" inputMode="numeric" maxLength={4} defaultValue={values.startYear ?? ""} className={input} {...inv("startYear")} />
          </Field>
          <Field id="endYear" label="Period to" error={e.endYear}>
            <input id="endYear" name="endYear" inputMode="numeric" maxLength={4} defaultValue={values.endYear ?? ""} className={input} {...inv("endYear")} />
          </Field>
          <Field id="language" label="Language">
            <input id="language" name="language" defaultValue={values.language ?? "English"} maxLength={60} list="hp-languages" className={input} />
            <datalist id="hp-languages">
              <option value="English" />
              <option value="Chichewa" />
              <option value="French" />
              <option value="Portuguese" />
              <option value="Swahili" />
            </datalist>
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field id="version" label="Version">
            <input id="version" name="version" defaultValue={values.version ?? ""} maxLength={60} className={input} />
          </Field>
          <Field id="edition" label="Edition">
            <input id="edition" name="edition" defaultValue={values.edition ?? ""} maxLength={60} className={input} />
          </Field>
        </div>
        <Field id="citationText" label="Citation" hint="Leave blank to generate one automatically.">
          <textarea id="citationText" name="citationText" rows={2} defaultValue={values.citationText ?? ""} maxLength={2000} className={`${input} h-auto py-2`} />
        </Field>
      </Section>

      <Section title="Review">
        {canVerify ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="verificationStatus" label="Verification status">
              <select id="verificationStatus" name="verificationStatus" defaultValue={values.verificationStatus ?? "UNVERIFIED"} className={input}>
                <option value="UNVERIFIED">Unverified</option>
                <option value="PENDING_VERIFICATION">Verification pending</option>
                <option value="VERIFIED">Verified</option>
                <option value="DISPUTED">Disputed</option>
              </select>
            </Field>
            <Field id="verificationNotes" label="Verification notes">
              <input id="verificationNotes" name="verificationNotes" defaultValue={values.verificationNotes ?? ""} maxLength={2000} className={input} />
            </Field>
          </div>
        ) : (
          <p className="text-sm text-brand-muted">An editor will verify this record.</p>
        )}
        {canFeature && (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="isFeatured" defaultChecked={values.isFeatured} className="h-4 w-4 rounded border-gray-300" /> Feature this document on the hub and country pages
          </label>
        )}
        <Field id="notes" label="Internal notes" hint="Never shown publicly.">
          <textarea id="notes" name="notes" rows={2} defaultValue={values.notes ?? ""} maxLength={5000} className={`${input} h-auto py-2`} />
        </Field>
      </Section>

      <div className="sticky bottom-0 bg-gray-50/95 backdrop-blur border-t border-gray-200 -mx-4 sm:-mx-8 px-4 sm:px-8 py-3 flex flex-wrap items-center gap-3">
        <button type="submit" name="intent" value="save" disabled={pending} className="h-10 px-5 rounded bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy/90 disabled:opacity-60">
          {pending ? "Saving…" : values.id ? "Save changes" : "Save as draft"}
        </button>
        <button type="submit" name="intent" value="another" disabled={pending} className="h-10 px-5 rounded border border-gray-300 bg-white text-brand-navy text-sm font-semibold hover:border-brand-navy disabled:opacity-60">
          Save and add another
        </button>
        <span className="text-xs text-brand-muted">&ldquo;Add another&rdquo; keeps the country, type, publisher and rights settings.</span>
      </div>
    </form>
  );
}
