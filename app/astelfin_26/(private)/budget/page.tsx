import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const metadata = {
  title: "Budget Lines | Astelfin IMS",
  robots: { index: false, follow: false },
};

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "PERSONNEL", "OPERATIONS", "ADMIN", "TRAVEL",
  "EQUIPMENT", "CONSULTANCY", "OTHER",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  PERSONNEL:   "Personnel",
  OPERATIONS:  "Operations",
  ADMIN:       "Administration",
  TRAVEL:      "Travel & Transport",
  EQUIPMENT:   "Equipment & Assets",
  CONSULTANCY: "Consultancy",
  OTHER:       "Other",
};

const CATEGORY_COLORS: Record<string, string> = {
  PERSONNEL:   "bg-blue-100 text-blue-800",
  OPERATIONS:  "bg-green-100 text-green-800",
  ADMIN:       "bg-gray-100 text-gray-700",
  TRAVEL:      "bg-sky-100 text-sky-800",
  EQUIPMENT:   "bg-purple-100 text-purple-800",
  CONSULTANCY: "bg-teal-100 text-teal-800",
  OTHER:       "bg-orange-100 text-orange-800",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtMoney(n: number, currency = "MWK") {
  return new Intl.NumberFormat("en-MW", {
    style: "currency", currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
}

// ── Server Actions ────────────────────────────────────────────────────────────

async function upsertBudgetLine(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || !["CEO","FINANCE_MANAGER"].includes(session.user.role!))
    redirect("/astelfin_26/dashboard");

  const id          = (formData.get("id") as string) || null;
  const name        = (formData.get("name") as string).trim();
  const description = (formData.get("description") as string) || null;
  const category    = (formData.get("category") as string) || "OTHER";
  const projectId   = (formData.get("projectId") as string) || null;
  const fiscalYear  = parseInt(formData.get("fiscalYear") as string) || new Date().getFullYear();
  const ceilingRaw  = formData.get("ceiling") as string;
  const ceiling     = ceilingRaw ? parseFloat(ceilingRaw) : null;
  const currency    = (formData.get("currency") as string) || "MWK";

  if (id) {
    await prisma.budgetLine.update({
      where: { id },
      data: { name, description, category, projectId, fiscalYear, ceiling, currency },
    });
    await auditLog({
      userId: session.user.id!, action: "UPDATE", entity: "BudgetLine", entityId: id,
      detail: `Updated "${name}" (FY${fiscalYear})`,
    });
  } else {
    const bl = await prisma.budgetLine.create({
      data: { name, description, category, projectId, fiscalYear, ceiling, currency },
    });
    await auditLog({
      userId: session.user.id!, action: "CREATE", entity: "BudgetLine", entityId: bl.id,
      detail: `Created "${name}" (FY${fiscalYear})`,
    });
  }

  revalidatePath("/astelfin_26/budget");
  redirect("/astelfin_26/budget");
}

async function toggleBudgetLine(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || !["CEO","FINANCE_MANAGER"].includes(session.user.role!))
    redirect("/astelfin_26/dashboard");

  const id     = formData.get("id") as string;
  const active = formData.get("active") === "true";
  await prisma.budgetLine.update({ where: { id }, data: { active } });
  await auditLog({
    userId: session.user.id!, action: "UPDATE", entity: "BudgetLine", entityId: id,
    detail: active ? "Reactivated budget line" : "Deactivated budget line",
  });
  revalidatePath("/astelfin_26/budget");
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BudgetLinesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; fy?: string }>;
}) {
  const session = await auth();
  const role    = session?.user?.role ?? "";
  const canEdit = role === "CEO" || role === "FINANCE_MANAGER";

  const { edit: editId, fy: fyStr } = await searchParams;
  const currentYear = new Date().getFullYear();
  const fy          = parseInt(fyStr ?? String(currentYear)) || currentYear;

  // Fetch budget lines for the selected year
  const [budgetLines, projects] = await Promise.all([
    prisma.budgetLine.findMany({
      where: { fiscalYear: fy },
      include: { project: { select: { id: true, name: true } } },
      orderBy: [{ active: "desc" }, { category: "asc" }, { name: "asc" }],
    }),
    canEdit
      ? prisma.project.findMany({
          where: { status: "ACTIVE" },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  // ── Compute utilisation per budget line ───────────────────────────────────
  // Source 1: approved liquidations (fundsAccountedFor)
  const liquidationGroups = await prisma.liquidation.groupBy({
    by: ["budgetLine"],
    where: { status: "FM_APPROVED", deletedAt: null },
    _sum: { fundsAccountedFor: true },
  });

  // Source 2: paid account payables
  const payableGroups = await prisma.accountPayable.groupBy({
    by: ["budgetLine"],
    where: { status: "PAID", budgetLine: { not: null } },
    _sum: { amount: true },
  });

  const spendMap: Record<string, number> = {};
  for (const g of liquidationGroups) {
    spendMap[g.budgetLine] = (spendMap[g.budgetLine] ?? 0) + (g._sum.fundsAccountedFor ?? 0);
  }
  for (const g of payableGroups) {
    if (g.budgetLine) {
      spendMap[g.budgetLine] = (spendMap[g.budgetLine] ?? 0) + (g._sum.amount ?? 0);
    }
  }

  const editingLine = editId ? budgetLines.find((b) => b.id === editId) : null;

  const fyOptions = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Budget Lines</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Define spending envelopes and track utilisation against approved ceilings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Fiscal year switcher */}
          <div className="flex items-center gap-1 text-sm border border-gray-200 rounded-lg overflow-hidden">
            {fyOptions.map((y) => (
              <Link key={y} href={`/astelfin_26/budget?fy=${y}`}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  y === fy
                    ? "bg-brand-navy text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}>
                FY{y}
              </Link>
            ))}
          </div>
          <Link href="/astelfin_26/compliance"
            className="text-sm text-brand-gold font-semibold hover:underline">
            Compliance →
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      {budgetLines.length > 0 && (() => {
        const withCeiling = budgetLines.filter((b) => b.ceiling != null);
        const totalCeiling = withCeiling.reduce((s, b) => s + (b.ceiling ?? 0), 0);
        const totalSpend   = budgetLines.reduce((s, b) => s + (spendMap[b.name] ?? 0), 0);
        const atRisk       = withCeiling.filter((b) => {
          const spent = spendMap[b.name] ?? 0;
          return b.ceiling != null && spent / b.ceiling >= 0.8;
        }).length;

        return (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Ceiling", value: fmtMoney(totalCeiling), sub: `${withCeiling.length} capped lines` },
              { label: "Total Spent",   value: fmtMoney(totalSpend),   sub: "approved liquidations + paid payables" },
              { label: "At Risk",       value: String(atRisk),         sub: "lines ≥ 80% utilised", warn: atRisk > 0 },
            ].map(({ label, value, sub, warn }) => (
              <div key={label} className={`rounded-xl border px-5 py-4 ${warn ? "border-amber-200 bg-amber-50" : "border-gray-100 bg-white shadow-sm"}`}>
                <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${warn ? "text-amber-600" : "text-gray-400"}`}>{label}</p>
                <p className={`text-2xl font-bold ${warn ? "text-amber-700" : "text-brand-navy"}`}>{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Edit / create form */}
      {canEdit && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-brand-navy mb-4">
            {editingLine ? `Edit: ${editingLine.name}` : "Add Budget Line"}
          </h2>
          <form action={upsertBudgetLine} className="grid grid-cols-2 gap-4">
            {editingLine && <input type="hidden" name="id" value={editingLine.id} />}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Name <span className="text-red-500">*</span>
                <span className="text-xs text-gray-400 font-normal ml-1">
                  (must match the Budget Line string on transactions)
                </span>
              </label>
              <input name="name" required defaultValue={editingLine?.name}
                placeholder="e.g. ADMIN, Field Travel, Project Salaries"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select name="category" defaultValue={editingLine?.category ?? "OTHER"}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Annual Ceiling (leave blank = uncapped)
              </label>
              <input name="ceiling" type="number" min="0" step="0.01"
                defaultValue={editingLine?.ceiling ?? ""}
                placeholder="e.g. 5000000"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Fiscal Year</label>
              <select name="fiscalYear" defaultValue={editingLine?.fiscalYear ?? fy}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
                {fyOptions.map((y) => <option key={y} value={y}>FY {y}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Link to Project (optional)
              </label>
              <select name="projectId" defaultValue={editingLine?.projectId ?? ""}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
                <option value="">— Organisation-wide —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
              <select name="currency" defaultValue={editingLine?.currency ?? "MWK"}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
                {["MWK","USD","EUR","GBP","ZAR"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (optional)</label>
              <input name="description" defaultValue={editingLine?.description ?? ""}
                placeholder="Brief description of this budget line's purpose"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
            </div>

            <div className="col-span-2 flex gap-3">
              <button type="submit"
                className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                {editingLine ? "Save Changes" : "Create Budget Line"}
              </button>
              {editingLine && (
                <Link href="/astelfin_26/budget"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-semibold">
                  Cancel
                </Link>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Budget lines table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-brand-navy">
            FY {fy} — {budgetLines.length} budget line{budgetLines.length !== 1 ? "s" : ""}
          </h2>
        </div>

        {budgetLines.length === 0 ? (
          <p className="py-12 text-center text-gray-400 text-sm">
            No budget lines for FY {fy}.{" "}
            {canEdit && "Use the form above to create one."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Category</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Project</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Ceiling</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Spent</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 w-40">Utilisation</th>
                {canEdit && <th className="px-5 py-3 text-right font-semibold text-gray-600">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {budgetLines.map((bl) => {
                const spent     = spendMap[bl.name] ?? 0;
                const pct       = bl.ceiling ? Math.min(100, (spent / bl.ceiling) * 100) : null;
                const isOver    = bl.ceiling != null && spent > bl.ceiling;
                const isNear    = pct != null && pct >= 80 && !isOver;
                const barColor  = isOver ? "bg-red-500" : isNear ? "bg-amber-400" : "bg-brand-gold";

                return (
                  <tr key={bl.id} className={`hover:bg-gray-50 ${!bl.active ? "opacity-50" : ""}`}>
                    <td className="px-5 py-3">
                      <div className="font-medium text-brand-navy">{bl.name}</div>
                      {bl.description && (
                        <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{bl.description}</div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[bl.category] ?? "bg-gray-100 text-gray-600"}`}>
                        {CATEGORY_LABELS[bl.category] ?? bl.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500 hidden md:table-cell">
                      {bl.project?.name ?? <span className="text-gray-300">Org-wide</span>}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-gray-600">
                      {bl.ceiling != null ? fmtMoney(bl.ceiling, bl.currency) : <span className="text-gray-300">Uncapped</span>}
                    </td>
                    <td className={`px-5 py-3 text-right font-mono text-xs font-semibold ${isOver ? "text-red-600" : "text-gray-700"}`}>
                      {fmtMoney(spent, bl.currency)}
                    </td>
                    <td className="px-5 py-3">
                      {pct != null ? (
                        <div className="space-y-1">
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className={`${barColor} h-2 rounded-full transition-all`}
                              style={{ width: `${Math.min(100, pct)}%` }} />
                          </div>
                          <span className={`text-xs font-semibold ${isOver ? "text-red-600" : isNear ? "text-amber-600" : "text-gray-500"}`}>
                            {pct.toFixed(1)}%{isOver ? " — OVER CEILING" : isNear ? " — Near limit" : ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">No ceiling</span>
                      )}
                    </td>
                    {canEdit && (
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex items-center gap-3">
                          <Link href={`/astelfin_26/budget?edit=${bl.id}&fy=${fy}`}
                            className="text-xs text-brand-gold font-semibold hover:underline">
                            Edit
                          </Link>
                          <form action={toggleBudgetLine}>
                            <input type="hidden" name="id" value={bl.id} />
                            <input type="hidden" name="active" value={bl.active ? "false" : "true"} />
                            <button type="submit"
                              className={`text-xs font-semibold hover:underline ${bl.active ? "text-gray-400" : "text-green-600"}`}>
                              {bl.active ? "Deactivate" : "Reactivate"}
                            </button>
                          </form>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
