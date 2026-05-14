"use client";

/** A button that calls window.print() — must be a client component. */
export function PrintButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={className}
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
      Print
    </button>
  );
}

/** A select that auto-submits its parent form when the value changes. */
export function AutoSubmitSelect({
  name,
  defaultValue,
  children,
  className,
}: {
  name: string;
  defaultValue?: string | number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <select
      name={name}
      defaultValue={String(defaultValue ?? "")}
      onChange={(e) => (e.target.form as HTMLFormElement | null)?.submit()}
      className={className}
    >
      {children}
    </select>
  );
}
