import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProjectForm from "@/components/projects/ProjectForm";

export const metadata = {
  title: "New Project | Astelfin IMS",
  robots: { index: false, follow: false },
};

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{
    oppId?:      string;
    oppName?:    string;
    client?:     string;
    thematic?:   string;
    oppType?:    string;
  }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "PROJECT_MANAGER") redirect("/astelfin_26/dashboard");

  const sp = await searchParams;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">New Project</h1>
          <p className="text-gray-500 text-sm mt-1">Register a project, its team, and deliverables.</p>
        </div>
        <Link
          href={sp.oppId ? "/astelfin_26/bizdev/submitted" : "/astelfin_26/projects"}
          className="text-sm text-brand-gold hover:underline font-semibold">
          ← Back
        </Link>
      </div>
      <ProjectForm
        oppId={sp.oppId}
        oppName={sp.oppName}
        oppClient={sp.client}
        oppThematic={sp.thematic}
        oppType={sp.oppType}
      />
    </div>
  );
}
