import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { LAUNCH_DATE } from "@/lib/constants";

export const metadata = { title: "New Travel Request | Astelfin IMS", robots: { index: false, follow: false } };

async function createTravelRequest(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  // Determine employee
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { employeeId: true, role: true } });
  const isFMorCEO = user?.role === "CEO" || user?.role === "FINANCE_MANAGER";
  const empId = isFMorCEO && formData.get("employeeId") ? formData.get("employeeId") as string : user?.employeeId;
  if (!empId) return;

  const perDiemRate = parseFloat(formData.get("perDiemRate") as string) || 0;
  const perDiemDays = parseFloat(formData.get("perDiemDays") as string) || 0;
  const transportCost = parseFloat(formData.get("transportCost") as string) || 0;
  const accommodationCost = parseFloat(formData.get("accommodationCost") as string) || 0;
  const otherCosts = parseFloat(formData.get("otherCosts") as string) || 0;
  const perDiemTotal = perDiemRate * perDiemDays;
  const totalCost = perDiemTotal + transportCost + accommodationCost + otherCosts;
  const advanceRequested = parseFloat(formData.get("advanceRequested") as string) || 0;
  const projectId = (formData.get("projectId") as string) || null;

  await prisma.travelRequest.create({
    data: {
      employeeId:          empId,
      projectId:           projectId,
      purpose:             formData.get("purpose") as string,
      destination:         formData.get("destination") as string,
      departureDate:       new Date(formData.get("departureDate") as string),
      returnDate:          new Date(formData.get("returnDate") as string),
      advanceRequested,
      advanceCurrency:     (formData.get("currency") as string) || "MWK",
      perDiemRate,
      perDiemCurrency:     (formData.get("currency") as string) || "MWK",
      perDiemDays,
      perDiemTotal,
      transportCost,
      accommodationCost,
      otherCosts,
      totalCost,
      itinerary:           (formData.get("itinerary") as string) || null,
      notes:               (formData.get("notes") as string) || null,
      status:              "PENDING_FM",
    },
  });
  revalidatePath("/astelfin_26/travel");
  redirect("/astelfin_26/travel");
}

export default async function NewTravelPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { employeeId: true, role: true } });
  const isFMorCEO = user?.role === "CEO" || user?.role === "FINANCE_MANAGER";

  const [employees, projects] = await Promise.all([
    isFMorCEO ? prisma.employee.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }) : Promise.resolve([]),
    prisma.project.findMany({ where: { status: "ACTIVE" }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="p-6 max-w-3xl">
      <a href="/astelfin_26/travel" className="text-sm text-gray-500 hover:text-gray-700">← Travel</a>
      <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-6">New Travel Request</h1>
      <form action={createTravelRequest} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {isFMorCEO && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
              <select name="employeeId" required className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">— select —</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project (optional)</label>
            <select name="projectId" className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">— none —</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className={isFMorCEO ? "" : "col-span-2"}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
            <input type="text" name="purpose" required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
            <input type="text" name="destination" required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date *</label>
            <input type="date" name="departureDate" required min={LAUNCH_DATE} defaultValue={LAUNCH_DATE} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Return Date *</label>
            <input type="date" name="returnDate" required min={LAUNCH_DATE} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select name="currency" className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="MWK">MWK</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Costs</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Per Diem Rate / Day</label>
              <input type="number" name="perDiemRate" step="0.01" defaultValue="0" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Per Diem Days</label>
              <input type="number" name="perDiemDays" step="0.5" defaultValue="0" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Advance Requested</label>
              <input type="number" name="advanceRequested" step="0.01" defaultValue="0" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Transport Cost</label>
              <input type="number" name="transportCost" step="0.01" defaultValue="0" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Accommodation</label>
              <input type="number" name="accommodationCost" step="0.01" defaultValue="0" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Other Costs</label>
              <input type="number" name="otherCosts" step="0.01" defaultValue="0" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Itinerary</label>
          <textarea name="itinerary" rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea name="notes" rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-brand-navy text-white px-6 py-2 rounded-lg text-sm hover:opacity-90">Submit Request</button>
          <a href="/astelfin_26/travel" className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</a>
        </div>
      </form>
    </div>
  );
}
