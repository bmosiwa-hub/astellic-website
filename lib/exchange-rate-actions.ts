"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { redirect } from "next/navigation";

function canManageRates(role: string) {
  return role === "CEO" || role === "FINANCE_MANAGER";
}

/**
 * Manually add or update a single currency's exchange rates (FM/CEO).
 */
export async function updateRateManually(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageRates(session.user.role)) {
    redirect("/astelfin_26/dashboard");
  }

  const currency   = (formData.get("currency") as string).toUpperCase().trim();
  const buyRate    = parseFloat(formData.get("buyRate")    as string);
  const middleRate = parseFloat(formData.get("middleRate") as string);
  const sellRate   = parseFloat(formData.get("sellRate")   as string);

  if (!currency || isNaN(middleRate) || middleRate <= 0) {
    redirect("/astelfin_26/exchange-rates?error=invalid");
  }

  await prisma.exchangeRate.upsert({
    where:  { currency },
    update: {
      buyRate:       isNaN(buyRate)  ? middleRate : buyRate,
      middleRate,
      sellRate:      isNaN(sellRate) ? middleRate : sellRate,
      effectiveDate: new Date(),
      source:        "MANUAL",
      updatedById:   session.user.id,
    },
    create: {
      currency,
      buyRate:       isNaN(buyRate)  ? middleRate : buyRate,
      middleRate,
      sellRate:      isNaN(sellRate) ? middleRate : sellRate,
      effectiveDate: new Date(),
      source:        "MANUAL",
      updatedById:   session.user.id,
    },
  });

  await auditLog({
    userId:   session.user.id,
    action:   "UPDATE",
    entity:   "ExchangeRate",
    entityId: currency,
    detail:   `Manual rate: middle = ${middleRate}`,
  });

  redirect("/astelfin_26/exchange-rates");
}
