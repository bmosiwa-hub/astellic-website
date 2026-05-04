import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Terminate Consultant | Astelfin IMS",
  robots: { index: false, follow: false },
};

async function terminateConsultant(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const consultantId = formData.get("consultantId") as string;
  const reason       = (formData.get("reason") as string) || null;

  const consultant = await prisma.consultant.findUnique({
    where: { id: consultantId },
    select: { name: true },
  });

  await prisma.consultant.update({
    where: { id: consultantId },
    data:  { active: false },
  });

  await auditLog({
    userId:   session.user.id,
    action:   "TERMINATE",
    entity:   "Consultant",
    entityId: consultantId,
    detail:   reason
      ? `Contract terminated for ${consultant?.name}: ${reason}`
      : `Contract terminated for ${consultant?.name}`,
  });

  redirect("/astelfin_26/consultants?success=terminated");
}

export default async function TerminateConsultantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const { id } = await params;
  const consultant = await prisma.consultant.findUnique({
    where: { id },
    select: { id: true, name: true, specialisation: true, active: true },
  });

  if (!consultant) notFound();
  if (!consultant.active) redirect("/astelfin_26/consultants");

  return (
    <div className="max-w-lg">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/astelfin_26/consultants"
          className="text-gray-400 hover:text-brand-navy transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-brand-navy">Terminate Contract</h1>
      </div>

      <div className="bg-red-50 rounded-2xl border border-red-200 p-6 space-y-4">
        <div>
          <p className="font-semibold text-red-800">{consultant.name}</p>
          {consultant.specialisation && (
            <p className="text-sm text-red-600">{consultant.specialisation}</p>
          )}
        </div>

        <p className="text-sm text-red-700">
          Terminating this contract will mark the consultant as <strong>inactive</strong>.
          All past payment records are preserved. This action is audit-logged and can be
          reversed from Settings if needed.
        </p>

        <form action={terminateConsultant} className="space-y-4">
          <input type="hidden" name="consultantId" value={consultant.id} />
          <div>
            <label className="block text-xs font-medium text-red-700 mb-1">
              Reason for Termination
            </label>
            <input
              name="reason"
              placeholder="e.g. End of contract, project completed, mutual agreement…"
              className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
              Confirm Termination
            </button>
            <Link href="/astelfin_26/consultants"
              className="px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
