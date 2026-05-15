import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { createLiquidation } from "@/lib/liquidation-actions";
import Link from "next/link";
import { LAUNCH_DATE } from "@/lib/constants";

export const metadata = {
  title: "Submit Liquidation | Astellic Finance",
  robots: { index: false, follow: false },
};

export default async function NewLiquidationPage({
  searchParams,
}: {
  searchParams: Promise<{ submissionId?: string }>;
}) {
  const { submissionId } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  if (!submissionId) redirect("/astelfin_26/my/submissions");

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { project: { select: { name: true } } },
  });

  if (!submission || submission.submittedBy !== session.user.id) notFound();
  if (submission.status !== "PAID") redirect(`/astelfin_26/my/submissions/${submissionId}`);

  // Check if already liquidated
  const existing = await prisma.liquidation.findFirst({
    where: { submissionId, status: { in: ["PENDING_FM", "FM_APPROVED", "CHANGES_REQUESTED"] } },
  });
  if (existing) redirect(`/astelfin_26/my/submissions/${submissionId}`);

  const budgetLine =
    submission.budgetLine ||
    (submission.project?.name ? submission.project.name : "Admin");

  const action = createLiquidation;

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Submit Liquidation</h1>
          <p className="text-gray-500 text-sm mt-1">
            Account for funds received for{" "}
            <strong>{submission.purpose || submission.milestone || "your submission"}</strong>.
          </p>
        </div>
        <Link href={`/astelfin_26/my/submissions/${submissionId}`}
          className="text-sm text-brand-gold hover:underline font-semibold">
          ← Back
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <form action={action} className="space-y-6" encType="multipart/form-data">
          <input type="hidden" name="submissionId" value={submissionId} />
          <input type="hidden" name="currency" value={submission.currency} />

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Liquidation Date <span className="text-red-500">*</span>
              </label>
              <input name="liquidationDate" type="date" required
                min={LAUNCH_DATE}
                defaultValue={LAUNCH_DATE}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Budget Line <span className="text-red-500">*</span>
              </label>
              <input name="budgetLine" required defaultValue={budgetLine}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Activity <span className="text-red-500">*</span>
              </label>
              <input name="activity" required
                defaultValue={submission.purpose || submission.milestone || ""}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="Describe the activity the funds were used for" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Funds Received ({submission.currency}) <span className="text-red-500">*</span>
              </label>
              <input name="fundsReceived" type="number" step="0.01" min="0" required
                defaultValue={submission.totalAmount}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Funds Accounted For ({submission.currency}) <span className="text-red-500">*</span>
              </label>
              <input name="fundsAccountedFor" type="number" step="0.01" min="0" required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="Total amount with receipts" />
            </div>
          </div>

          <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
            The system will calculate the balance automatically.
            If you spent <strong>less</strong> than received, you must return the difference and upload proof.
            If you spent <strong>more</strong>, upload proof of over-expenditure and prior approval.
          </p>

          {/* Document uploads */}
          <div className="space-y-5 border-t pt-5">
            <h3 className="font-semibold text-brand-navy">Supporting Documents</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Receipts / Proof of Expenditure <span className="text-red-500">*</span>
              </label>
              <input name="receipts" type="file" multiple accept="image/*,.pdf"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-gold/10 file:text-brand-navy hover:file:bg-brand-gold/20" />
              <p className="text-xs text-gray-400 mt-1">Upload all receipt images or PDFs</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Proof of Refund Paid
              </label>
              <input name="refundProof" type="file" accept="image/*,.pdf"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              <p className="text-xs text-gray-400 mt-1">Required if you are returning unspent funds</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Proof of Over-Expenditure
              </label>
              <input name="overExpenditureProof" type="file" accept="image/*,.pdf"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
              <p className="text-xs text-gray-400 mt-1">Required if you spent more than received</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Prior Approval to Exceed Budget
              </label>
              <input name="priorApprovalProof" type="file" accept="image/*,.pdf"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" />
              <p className="text-xs text-gray-400 mt-1">Email screenshots or written approval required for over-expenditure</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
              Submit Liquidation
            </button>
            <Link href={`/astelfin_26/my/submissions/${submissionId}`}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
