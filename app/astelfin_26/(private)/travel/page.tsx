import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import Link from "next/link";

export const metadata = { title: "Travel & Logistics | Astelfin IMS", robots: { index: false, follow: false } };

const STATUS_COLOURS: Record<string, string> = {
  DRAFT:      "bg-gray-100 text-gray-600",
  PENDING_FM: "bg-yellow-100 text-yellow-800",
  APPROVED:   "bg-green-100 text-green-800",
  REJECTED:   "bg-red-100 text-red-800",
  COMPLETED:  "bg-blue-100 text-blue-800",
  CANCELLED:  "bg-gray-100 text-gray-500",
};

export default async function TravelPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  const isFMorCEO = role === "CEO" || role === "FINANCE_MANAGER";

  // FM/CEO see all; others see their own
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { employeeId: true } });

  const where = isFMorCEO ? {} : user?.employeeId ? { employeeId: user.employeeId } : { id: "none" };

  const requests = await prisma.travelRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      employee: { select: { name: true } },
      project:  { select: { name: true } },
    },
  });

  const pending  = requests.filter(r => r.status === "PENDING_FM");
  const active   = requests.filter(r => ["DRAFT","APPROVED"].includes(r.status));
  const history  = requests.filter(r => ["COMPLETED","REJECTED","CANCELLED"].includes(r.status));

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Travel & Logistics</h1>
          {isFMorCEO && pending.length > 0 && (
            <p className="text-sm text-orange-600 mt-1">{pending.length} pending approval</p>
          )}
        </div>
        <Link href="/astelfin_26/travel/new" className="bg-brand-navy text-white text-sm px-4 py-2 rounded-lg hover:opacity-90">
          + New Request
        </Link>
      </div>

      {requests.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          No travel requests yet.
        </div>
      )}

      {requests.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {isFMorCEO && <th className="px-4 py-3 text-left font-medium text-gray-600">Employee</th>}
                <th className="px-4 py-3 text-left font-medium text-gray-600">Purpose / Destination</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Dates</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Project</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Total Cost</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-gray-50">
                  {isFMorCEO && <td className="px-4 py-3 font-medium">{req.employee.name}</td>}
                  <td className="px-4 py-3">
                    <p className="font-medium">{req.purpose}</p>
                    <p className="text-gray-500 text-xs">{req.destination}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(req.departureDate)} – {formatDate(req.returnDate)}</td>
                  <td className="px-4 py-3 text-gray-500">{req.project?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(req.totalCost, req.advanceCurrency)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOURS[req.status] ?? ""}`}>
                      {req.status.replace("_"," ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/astelfin_26/travel/${req.id}`} className="text-xs text-brand-navy hover:underline">View</Link>
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
