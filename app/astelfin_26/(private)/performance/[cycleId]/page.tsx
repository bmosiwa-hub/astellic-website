import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  reviewObjectives,
  submitSupervisorReview,
  saveCEODecision,
} from "@/lib/performance-actions";

export const metadata = {
  title: "Performance Review | Astelfin",
  robots: { index: false, follow: false },
};

const RATING_LABELS: Record<number, string> = {
  1: "Does Not Meet",
  2: "Partially Meets",
  3: "Meets Expectations",
  4: "Exceeds Expectations",
  5: "Outstanding",
};

export default async function PerformanceCycleReviewPage({
  params,
  searchParams,
}: {
  params:       Promise<{ cycleId: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { cycleId } = await params;
  const { success } = await searchParams;
  const session     = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER" && role !== "PROJECT_MANAGER") {
    redirect("/astelfin_26/dashboard");
  }

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
      employee: {
        select: { name: true, email: true, position: true, supervisorId: true },
      },
    },
  });
  if (!cycle) notFound();

  const status   = cycle.status;
  const selfReview = cycle.reviews.find((r) => r.reviewType === "SELF");
  const supReview  = cycle.reviews.find((r) => r.reviewType === "SUPERVISOR");

  const canApproveObjectives   = status === "OBJECTIVES_SUBMITTED";
  const canSubmitSupReview     = status === "REVIEWING";
  const canMakeCEODecision     = status === "CEO_PENDING" && role === "CEO";

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">
            {cycle.employee.name} — {cycle.cycleType} {cycle.year}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {cycle.employee.position ?? "Employee"} ·{" "}
            {new Date(cycle.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            {" – "}
            {new Date(cycle.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <Link href="/astelfin_26/performance"
          className="text-sm text-brand-gold hover:underline font-semibold">
          ← Team Performance
        </Link>
      </div>

      {/* Toasts */}
      {success === "reviewed" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ✓ Objectives review saved. Employee has been notified.
        </div>
      )}
      {success === "supervisor_done" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ✓ Supervisor assessment submitted. CEO has been notified.
        </div>
      )}
      {success === "decision_saved" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ✓ CEO decision recorded. Review cycle is now complete.
        </div>
      )}

      {/* ── Objectives ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-brand-navy">Performance Objectives</h2>
        </div>
        <div className="p-5">
          {cycle.objectives.length === 0 ? (
            <p className="text-sm text-gray-400">No objectives set.</p>
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

        {/* Approve / Reject objectives */}
        {canApproveObjectives && (
          <div className="px-5 pb-5 pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Review Objectives
            </p>
            <div className="grid grid-cols-2 gap-4">
              <form action={reviewObjectives} className="space-y-2">
                <input type="hidden" name="cycleId"  value={cycleId} />
                <input type="hidden" name="decision" value="APPROVE" />
                <textarea name="note" rows={2} placeholder="Approval note (optional)…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none" />
                <button type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  ✓ Approve Objectives
                </button>
              </form>
              <form action={reviewObjectives} className="space-y-2">
                <input type="hidden" name="cycleId"  value={cycleId} />
                <input type="hidden" name="decision" value="REJECT" />
                <textarea name="note" required rows={2} placeholder="Reason for returning (required)…"
                  className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none" />
                <button type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  ✗ Return for Revision
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ── Self-Review (read-only) ──────────────────────────────────────── */}
      {selfReview && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-brand-navy">Employee Self-Assessment</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Submitted {selfReview.submittedAt
                ? new Date(selfReview.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                : ""}
            </p>
          </div>
          <ReviewReadOnly review={selfReview} objectives={cycle.objectives} />
        </div>
      )}

      {/* ── Supervisor Review ────────────────────────────────────────────── */}
      {canSubmitSupReview && !supReview ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-brand-navy">Your Supervisor Assessment</h2>
            <p className="text-xs text-gray-400 mt-0.5">Complete your assessment to move this to CEO review.</p>
          </div>
          <form action={submitSupervisorReview} className="p-5 space-y-5">
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
                    <input name="ratingComment" placeholder="Comment (optional)"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold bg-white" />
                  </div>
                ))}
              </div>
            )}

            {/* Overall */}
            <div className="space-y-3">
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
              <textarea name="strengths" rows={3} placeholder="Key strengths observed…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold resize-none" />
              <textarea name="improvements" rows={3} placeholder="Development areas…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold resize-none" />
              <textarea name="comments" rows={2} placeholder="Additional comments…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold resize-none" />
            </div>

            <button type="submit"
              className="w-full bg-brand-navy text-white font-semibold py-2.5 rounded-lg hover:bg-brand-navy/90 transition-colors text-sm">
              Submit Supervisor Assessment →
            </button>
          </form>
        </div>
      ) : supReview ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-brand-navy">Supervisor Assessment</h2>
            <p className="text-xs text-gray-400 mt-0.5">By {supReview.submittedBy.name}</p>
          </div>
          <ReviewReadOnly review={supReview} objectives={cycle.objectives} />
        </div>
      ) : null}

      {/* ── CEO Decision Panel ───────────────────────────────────────────── */}
      {canMakeCEODecision && (
        <div className="bg-amber-50 rounded-2xl border border-amber-300 p-6 space-y-5">
          <div>
            <h2 className="font-bold text-amber-800">CEO Decision</h2>
            <p className="text-xs text-amber-700 mt-1">
              Both reviews have been submitted. Record your final decision to complete this review cycle.
            </p>
          </div>
          <form action={saveCEODecision} className="space-y-4">
            <input type="hidden" name="cycleId" value={cycleId} />
            <div>
              <label className="block text-sm font-semibold text-amber-800 mb-1">Overall Score (1–5)</label>
              <select name="overallScore"
                className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
                <option value="">Select…</option>
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>{r} — {RATING_LABELS[r]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-amber-800 mb-1">Outcome</label>
              <input type="text" name="outcome" placeholder="e.g. Confirmed, Extended Probation, Promoted…"
                className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-amber-800 mb-1">Comments</label>
              <textarea name="comments" rows={3} placeholder="CEO remarks…"
                className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white resize-none" />
            </div>
            <button type="submit"
              className="w-full bg-brand-navy text-white font-semibold py-2.5 rounded-lg hover:bg-brand-navy/90 transition-colors text-sm">
              Save Decision & Complete Review →
            </button>
          </form>
        </div>
      )}

      {/* Completed CEO decision — read only */}
      {cycle.ceoDecision && status === "COMPLETED" && (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 space-y-3">
          <h2 className="font-bold text-emerald-800">CEO Decision</h2>
          {cycle.ceoDecision.overallScore != null && (
            <p className="text-sm text-emerald-900">
              <strong>Overall Score:</strong> {cycle.ceoDecision.overallScore} / 5
              {" — "}{RATING_LABELS[Math.round(cycle.ceoDecision.overallScore)] ?? ""}
            </p>
          )}
          {cycle.ceoDecision.outcome && (
            <p className="text-sm text-emerald-900"><strong>Outcome:</strong> {cycle.ceoDecision.outcome}</p>
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
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

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
        <p>
          <strong className="text-brand-navy">Overall:</strong>{" "}
          {review.overallRating} / 5 — {RATING_LABELS[Math.round(review.overallRating)] ?? ""}
        </p>
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
