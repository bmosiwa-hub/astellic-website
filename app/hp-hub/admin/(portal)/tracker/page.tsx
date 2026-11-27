import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { PageHeader, Pill, STATUS_TONE, Stat, Table, fmtDate, Flash, btnPrimary, btnSecondary, inputCls } from "@/components/hp-hub/admin/ui";
import { prisma } from "@/lib/prisma";
import { requireHpPage } from "@/lib/hp-hub/auth";
import { ACQUISITION_LABELS } from "@/lib/hp-hub/constants";
import { memberOptions } from "@/lib/hp-hub/admin/members";
import { taxonomyOptions } from "@/lib/hp-hub/admin/options";

export const metadata = { title: "Missing documents" };

type SP = { status?: string; country?: string; publisher?: string; type?: string; owner?: string; due?: string; q?: string; ok?: string; err?: string };
const STATUSES = Object.keys(ACQUISITION_LABELS) as (keyof typeof ACQUISITION_LABELS)[];

export default async function TrackerPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireHpPage("acquisition.edit");
  const sp = await searchParams;
  const today = new Date();
  const in14 = new Date(Date.now() + 14 * 86400000);

  const where: Prisma.HpAcquisitionItemWhereInput = {
    ...(sp.status && STATUSES.includes(sp.status as never) ? { status: sp.status as (typeof STATUSES)[number] } : {}),
    ...(sp.country ? { countryId: sp.country } : {}),
    ...(sp.type ? { documentTypeId: sp.type } : {}),
    ...(sp.owner === "none" ? { ownerId: null } : sp.owner ? { ownerId: sp.owner } : {}),
    ...(sp.publisher
      ? { OR: [{ publisherId: sp.publisher }, { publisherName: { contains: sp.publisher, mode: "insensitive" } }] }
      : {}),
    ...(sp.due === "overdue" ? { nextActionDue: { lt: today }, status: { not: "ACQUIRED" } } : {}),
    ...(sp.due === "soon" ? { nextActionDue: { gte: today, lte: in14 } } : {}),
    ...(sp.q ? { title: { contains: sp.q, mode: "insensitive" } } : {}),
  };

  const [items, counts, options, members] = await Promise.all([
    prisma.hpAcquisitionItem.findMany({
      where,
      orderBy: [{ nextActionDue: { sort: "asc", nulls: "last" } }, { updatedAt: "desc" }],
      take: 300,
      include: {
        country: { select: { name: true } },
        publisher: { select: { name: true } },
        documentType: { select: { name: true } },
        owner: { select: { user: { select: { name: true } } } },
        document: { select: { id: true } },
      },
    }),
    prisma.hpAcquisitionItem.groupBy({ by: ["status"], _count: { _all: true } }),
    taxonomyOptions(),
    memberOptions(),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count._all ?? 0;
  const total = counts.reduce((n, c) => n + c._count._all, 0);

  return (
    <div>
      <PageHeader
        title="Missing documents tracker"
        description="Documents known to exist but not yet in the repository. Update a record as it progresses rather than adding a new one."
        actions={
          <>
            <Link href="/hp-hub/admin/outreach" className={btnSecondary}>
              Acquisition requests
            </Link>
            <Link href="/hp-hub/admin/tracker/new" className={btnPrimary}>
              Add record
            </Link>
          </>
        }
      />
      <Flash ok={sp.ok} err={sp.err} />

      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
        <Stat label="Identified" value={total} href="/hp-hub/admin/tracker" />
        {STATUSES.map((s) => (
          <Stat key={s} label={ACQUISITION_LABELS[s]} value={count(s)} href={`/hp-hub/admin/tracker?status=${s}`} />
        ))}
      </div>

      <form action="/hp-hub/admin/tracker" className="grid sm:grid-cols-3 xl:grid-cols-7 gap-3 items-end mb-4">
        <div className="sm:col-span-3 xl:col-span-2">
          <label htmlFor="q" className="block text-xs font-semibold text-brand-muted mb-1">Title</label>
          <input id="q" name="q" defaultValue={sp.q} className={inputCls} />
        </div>
        <div>
          <label htmlFor="status" className="block text-xs font-semibold text-brand-muted mb-1">Status</label>
          <select id="status" name="status" defaultValue={sp.status ?? ""} className={inputCls}>
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{ACQUISITION_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="country" className="block text-xs font-semibold text-brand-muted mb-1">Country</label>
          <select id="country" name="country" defaultValue={sp.country ?? ""} className={inputCls}>
            <option value="">All</option>
            {options.countries.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="type" className="block text-xs font-semibold text-brand-muted mb-1">Type</label>
          <select id="type" name="type" defaultValue={sp.type ?? ""} className={inputCls}>
            <option value="">All</option>
            {options.types.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="owner" className="block text-xs font-semibold text-brand-muted mb-1">Owner</label>
          <select id="owner" name="owner" defaultValue={sp.owner ?? ""} className={inputCls}>
            <option value="">Anyone</option>
            <option value="none">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="due" className="block text-xs font-semibold text-brand-muted mb-1">Follow-up</label>
          <select id="due" name="due" defaultValue={sp.due ?? ""} className={inputCls}>
            <option value="">Any date</option>
            <option value="overdue">Overdue</option>
            <option value="soon">Due in 14 days</option>
          </select>
        </div>
        <div className="sm:col-span-3 xl:col-span-7 flex flex-wrap gap-3 items-end">
          <div className="min-w-56">
            <label htmlFor="publisher" className="block text-xs font-semibold text-brand-muted mb-1">Publisher</label>
            <input id="publisher" name="publisher" defaultValue={sp.publisher} placeholder="Name contains…" className={inputCls} />
          </div>
          <button className={btnSecondary}>Filter</button>
          <Link href="/hp-hub/admin/tracker" className="text-sm text-brand-muted underline h-10 inline-flex items-center">Reset</Link>
        </div>
      </form>

      <Table
        head={["Document", "Country", "Publisher", "Status", "Owner", "Next follow-up", "Last verified"]}
        empty={!items.length && <p className="px-4 py-10 text-center text-sm text-brand-muted">No records match.</p>}
      >
        {items.map((i) => {
          const overdue = i.nextActionDue && i.nextActionDue < today && i.status !== "ACQUIRED";
          return (
            <tr key={i.id} className="hover:bg-gray-50 align-top">
              <td className="px-4 py-3 min-w-64">
                <Link href={`/hp-hub/admin/tracker/${i.id}`} className="font-semibold text-brand-navy hover:text-brand-teal">
                  {i.title}
                </Link>
                <p className="text-xs text-brand-muted">
                  {[i.documentType?.name, i.year].filter(Boolean).join(" · ")}
                  {i.document && " · catalogued"}
                </p>
              </td>
              <td className="px-4 py-3">{i.country.name}</td>
              <td className="px-4 py-3">{i.publisher?.name ?? i.publisherName ?? "—"}</td>
              <td className="px-4 py-3"><Pill tone={STATUS_TONE[i.status]}>{ACQUISITION_LABELS[i.status]}</Pill></td>
              <td className="px-4 py-3 whitespace-nowrap">{i.owner?.user.name ?? "—"}</td>
              <td className={`px-4 py-3 text-xs ${overdue ? "text-red-700 font-semibold" : ""}`}>
                {i.nextActionDue ? fmtDate(i.nextActionDue) : "—"}
                {i.nextAction && <span className="block text-brand-muted font-normal">{i.nextAction}</span>}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xs text-brand-muted">{fmtDate(i.lastVerifiedAt)}</td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}
