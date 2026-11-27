"use client";

import { upload } from "@vercel/blob/client";
import { useId, useRef, useState } from "react";
import { checkFileMeta, safeFileName } from "@/lib/hp-hub/files";
import { formatFileSize } from "@/lib/hp-hub/text";

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
}

/**
 * Drag-and-drop uploader that sends the file straight to storage using a
 * token from /api/hp-hub/upload, with progress, validation and error states.
 * It renders hidden inputs (fileUrl, fileName, fileSize) for the parent form.
 * The server re-validates the upload before using it.
 */
export default function FileUploader({
  area,
  prefix,
  access,
  allowedTypes,
  accept,
  maxBytes,
  label = "Document file",
  hint,
  inputPrefix = "file",
  onChange,
  error,
}: {
  area: "documents" | "submissions" | "evidence";
  prefix: string;
  access: "private" | "public";
  allowedTypes: string[];
  accept: string;
  maxBytes: number;
  label?: string;
  hint?: string;
  inputPrefix?: string;
  onChange?: (f: UploadedFile | null) => void;
  error?: string;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function start(f: File) {
    setProblem(null);
    const check = checkFileMeta({ name: f.name, size: f.size, type: f.type }, { allowed: allowedTypes, maxBytes });
    if (!check.ok) {
      setProblem(check.error);
      return;
    }
    setProgress(0);
    try {
      const result = await upload(`${prefix}${safeFileName(f.name)}`, f, {
        access,
        handleUploadUrl: "/api/hp-hub/upload",
        contentType: check.mime,
        clientPayload: JSON.stringify({ area, size: f.size, name: f.name }),
        multipart: f.size > 20 * 1024 * 1024,
        onUploadProgress: (e) => setProgress(Math.round(e.percentage)),
      });
      const uploaded = { url: result.url, name: f.name, size: f.size };
      setFile(uploaded);
      onChange?.(uploaded);
    } catch (err) {
      setProblem(err instanceof Error && err.message ? err.message : "The upload failed. Check your connection and try again.");
    } finally {
      setProgress(null);
    }
  }

  function clear() {
    setFile(null);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const shownError = problem ?? error;

  return (
    <div>
      <p id={`${id}-label`} className="block text-sm font-semibold text-brand-navy mb-1.5">
        {label}
      </p>
      {file ? (
        <div className="flex items-center justify-between gap-4 rounded border border-brand-teal/40 bg-brand-teal/5 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand-navy truncate">{file.name}</p>
            <p className="text-xs text-brand-muted">{formatFileSize(file.size)} · uploaded</p>
          </div>
          <button type="button" onClick={clear} className="text-sm font-semibold text-red-700 hover:underline shrink-0">
            Remove
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f && progress === null) start(f);
          }}
          className={`rounded border-2 border-dashed px-4 py-6 text-center transition-colors ${
            dragging ? "border-brand-teal bg-brand-teal/5" : shownError ? "border-red-300" : "border-gray-300"
          }`}
        >
          {progress !== null ? (
            <div role="status" aria-live="polite">
              <p className="text-sm text-brand-navy mb-2">Uploading… {progress}%</p>
              <div className="h-1.5 bg-gray-200 rounded overflow-hidden max-w-xs mx-auto">
                <div className="h-full bg-brand-teal transition-[width]" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-brand-navy">
                Drag a file here, or{" "}
                <button type="button" onClick={() => inputRef.current?.click()} className="font-semibold text-brand-teal underline underline-offset-2">
                  choose a file
                </button>
              </p>
              {hint && <p className="text-xs text-brand-muted mt-1">{hint}</p>}
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="sr-only"
            aria-labelledby={`${id}-label`}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) start(f);
            }}
          />
        </div>
      )}
      {shownError && (
        <p role="alert" className="text-sm text-red-700 mt-1.5">
          {shownError}
        </p>
      )}
      <input type="hidden" name={`${inputPrefix}Url`} value={file?.url ?? ""} />
      <input type="hidden" name={`${inputPrefix}Name`} value={file?.name ?? ""} />
    </div>
  );
}
