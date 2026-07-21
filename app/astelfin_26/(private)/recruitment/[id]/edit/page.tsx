import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import EditPostingForm from "./EditPostingForm";

export const metadata = { title: "Edit Job Posting | Astelfin IMS", robots: { index: false, follow: false } };

export default async function EditPostingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const posting = await prisma.jobPosting.findUnique({
    where: { id },
    select: {
      id: true, title: true, department: true, location: true, contractType: true,
      status: true, deadline: true, salary: true, description: true, requirements: true,
      mandatoryConditions: true, requiredDocuments: true, isPublishedToWebsite: true,
    },
  });
  if (!posting) notFound();

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <a href={`/astelfin_26/recruitment/${id}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Posting
        </a>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Edit Posting</h1>
        <p className="text-sm text-gray-500 mt-0.5">{posting.title}</p>
      </div>
      <EditPostingForm posting={posting} />
    </div>
  );
}
