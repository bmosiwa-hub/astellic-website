import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchRBMRates } from "@/lib/rbm-scraper";

export const runtime = "nodejs";

export async function GET(req: Request) {
  // Verify Vercel cron secret
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
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
            updatedById:   null,
          },
          create: {
            currency:      r.currency,
            buyRate:       r.buyRate,
            middleRate:    r.middleRate,
            sellRate:      r.sellRate,
            effectiveDate,
            source:        "RBM",
            updatedById:   null,
          },
        })
      )
    );

    console.log(`[cron/exchange-rates] Updated ${rates.length} rates for ${effectiveDate.toDateString()}`);
    return NextResponse.json({ ok: true, count: rates.length, effectiveDate });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[cron/exchange-rates]", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
