import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { formatCurrency, formatDate } from "@/lib/finance-utils";

export const metadata = { title: "Travel Request | Astelfin IMS", robots: { index: false, follow: false } };

async function reviewTravel(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") return;

  const id     = formData.get("id") as string;
  const action = formData.get("action") as string;
  const note   = (formData.get("reviewNote") as string) || null;

  await prisma.travelRequest.update({
    where: { id },
    data: {
      status:      action === "APPROVE" ? "APPROVED" : "REJECTED",
      reviewedById: session.user.id,
      reviewNote:  note,
      reviewedAt:  new Date(),
    },
  });
  revalidatePath(`/astelfin_26/travel/${id}`);
}

async function markCompleted(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const id = formData.get("id") as string;
  const amountAccountedFor = parseFloat(formData.get("amountAccountedFor") as string) || 0;

  const req = await prisma.travelRequest.findUnique({ where: { id } });
  if (!req) return;
  const refundDue = req.advancePaid - amountAccountedFor;

  await prisma.travelRequest.update({
    where: { id },
    data: { status: "COMPLETED", amountAccountedFor, refundDue },
  });
  revalidatePath(`/astelfin_26/travel/${id}`);
}

export default async function TravelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const req = await prisma.travelRequest.findUnique({
    where: { id },
    include: {
      employee:   { select: { name: true } },
      project:    { select: { name: true } },
      reviewedBy: { select: { name: true } },
    },
  });
  if (!req) notFound();

  const role = session.user.role;
  const isFMorCEO = role === "CEO" || role === "FINANCE_MANAGER";
  const isOwner = session.user.id === req.employeeId; // simplified check

  const canReview   = isFMorCEO && req.status === "PENDING_FM";
  const canComplete = req.status === "APPROVED";

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <a href="/astelfin_26/travel" className="text-sm text-gray-500 hover:text-gray-700">← Travel</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{req.purpose}</h1>
        <p className="text-sm text-gray-500">{req.destination} · {req.employee.name}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-2 gap-4 text-sm">
        <div><p className="text-xs text-gray-500">Departure</p><p className="font-medium">{formatDate(req.departureDate)}</p></div>
        <div><p className="text-xs text-gray-500">Return</p><p className="font-medium">{formatDate(req.returnDate)}</p></div>
        <div><p className="text-xs text-gray-500">Project</p><p className="font-medium">{req.project?.name ?? "—"}</p></div>
        <div><p className="text-xs text-gray-500">Status</p><p className="font-semibold">{req.status.replace("_"," ")}</p></div>
        <div><p className="text-xs text-gray-500">Per Diem Total</p><p className="font-medium">{formatCurrency(req.perDiemTotal, req.perDiemCurrency)} ({req.perDiemDays} days @ {formatCurrency(req.perDiemRate, req.perDiemCurrency)})</p></div>
        <div><p className="text-xs text-gray-500">Transport</p><p className="font-medium">{formatCurrency(req.transportCost, req.advanceCurrency)}</p></div>
        <div><p className="text-xs text-gray-500">Accommodation</p><p className="font-medium">{formatCurrency(req.accommodationCost, req.advanceCurrency)}</p></div>
        <div><p className="text-xs text-gray-500">Other</p><p className="font-medium">{formatCurrency(req.otherCosts, req.advanceCurrency)}</p></div>
        <div><p className="text-xs text-gray-500">Total Cost</p><p className="font-bold text-gray-900">{formatCurrency(req.totalCost, req.advanceCurrency)}</p></div>
        <div><p className="text-xs text-gray-500">Advance Requested</p><p className="font-medium">{formatCurrency(req.advanceRequested, req.advanceCurrency)}</p></div>
        {req.advancePaid > 0 && <div><p className="text-xs text-gray-500">Advance Paid</p><p className="font-medium">{formatCurrency(req.advancePaid, req.advanceCurrency)}</p></div>}
        {req.status === "COMPLETED" && <div><p className="text-xs text-gray-500">Amount Accounted For</p><p className="font-medium">{formatCurrency(req.amountAccountedFor, req.advanceCurrency)}</p></div>}
        {req.status === "COMPLETED" && <div><p className="text-xs text-gray-500">Refund Due</p><p className={`font-semibold ${req.refundDue > 0 ? "text-orange-600" : "text-green-600"}`}>{formatCurrency(req.refundDue, req.advanceCurrency)}</p></div>}
        {req.itinerary && <div className="col-span-2"><p className="text-xs text-gray-500">Itinerary</p><p className="font-medium whitespace-pre-wrap">{req.itinerary}</p></div>}
        {req.reviewedBy && <div className="col-span-2"><p className="text-xs text-gray-500">Reviewed by {req.reviewedBy.name}</p>{req.reviewNote && <p className="text-gray-600 italic text-xs">{req.reviewNote}</p>}</div>}
      </div>

      {canReview && (
        <div className="flex gap-3">
          <form action={reviewTravel} className="flex gap-2 items-center">
            <input type="hidden" name="id" value={req.id} />
            <input type="hidden" name="action" value="APPROVE" />
            <button className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700">Approve</button>
          </form>
          <form action={reviewTravel} className="flex gap-2 items-center">
            <input type="hidden" name="id" value={req.id} />
            <input type="hidden" name="action" value="REJECT" />
            <input type="text" name="reviewNote" placeholder="Reason" className="border rounded-lg px-3 py-2 text-sm w-48" />
            <button className="bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700">Reject</button>
          </form>
        </div>
      )}

      {canComplete && (
        <form action={markCompleted} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="font-semibold text-gray-800">Liquidate Travel</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount Accounted For</label>
            <input type="number" name="amountAccountedFor" step="0.01" defaultValue={req.totalCost} required className="border rounded-lg px-3 py-2 text-sm w-48" />
          </div>
          <input type="hidden" name="id" value={req.id} />
          <button type="submit" className="bg-brand-navy text-white text-sm px-4 py-2 rounded-lg hover:opacity-90">Mark Completed</button>
        </form>
      )}
    </div>
  );
}
