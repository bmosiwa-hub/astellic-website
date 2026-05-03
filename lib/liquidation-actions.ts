"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/** Staff / Consultant submits a liquidation */
export async function createLiquidation(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const submissionId   = formData.get("submissionId") as string;
  const liquidationDate = new Date(formData.get("liquidationDate") as string);
  const activity       = formData.get("activity") as string;
  const budgetLine     = formData.get("budgetLine") as string;
  const fundsReceived  = parseFloat(formData.get("fundsReceived") as string);
  const fundsAccountedFor = parseFloat(formData.get("fundsAccountedFor") as string);
  const currency       = (formData.get("currency") as string) || "MWK";
  const refundRequired = fundsReceived - fundsAccountedFor;

  const liq = await prisma.liquidation.create({
    data: {
      submissionId,
      submittedBy: session.user.id!,
      liquidationDate,
      activity,
      budgetLine,
      fundsReceived,
      fundsAccountedFor,
      refundRequired,
      currency,
    },
  });

  // Process document uploads
  const docTypes = [
    { field: "receipts",           type: "RECEIPT" },
    { field: "refundProof",        type: "REFUND_PROOF" },
    { field: "overExpenditureProof", type: "OVER_EXPENDITURE_PROOF" },
    { field: "priorApprovalProof", type: "PRIOR_APPROVAL_PROOF" },
  ] as const;

  for (const { field, type: docType } of docTypes) {
    const files = formData.getAll(field) as File[];
    for (const file of files) {
      if (!file || file.size === 0) continue;
      try {
        const blob = await put(
          `liquidations/${liq.id}/${docType.toLowerCase()}-${Date.now()}-${file.name}`,
          file,
          { access: "public", addRandomSuffix: true }
        );
        await prisma.liquidationDocument.create({
          data: {
            liquidationId: liq.id,
            docType,
            url: blob.url,
            filename: file.name,
          },
        });
      } catch {
        // File upload failed — skip silently (FM will notice missing docs)
      }
    }
  }

  await auditLog({
    userId: session.user.id!,
    action: "CREATE",
    entity: "Liquidation",
    entityId: liq.id,
    detail: `${currency} received ${fundsReceived}, accounted ${fundsAccountedFor}, balance ${refundRequired}`,
  });

  revalidatePath("/astelfin_26/my/liquidations");
  redirect("/astelfin_26/my/liquidations");
}

/** FM reviews a liquidation */
export async function reviewLiquidation(
  liquidationId: string,
  action: "FM_APPROVED" | "FM_REJECTED" | "CHANGES_REQUESTED",
  formData: FormData
): Promise<void> {
  const session = await auth();
  if (!session?.user || (session.user.role !== "FINANCE_MANAGER" && session.user.role !== "CEO")) {
    redirect("/astelfin_26/login");
  }

  const note = (formData.get("note") as string) || null;

  await prisma.liquidation.update({
    where: { id: liquidationId },
    data: {
      status: action,
      fmNote: note || null,
      reviewedByName: session.user.name,
      reviewedAt: new Date(),
    },
  });

  await auditLog({
    userId: session.user.id!,
    action,
    entity: "Liquidation",
    entityId: liquidationId,
    detail: note || undefined,
  });

  revalidatePath("/astelfin_26/liquidations");
  revalidatePath(`/astelfin_26/liquidations/${liquidationId}`);
  redirect("/astelfin_26/liquidations");
}
