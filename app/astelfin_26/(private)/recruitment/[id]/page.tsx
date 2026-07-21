import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { formatDate } from "@/lib/finance-utils";

export const metadata = { title: "Job Posting | Astelfin IMS", robots: { index: false, follow: false } };

const APP_STATUS_COLOURS: Record<string, string> = {
  APPLIED:              "bg-blue-100 text-blue-800",
  SCREENING:            "bg-yellow-100 text-yellow-800",
  INTERVIEW_SCHEDULED:  "bg-purple-100 text-purple-800",
  INTERVIEWED:          "bg-indigo-100 text-indigo-800",
  SHORTLISTED:          "bg-green-100 text-green-800",
  OFFERED:              "bg-teal-100 text-teal-800",
  ACCEPTED:             "bg-emerald-100 text-emerald-800",
  REJECTED:             "bg-red-100 text-red-800",
  WITHDRAWN:            "bg-gray-100 text-gray-600",
};

async function updateApplicationStatus(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const id     = formData.get("id") as string;
  const status = formData.get("status") as string;
  const note   = (formData.get("note") as string) || null;
  await prisma.jobApplication.update({
    where: { id },
    data:  { status: status as "APPLIED", reviewedById: session.user.id, reviewedAt: new Date(), notes: note },
  });
  const app = await prisma.jobApplication.findUnique({ where: { id }, select: { jobPostingId: true } });
  revalidatePath(`/astelfin_26/recruitment/${app?.jobPostingId}`);
}

async function addApplication(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const postingId = formData.get("postingId") as string;
  await prisma.jobApplication.create({
    data: {
      jobPostingId:   postingId,
      applicantName:  formData.get("applicantName") as string,
      applicantEmail: (formData.get("applicantEmail") as string) || null,
      applicantPhone: (formData.get("applicantPhone") as string) || null,
      notes:          (formData.get("notes") as string) || null,
    },
  });
  revalidatePath(`/astelfin_26/recruitment/${postingId}`);
}

async function updatePosting(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const id = formData.get("id") as string;
  await prisma.jobPosting.update({
    where: { id },
    data:  {
      status: formData.get("status") as string,
      isPublishedToWebsite: formData.get("isPublishedToWebsite") === "on",
    },
  });
  revalidatePath(`/astelfin_26/recruitment/${id}`);
}

export default async function PostingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const posting = await prisma.jobPosting.findUnique({
    where:   { id },
    include: { applications: { orderBy: { createdAt: "desc" }, include: { reviewedBy: { select: { name: true } } } } },
  });
  if (!posting) notFound();

  const byStatus: Record<string, typeof posting.applications> = {};
  for (const app of posting.applications) {
    (byStatus[app.status] ??= []).push(app);
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <a href="/astelfin_26/recruitment" className="text-sm text-gray-500 hover:text-gray-700">← Recruitment</a>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{posting.title}</h1>
          <p className="text-sm text-gray-500">{posting.department} · {posting.contractType.replace("_"," ")}{posting.deadline ? ` · Deadline: ${formatDate(posting.deadline)}` : ""}</p>
        </div>
        <div className="flex items-center gap-3">
        <a
          href={`/astelfin_26/recruitment/${posting.id}/edit`}
          className="border border-gray-300 text-gray-700 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-50"
        >
          Edit Posting
        </a>
        <form action={updatePosting} className="flex items-center gap-2">
          <input type="hidden" name="id" value={posting.id} />
          <select name="status" defaultValue={posting.status} className="border rounded-lg px-3 py-1.5 text-sm">
            {["DRAFT","OPEN","CLOSED","FILLED"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" name="isPublishedToWebsite" defaultChecked={posting.isPublishedToWebsite} className="h-4 w-4 accent-brand-gold" />
            Published
          </label>
          <button className="bg-brand-navy text-white text-sm px-3 py-1.5 rounded-lg hover:opacity-90">Update</button>
        </form>
        </div>
      </div>

      {/* Conditions & Documents */}
      {(posting.mandatoryConditions.length > 0 || posting.requiredDocuments.length > 0) && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {posting.mandatoryConditions.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">Mandatory Conditions ({posting.mandatoryConditions.length})</p>
              <ul className="space-y-1">
                {posting.mandatoryConditions.map((c, i) => (
                  <li key={i} className="text-sm text-amber-900 flex items-start gap-1.5">
                    <span className="text-amber-500 mt-0.5">✓</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {posting.requiredDocuments.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Required Documents ({posting.requiredDocuments.length})</p>
              <ul className="space-y-1">
                {posting.requiredDocuments.map((d, i) => (
                  <li key={i} className="text-sm text-blue-900 flex items-start gap-1.5">
                    <span className="text-blue-500 mt-0.5">📎</span>{d}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Add Application */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-3">Add Application</h2>
        <form action={addApplication} className="grid grid-cols-2 gap-3">
          <input type="hidden" name="postingId" value={posting.id} />
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" name="applicantName" required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="applicantEmail" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" name="applicantPhone" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
            <input type="text" name="notes" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2">
            <button type="submit" className="bg-brand-navy text-white text-sm px-5 py-2 rounded-lg hover:opacity-90">Add Applicant</button>
          </div>
        </form>
      </section>

      {/* Applications table */}
      <section>
        <h2 className="font-semibold text-gray-800 mb-3">Applications ({posting.applications.length})</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Applicant</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Contact</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Eligible</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Notes</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Move to</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posting.applications.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No applicants yet</td></tr>
              )}
              {posting.applications.map(app => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{app.applicantName}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{app.applicantEmail ?? app.applicantPhone ?? "—"}</td>
                  <td className="px-4 py-3">
                    {app.fromWebPortal ? (
                      app.isQualified
                        ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">✓ Qualified</span>
                        : <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">✗ Not qualified</span>
                    ) : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${APP_STATUS_COLOURS[app.status] ?? ""}`}>
                      {app.status.replace("_"," ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[160px] truncate">{app.notes ?? "—"}</td>
                  <td className="px-4 py-3">
                    <form action={updateApplicationStatus} className="flex gap-2 items-center">
                      <input type="hidden" name="id" value={app.id} />
                      <select name="status" defaultValue={app.status} className="border rounded px-2 py-1 text-xs">
                        {["APPLIED","SCREENING","INTERVIEW_SCHEDULED","INTERVIEWED","SHORTLISTED","OFFERED","ACCEPTED","REJECTED","WITHDRAWN"].map(s => (
                          <option key={s} value={s}>{s.replace("_"," ")}</option>
                        ))}
                      </select>
                      <input type="text" name="note" placeholder="note" className="border rounded px-2 py-1 text-xs w-24" />
                      <button className="text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-900">Save</button>
                    </form>
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
