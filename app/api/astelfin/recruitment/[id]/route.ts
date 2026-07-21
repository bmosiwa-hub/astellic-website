import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { resolveAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const access = await resolveAccess(session);
  if (!access || !access.can("canManageRecruitment")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();

    const title        = (formData.get("title") as string)?.trim();
    const department   = (formData.get("department") as string)?.trim() || null;
    const location     = (formData.get("location") as string)?.trim() || null;
    const contractType = (formData.get("contractType") as string) || "PERMANENT";
    const status       = (formData.get("status") as string) || "DRAFT";
    const deadlineRaw  = (formData.get("deadline") as string)?.trim();
    const salary       = (formData.get("salary") as string)?.trim() || null;
    const description  = (formData.get("description") as string)?.trim();
    const requirements = (formData.get("requirements") as string)?.trim() || null;
    const isPublishedToWebsite = formData.get("isPublishedToWebsite") === "on";

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
    }

    const mandatoryConditions = (formData.getAll("mandatoryConditions") as string[]).filter(Boolean);
    const requiredDocuments   = (formData.getAll("requiredDocuments") as string[]).filter(Boolean);
    const deadline = deadlineRaw ? new Date(deadlineRaw) : null;

    await prisma.jobPosting.update({
      where: { id },
      data: {
        title,
        department,
        location,
        contractType,
        status,
        deadline,
        salary,
        description,
        requirements,
        mandatoryConditions,
        requiredDocuments,
        isPublishedToWebsite,
      },
    });

    revalidatePath(`/astelfin_26/recruitment/${id}`);
    revalidatePath("/astelfin_26/recruitment");
    revalidatePath("/vacancies");

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[recruitment PATCH]", msg);
    return NextResponse.json({ error: "Failed to update posting." }, { status: 500 });
  }
}
