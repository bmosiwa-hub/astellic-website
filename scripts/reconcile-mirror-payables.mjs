/**
 * One-time reconciliation: clear the mirror Accounts Payable entries whose
 * underlying obligation is already settled in the Payroll / Tax modules.
 *
 *  • "Unpaid Salary — … (Payroll ID: X (salary))"  → cleared if payroll X is PAID
 *  • "Unpaid PAYE   — … (Payroll ID: X (paye))"    → cleared if payroll X PAYE is REMITTED/WAIVED
 *  • "Pension Contributions — <period>" (budgetLine Pension) → cleared once every
 *    pension-bearing payroll in <period> is REMITTED/WAIVED
 *
 * These payables are mirrors — their cash outflow is booked as an Expense by the
 * payroll/tax flows — so we only flip status to PAID, never create an Expense.
 *
 * Run: node scripts/reconcile-mirror-payables.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");
const envText = readFileSync(envPath, "utf8");
const match   = envText.match(/^DATABASE_URL="?([^"\n]+)"?/m);
if (!match) { console.error("DATABASE_URL not found in .env"); process.exit(1); }
const DATABASE_URL = match[1];

const { PrismaPg }     = await import("@prisma/adapter-pg");
const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });

const DONE = ["REMITTED", "WAIVED"];
let cleared = 0;

try {
  const mirrors = await prisma.accountPayable.findMany({
    where: {
      status: { notIn: ["PAID", "CANCELLED"] },
      OR: [
        { note: { contains: "Auto-converted" } },
        { budgetLine: "Pension", description: { startsWith: "Pension Contributions" } },
      ],
    },
  });

  console.log(`Found ${mirrors.length} open mirror payable(s).\n`);

  for (const ap of mirrors) {
    let settled = false;
    let reason  = "";

    const salaryId = ap.note?.match(/Payroll ID: (\S+) \(salary\)/)?.[1];
    const payeId   = ap.note?.match(/Payroll ID: (\S+) \(paye\)/)?.[1];

    if (salaryId) {
      const p = await prisma.payroll.findUnique({ where: { id: salaryId }, select: { status: true } });
      settled = p?.status === "PAID";
      reason  = `salary payroll ${salaryId} status=${p?.status}`;
    } else if (payeId) {
      const p = await prisma.payroll.findUnique({ where: { id: payeId }, select: { payeStatus: true } });
      settled = !!p && DONE.includes(p.payeStatus);
      reason  = `PAYE payroll ${payeId} payeStatus=${p?.payeStatus}`;
    } else if (ap.budgetLine === "Pension") {
      const period = ap.description.match(/(\d{4}-\d{2})/)?.[1];
      if (period) {
        const stillOutstanding = await prisma.payroll.count({
          where: {
            period, deletedAt: null,
            pensionStatus: { notIn: DONE },
            OR: [{ pension: { gt: 0 } }, { pensionEmployer: { gt: 0 } }],
          },
        });
        settled = stillOutstanding === 0;
        reason  = `pension period ${period}, still-outstanding records=${stillOutstanding}`;
      }
    }

    const label = `${ap.description} [${ap.status}, ${ap.currency} ${ap.amount}]`;
    if (settled) {
      await prisma.accountPayable.update({
        where: { id: ap.id },
        data:  { status: "PAID", paidDate: new Date() },
      });
      cleared++;
      console.log(`✓ CLEARED  ${label}\n           (${reason})`);
    } else {
      console.log(`·  kept     ${label}\n           (${reason})`);
    }
  }

  console.log(`\nDone. Cleared ${cleared} of ${mirrors.length} mirror payable(s).`);
} catch (e) {
  console.error("Error:", e);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
