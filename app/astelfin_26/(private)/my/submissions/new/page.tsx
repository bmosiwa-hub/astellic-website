import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SubmissionForm from "@/components/finance/SubmissionForm";

export const metadata = {
  title: "New Submission | Astellic Finance",
  robots: { index: false, follow: false },
};

export default async function NewSubmissionPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const [projects, fmCount] = await Promise.all([
    prisma.project.findMany({
      where:   { status: "ACTIVE" },
      select:  { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.count({ where: { role: "FINANCE_MANAGER", active: true } }),
  ]);

  const hasFM = fmCount > 0;
  const budgetLines = ["Admin", ...projects.map((p) => p.name)];

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">New Submission</h1>
        <p className="text-gray-500 text-sm mt-1">
          Submit an invoice for services rendered, or request funds for an upcoming activity.{" "}
          {hasFM
            ? "Your submission will be reviewed by the Finance Manager, then the Chief Executive Officer."
            : "Your submission will go directly to the Chief Executive Officer for approval."}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <SubmissionForm projects={projects} budgetLines={budgetLines} />
      </div>
    </div>
  );
}
