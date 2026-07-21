import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createAccountReceivable } from "@/lib/recurring-actions";
import { LAUNCH_DATE } from "@/lib/constants";

export const metadata = {
  title: "New Receivable | Astellic Finance",
  robots: { index: false, follow: false },
};

export default async function NewReceivablePage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;

  const projects = await prisma.project.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-navy">Add Receivable</h1>
        <Link href="/astelfin_26/receivables" className="text-sm text-brand-gold hover:underline font-semibold">
          ← Back
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form action={createAccountReceivable} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              name="description" required
              placeholder="What is expected to be received?"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Payer / Source</label>
              <input
                name="payer"
                placeholder="Who will pay?"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Project</label>
              <select
                name="projectId"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                name="amount" type="number" step="0.01" min="0" required
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Currency</label>
              <select
                name="currency" defaultValue="MWK"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                {["MWK", "USD", "EUR", "GBP", "ZAR"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Expected Date <span className="text-red-500">*</span>
              </label>
              <input
                name="expectedDate" type="date" required
                min={LAUNCH_DATE}
                defaultValue={LAUNCH_DATE}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Note</label>
              <input
                name="note"
                placeholder="Invoice number, contract reference…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/astelfin_26/receivables"
              className="px-5 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Add Receivable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
