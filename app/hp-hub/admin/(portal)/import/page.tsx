import ImportForm from "@/components/hp-hub/admin/ImportForm";
import { PageHeader, Panel, btnSecondary } from "@/components/hp-hub/admin/ui";
import { requireHpPage } from "@/lib/hp-hub/auth";
import { CSV_COLUMNS } from "@/lib/hp-hub/csv";

export const metadata = { title: "CSV import" };

export default async function ImportPage() {
  await requireHpPage("import.csv");
  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Bulk import from CSV"
        description="Import document metadata in bulk. Rows are checked first; valid rows become drafts for review. Files can't be imported by CSV: imported records are external-source or restricted, and you can attach files afterwards."
        actions={
          <a href="/api/hp-hub/admin/csv-template" className={btnSecondary}>
            Download template
          </a>
        }
      />
      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        <ImportForm />
        <Panel title="Columns">
          <ul className="text-xs space-y-1.5">
            {CSV_COLUMNS.map((c) => (
              <li key={c.key}>
                <code className="font-semibold text-brand-navy">{c.key}</code>
                {c.required && <span className="text-red-700"> *</span>}
                {c.help && <span className="text-brand-muted"> — {c.help}</span>}
              </li>
            ))}
          </ul>
          <p className="text-xs text-brand-muted mt-3">Country, type and theme values must match existing names. Unknown publishers are created.</p>
        </Panel>
      </div>
    </div>
  );
}
