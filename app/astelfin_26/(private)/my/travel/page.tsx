import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import Link from "next/link";

export const metadata = { title: "My Travel | Astelfin IMS", robots: { index: false, follow: false } };

const STATUS_COLOURS: Record<string, string> = {
  DRAFT:      "bg-gray-100 text-gray-600",
  PENDING_FM: "bg-yellow-100 text-yellow-800",
  APPROVED:   "bg-green-100 text-green-800",
  REJECTED:   "bg-red-100 text-red-800",
  COMPLETED:  "bg-blue-100 text-blue-800",
  CANCELLED:  "bg-gray-100 text-gray-500",
};

export default async function MyTravelPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { employeeId: true } });
  const employeeId = user?.employeeId;

  const requests = employeeId
    ? await prisma.travelRequest.findMany({
        where:   { employeeId },
        orderBy: { createdAt: "desc" },
        include: { project: { select: { name: true } } },
      })
    : [];

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Travel</h1>
        <Link href="/astelfin_26/travel/new" className="bg-brand-navy text-white text-sm px-4 py-2 rounded-lg hover:opacity-90">
          + New Request
        </Link>
      </div>

      {!employeeId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          Your account is not linked to an employee record. Contact HR.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Purpose</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Destination</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Dates</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Total</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No travel requests yet</td></tr>
            )}
            {requests.map(req => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{req.purpose}</td>
                <td className="px-4 py-3 text-gray-600">{req.destination}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(req.departureDate)} – {formatDate(req.returnDate)}</td>
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
    </div>
  );
}
