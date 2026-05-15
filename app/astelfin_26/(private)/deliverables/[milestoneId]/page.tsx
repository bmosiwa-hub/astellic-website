/**
 * Deliverable version control for a specific milestone.
 * /astelfin_26/deliverables/[milestoneId]
 *
 * Shows submission history with version numbers, status workflow,
 * and allows PM/CEO to approve/reject/request revision.
 */
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { formatDate } from "@/lib/finance-utils";
import Link from "next/link";

export const metadata = { title: "Deliverable Submissions | Astelfin IMS", robots: { index: false, follow: false } };

const STATUS_COLOURS: Record<string, string> = {
  DRAFT:              "bg-gray-100 text-gray-600",
  SUBMITTED:          "bg-blue-100 text-blue-800",
  UNDER_REVIEW:       "bg-yellow-100 text-yellow-800",
  APPROVED:           "bg-green-100 text-green-800",
  REJECTED:           "bg-red-100 text-red-800",
  REVISION_REQUESTED: "bg-orange-100 text-orange-800",
};

async function submitDeliverable(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const milestoneId = formData.get("milestoneId") as string;
  const fileUrl     = (formData.get("fileUrl") as string) || null;
  const title       = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;

  // Get next version number
  const latest = await prisma.deliverableSubmission.findFirst({
    where:   { milestoneId },
    orderBy: { version: "desc" },
    select:  { version: true },
  });
  const version = (latest?.version ?? 0) + 1;

  await prisma.deliverableSubmission.create({
    data: {
      milestoneId,
      version,
      title,
      description,
      fileUrl,
      status:       "SUBMITTED",
      submittedById: session.user.id,
      submittedAt:  new Date(),
    },
  });
  revalidatePath(`/astelfin_26/deliverables/${milestoneId}`);
}

async function reviewDeliverable(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "PROJECT_MANAGER") return;

  const id         = formData.get("id") as string;
  const action     = formData.get("action") as string;
  const reviewNote = (formData.get("reviewNote") as string) || null;
  const milestoneId = formData.get("milestoneId") as string;

  const statusMap: Record<string, string> = {
    APPROVE:            "APPROVED",
    REJECT:             "REJECTED",
    REQUEST_REVISION:   "REVISION_REQUESTED",
    START_REVIEW:       "UNDER_REVIEW",
  };
  const newStatus = statusMap[action] ?? "UNDER_REVIEW";

  await prisma.deliverableSubmission.update({
    where: { id },
    data: {
      status:        newStatus,
      reviewedById:  session.user.id,
      reviewNote,
      reviewedAt:    new Date(),
    },
  });
  revalidatePath(`/astelfin_26/deliverables/${milestoneId}`);
}

export default async function DeliverableMilestonePage({ params }: { params: Promise<{ milestoneId: string }> }) {
  const { milestoneId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const milestone = await prisma.milestone.findUnique({
    where:   { id: milestoneId },
    include: {
      project: { select: { id: true, name: true, client: true } },
      deliverableSubmissions: {
        orderBy: { version: "desc" },
        include: {
          submittedBy: { select: { name: true } },
          reviewedBy:  { select: { name: true } },
        },
      },
    },
  });
  if (!milestone) notFound();

  const role = session.user.role;
  const canReview  = role === "CEO" || role === "PROJECT_MANAGER";
  const canSubmit  = true; // any authenticated user can submit
  const latestVersion = milestone.deliverableSubmissions[0];
  const canSubmitNew = !latestVersion || ["REJECTED","REVISION_REQUESTED","APPROVED"].includes(latestVersion.status);

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <a href="/astelfin_26/deliverables" className="text-sm text-gray-500 hover:text-gray-700">← Deliverables</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{milestone.title}</h1>
        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
          <Link href={`/astelfin_26/projects/${milestone.project.id}`} className="hover:underline">
            {milestone.project.name}
          </Link>
          <span>·</span>
          <span>{milestone.project.client}</span>
          <span>·</span>
          <span>Due {formatDate(milestone.deliveryDate)}</span>
          {milestone.paymentExpected && <span>· Payment: {milestone.paymentExpected.toLocaleString()} {milestone.currency}</span>}
        </div>
      </div>

      {/* Milestone status */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
        <div>
          <p className="text-xs text-gray-500">Milestone Status</p>
          <p className="font-semibold text-gray-900">{milestone.status}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Submissions</p>
          <p className="font-semibold text-gray-900">{milestone.deliverableSubmissions.length} version{milestone.deliverableSubmissions.length !== 1 ? "s" : ""}</p>
        </div>
        {latestVersion && (
          <div>
            <p className="text-xs text-gray-500">Latest Status</p>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOURS[latestVersion.status] ?? ""}`}>
              v{latestVersion.version} — {latestVersion.status.replace("_"," ")}
            </span>
          </div>
        )}
      </div>

      {/* Submit New Version */}
      {canSubmit && canSubmitNew && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Submit Deliverable {latestVersion ? `(v${(latestVersion.version + 1)})` : "(v1)"}
          </h2>
          <form action={submitDeliverable} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <input type="hidden" name="milestoneId" value={milestone.id} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Submission Title *</label>
              <input type="text" name="title" required defaultValue={milestone.title} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description / Summary</label>
              <textarea name="description" rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="What was submitted, key highlights, completion notes..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File URL (Blob / external link)</label>
              <input type="url" name="fileUrl" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
            </div>
            <button type="submit" className="bg-brand-navy text-white px-6 py-2 rounded-lg text-sm hover:opacity-90">Submit</button>
          </form>
        </section>
      )}

      {/* Submission History */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Submission History</h2>
        {milestone.deliverableSubmissions.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm">
            No submissions yet for this milestone.
          </div>
        )}
        <div className="space-y-3">
          {milestone.deliverableSubmissions.map(sub => (
            <div key={sub.id} className={`bg-white rounded-xl border p-5 ${sub.status === "APPROVED" ? "border-green-200" : sub.status === "REJECTED" ? "border-red-200" : "border-gray-200"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400">v{sub.version}</span>
                    <span className="font-semibold text-gray-900">{sub.title}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOURS[sub.status] ?? ""}`}>
                      {sub.status.replace("_"," ")}
                    </span>
                  </div>
                  {sub.description && <p className="text-sm text-gray-600 mt-1">{sub.description}</p>}
                  {sub.fileUrl && (
                    <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-navy hover:underline mt-1 inline-block">
                      View File →
                    </a>
                  )}
                  <div className="mt-2 text-xs text-gray-400">
                    Submitted by {sub.submittedBy.name}{sub.submittedAt ? ` on ${formatDate(sub.submittedAt)}` : ""}
                    {sub.reviewedBy && (
                      <> · Reviewed by {sub.reviewedBy.name}{sub.reviewedAt ? ` on ${formatDate(sub.reviewedAt)}` : ""}</>
                    )}
                  </div>
                  {sub.reviewNote && (
                    <p className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded px-3 py-2 mt-2">
                      Review note: {sub.reviewNote}
                    </p>
                  )}
                </div>

                {/* Review actions for latest submitted version */}
                {canReview && sub.id === (milestone.deliverableSubmissions.find(s => s.status === "SUBMITTED" || s.status === "UNDER_REVIEW")?.id) && (
                  <div className="shrink-0 space-y-2">
                    <form action={reviewDeliverable} className="flex flex-col gap-2">
                      <input type="hidden" name="id" value={sub.id} />
                      <input type="hidden" name="milestoneId" value={milestone.id} />
                      <input type="text" name="reviewNote" placeholder="Review note (optional)" className="border rounded px-2 py-1 text-xs w-44" />
                      <div className="flex gap-1">
                        <button name="action" value="APPROVE" className="flex-1 text-xs bg-green-600 text-white px-2 py-1.5 rounded hover:bg-green-700">Approve</button>
                        <button name="action" value="REQUEST_REVISION" className="flex-1 text-xs bg-orange-500 text-white px-2 py-1.5 rounded hover:bg-orange-600">Revise</button>
                        <button name="action" value="REJECT" className="flex-1 text-xs bg-red-600 text-white px-2 py-1.5 rounded hover:bg-red-700">Reject</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
