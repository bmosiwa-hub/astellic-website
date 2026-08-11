import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getEffectivePermissions } from "@/lib/permissions";
import { globalSearch, type SearchAccess } from "@/lib/global-search";
import SearchBox from "@/components/finance/SearchBox";

export const metadata = {
  title: "Search | Astelfin",
  robots: { index: false, follow: false },
};

// Small emoji marker per result group — keeps the page dependency-free.
const TYPE_ICON: Record<string, string> = {
  employee: "👤", consultant: "🧑‍💼", contact: "📇",
  income: "💰", expense: "🧾", asset: "🏢", grant: "🎁",
  submission: "📄", payable: "📕", receivable: "📗", procurement: "🛒",
  project: "📁", payroll: "💵", remittance: "🏛️",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const role  = session.user.role;
  const isCEO = role === "CEO";
  const isPM  = role === "PROJECT_MANAGER";

  const dbUser = await prisma.user.findUnique({
    where:  { id: session.user.id! },
    select: { permissions: true },
  });
  const perms = getEffectivePermissions(role, dbUser?.permissions ?? null);

  // Gate each entity group to the same tabs/functions that reveal it in the nav.
  const access: SearchAccess = {
    finance:    isCEO || perms.tabs.finance,
    hr:         isCEO || isPM || perms.tabs.finance,
    operations: isCEO || perms.tabs.operations,
    projects:   isCEO || isPM || perms.tabs.projects,
    payrollTax: isCEO || perms.tabs.finance || perms.functions.canViewPayroll || perms.functions.canManageTax,
  };

  const query = q.trim();
  const { groups, total } = query ? await globalSearch(query, access) : { groups: [], total: 0 };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Search</h1>
        <p className="text-gray-500 text-sm mt-1">
          Find employees, consultants, contacts, income, expenses, assets, invoices &amp; requests,
          payables, receivables, procurement, projects, payroll and tax records.
        </p>
      </div>

      <SearchBox initialQuery={query} autoFocus variant="page" />

      {query.length > 0 && query.length < 2 && (
        <p className="text-sm text-gray-400">Type at least two characters to search.</p>
      )}

      {query.length >= 2 && (
        <p className="text-sm text-gray-500">
          {total === 0
            ? <>No results for <span className="font-semibold text-brand-navy">“{query}”</span>.</>
            : <><span className="font-semibold text-brand-navy">{total}</span> result{total === 1 ? "" : "s"} for <span className="font-semibold text-brand-navy">“{query}”</span></>}
        </p>
      )}

      <div className="space-y-6">
        {groups.map((g) => (
          <section key={g.key}>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              {g.title} <span className="text-gray-300">({g.hits.length}{g.hits.length === 6 ? "+" : ""})</span>
            </h2>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {g.hits.map((h) => (
                <Link
                  key={h.id}
                  href={h.href}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg shrink-0" aria-hidden>{TYPE_ICON[h.type] ?? "•"}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-brand-navy truncate">{h.label}</span>
                    {h.sub && <span className="block text-xs text-gray-500 truncate">{h.sub}</span>}
                  </span>
                  <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
