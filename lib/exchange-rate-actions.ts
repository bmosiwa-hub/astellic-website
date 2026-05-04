"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { fetchRBMRates } from "@/lib/rbm-scraper";
import { redirect } from "next/navigation";

function canManageRates(role: string) {
  return role === "CEO" || role === "FINANCE_MANAGER";
}

/**
 * Pull fresh rates from the RBM website and upsert them into the database.
 * Used as a form action on the exchange-rates page (FM/CEO).
 */
export async function refreshRatesFromRBM(_formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user || !canManageRates(session.user.role)) {
    redirect("/astelfin_26/dashboard");
  }

  try {
    const { effectiveDate, rates } = await fetchRBMRates();

    await Promise.all(
      rates.map((r) =>
        prisma.exchangeRate.upsert({
          where:  { currency: r.currency },
          update: {
            buyRate:       r.buyRate,
            middleRate:    r.middleRate,
            sellRate:      r.sellRate,
            effectiveDate,
            source:        "RBM",
            updatedById:   session.user.id,
          },
          create: {
            currency:      r.currency,
            buyRate:       r.buyRate,
            middleRate:    r.middleRate,
            sellRate:      r.sellRate,
            effectiveDate,
            source:        "RBM",
            updatedById:   session.user.id,
          },
        })
      )
    );

    await auditLog({
      userId:   session.user.id,
      action:   "REFRESH",
      entity:   "ExchangeRate",
      entityId: "RBM",
      detail:   `Fetched ${rates.length} rates (effective ${effectiveDate.toDateString()})`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[exchange-rate-actions] refreshRatesFromRBM:", msg);
    redirect(`/astelfin_26/exchange-rates?error=${encodeURIComponent(msg)}`);
  }

  redirect("/astelfin_26/exchange-rates");
}

/**
 * Non-form version for internal/cron use — returns result instead of redirecting.
 */
export async function refreshRatesFromRBMInternal(): Promise<{ ok: boolean; message: string; count?: number }> {
  try {
    const { effectiveDate, rates } = await fetchRBMRates();

    await Promise.all(
      rates.map((r) =>
        prisma.exchangeRate.upsert({
          where:  { currency: r.currency },
          update: { buyRate: r.buyRate, middleRate: r.middleRate, sellRate: r.sellRate, effectiveDate, source: "RBM", updatedById: null },
          create: { currency: r.currency, buyRate: r.buyRate, middleRate: r.middleRate, sellRate: r.sellRate, effectiveDate, source: "RBM", updatedById: null },
        })
      )
    );

    return { ok: true, message: `Updated ${rates.length} rates from RBM.`, count: rates.length };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: msg };
  }
}

/**
 * Manually override a single currency's middle rate (FM/CEO).
 */
export async function updateRateManually(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageRates(session.user.role)) {
    redirect("/astelfin_26/dashboard");
  }

  const currency   = (formData.get("currency") as string).toUpperCase().trim();
  const buyRate    = parseFloat(formData.get("buyRate") as string);
  const middleRate = parseFloat(formData.get("middleRate") as string);
  const sellRate   = parseFloat(formData.get("sellRate") as string);

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
    detail:   `Manual override: middle = ${middleRate}`,
  });

  redirect("/astelfin_26/exchange-rates");
}
