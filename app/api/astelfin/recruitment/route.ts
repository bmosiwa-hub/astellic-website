import { auth } from "@/auth";
import { resolveAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const access = await resolveAccess(session);
  if (!access || !access.can("canManageRecruitment"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await request.formData();

  const conditions = (formData.getAll("mandatoryConditions") as string[]).map(s => s.trim()).filter(Boolean);
  const documents  = (formData.getAll("requiredDocuments") as string[]).map(s => s.trim()).filter(Boolean);
  const deadline   = formData.get("deadline") as string;

  await prisma.jobPosting.create({
    data: {
      title:               formData.get("title") as string,
      department:          (formData.get("department") as string) || null,
      description:         formData.get("description") as string,
      requirements:        (formData.get("requirements") as string) || null,
      mandatoryConditions: conditions,
      requiredDocuments:   documents,
      isPublishedToWebsite: formData.get("isPublishedToWebsite") === "on",
      contractType:        (formData.get("contractType") as string) || "PERMANENT",
      location:            (formData.get("location") as string) || null,
      status:              (formData.get("status") as string) || "DRAFT",
      deadline:            deadline ? new Date(deadline) : null,
      salary:              (formData.get("salary") as string) || null,
      createdById:         session.user.id,
    },
  });

  revalidatePath("/astelfin_26/recruitment");
  return NextResponse.json({ success: true });
}
