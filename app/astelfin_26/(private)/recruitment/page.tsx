import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/finance-utils";
import Link from "next/link";

export const metadata = { title: "Recruitment | Astelfin IMS", robots: { index: false, follow: false } };

const STATUS_COLOURS: Record<string, string> = {
  DRAFT:  "bg-gray-100 text-gray-600",
  OPEN:   "bg-green-100 text-green-800",
  CLOSED: "bg-orange-100 text-orange-800",
  FILLED: "bg-blue-100 text-blue-800",
};

export default async function RecruitmentPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;

  const postings = await prisma.jobPosting.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  const open   = postings.filter(p => p.status === "OPEN");
  const others = postings.filter(p => p.status !== "OPEN");

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment</h1>
          <p className="text-sm text-gray-500 mt-1">{open.length} open posting{open.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/astelfin_26/recruitment/new" className="bg-brand-navy text-white text-sm px-4 py-2 rounded-lg hover:opacity-90">
          + New Posting
        </Link>
      </div>

      {postings.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          No job postings yet. Create your first posting to start tracking candidates.
        </div>
      )}

      <div className="space-y-3">
        {postings.map(posting => (
          <div key={posting.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Link href={`/astelfin_26/recruitment/${posting.id}`} className="font-semibold text-gray-900 hover:text-brand-navy">
                    {posting.title}
                  </Link>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOURS[posting.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {posting.status}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                  {posting.department && <span>{posting.department}</span>}
                  <span>{posting.contractType.replace("_"," ")}</span>
                  {posting.deadline && <span>Deadline: {formatDate(posting.deadline)}</span>}
                </div>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{posting.description}</p>
              </div>
              <div className="shrink-0 text-center">
                <p className="text-2xl font-bold text-gray-900">{posting._count.applications}</p>
                <p className="text-xs text-gray-500">applicant{posting._count.applications !== 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
