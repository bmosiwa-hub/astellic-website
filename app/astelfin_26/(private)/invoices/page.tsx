import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Invoices & Requests | Astellic Finance",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, string> = {
  PENDING_FM:            "bg-yellow-100 text-yellow-800",
  FM_CHANGES_REQUESTED:  "bg-orange-100 text-orange-800",
  PENDING_CEO:           "bg-blue-100 text-blue-800",
  CEO_CHANGES_REQUESTED: "bg-orange-100 text-orange-800",
  APPROVED:              "bg-green-100 text-green-800",
  PAID:                  "bg-emerald-100 text-emerald-800",
  REJECTED:              "bg-red-100 text-red-800",
};

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "pending" } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/my/submissions");

  // What's "pending" for this role?
  const pendingStatuses =
    role === "FINANCE_MANAGER"
      ? ["PENDING_FM"]
      : ["PENDING_CEO", "APPROVED"]; // CEO reviews + marks ready for FM to pay

  const [pending, all] = await Promise.all([
    prisma.submission.findMany({
      where: { status: { in: pendingStatuses as ("PENDING_FM" | "PENDING_CEO" | "APPROVED")[] } },
      orderBy: { createdAt: "asc" },
      include: {
        submitter: { select: { name: true } },
        project: { select: { name: true } },
      },
    }),
    prisma.submission.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        submitter: { select: { name: true } },
        project: { select: { name: true } },
      },
    }),
  ]);

  const list = tab === "pending" ? pending : all;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Invoices & Requests</h1>
        <p className="text-gray-500 text-sm mt-1">
          {role === "FINANCE_MANAGER"
            ? "Review and action submissions from staff and consultants."
            : "Review FM-approved submissions and manage payment approvals."}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {["pending", "all"].map((t) => (
          <Link
            key={t}
            href={`/astelfin_26/invoices?tab=${t}`}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              tab === t
                ? "border-brand-gold text-brand-navy"
                : "border-transparent text-gray-500 hover:text-brand-navy"
            }`}
          >
            {t === "pending" ? (
              <>
                Needs Action
                {pending.length > 0 && (
                  <span className="ml-2 bg-orange-100 text-orange-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {pending.length}
                  </span>
                )}
              </>
            ) : "All Submissions"}
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-12 text-center text-gray-400 text-sm">
          {tab === "pending" ? "Nothing needs your attention right now." : "No submissions yet."}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">From</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Type</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Description</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Amount</th>
                <th className="text-center px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {list.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(s.createdAt)}</td>
                  <td className="px-5 py-3 font-medium text-brand-navy">{s.submitter.name}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                      s.type === "INVOICE" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                    }`}>
                      {s.type === "INVOICE" ? "Invoice" : "Request"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-700 max-w-xs truncate">
                    {s.milestone || s.purpose || s.project?.name || "—"}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-brand-navy">
                    {formatCurrency(s.totalAmount, s.currency)}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[s.status] ?? "bg-gray-100"}`}>
                      {s.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/astelfin_26/invoices/${s.id}`}
                      className="text-xs text-brand-gold font-semibold hover:underline whitespace-nowrap">
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
