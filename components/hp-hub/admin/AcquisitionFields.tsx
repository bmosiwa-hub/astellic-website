import { ACQUISITION_LABELS } from "@/lib/hp-hub/constants";
import { dateInputValue, inputCls, textareaCls } from "./ui";

interface Opt {
  id: string;
  name: string;
}

export interface AcquisitionValues {
  title?: string;
  countryId?: string;
  publisherId?: string | null;
  publisherName?: string | null;
  documentTypeId?: string | null;
  year?: number | null;
  evidence?: string | null;
  sourceUrl?: string | null;
  status?: string;
  unavailableReason?: string | null;
  lastVerifiedAt?: Date | null;
  ownerId?: string | null;
  nextAction?: string | null;
  nextActionDue?: Date | null;
  notes?: string | null;
}

function L({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-brand-navy mb-1">
      {children}
    </label>
  );
}

/** Field set shared by the "new" and "edit" tracker forms. */
export default function AcquisitionFields({
  v,
  countries,
  publishers,
  types,
  members,
}: {
  v: AcquisitionValues;
  countries: Opt[];
  publishers: Opt[];
  types: Opt[];
  members: Opt[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <L htmlFor="title">Document title *</L>
        <input id="title" name="title" required defaultValue={v.title} maxLength={500} className={inputCls} />
      </div>
      <div className="grid sm:grid-cols-4 gap-4">
        <div>
          <L htmlFor="countryId">Country *</L>
          <select id="countryId" name="countryId" defaultValue={v.countryId} className={inputCls}>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <L htmlFor="documentTypeId">Document type</L>
          <select id="documentTypeId" name="documentTypeId" defaultValue={v.documentTypeId ?? ""} className={inputCls}>
            <option value="">Unknown</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <L htmlFor="year">Year / date</L>
          <input id="year" name="year" inputMode="numeric" maxLength={4} defaultValue={v.year ?? ""} className={inputCls} />
        </div>
        <div>
          <L htmlFor="status">Status *</L>
          <select id="status" name="status" defaultValue={v.status ?? "MISSING"} className={inputCls}>
            {Object.entries(ACQUISITION_LABELS).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <L htmlFor="publisherId">Publisher (catalogued)</L>
          <select id="publisherId" name="publisherId" defaultValue={v.publisherId ?? ""} className={inputCls}>
            <option value="">—</option>
            {publishers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <L htmlFor="publisherName">…or publisher / institution name</L>
          <input id="publisherName" name="publisherName" defaultValue={v.publisherName ?? ""} maxLength={300} className={inputCls} />
        </div>
      </div>
      <div>
        <L htmlFor="evidence">Evidence the document exists</L>
        <textarea id="evidence" name="evidence" rows={2} defaultValue={v.evidence ?? ""} maxLength={5000} placeholder="Citation, reference in another document, meeting record…" className={textareaCls} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <L htmlFor="sourceUrl">Source URL / reference link</L>
          <input id="sourceUrl" name="sourceUrl" type="url" defaultValue={v.sourceUrl ?? ""} className={inputCls} />
        </div>
        <div>
          <L htmlFor="unavailableReason">Why it&rsquo;s unavailable</L>
          <input id="unavailableReason" name="unavailableReason" defaultValue={v.unavailableReason ?? ""} maxLength={2000} className={inputCls} />
        </div>
      </div>
      <div className="grid sm:grid-cols-4 gap-4">
        <div>
          <L htmlFor="ownerId">Owner</L>
          <select id="ownerId" name="ownerId" defaultValue={v.ownerId ?? ""} className={inputCls}>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <L htmlFor="lastVerifiedAt">Last verified</L>
          <input id="lastVerifiedAt" name="lastVerifiedAt" type="date" defaultValue={dateInputValue(v.lastVerifiedAt)} className={inputCls} />
        </div>
        <div className="sm:col-span-2 grid grid-cols-[minmax(0,1fr)_9.5rem] gap-2">
          <div>
            <L htmlFor="nextAction">Next follow-up action</L>
            <input id="nextAction" name="nextAction" defaultValue={v.nextAction ?? ""} maxLength={1000} className={inputCls} />
          </div>
          <div>
            <L htmlFor="nextActionDue">Due</L>
            <input id="nextActionDue" name="nextActionDue" type="date" defaultValue={dateInputValue(v.nextActionDue)} className={inputCls} />
          </div>
        </div>
      </div>
      <div>
        <L htmlFor="notes">Notes</L>
        <textarea id="notes" name="notes" rows={3} defaultValue={v.notes ?? ""} maxLength={10000} className={textareaCls} />
      </div>
    </div>
  );
}
