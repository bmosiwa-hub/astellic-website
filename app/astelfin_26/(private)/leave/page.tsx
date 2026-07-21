import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { formatDate } from "@/lib/finance-utils";
import Link from "next/link";

export const metadata = { title: "Leave Management | Astelfin IMS", robots: { index: false, follow: false } };

const LEAVE_TYPES = ["ANNUAL","SICK","MATERNITY","PATERNITY","STUDY","COMPASSIONATE","UNPAID","OTHER"] as const;
const STATUS_COLOURS: Record<string, string> = {
  PENDING:   "bg-yellow-100 text-yellow-800",
  APPROVED:  "bg-green-100 text-green-800",
  REJECTED:  "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-600",
};

async function reviewLeave(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;

  const id = formData.get("id") as string;
  const action = formData.get("action") as string;
  const reviewNote = (formData.get("reviewNote") as string) || null;

  if (action === "APPROVE") {
    const req = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!req) return;
    await prisma.leaveRequest.update({
      where: { id },
      data: { status: "APPROVED", reviewedById: session.user.id, reviewNote, reviewedAt: new Date() },
    });
    // Increment used days on balance
    const year = new Date(req.startDate).getFullYear();
    await prisma.leaveBalance.upsert({
      where: { employeeId_year_leaveType: { employeeId: req.employeeId, year, leaveType: req.leaveType } },
      create: { employeeId: req.employeeId, year, leaveType: req.leaveType, entitled: 0, used: req.days },
      update: { used: { increment: req.days } },
    });
  } else if (action === "REJECT") {
    await prisma.leaveRequest.update({
      where: { id },
      data: { status: "REJECTED", reviewedById: session.user.id, reviewNote, reviewedAt: new Date() },
    });
  }
  revalidatePath("/astelfin_26/leave");
}

async function upsertPolicy(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const leaveType = formData.get("leaveType") as string;
  const daysPerYear = parseFloat(formData.get("daysPerYear") as string) || 0;
  const carryOver = parseFloat(formData.get("carryOver") as string) || 0;

  await prisma.leavePolicy.upsert({
    where: { leaveType: leaveType as "ANNUAL" | "SICK" | "MATERNITY" | "PATERNITY" | "STUDY" | "COMPASSIONATE" | "UNPAID" | "OTHER" },
    create: { leaveType: leaveType as "ANNUAL", daysPerYear, carryOver },
    update: { daysPerYear, carryOver },
  });
  revalidatePath("/astelfin_26/leave");
}

export default async function LeavePage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;

  const [requests, policies, employees] = await Promise.all([
    prisma.leaveRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { employee: { select: { name: true } }, reviewedBy: { select: { name: true } } },
    }),
    prisma.leavePolicy.findMany({ orderBy: { leaveType: "asc" } }),
    prisma.employee.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const pending = requests.filter(r => r.status === "PENDING");
  const others  = requests.filter(r => r.status !== "PENDING");

  return (
    <div className="p-6 space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-sm text-gray-500 mt-1">{pending.length} pending request{pending.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/astelfin_26/leave/policy" className="btn-secondary text-sm">Manage Policies</Link>
      </div>

      {/* Leave Policies */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Leave Policies</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Leave Type</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Days / Year</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Max Carry-over</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {LEAVE_TYPES.map(lt => {
                const pol = policies.find(p => p.leaveType === lt);
                return (
                  <tr key={lt} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{lt.replace("_", " ")}</td>
                    <td className="px-4 py-3 text-right">{pol ? pol.daysPerYear : "—"}</td>
                    <td className="px-4 py-3 text-right">{pol ? pol.carryOver : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <form action={upsertPolicy} className="inline-flex items-center gap-2">
                        <input type="hidden" name="leaveType" value={lt} />
                        <input type="number" name="daysPerYear" defaultValue={pol?.daysPerYear ?? ""} placeholder="Days" step="0.5" className="w-20 border rounded px-2 py-1 text-sm" required />
                        <input type="number" name="carryOver" defaultValue={pol?.carryOver ?? 0} placeholder="C/O" step="0.5" className="w-16 border rounded px-2 py-1 text-sm" />
                        <button className="text-xs bg-brand-navy text-white px-3 py-1 rounded hover:opacity-90">Save</button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pending Requests */}
      {pending.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Pending Approval</h2>
          <div className="space-y-3">
            {pending.map(req => (
              <div key={req.id} className="bg-white rounded-xl border border-yellow-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{req.employee.name}</p>
                    <p className="text-sm text-gray-600">{req.leaveType.replace("_"," ")} · {req.days} day{req.days !== 1 ? "s" : ""}</p>
                    <p className="text-sm text-gray-500">{formatDate(req.startDate)} – {formatDate(req.endDate)}</p>
                    {req.reason && <p className="text-sm text-gray-500 mt-1 italic">"{req.reason}"</p>}
                  </div>
                  <div className="shrink-0 space-y-2">
                    <form action={reviewLeave} className="flex gap-2">
                      <input type="hidden" name="id" value={req.id} />
                      <input type="hidden" name="action" value="APPROVE" />
                      <button className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700">Approve</button>
                    </form>
                    <form action={reviewLeave} className="flex gap-2 items-center">
                      <input type="hidden" name="id" value={req.id} />
                      <input type="hidden" name="action" value="REJECT" />
                      <input type="text" name="reviewNote" placeholder="Reason (optional)" className="text-xs border rounded px-2 py-1 w-36" />
                      <button className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700">Reject</button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Requests */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">All Requests</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Employee</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Dates</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Days</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Reviewed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No leave requests yet</td></tr>
              )}
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{req.employee.name}</td>
                  <td className="px-4 py-3">{req.leaveType.replace("_"," ")}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(req.startDate)} – {formatDate(req.endDate)}</td>
                  <td className="px-4 py-3 text-right">{req.days}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOURS[req.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{req.reviewedBy?.name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
