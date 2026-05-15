import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { formatDate } from "@/lib/finance-utils";

export const metadata = { title: "My Leave | Astelfin IMS", robots: { index: false, follow: false } };

const STATUS_COLOURS: Record<string, string> = {
  PENDING:   "bg-yellow-100 text-yellow-800",
  APPROVED:  "bg-green-100 text-green-800",
  REJECTED:  "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-600",
};

async function submitLeaveRequest(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  // Find the employee linked to this user
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { employeeId: true } });
  if (!user?.employeeId) return;

  const leaveType = formData.get("leaveType") as string;
  const startDate = new Date(formData.get("startDate") as string);
  const endDate   = new Date(formData.get("endDate") as string);
  const reason    = (formData.get("reason") as string) || null;

  // Calculate working days (Mon–Fri)
  let days = 0;
  const d = new Date(startDate);
  while (d <= endDate) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) days++;
    d.setDate(d.getDate() + 1);
  }

  await prisma.leaveRequest.create({
    data: {
      employeeId: user.employeeId,
      leaveType: leaveType as "ANNUAL",
      startDate,
      endDate,
      days,
      reason,
    },
  });
  revalidatePath("/astelfin_26/my/leave");
}

async function cancelRequest(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const id = formData.get("id") as string;
  // Only cancel own PENDING requests
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { employeeId: true } });
  if (!user?.employeeId) return;
  await prisma.leaveRequest.updateMany({
    where: { id, employeeId: user.employeeId, status: "PENDING" },
    data:  { status: "CANCELLED" },
  });
  revalidatePath("/astelfin_26/my/leave");
}

export default async function MyLeavePage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { employeeId: true } });
  const employeeId = user?.employeeId;

  const [requests, balances, policies] = await Promise.all([
    employeeId ? prisma.leaveRequest.findMany({
      where:   { employeeId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }) : Promise.resolve([]),
    employeeId ? prisma.leaveBalance.findMany({
      where:   { employeeId, year: new Date().getFullYear() },
    }) : Promise.resolve([]),
    prisma.leavePolicy.findMany(),
  ]);

  const currentYear = new Date().getFullYear();

  return (
    <div className="p-6 space-y-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">My Leave</h1>

      {!employeeId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          Your account is not linked to an employee record. Contact HR to link your profile.
        </div>
      )}

      {/* Leave Balances */}
      {policies.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Leave Balance — {currentYear}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {policies.map(pol => {
              const bal = balances.find(b => b.leaveType === pol.leaveType);
              const used = bal?.used ?? 0;
              const entitled = bal?.entitled ?? pol.daysPerYear;
              const remaining = Math.max(0, entitled - used);
              return (
                <div key={pol.leaveType} className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{pol.leaveType.replace("_"," ")}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{remaining}</p>
                  <p className="text-xs text-gray-400">{used} used / {entitled} entitled</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* New Request Form */}
      {employeeId && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Request Leave</h2>
          <form action={submitLeaveRequest} className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
              <select name="leaveType" required className="w-full border rounded-lg px-3 py-2 text-sm">
                {["ANNUAL","SICK","MATERNITY","PATERNITY","STUDY","COMPASSIONATE","UNPAID","OTHER"].map(t => (
                  <option key={t} value={t}>{t.replace("_"," ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
              <input type="text" name="reason" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" name="startDate" required className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" name="endDate" required className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <button type="submit" className="bg-brand-navy text-white px-6 py-2 rounded-lg text-sm hover:opacity-90">Submit Request</button>
            </div>
          </form>
        </section>
      )}

      {/* My Requests */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">My Requests</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Dates</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Days</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Note</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No leave requests yet</td></tr>
              )}
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{req.leaveType.replace("_"," ")}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(req.startDate)} – {formatDate(req.endDate)}</td>
                  <td className="px-4 py-3 text-right">{req.days}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOURS[req.status] ?? ""}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{req.reviewNote ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    {req.status === "PENDING" && (
                      <form action={cancelRequest}>
                        <input type="hidden" name="id" value={req.id} />
                        <button className="text-xs text-red-600 hover:underline">Cancel</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
