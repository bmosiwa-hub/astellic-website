"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { redirect } from "next/navigation";
import { resolveAccess } from "@/lib/access";

/**
 * Manually add or update a single currency's exchange rates.
 */
export async function updateRateManually(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const access = await resolveAccess(session);
  if (!access || !access.can("canManageExchangeRates")) redirect("/astelfin_26/my");

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
