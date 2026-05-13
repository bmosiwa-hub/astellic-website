import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { redirect } from "next/navigation";
import ConsultantForm from "@/components/finance/ConsultantForm";
import type { ConsultancyProject } from "@/components/finance/ConsultantForm";

export const metadata = {
  title: "Add Consultant | Astelfin IMS",
  robots: { index: false, follow: false },
};

async function createConsultant(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const budgetedFeeRaw    = formData.get("budgetedFee")           as string;
  const profFeesRaw       = formData.get("totalProfessionalFees") as string;
  const otherFeesRaw      = formData.get("otherFees")             as string;
  const whtRateRaw        = formData.get("withholdingTaxRate")    as string;

  const data = {
    name:                 formData.get("name") as string,
    email:                (formData.get("email") as string)          || null,
    phone:                (formData.get("phone") as string)          || null,
    specialisation:       (formData.get("specialisation") as string) || null,
    dailyRate:            null,
    currency:             (formData.get("currency") as string)       || "MWK",
    taxPin:               (formData.get("taxPin") as string)         || null,
    notes:                (formData.get("notes") as string)          || null,
    projectId:            (formData.get("projectId") as string)      || null,
    budgetedFee:          budgetedFeeRaw ? parseFloat(budgetedFeeRaw) : null,
    totalProfessionalFees: profFeesRaw  ? parseFloat(profFeesRaw)   : null,
    otherFees:            otherFeesRaw  ? parseFloat(otherFeesRaw)   : null,
    withholdingTaxRate:   whtRateRaw    ? parseFloat(whtRateRaw)     : 20,
  };

  const record = await prisma.consultant.create({ data });
  await auditLog({
    userId:   session.user.id,
    action:   "CREATE",
    entity:   "Consultant",
    entityId: record.id,
    detail:   `${data.name}${data.projectId ? " — consultancy project" : ""}`,
  });

  redirect("/astelfin_26/consultants");
}

export default async function NewConsultantPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  // Fetch active consultancy projects with their members and milestones
  const raw = await prisma.project.findMany({
    where:   { status: "ACTIVE", category: "CONSULTANCY" },
    select: {
      id:             true,
      name:           true,
      currency:       true,
      projectLead:    true,
      projectLeadFee: true,
      members: {
        select: { id: true, name: true, email: true, budgetedFee: true },
        orderBy: { name: "asc" },
      },
      milestones: {
        select: { id: true, title: true, feePercentage: true, order: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  // Cast to the exported interface (null → null is already compatible)
  const consultancyProjects: ConsultancyProject[] = raw as ConsultancyProject[];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Add Consultant</h1>
        <p className="text-gray-500 text-sm mt-1">
          Select the consultancy project and the consultant's name from the project team.
          Fee breakdown is calculated automatically.
        </p>
      </div>
      <ConsultantForm action={createConsultant} consultancyProjects={consultancyProjects} />
    </div>
  );
}
