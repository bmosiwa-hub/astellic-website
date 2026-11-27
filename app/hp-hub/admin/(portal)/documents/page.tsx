import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { PageHeader, Pill, STATUS_TONE, Table, fmtDate, Flash, btnPrimary, btnSecondary, inputCls } from "@/components/hp-hub/admin/ui";
import { Pagination } from "@/components/hp-hub/ui";
import { prisma } from "@/lib/prisma";
import { requireHpPage } from "@/lib/hp-hub/auth";
import { ACCESS_LABELS, STATUS_LABELS, VERIFICATION_LABELS } from "@/lib/hp-hub/constants";
import { can } from "@/lib/hp-hub/permissions";

export const metadata = { title: "Documents" };

const PAGE = 30;
const STATUSES = ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "ARCHIVED"] as const;
const VERIFS = ["UNVERIFIED", "PENDING_VERIFICATION", "VERIFIED", "DISPUTED"] as const;

type SP = { q?: string; status?: string; verification?: string; country?: string; mine?: string; page?: string; ok?: string; err?: string };

export default async function DocumentsAdminPage({ searchParams }: { searchParams: Promise<SP> }) {
  const actor = await requireHpPage();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const statuses = (sp.status ?? "").split(",").filter((s): s is (typeof STATUSES)[number] => (STATUSES as readonly string[]).includes(s));
  const verifs = (sp.verification ?? "").split(",").filter((s): s is (typeof VERIFS)[number] => (VERIFS as readonly string[]).includes(s));
  const q = sp.q?.trim().slice(0, 200);

  const where: Prisma.HpDocumentWhereInput = {
    ...(statuses.length ? { status: { in: statuses } } : {}),
    ...(verifs.length ? { verificationStatus: { in: verifs } } : {}),
    ...(sp.country ? { countryId: sp.country } : {}),
    ...(sp.mine ? { createdById: actor.memberId } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { slug: { contains: q.toLowerCase() } },
            { publisher: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [docs, total, countries] = await Promise.all([
    prisma.hpDocument.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE,
      take: PAGE,
      select: {
        id: true, title: true, status: true, verificationStatus: true, accessType: true, publicationYear: true, updatedAt: true,
        isSynthetic: true, storagePath: true,
        country: { select: { name: true } }, documentType: { select: { name: true } }, publisher: { select: { acronym: true, name: true } },
      },
    }),
    prisma.hpDocument.count({ where }),
    prisma.hpCountry.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  const qs = (overrides: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    const merged = { q, status: sp.status, verification: sp.verification, country: sp.country, mine: sp.mine, ...overrides };
    for (const [k, v] of Object.entries(merged)) if (v) u.set(k, v);
    const s = u.toString();
    return `/hp-hub/admin/documents${s ? `?${s}` : ""}`;
  };

  return (
    <div>
      <PageHeader
        title="Documents"
        description={`${total} ${total === 1 ? "record" : "records"}`}
        actions={
          <>
            {can(actor.role, "import.csv") && (
              <Link href="/hp-hub/admin/import" className={btnSecondary}>
                Import CSV
              </Link>
            )}
            <Link href="/hp-hub/admin/documents/new" className={btnPrimary}>
              Add document
            </Link>
          </>
        }
      />
      <Flash ok={sp.ok} err={sp.err} />

      <form className="flex flex-wrap items-end gap-3 mb-4" action="/hp-hub/admin/documents">
        <div className="flex-1 min-w-56">
          <label htmlFor="q" className="block text-xs font-semibold text-brand-muted mb-1">
            Search titles and publishers
          </label>
          <input id="q" name="q" defaultValue={q} className={inputCls} />
        </div>
        <div>
          <label htmlFor="status" className="block text-xs font-semibold text-brand-muted mb-1">
            Status
          </label>
          <select id="status" name="status" defaultValue={sp.status ?? ""} className={inputCls}>
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="verification" className="block text-xs font-semibold text-brand-muted mb-1">
            Verification
          </label>
          <select id="verification" name="verification" defaultValue={sp.verification ?? ""} className={inputCls}>
            <option value="">All</option>
            <option value="UNVERIFIED,PENDING_VERIFICATION">Awaiting verification</option>
            {VERIFS.map((s) => (
              <option key={s} value={s}>
                {VERIFICATION_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="country" className="block text-xs font-semibold text-brand-muted mb-1">
            Country
          </label>
          <select id="country" name="country" defaultValue={sp.country ?? ""} className={inputCls}>
            <option value="">All</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 h-10 text-sm text-gray-700">
          <input type="checkbox" name="mine" value="1" defaultChecked={!!sp.mine} className="h-4 w-4 rounded border-gray-300" /> Mine
        </label>
        <button type="submit" className={btnSecondary}>
          Filter
        </button>
      </form>

      <Table
        head={["Title", "Type", "Country", "Status", "Verification", "Access", "Updated"]}
        empty={!docs.length && <p className="px-4 py-10 text-center text-sm text-brand-muted">No documents match these filters.</p>}
      >
        {docs.map((d) => (
          <tr key={d.id} className="hover:bg-gray-50 align-top">
            <td className="px-4 py-3 min-w-72">
              <Link href={`/hp-hub/admin/documents/${d.id}`} className="font-semibold text-brand-navy hover:text-brand-teal">
                {d.title}
              </Link>
              <p className="text-xs text-brand-muted mt-0.5">
                {[d.publisher.acronym || d.publisher.name, d.publicationYear].filter(Boolean).join(" · ")}
                {d.isSynthetic && <span className="ml-2 text-red-700 font-semibold">SYNTHETIC</span>}
              </p>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">{d.documentType.name}</td>
            <td className="px-4 py-3 whitespace-nowrap">{d.country.name}</td>
            <td className="px-4 py-3">
              <Pill tone={STATUS_TONE[d.status]}>{STATUS_LABELS[d.status]}</Pill>
            </td>
            <td className="px-4 py-3">
              <Pill tone={STATUS_TONE[d.verificationStatus]}>{VERIFICATION_LABELS[d.verificationStatus]}</Pill>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-xs">
              {ACCESS_LABELS[d.accessType]}
              {d.storagePath ? " · file" : ""}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-xs text-brand-muted">{fmtDate(d.updatedAt)}</td>
          </tr>
        ))}
      </Table>
      <Pagination page={page} pageCount={Math.max(1, Math.ceil(total / PAGE))} hrefFor={(p) => qs({ page: String(p) })} />
    </div>
  );
}
