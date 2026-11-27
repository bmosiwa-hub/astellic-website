"use client";

import { useRef, type ReactNode } from "react";

/**
 * A GET form that submits itself when a checkbox/select changes. Without
 * JavaScript it is an ordinary form with an Apply button, so filtering still
 * works on any device.
 */
export default function AutoSubmitForm({
  action,
  children,
  className,
  ariaLabel,
}: {
  action: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={ref}
      action={action}
      method="get"
      aria-label={ariaLabel}
      className={className}
      onChange={(e) => {
        const t = e.target as unknown as HTMLInputElement;
        // Unnamed checkboxes belong to widgets (e.g. FilterDropdown) that submit themselves.
        if ((t.type === "checkbox" && t.name) || t.tagName === "SELECT") ref.current?.requestSubmit();
      }}
      onSubmit={(e) => {
        // Drop empty fields so URLs stay short and shareable.
        const form = e.currentTarget;
        for (const el of Array.from(form.elements) as HTMLInputElement[]) {
          if (el.name && !el.value) el.disabled = true;
        }
        setTimeout(() => {
          for (const el of Array.from(form.elements) as HTMLInputElement[]) el.disabled = false;
        }, 0);
      }}
    >
      {children}
    </form>
  );
}
