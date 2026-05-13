import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  saveObjectives,
  submitObjectives,
  submitSelfReview,
} from "@/lib/performance-actions";

export const metadata = {
  title: "Performance Cycle | Astelfin",
  robots: { index: false, follow: false },
};

const RATING_LABELS: Record<number, string> = {
  1: "Does Not Meet",
  2: "Partially Meets",
  3: "Meets Expectations",
  4: "Exceeds Expectations",
  5: "Outstanding",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  OBJECTIVES_DRAFT:     { label: "Objectives Draft",      color: "bg-gray-100 text-gray-600" },
  OBJECTIVES_SUBMITTED: { label: "Awaiting Approval",     color: "bg-blue-100 text-blue-700" },
  OBJECTIVES_APPROVED:  { label: "Objectives Approved",   color: "bg-green-100 text-green-700" },
  REVIEWING:            { label: "Self-Review Submitted",  color: "bg-amber-100 text-amber-700" },
  CEO_PENDING:          { label: "Pending CEO Decision",   color: "bg-purple-100 text-purple-700" },
  COMPLETED:            { label: "Completed",              color: "bg-emerald-100 text-emerald-700" },
};

export default async function MyCyclePage({
  params,
  searchParams,
}: {
  params:       Promise<{ cycleId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { cycleId } = await params;
  const { success, error } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id! },
    select: { employeeId: true },
  });

  const cycle = await prisma.performanceCycle.findUnique({
    where:   { id: cycleId },
    include: {
      objectives: { orderBy: { createdAt: "asc" } },
      reviews: {
        include: {
          ratings:     true,
          submittedBy: { select: { name: true } },
        },
      },
      ceoDecision: { include: { decidedBy: { select: { name: true } } } },
      employee:    { select: { name: true } },
    },
  });
  if (!cycle) notFound();

  // Only the cycle's employee can access this page (or CEO/FM for visibility)
  const role = session.user.role;
  const isOwner = user?.employeeId === cycle.employeeId;
  if (!isOwner && role !== "CEO" && role !== "FINANCE_MANAGER") {
    redirect("/astelfin_26/dashboard");
  }

  const status = cycle.status;
  const st = STATUS_LABELS[status] ?? { label: status, color: "bg-gray-100 text-gray-600" };

  const canEditObjectives = isOwner && status === "OBJECTIVES_DRAFT";
  const canSubmitObjectives = canEditObjectives && cycle.objectives.length > 0;
  const canSelfReview = isOwner && status === "OBJECTIVES_APPROVED";

  const selfReview = cycle.reviews.find((r) => r.reviewType === "SELF");
  const supReview  = cycle.reviews.find((r) => r.reviewType === "SUPERVISOR");

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">
            {cycle.cycleType} {cycle.year}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {cycle.employee.name} ·{" "}
            {new Date(cycle.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            {" – "}
            {new Date(cycle.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st.color}`}>
            {st.label}
          </span>
          <Link href="/astelfin_26/my/performance"
            className="text-sm text-brand-gold hover:underline font-semibold">
            ← Back
          </Link>
        </div>
      </div>

      {/* Toasts */}
      {success === "submitted" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ✓ Objectives submitted to your supervisor for approval.
        </div>
      )}
      {success === "review_submitted" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ✓ Self-review submitted. Your supervisor has been notified.
        </div>
      )}
      {cycle.supervisorNote && (status === "OBJECTIVES_DRAFT" || status === "OBJECTIVES_APPROVED") && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
          <strong>Supervisor note:</strong> {cycle.supervisorNote}
        </div>
      )}

      {/* ── Objectives ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-brand-navy">Performance Objectives</h2>
          {status === "OBJECTIVES_SUBMITTED" && (
            <span className="text-xs text-blue-600 font-semibold">Waiting for supervisor approval</span>
          )}
        </div>

        {canEditObjectives ? (
          <div className="p-5 space-y-5">
            {/* Existing objectives list */}
            {cycle.objectives.length > 0 && (
              <div className="space-y-3">
                {cycle.objectives.map((obj, i) => (
                  <div key={obj.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm">
                    <p className="font-semibold text-brand-navy">{i + 1}. {obj.title}</p>
                    {obj.description && <p className="text-gray-500 mt-1">{obj.description}</p>}
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      {obj.weight != null && <span>Weight: {obj.weight}%</span>}
                      {obj.target && <span>Target: {obj.target}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Edit objectives form */}
            <form action={saveObjectives} className="space-y-4">
              <input type="hidden" name="cycleId" value={cycleId} />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {cycle.objectives.length > 0 ? "Replace all objectives" : "Add objectives"}
              </p>
              {[1, 2, 3, 4, 5].map((n) => {
                const existing = cycle.objectives[n - 1];
                return (
                  <div key={n} className="border border-gray-100 rounded-xl p-4 space-y-2 bg-gray-50/50">
                    <p className="text-xs font-bold text-gray-500">Objective {n}</p>
                    <input
                      name="title"
                      defaultValue={existing?.title ?? ""}
                      placeholder={`Objective ${n} title${n <= 2 ? " *" : " (optional)"}`}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold bg-white"
                    />
                    <input
                      name="description"
                      defaultValue={existing?.description ?? ""}
                      placeholder="Description (optional)"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold bg-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        name="weight"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        defaultValue={existing?.weight ?? ""}
                        placeholder="Weight % (optional)"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold bg-white"
                      />
                      <input
                        name="target"
                        defaultValue={existing?.target ?? ""}
                        placeholder="Target / KPI (optional)"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold bg-white"
                      />
                    </div>
                  </div>
                );
              })}
              <button type="submit"
                className="w-full bg-gray-100 hover:bg-gray-200 text-brand-navy font-semibold py-2.5 rounded-lg text-sm transition-colors">
                💾 Save Objectives
              </button>
            </form>

            {canSubmitObjectives && (
              <form action={submitObjectives}>
                <input type="hidden" name="cycleId" value={cycleId} />
                <button type="submit"
                  className="w-full bg-brand-navy text-white font-semibold py-2.5 rounded-lg hover:bg-brand-navy/90 transition-colors text-sm">
                  Submit for Supervisor Approval →
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="p-5">
            {cycle.objectives.length === 0 ? (
              <p className="text-gray-400 text-sm">No objectives set yet.</p>
            ) : (
              <div className="space-y-3">
                {cycle.objectives.map((obj, i) => (
                  <div key={obj.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm">
                    <p className="font-semibold text-brand-navy">{i + 1}. {obj.title}</p>
                    {obj.description && <p className="text-gray-500 mt-1">{obj.description}</p>}
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      {obj.weight != null && <span>Weight: {obj.weight}%</span>}
                      {obj.target && <span>Target: {obj.target}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Self-Review ─────────────────────────────────────────────────────── */}
      {(canSelfReview || selfReview) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-brand-navy">Self-Assessment</h2>
            {selfReview && (
              <p className="text-xs text-gray-400 mt-0.5">
                Submitted {selfReview.submittedAt
                  ? new Date(selfReview.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                  : ""}
              </p>
            )}
          </div>

          {canSelfReview && !selfReview ? (
            <form action={submitSelfReview} className="p-5 space-y-5">
              <input type="hidden" name="cycleId" value={cycleId} />

              {/* Per-objective ratings */}
              {cycle.objectives.length > 0 && (
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rate each objective</p>
                  {cycle.objectives.map((obj) => (
                    <div key={obj.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                      <p className="text-sm font-semibold text-brand-navy">{obj.title}</p>
                      <input type="hidden" name="objectiveId" value={obj.id} />
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <label key={r} className="flex-1 text-center cursor-pointer">
                            <input type="radio" name="rating" value={r} required className="sr-only peer" />
                            <div className="border border-gray-200 rounded-lg py-2 text-xs font-semibold text-gray-500 peer-checked:bg-brand-gold peer-checked:text-white peer-checked:border-brand-gold transition-colors hover:bg-gray-100">
                              {r}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 leading-tight">{RATING_LABELS[r]}</p>
                          </label>
                        ))}
                      </div>
                      <input name="ratingComment" placeholder="Comment on this objective (optional)"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold bg-white" />
                    </div>
                  ))}
                </div>
              )}

              {/* Overall */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Overall self-assessment</p>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Overall Rating (1–5)</label>
                  <select name="overallRating"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
                    <option value="">Select…</option>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>{r} — {RATING_LABELS[r]}</option>
                    ))}
                  </select>
                </div>
                <textarea name="strengths" rows={3} placeholder="Key strengths demonstrated this period…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold resize-none" />
                <textarea name="improvements" rows={3} placeholder="Areas for improvement…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold resize-none" />
                <textarea name="comments" rows={2} placeholder="Any additional comments…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold resize-none" />
              </div>

              <button type="submit"
                className="w-full bg-brand-navy text-white font-semibold py-2.5 rounded-lg hover:bg-brand-navy/90 transition-colors text-sm">
                Submit Self-Review →
              </button>
            </form>
          ) : selfReview ? (
            <ReviewReadOnly review={selfReview} objectives={cycle.objectives} />
          ) : null}
        </div>
      )}

      {/* ── Supervisor Review (read-only for employee) ───────────────────────── */}
      {supReview && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-brand-navy">Supervisor Assessment</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              By {supReview.submittedBy.name}
            </p>
          </div>
          <ReviewReadOnly review={supReview} objectives={cycle.objectives} />
        </div>
      )}

      {/* ── CEO Decision ─────────────────────────────────────────────────────── */}
      {cycle.ceoDecision && status === "COMPLETED" && (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 space-y-3">
          <h2 className="font-bold text-emerald-800">CEO Decision</h2>
          {cycle.ceoDecision.overallScore != null && (
            <p className="text-sm text-emerald-900">
              <strong>Overall Score:</strong> {cycle.ceoDecision.overallScore} / 5
              {" "}— {RATING_LABELS[Math.round(cycle.ceoDecision.overallScore)] ?? ""}
            </p>
          )}
          {cycle.ceoDecision.outcome && (
            <p className="text-sm text-emerald-900">
              <strong>Outcome:</strong> {cycle.ceoDecision.outcome}
            </p>
          )}
          {cycle.ceoDecision.comments && (
            <p className="text-sm text-emerald-700">{cycle.ceoDecision.comments}</p>
          )}
          {cycle.ceoDecision.decidedBy && cycle.ceoDecision.decidedAt && (
            <p className="text-xs text-emerald-600">
              Decided by {cycle.ceoDecision.decidedBy.name} on{" "}
              {new Date(cycle.ceoDecision.decidedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      )}

      {/* ── Status info panels ───────────────────────────────────────────────── */}
      {status === "OBJECTIVES_SUBMITTED" && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
          <strong>Objectives submitted.</strong> Waiting for supervisor approval before you can begin your self-assessment.
        </div>
      )}
      {status === "REVIEWING" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          <strong>Self-review submitted.</strong> Your supervisor is completing their assessment.
        </div>
      )}
      {status === "CEO_PENDING" && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-sm text-purple-800">
          <strong>Both reviews complete.</strong> Waiting for the CEO to make a final decision.
        </div>
      )}
    </div>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────────

function ReviewReadOnly({
  review,
  objectives,
}: {
  review: {
    overallRating: number | null;
    strengths:     string | null;
    improvements:  string | null;
    comments:      string | null;
    ratings:       { objectiveId: string; rating: number; comment: string | null }[];
  };
  objectives: { id: string; title: string }[];
}) {
  const ratingsByObj = Object.fromEntries(review.ratings.map((r) => [r.objectiveId, r]));

  return (
    <div className="p-5 space-y-4 text-sm">
      {objectives.length > 0 && (
        <div className="space-y-3">
          {objectives.map((obj) => {
            const r = ratingsByObj[obj.id];
            return r ? (
              <div key={obj.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-brand-navy">{obj.title}</p>
                  <span className="shrink-0 bg-brand-gold text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {r.rating} / 5
                  </span>
                </div>
                {r.comment && <p className="text-gray-500 text-xs mt-1">{r.comment}</p>}
              </div>
            ) : null;
          })}
        </div>
      )}
      {review.overallRating != null && (
        <p><strong className="text-brand-navy">Overall:</strong> {review.overallRating} / 5 — {RATING_LABELS[Math.round(review.overallRating)] ?? ""}</p>
      )}
      {review.strengths && (
        <div>
          <p className="font-semibold text-brand-navy">Strengths</p>
          <p className="text-gray-600">{review.strengths}</p>
        </div>
      )}
      {review.improvements && (
        <div>
          <p className="font-semibold text-brand-navy">Areas for Improvement</p>
          <p className="text-gray-600">{review.improvements}</p>
        </div>
      )}
      {review.comments && (
        <div>
          <p className="font-semibold text-brand-navy">Comments</p>
          <p className="text-gray-600">{review.comments}</p>
        </div>
      )}
    </div>
  );
}
