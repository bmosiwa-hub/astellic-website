import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: Date | null | undefined) {
  if (!d) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Escape a CSV cell — wraps in quotes if it contains commas, quotes, or newlines. */
function csv(v: string | number | null | undefined): string {
  const s = v == null ? "" : String(v);
  if (/[,"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Build one CSV row. */
function row(...cells: (string | number | null | undefined)[]): string {
  return cells.map(csv).join(",");
}

/** Section header row (full-width label). */
function section(label: string): string {
  return `\n"${label}"\n`;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!["CEO", "FINANCE_MANAGER"].includes(session?.user?.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const grant = await prisma.donorGrant.findUnique({
    where: { id },
    include: {
      budgetLines: {
        orderBy: [{ active: "desc" }, { name: "asc" }],
        include: { project: { select: { name: true } } },
      },
      income: {
        where:   { deletedAt: null },
        orderBy: { receivedDate: "asc" },
        select:  {
          id: true, description: true, amount: true, currency: true,
          receivedDate: true, source: true, invoiceNumber: true, incomeType: true,
        },
      },
    },
  });

  if (!grant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const blNames = grant.budgetLines.map((bl) => bl.name);

  const [liquidations, payables] = await Promise.all([
    blNames.length > 0
      ? prisma.liquidation.findMany({
          where:   { budgetLine: { in: blNames }, status: "FM_APPROVED", deletedAt: null },
          orderBy: { liquidationDate: "asc" },
          select:  { liquidationDate: true, activity: true, budgetLine: true, fundsAccountedFor: true, currency: true },
        })
      : Promise.resolve([]),
    blNames.length > 0
      ? prisma.accountPayable.findMany({
          where:   { budgetLine: { in: blNames }, status: "PAID", deletedAt: null },
          orderBy: { paidDate: "asc" },
          select:  { description: true, vendor: true, amount: true, currency: true, budgetLine: true, paidDate: true },
        })
      : Promise.resolve([]),
  ]);

  // ── Compute totals ──────────────────────────────────────────────────────────
  const spendByBL: Record<string, number> = {};
  for (const l of liquidations) spendByBL[l.budgetLine] = (spendByBL[l.budgetLine] ?? 0) + l.fundsAccountedFor;
  for (const p of payables)     if (p.budgetLine) spendByBL[p.budgetLine] = (spendByBL[p.budgetLine] ?? 0) + p.amount;

  const totalReceived = grant.income.reduce((s, r) => s + r.amount, 0);
  const totalSpent    = Object.values(spendByBL).reduce((a, b) => a + b, 0);
  const totalAward    = grant.totalAmount;
  const balance       = totalAward - totalSpent;
  const utilPct       = totalAward > 0 ? ((totalSpent / totalAward) * 100).toFixed(1) : "0.0";

  const generatedAt = new Date();
  const refCode     = `RPT-${grant.id.slice(-6).toUpperCase()}-${generatedAt.getFullYear()}${String(generatedAt.getMonth() + 1).padStart(2, "0")}`;

  // ── Build CSV ───────────────────────────────────────────────────────────────
  const lines: string[] = [];

  // ── Section 1: Grant Information ───────────────────────────────────────────
  lines.push(section("GRANT DONOR REPORT — ASTELLIC"));
  lines.push(row("Reference",       refCode));
  lines.push(row("Generated",       fmtDate(generatedAt)));
  lines.push(row("Prepared by",     session?.user?.name ?? "Finance"));
  lines.push("");
  lines.push(section("1. GRANT INFORMATION"));
  lines.push(row("Grant Name",      grant.name));
  lines.push(row("Donor",           grant.donorName));
  lines.push(row("Grant Number",    grant.grantNumber ?? ""));
  lines.push(row("Status",          grant.status));
  lines.push(row("Currency",        grant.currency));
  lines.push(row("Reporting Period",grant.reportingPeriod ?? ""));
  lines.push(row("Start Date",      fmtDate(grant.startDate)));
  lines.push(row("End Date",        fmtDate(grant.endDate)));
  lines.push(row("Total Award",     totalAward));
  if (grant.notes) lines.push(row("Notes", grant.notes));

  // ── Section 2: Financial Summary ───────────────────────────────────────────
  lines.push(section("2. FINANCIAL SUMMARY"));
  lines.push(row("Item", "Amount (" + grant.currency + ")", "% of Award"));
  lines.push(row("Total Award",        totalAward,       "100.0%"));
  lines.push(row("Total Received",     totalReceived,    totalAward > 0 ? ((totalReceived / totalAward) * 100).toFixed(1) + "%" : ""));
  lines.push(row("Total Expenditure",  totalSpent,       utilPct + "%"));
  lines.push(row(balance >= 0 ? "Unspent Balance" : "Overspend", Math.abs(balance), totalAward > 0 ? ((Math.abs(balance) / totalAward) * 100).toFixed(1) + "%" : ""));

  // ── Section 3: Budget Lines ─────────────────────────────────────────────────
  lines.push(section("3. BUDGET LINE BREAKDOWN"));
  lines.push(row("Budget Line", "Project", "Active", "Ceiling (" + grant.currency + ")", "Spent", "Balance", "Utilisation %"));
  for (const bl of grant.budgetLines) {
    const spent = spendByBL[bl.name] ?? 0;
    const bal   = bl.ceiling != null ? bl.ceiling - spent : null;
    const blPct = bl.ceiling != null && bl.ceiling > 0 ? ((spent / bl.ceiling) * 100).toFixed(1) + "%" : "";
    lines.push(row(
      bl.name,
      bl.project?.name ?? "Org-wide",
      bl.active ? "Yes" : "No",
      bl.ceiling ?? "",
      spent,
      bal ?? "",
      blPct,
    ));
  }
  lines.push(row("TOTAL", "", "", "", totalSpent, balance, utilPct + "%"));

  // ── Section 4: Income Receipts ─────────────────────────────────────────────
  lines.push(section("4. INCOME RECEIPTS"));
  lines.push(row("Date", "Description", "Income Type", "Source", "Invoice / Reference", "Currency", "Amount"));
  for (const r of grant.income) {
    lines.push(row(
      fmtDate(r.receivedDate),
      r.description,
      r.incomeType,
      r.source ?? "",
      r.invoiceNumber ?? "",
      r.currency,
      r.amount,
    ));
  }
  lines.push(row("TOTAL", "", "", "", "", grant.currency, totalReceived));

  // ── Section 5a: Liquidations ───────────────────────────────────────────────
  if (liquidations.length > 0) {
    lines.push(section("5a. EXPENDITURE — LIQUIDATIONS (FM APPROVED)"));
    lines.push(row("Date", "Activity", "Budget Line", "Currency", "Amount Accounted For"));
    for (const l of liquidations) {
      lines.push(row(
        fmtDate(l.liquidationDate),
        l.activity,
        l.budgetLine,
        l.currency,
        l.fundsAccountedFor,
      ));
    }
    lines.push(row("TOTAL", "", "", grant.currency, liquidations.reduce((s, l) => s + l.fundsAccountedFor, 0)));
  }

  // ── Section 5b: Direct Payments ────────────────────────────────────────────
  if (payables.length > 0) {
    lines.push(section("5b. EXPENDITURE — DIRECT PAYMENTS (PAID)"));
    lines.push(row("Description", "Vendor", "Budget Line", "Date Paid", "Currency", "Amount"));
    for (const p of payables) {
      lines.push(row(
        p.description,
        p.vendor ?? "",
        p.budgetLine ?? "",
        fmtDate(p.paidDate),
        p.currency,
        p.amount,
      ));
    }
    lines.push(row("TOTAL", "", "", "", grant.currency, payables.reduce((s, p) => s + p.amount, 0)));
  }

  // ── Serve the file ──────────────────────────────────────────────────────────
  const filename = `grant-report_${grant.name.replace(/[^a-zA-Z0-9]+/g, "-").slice(0, 40)}_${generatedAt.toISOString().slice(0, 10)}.csv`;

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type":        "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control":       "no-store",
    },
  });
}
