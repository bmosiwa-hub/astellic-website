import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { LAUNCH_DATE } from "@/lib/constants";

export const metadata = { title: "New Job Posting | Astelfin IMS", robots: { index: false, follow: false } };

async function createPosting(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO" && session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  const deadline = formData.get("deadline") as string;

  await prisma.jobPosting.create({
    data: {
      title:        formData.get("title") as string,
      department:   (formData.get("department") as string) || null,
      description:  formData.get("description") as string,
      requirements: (formData.get("requirements") as string) || null,
      contractType: formData.get("contractType") as string,
      location:     (formData.get("location") as string) || null,
      status:       formData.get("status") as string,
      deadline:     deadline ? new Date(deadline) : null,
      salary:       (formData.get("salary") as string) || null,
      createdById:  session.user.id,
    },
  });
  revalidatePath("/astelfin_26/recruitment");
  redirect("/astelfin_26/recruitment");
}

export default async function NewPostingPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO" && session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Job Posting</h1>
      <form action={createPosting} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
            <input type="text" name="title" required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input type="text" name="department" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input type="text" name="location" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type</label>
            <select name="contractType" className="w-full border rounded-lg px-3 py-2 text-sm">
              {["PERMANENT","CONTRACT","CONSULTANCY","INTERNSHIP","VOLUNTEER"].map(t => (
                <option key={t} value={t}>{t.replace("_"," ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="DRAFT">Draft</option>
              <option value="OPEN">Open</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
            <input type="date" name="deadline" min={LAUNCH_DATE} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
            <input type="text" name="salary" placeholder="e.g. MWK 800,000 – 1,200,000" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
            <textarea name="description" required rows={5} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
            <textarea name="requirements" rows={4} placeholder="Qualifications, experience, skills..." className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-brand-navy text-white px-6 py-2 rounded-lg text-sm hover:opacity-90">Create Posting</button>
          <a href="/astelfin_26/recruitment" className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</a>
        </div>
      </form>
    </div>
  );
}
